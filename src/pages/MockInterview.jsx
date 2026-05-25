import { useState, useRef, useEffect, useCallback } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const API = import.meta.env.VITE_API_URL;

// ======================================================
// CONSTANTS
// ======================================================

const GAZE_SIDE_THRESHOLD      = 12;
const LOOKING_DOWN_Z_THRESHOLD = 0.15;
const IRIS_DOWN_RATIO          = 0.72;
const LOOKING_DOWN_FRAME_COUNT = 25;
const PHONE_ALERT_COOLDOWN_MS  = 6000;
const DOWN_ALERT_COOLDOWN_MS   = 5000;

// ======================================================
// MCQ PARSER
// Parse a raw question block like:
//   1. What is X?
//   A. Option 1
//   B. Option 2
//   C. Option 3
//   D. Option 4
//   Answer: B
// Returns { questionText, options: [{letter, text}], correctAnswer }
// ======================================================

function parseMCQ(raw) {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const questionText = lines[0].replace(/^\d+\.\s*/, "");
  const optionRegex = /^([A-D])\.\s+(.+)/i;
  const options = [];
  lines.forEach((line) => {
    const m = line.match(optionRegex);
    if (m) options.push({ letter: m[1].toUpperCase(), text: m[2] });
  });
  const answerLine = lines.find((l) => /^answer\s*:/i.test(l));
  const correctAnswer = answerLine
    ? answerLine.replace(/^answer\s*:\s*/i, "").trim().charAt(0).toUpperCase()
    : "";
  return { questionText, options, correctAnswer };
}

// ======================================================
// HELPERS
// ======================================================

function getConfidenceCategory(score) {
  if (score >= 75) return { label: "Excellent", color: "#22c55e", bg: "#dcfce7" };
  if (score >= 50) return { label: "Average",   color: "#f59e0b", bg: "#fef3c7" };
  if (score >= 25) return { label: "Low",        color: "#f97316", bg: "#ffedd5" };
  return                   { label: "Very Low",  color: "#ef4444", bg: "#fee2e2" };
}

function getSpeakingCategory(score) {
  if (score >= 80) return { label: "Fluent",   color: "#22c55e" };
  if (score >= 50) return { label: "Moderate", color: "#f59e0b" };
  return                   { label: "Brief",   color: "#ef4444" };
}

function computeSkillWeaknesses(answers, feedbackList) {
  const SKILLS = ["budgeting", "python", "documentation", "communication", "tensorflow", "nlp", "leadership"];
  const keywordMap = {
    budgeting:     ["budget", "cost", "expense", "finance", "forecast", "allocation"],
    python:        ["python", "script", "pandas", "numpy", "flask", "django", "pip"],
    documentation: ["document", "readme", "wiki", "spec", "write", "doc"],
    communication: ["communicat", "present", "stakeholder", "team", "report", "explain"],
    tensorflow:    ["tensorflow", "tf.", "keras", "model", "train", "neural", "layer"],
    nlp:           ["nlp", "natural language", "text", "token", "bert", "gpt", "sentiment"],
    leadership:    ["lead", "mentor", "manage", "team", "direct", "oversee", "motivat"],
  };
  const scores = {};
  SKILLS.forEach((skill) => {
    let hits = 0;
    const keywords = keywordMap[skill];
    (answers || []).forEach((ans) => {
      const lower = (ans || "").toLowerCase();
      keywords.forEach((kw) => { if (lower.includes(kw)) hits++; });
    });
    (feedbackList || []).forEach((fb) => {
      const lower = (fb || "").toLowerCase();
      keywords.forEach((kw) => { if (lower.includes(kw)) hits++; });
    });
    scores[skill] = Math.min(15 + hits * 12, 90);
  });
  return SKILLS.map((skill) => ({ skill, score: scores[skill] }));
}

// ======================================================
// METER BAR
// ======================================================

function MeterBar({ value, color }) {
  return (
    <div style={{ height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden", marginTop: 8 }}>
      <div style={{ width: `${Math.min(value, 100)}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.4s ease" }} />
    </div>
  );
}

// ======================================================
// ALERTS
// ======================================================

function AlertBadge({ alerts }) {
  if (!alerts.length) return null;
  return (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {alerts.map((a, i) => (
        <div key={i} style={{ background: a.type === "phone" ? "#7c3aed" : a.type === "down" ? "#b45309" : "#ef4444", color: "#fff", padding: "10px 22px", borderRadius: 999, fontSize: 13, fontWeight: 700, boxShadow: "0 10px 30px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
          {a.type === "phone" ? "📱" : a.type === "down" ? "👀" : "⚠️"} {a.msg}
        </div>
      ))}
    </div>
  );
}

// ======================================================
// SUSPICIOUS ACTIVITY LOG
// ======================================================

function ActivityLog({ events }) {
  if (!events.length) return null;
  return (
    <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 20, padding: 20, marginBottom: 24 }}>
      <p style={{ fontSize: 12, fontWeight: 800, color: "#ea580c", marginBottom: 12 }}>🚨 SUSPICIOUS ACTIVITY LOG</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {events.map((e, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#7c2d12" }}>
            <span style={{ opacity: 0.6, minWidth: 55 }}>{e.time}</span>
            <span style={{ background: e.kind === "phone" ? "#ede9fe" : "#fef3c7", color: e.kind === "phone" ? "#6d28d9" : "#92400e", padding: "2px 10px", borderRadius: 999, fontWeight: 700, fontSize: 11 }}>
              {e.kind === "phone" ? "📱 PHONE" : "👀 LOOKING DOWN"}
            </span>
            <span>{e.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================================================
// WEBCAM WIDGET
// Fixed bottom-right; compact 180px wide (v2 size) with full
// confidence, phone & gaze panels (v1 feature set).
// ======================================================

function WebcamWidget({ videoRef, confidenceScore, webcamActive, phoneDetected, lookingDown }) {
  const cat = getConfidenceCategory(confidenceScore);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, width: 200, background: "#ffffff", border: `2px solid ${phoneDetected ? "#7c3aed" : lookingDown ? "#f59e0b" : "#e5e7eb"}`, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.13)", transition: "border-color 0.3s ease" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", background: "#000" }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
        {webcamActive && (
          <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.7)", color: "#fff", borderRadius: 999, padding: "3px 8px", fontSize: 10, fontWeight: 700 }}>🔴 LIVE</div>
        )}
        {(phoneDetected || lookingDown) && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: phoneDetected ? "rgba(124,58,237,0.88)" : "rgba(180,83,9,0.88)", color: "#fff", fontSize: 10, fontWeight: 800, textAlign: "center", padding: "5px 4px", animation: "pulse 1.2s infinite" }}>
            {phoneDetected ? "📱 PHONE DETECTED" : "👀 LOOKING DOWN"}
          </div>
        )}
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, marginBottom: 2 }}>CONFIDENCE</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: cat.color }}>{confidenceScore}%</div>
          </div>
          <span style={{ color: cat.color, background: cat.bg, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{cat.label}</span>
        </div>
        <MeterBar value={confidenceScore} color={cat.color} />
        <div style={{ height: 1, background: "#f3f4f6", margin: "2px 0" }} />
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1, background: phoneDetected ? "#f5f3ff" : "#f9fafb", border: `1px solid ${phoneDetected ? "#7c3aed40" : "#e5e7eb"}`, borderRadius: 12, padding: "8px 10px", transition: "all 0.3s" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#6b7280", marginBottom: 3 }}>📱 PHONE</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: phoneDetected ? "#7c3aed" : "#22c55e" }}>{phoneDetected ? "Detected ⚠️" : "Clear ✓"}</div>
          </div>
          <div style={{ flex: 1, background: lookingDown ? "#fffbeb" : "#f9fafb", border: `1px solid ${lookingDown ? "#b4530940" : "#e5e7eb"}`, borderRadius: 12, padding: "8px 10px", transition: "all 0.3s" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#6b7280", marginBottom: 3 }}>👀 GAZE</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: lookingDown ? "#b45309" : "#22c55e" }}>{lookingDown ? "Down ⚠️" : "Forward ✓"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// ACTION BUTTON
// ======================================================

function ActionBtn({ onClick, disabled, color, children, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: disabled ? "#f3f4f6" : `${color}15`, border: `1px solid ${disabled ? "#e5e7eb" : color + "40"}`, color: disabled ? "#9ca3af" : color, padding: small ? "10px 18px" : "14px 24px", borderRadius: 16, fontSize: small ? 13 : 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
      {children}
    </button>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({ label, value, sub, color, meter }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "12px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
      <p style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, marginBottom: 6 }}>{label.toUpperCase()}</p>
      <p style={{ fontSize: 20, fontWeight: 800, color, marginBottom: 3 }}>{value}</p>
      <p style={{ color, fontWeight: 600, fontSize: 11 }}>{sub}</p>
      <MeterBar value={meter} color={color} />
    </div>
  );
}

// ======================================================
// MCQ OPTIONS — vertical radio buttons
// ======================================================

function MCQOptions({ options, selected, onSelect, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20, marginBottom: 8 }}>
      {options.map(({ letter, text }) => {
        const isSelected = selected === letter;
        return (
          <button
            key={letter}
            onClick={() => !disabled && onSelect(letter)}
            disabled={disabled}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 18px",
              borderRadius: 14,
              border: isSelected ? "2px solid #6366f1" : "2px solid #e5e7eb",
              background: isSelected ? "#eef2ff" : "#f8fafc",
              cursor: disabled ? "not-allowed" : "pointer",
              textAlign: "left",
              transition: "all 0.18s",
              fontFamily: "inherit",
              width: "100%",
              boxShadow: isSelected ? "0 0 0 3px #6366f120" : "none",
            }}
          >
            <span style={{
              minWidth: 32,
              height: 32,
              borderRadius: "50%",
              background: isSelected ? "#6366f1" : "#e5e7eb",
              color: isSelected ? "#fff" : "#374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
              transition: "all 0.18s",
            }}>
              {letter}
            </span>
            <span style={{ fontSize: 15, color: isSelected ? "#3730a3" : "#374151", fontWeight: isSelected ? 600 : 400, lineHeight: 1.5 }}>
              {text}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ======================================================
// HYBRID ANSWER INPUT
// Combines v1's voice-select-option feature with v2's
// continuous voice-to-text textarea + inline mic button.
// ======================================================

function HybridAnswerInput({ typedAnswer, setTypedAnswer, onOptionDetected, disabled, isListening, setIsListening, recognitionRef }) {
  const charCount = typedAnswer.length;

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    let finalSoFar = typedAnswer;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalSoFar += (finalSoFar ? " " : "") + t;
        } else {
          interim = t;
        }
      }
      const displayed = finalSoFar + (interim ? " " + interim : "");
      setTypedAnswer(displayed);

      // Auto-detect MCQ letter from speech (e.g. "option A", "I choose B", "answer is C")
      const upper = displayed.toUpperCase();
      const match = upper.match(/\b(?:OPTION\s*|ANSWER\s*(?:IS\s*)?|CHOOSE\s*|SELECT\s*)?([A-D])\b/);
      if (match) onOptionDetected(match[1]);
    };

    recognition.onerror = (err) => {
      if (err.error !== "aborted") console.warn("Speech error:", err.error);
      stopVoice();
    };

    recognition.onend = () => stopVoice();
    recognition.start();
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleVoice = () => {
    if (disabled) return;
    if (isListening) stopVoice();
    else startVoice();
  };

  return (
    <div style={{ marginTop: 20 }}>
      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px" }}>OR TYPE / SPEAK YOUR ANSWER</span>
        <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
      </div>

      {/* Mode chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "#eef2ff", color: "#6366f1" }}>📋 MCQ Selection</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "#f0fdf4", color: "#16a34a" }}>⌨️ Free Text</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "#fff1f2", color: "#e11d48" }}>🎤 Voice-to-Text</span>
      </div>

      {/* Textarea with embedded mic button */}
      <div style={{ position: "relative" }}>
        <textarea
          value={typedAnswer}
          onChange={(e) => !disabled && setTypedAnswer(e.target.value)}
          disabled={disabled}
          placeholder="Type your detailed answer here… or click 🎤 to dictate. You can also just select an MCQ option above."
          style={{
            width: "100%",
            minHeight: 110,
            background: isListening ? "#fff8f8" : "#f8fafc",
            border: `1.5px solid ${isListening ? "#f43f5e" : "#e5e7eb"}`,
            borderRadius: 14,
            padding: "14px 52px 14px 16px",
            fontFamily: "inherit",
            fontSize: 14,
            color: "#111827",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.6,
            transition: "border 0.2s, background 0.2s",
            boxShadow: isListening ? "0 0 0 3px rgba(244,63,94,0.12)" : "none",
            boxSizing: "border-box",
          }}
        />
        {/* Mic toggle button inside textarea */}
        <button
          onClick={toggleVoice}
          disabled={disabled}
          title={isListening ? "Stop listening" : "Start voice input"}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            background: isListening ? "rgba(244,63,94,0.15)" : "#e5e7eb",
            color: isListening ? "#e11d48" : "#6b7280",
            transition: "all 0.2s",
            animation: isListening ? "pulse 1.2s infinite" : "none",
          }}
        >
          {isListening ? "⏹" : "🎤"}
        </button>
      </div>

      {/* Status row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isListening && (
            <>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e11d48", animation: "pulse 1.2s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#e11d48", animation: "pulse 1.2s infinite" }}>Listening… speak now</span>
            </>
          )}
        </div>
        <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>{charCount} characters</span>
      </div>
    </div>
  );
}

// ======================================================
// SKILL WEAKNESS MAP
// ======================================================

function SkillWeaknessMap({ skills }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 24, padding: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: 24 }}>
      <p style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginBottom: 20 }}>Skill Weakness Map</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {skills.map(({ skill, score }) => (
          <div key={skill} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, width: 120, minWidth: 120, textAlign: "right", paddingRight: 8 }}>{skill}</span>
            <div style={{ flex: 1, height: 18, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${score}%`, height: "100%", background: "#1a1a1a", borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", minWidth: 36, textAlign: "right" }}>{score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================================================
// FINAL REPORT
// ======================================================

function FinalReport({ score, totalQuestions, confidenceScore, accentScore, suspiciousEvents, answers, feedbackList }) {
  const confCat  = getConfidenceCategory(confidenceScore);
  const speakCat = getSpeakingCategory(accentScore);
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const skillData = computeSkillWeaknesses(answers, feedbackList);

  return (
    <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 28, padding: 34, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
      <h2 style={{ fontSize: 34, fontWeight: 800, marginBottom: 28, color: "#111827" }}>Interview Report</h2>

      {/* TOP STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 22 }}>
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 14, padding: "12px 14px" }}>
          <p style={{ fontSize: 10, color: "#0369a1", fontWeight: 700, marginBottom: 4 }}>SCORE</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#0284c7", marginBottom: 2 }}>{score} / {totalQuestions}</p>
          <p style={{ fontSize: 11, color: "#0369a1", fontWeight: 600 }}>Correct Answers</p>
          <MeterBar value={accuracy} color="#0284c7" />
        </div>

        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "12px 14px" }}>
          <p style={{ fontSize: 10, color: "#15803d", fontWeight: 700, marginBottom: 4 }}>ACCURACY</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#16a34a", marginBottom: 2 }}>{accuracy}%</p>
          <p style={{ fontSize: 11, color: "#15803d", fontWeight: 600 }}>{accuracy >= 80 ? "Excellent!" : accuracy >= 60 ? "Good" : "Needs Improvement"}</p>
          <MeterBar value={accuracy} color="#16a34a" />
        </div>

        <StatCard label="Confidence"      value={`${confidenceScore}%`}    sub={confCat.label}                                                     color={confCat.color}                        meter={confidenceScore} />
        <StatCard label="Speaking Clarity" value={`${accentScore}%`}        sub={speakCat.label}                                                    color={speakCat.color}                       meter={accentScore} />
        <StatCard label="Suspicious Flags" value={suspiciousEvents.length}  sub={suspiciousEvents.length === 0 ? "Clean session 🎉" : "Events recorded"} color={suspiciousEvents.length === 0 ? "#22c55e" : "#ef4444"} meter={Math.min(suspiciousEvents.length * 20, 100)} />
      </div>

      {/* SKILL WEAKNESS MAP */}
      <SkillWeaknessMap skills={skillData} />

      <p style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic", marginBottom: 4 }}>Keep practicing to improve your interview performance!</p>
      <p style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Speaking Clarity: {accentScore}%</p>

      {suspiciousEvents.length > 0 && <div style={{ marginTop: 24 }}><ActivityLog events={suspiciousEvents} /></div>}
    </div>
  );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function MockInterview() {
  const [score, setScore]                       = useState(0);
  const scoreRef                                = useRef(0);   // always in sync, no async lag
  const [finished, setFinished]                 = useState(false);
  const [questions, setQuestions]               = useState([]);
  const [currentIndex, setCurrentIndex]         = useState(0);
  const [selectedOption, setSelectedOption]     = useState("");
  const [feedback, setFeedback]                 = useState("");
  const [feedbackResult, setFeedbackResult]     = useState(null); // { isCorrect, correctAnswer, explanation }
  const [timeLeft, setTimeLeft]                 = useState(60);
  const [confidenceScore, setConfidenceScore]   = useState(0);
  const [accentScore, setAccentScore]           = useState(0);
  const [webcamActive, setWebcamActive]         = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [submitting, setSubmitting]             = useState(false);
  const [alerts, setAlerts]                     = useState([]);
  const [phoneDetected, setPhoneDetected]       = useState(false);
  const [lookingDown, setLookingDown]           = useState(false);
  const [suspiciousEvents, setSuspiciousEvents] = useState([]);
  const [allAnswers, setAllAnswers]             = useState([]);
  const [allFeedback, setAllFeedback]           = useState([]);
  const [typedAnswer, setTypedAnswer]           = useState("");
  const [isListening, setIsListening]           = useState(false);

  const timerRef          = useRef(null);
  const videoRef          = useRef(null);
  const noFaceTimerRef    = useRef(null);
  const phoneAlertLastRef = useRef(0);
  const downAlertLastRef  = useRef(0);
  const lookDownFrames    = useRef(0);
  const phoneIntervalRef  = useRef(null);
  const recognitionRef    = useRef(null); // holds the live SpeechRecognition instance

  // ── ALERTS ──────────────────────────────────────────

  const pushAlert = useCallback((msg, type = "warning") => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { msg, type, id }]);
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), 4000);
  }, []);

  const logSuspicious = useCallback((kind, detail) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setSuspiciousEvents((prev) => [...prev, { kind, detail, time }]);
  }, []);

  // ── TTS ──────────────────────────────────────────────

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1;
    window.speechSynthesis.speak(u);
  };

  // ── CAMERA ──────────────────────────────────────────

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setWebcamActive(true);
    } catch {
      alert("Camera access denied");
    }
  };

  // ── PHONE DETECTION ─────────────────────────────────

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const startPhoneDetection = async () => {
    try {
      if (!window.tf)      await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js");
      if (!window.cocoSsd) await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js");
      const model = await window.cocoSsd.load();
      phoneIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        const predictions = await model.detect(videoRef.current);
        const phones = predictions.filter((p) => p.class === "cell phone" && p.score > 0.45);
        const detected = phones.length > 0;
        setPhoneDetected(detected);
        if (detected) {
          const now = Date.now();
          if (now - phoneAlertLastRef.current > PHONE_ALERT_COOLDOWN_MS) {
            phoneAlertLastRef.current = now;
            const conf = Math.round(phones[0].score * 100);
            pushAlert(`Mobile phone detected (${conf}% confidence)`, "phone");
            logSuspicious("phone", `Phone spotted with ${conf}% confidence`);
          }
        }
      }, 800);
    } catch (err) {
      console.warn("Phone detection failed to init:", err);
    }
  };

  // ── FACE MESH ───────────────────────────────────────

  const startConfidenceDetection = () => {
    const faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const lm = results.multiFaceLandmarks[0];
        let conf = 40;
        const nose = lm[1];
        if (nose.x > 0.35 && nose.x < 0.65) conf += 30;
        if (Math.abs(lm[33].y - lm[263].y) < 0.02) conf += 30;
        setConfidenceScore(conf);

        const headPitch   = lm[152].z - lm[10].z;
        const lIrisRatio  = (lm[468].y - lm[159].y) / (Math.abs(lm[145].y - lm[159].y) || 0.001);
        const rIrisRatio  = (lm[473].y - lm[386].y) / (Math.abs(lm[374].y - lm[386].y) || 0.001);
        const avgIrisRatio = (lIrisRatio + rIrisRatio) / 2;
        const isDown = headPitch > LOOKING_DOWN_Z_THRESHOLD && avgIrisRatio > IRIS_DOWN_RATIO;

        if (isDown) lookDownFrames.current += 1;
        else        lookDownFrames.current = Math.max(0, lookDownFrames.current - 3);

        const flagDown = lookDownFrames.current >= LOOKING_DOWN_FRAME_COUNT;
        setLookingDown(flagDown);
        if (flagDown) {
          const now = Date.now();
          if (now - downAlertLastRef.current > DOWN_ALERT_COOLDOWN_MS) {
            downAlertLastRef.current = now;
            pushAlert("Suspicious activity: eyes/head looking down", "down");
            logSuspicious("down", `Head pitch Δz=${headPitch.toFixed(3)}, iris ratio=${avgIrisRatio.toFixed(2)}`);
          }
        }

        const gazeOffset = Math.abs(nose.x - 0.5) * 100;
        if (gazeOffset > GAZE_SIDE_THRESHOLD) {
          const now = Date.now();
          if (!pushAlert._gazeCooldown || now - pushAlert._gazeCooldown > 4000) {
            pushAlert._gazeCooldown = now;
            pushAlert("Eyes looking to the side", "warning");
          }
        }
      } else {
        setConfidenceScore(0); setLookingDown(false); lookDownFrames.current = 0;
        pushAlert("No face detected", "warning");
      }
    });
    const camera = new Camera(videoRef.current, { onFrame: async () => { await faceMesh.send({ image: videoRef.current }); }, width: 640, height: 480 });
    camera.start();
  };

  const handleStartWebcam = async () => {
    await startCamera();
    startConfidenceDetection();
    startPhoneDetection();
  };

  // ── STOP VOICE RECOGNITION ───────────────────────────

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // ── TIMER ────────────────────────────────────────────

  const advanceQuestion = useCallback((idx, qs) => {
    const next = idx + 1;
    if (next < qs.length) {
      setCurrentIndex(next);
      setSelectedOption("");
      setTypedAnswer("");
      setFeedback("");
      setFeedbackResult(null);
      stopVoiceRecognition();
      speakText(qs[next].questionText);
      startTimerFor(next, qs);
    } else {
      setFinished(true);
      clearInterval(timerRef.current);
    }
  }, []);

  const startTimerFor = (idx, qs) => {
    clearInterval(timerRef.current);
    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          advanceQuestion(idx, qs);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── GENERATE QUESTIONS ───────────────────────────────
  // Supports both v1 backend response format (data.questions as array of objects)
  // and v2 format (data.questions as a raw MCQ text string).

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const resumeData = JSON.parse(localStorage.getItem("resumeData") || "{}");
      const response = await fetch(`${API}/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: resumeData.role,
          matched_skills: resumeData.matched_skills || [],
          missing_skills: resumeData.missing_skills || [],
        }),
      });

      if (!response.ok) throw new Error("Backend not responding");
      const data = await response.json();
      if (!data.questions) throw new Error("Invalid backend response");

      let parsed = [];

      // Format A: array of structured question objects (v1 backend)
      if (Array.isArray(data.questions)) {
        parsed = data.questions.map((q) => ({
          raw: `${q.question}\nA. ${q.options[0]}\nB. ${q.options[1]}\nC. ${q.options[2]}\nD. ${q.options[3]}\nAnswer: ${["A", "B", "C", "D"][q.correct]}`,
          questionText: q.question,
          options: q.options.map((opt, i) => ({ letter: ["A", "B", "C", "D"][i], text: opt })),
          correctAnswer: ["A", "B", "C", "D"][q.correct],
        }));
      } else {
        // Format B: raw MCQ text blocks (v2 backend)
        const rawBlocks = data.questions
          .split(/\n(?=\d+\.)/)
          .map((b) => b.trim())
          .filter((b) => b.match(/^\d+\./));
        parsed = rawBlocks.map((raw) => ({ raw, ...parseMCQ(raw) }));
      }

      if (!parsed.length) throw new Error("No questions parsed");

      setQuestions(parsed);
      setCurrentIndex(0);
      setFinished(false);
      setScore(0);
      scoreRef.current = 0;
      setFeedback("");
      setFeedbackResult(null);
      setSelectedOption("");
      setTypedAnswer("");
      setAllAnswers([]);
      setAllFeedback([]);
      setSuspiciousEvents([]);
      setTimeLeft(60);
      setAccentScore(0);
      setConfidenceScore(0);
      stopVoiceRecognition();

      speakText(parsed[0].questionText);
      startTimerFor(0, parsed);
    } catch (err) {
      alert(err.message || "Failed to start interview");
    }
    setLoading(false);
  };

  // ── SUBMIT ANSWER ────────────────────────────────────
  // Accepts: selected MCQ letter, typed free text, or both.
  // Parses structured feedback (Score / Correct Answer / Result / Explanation)
  // from the backend, falling back to direct letter comparison.

  const submitAnswer = async () => {
    if (!selectedOption && !typedAnswer.trim()) return;
    clearInterval(timerRef.current);
    stopVoiceRecognition();
    setSubmitting(true);
    try {
      const q = questions[currentIndex];
      const answerPayload = typedAnswer.trim() || selectedOption;

      const response = await fetch(`${API}/evaluate-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q.questionText, answer: answerPayload }),
      });

      const data = await response.json();
      const raw = data.feedback || "";

      // Parse structured feedback fields
      const scoreMatch       = raw.match(/Score\s*:\s*([01])/i);
      const correctMatch     = raw.match(/Correct Answer\s*:\s*(.+)/i);
      const resultMatch      = raw.match(/Result\s*:\s*(\w+)/i);
      const explanationMatch = raw.match(/Explanation\s*:\s*(.+)/is);

      const correctAnswer = correctMatch ? correctMatch[1].trim() : q.correctAnswer;

      let isCorrect = false;
      if (scoreMatch) {
        isCorrect = scoreMatch[1] === "1";
      } else if (resultMatch) {
        isCorrect = /correct/i.test(resultMatch[1]);
      } else {
        // Fallback: direct letter comparison
        isCorrect =
          q.correctAnswer !== "" &&
          selectedOption.toUpperCase() === q.correctAnswer.toUpperCase();
      }

      const explanation = explanationMatch ? explanationMatch[1].trim() : raw;

      if (isCorrect) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }

      setFeedback(raw);
      setFeedbackResult({ isCorrect, correctAnswer, explanation });
      setAllAnswers((prev) => [...prev, answerPayload]);
      setAllFeedback((prev) => [...prev, raw]);

      // Accent/speaking score based on response length
      const words = (typedAnswer.trim() || explanation).split(/\s+/).length;
      if (words > 30)      setAccentScore(100);
      else if (words > 20) setAccentScore(70);
      else if (words > 10) setAccentScore(40);
      else                 setAccentScore(20);

    } catch {
      setFeedback("Evaluation failed");
    }
    setSubmitting(false);
  };

  // ── NEXT QUESTION ────────────────────────────────────

  const nextQuestion = () => advanceQuestion(currentIndex, questions);

  // ── STOP INTERVIEW ───────────────────────────────────

  const stopInterview = () => {
    clearInterval(timerRef.current);
    clearInterval(phoneIntervalRef.current);
    window.speechSynthesis.cancel();
    stopVoiceRecognition();
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    setQuestions([]); setCurrentIndex(0); setSelectedOption(""); setTypedAnswer(""); setFeedback(""); setFeedbackResult(null);
    setFinished(false); setWebcamActive(false); setPhoneDetected(false); setLookingDown(false);
    lookDownFrames.current = 0; scoreRef.current = 0; setScore(0); setAllAnswers([]); setAllFeedback([]);
  };

  // ── CLEANUP ──────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(noFaceTimerRef.current);
      clearInterval(phoneIntervalRef.current);
      stopVoiceRecognition();
    };
  }, []);

  const confCat  = getConfidenceCategory(confidenceScore);
  const speakCat = getSpeakingCategory(accentScore);
  const isActive = questions.length > 0 && !finished;
  const currentQ = isActive ? questions[currentIndex] : null;

  // ======================================================
  // UI
  // ======================================================

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111827", fontFamily: "'DM Sans', sans-serif", paddingBottom: 120 }}>
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>

      <AlertBadge alerts={alerts} />
      <WebcamWidget
        videoRef={videoRef}
        confidenceScore={confidenceScore}
        webcamActive={webcamActive}
        phoneDetected={phoneDetected}
        lookingDown={lookingDown}
      />

      {/* HERO */}
      <div style={{ padding: "100px 24px 60px", textAlign: "center", background: "linear-gradient(to right,#3b82f6,#06b6d4)", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 999, background: "rgba(255,255,255,0.15)", marginBottom: 20, fontSize: 13, fontWeight: 700 }}>🤖 AI Mock Interview</div>
          <h1 style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>Practice Like<br />Real Interviews</h1>
          <p style={{ fontSize: 18, opacity: 0.9, lineHeight: 1.8, maxWidth: 800, margin: "0 auto" }}>
            AI-generated MCQ questions · webcam confidence analysis · voice input · real-time feedback · phone &amp; gaze monitoring
          </p>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>

        {/* CONTROL BUTTONS */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 30 }}>
          <ActionBtn onClick={generateQuestions} disabled={loading}    color="#6366f1">{loading ? "Loading..." : "▶ Start Interview"}</ActionBtn>
          <ActionBtn onClick={handleStartWebcam}  disabled={webcamActive} color="#0ea5e9">📷 Enable Webcam</ActionBtn>
          <ActionBtn onClick={stopInterview}                            color="#ef4444">⏹ Stop Interview</ActionBtn>
        </div>

        {/* LIVE STATS (webcam active) */}
        {webcamActive && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 30 }}>
            <StatCard label="Confidence"     value={`${confidenceScore}%`}          sub={confCat.label}                         color={confCat.color}                        meter={confidenceScore} />
            <StatCard label="Speaking"       value={`${accentScore}%`}              sub={speakCat.label}                        color={speakCat.color}                       meter={accentScore} />
            <StatCard label="Questions"      value={`${currentIndex + 1}`}          sub={`${questions.length} Total`}           color="#6366f1"                              meter={questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0} />
            <StatCard label="Phone Detected" value={phoneDetected ? "YES ⚠️" : "Clear ✓"} sub={phoneDetected ? "Put it away!" : "No device found"} color={phoneDetected ? "#7c3aed" : "#22c55e"} meter={phoneDetected ? 100 : 0} />
            <StatCard label="Gaze Direction" value={lookingDown ? "Down ⚠️" : "Forward ✓"} sub={lookingDown ? "Look at screen" : "Good eye contact"} color={lookingDown ? "#b45309" : "#22c55e"}  meter={lookingDown ? 100 : 0} />
          </div>
        )}

        {suspiciousEvents.length > 0 && <ActivityLog events={suspiciousEvents} />}

        {/* QUESTION CARD */}
        {isActive && currentQ && (
          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 28, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.06)", marginBottom: 24 }}>

            {/* TIMER */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>TIME REMAINING</span>
                <span style={{ color: timeLeft <= 10 ? "#ef4444" : "#22c55e", fontWeight: 700 }}>{timeLeft}s</span>
              </div>
              <MeterBar value={(timeLeft / 60) * 100} color={timeLeft <= 10 ? "#ef4444" : "#22c55e"} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", marginBottom: 12 }}>
              QUESTION {currentIndex + 1} OF {questions.length}
            </div>

            {/* QUESTION TEXT */}
            <p style={{ fontSize: 22, lineHeight: 1.8, color: "#111827", marginBottom: 6, fontWeight: 500 }}>
              {currentQ.questionText}
            </p>

            {/* MCQ OPTIONS */}
            <MCQOptions
              options={currentQ.options}
              selected={selectedOption}
              onSelect={setSelectedOption}
              disabled={!!feedbackResult}
            />

            {/* HYBRID ANSWER INPUT (typing + continuous voice-to-text) */}
            <HybridAnswerInput
              typedAnswer={typedAnswer}
              setTypedAnswer={setTypedAnswer}
              onOptionDetected={(letter) => !feedbackResult && setSelectedOption(letter)}
              disabled={!!feedbackResult}
              isListening={isListening}
              setIsListening={setIsListening}
              recognitionRef={recognitionRef}
            />

            {/* ACTION BUTTONS */}
            {!feedbackResult && (
              <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                <ActionBtn
                  onClick={() => { setTypedAnswer(""); setSelectedOption(""); }}
                  disabled={submitting}
                  color="#6b7280"
                  small
                >
                  ✕ Clear
                </ActionBtn>
                <ActionBtn
                  onClick={submitAnswer}
                  disabled={submitting || (!selectedOption && !typedAnswer.trim())}
                  color="#22c55e"
                  small
                >
                  {submitting ? "Evaluating..." : "Submit Answer"}
                </ActionBtn>
              </div>
            )}
          </div>
        )}

        {/* FEEDBACK CARD */}
        {feedbackResult && !finished && (
          <div style={{ background: "#ffffff", border: `2px solid ${feedbackResult.isCorrect ? "#22c55e" : "#ef4444"}`, borderRadius: 28, padding: 30, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>{feedbackResult.isCorrect ? "✅" : "❌"}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: feedbackResult.isCorrect ? "#15803d" : "#b91c1c" }}>
                  {feedbackResult.isCorrect ? "Correct!" : "Incorrect"}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                  Correct Answer: <strong style={{ color: "#111827" }}>{feedbackResult.correctAnswer}</strong>
                </div>
              </div>
            </div>

            {feedbackResult.explanation && (
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "#374151", background: "#f8fafc", borderRadius: 14, padding: "14px 18px", marginBottom: 20 }}>
                {feedbackResult.explanation}
              </p>
            )}

            <ActionBtn onClick={nextQuestion} color="#6366f1" small>
              {currentIndex === questions.length - 1 ? "View Result" : "Next Question →"}
            </ActionBtn>
          </div>
        )}

        {/* FINAL REPORT */}
        {finished && (
          <FinalReport
            score={scoreRef.current}
            totalQuestions={questions.length}
            confidenceScore={confidenceScore}
            accentScore={accentScore}
            suspiciousEvents={suspiciousEvents}
            answers={allAnswers}
            feedbackList={allFeedback}
          />
        )}
      </div>
    </div>
  );
}