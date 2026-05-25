const API = import.meta.env.VITE_API_URL;
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const jobRoles = {
  "Software Development Engineer": {
    icon: "⚙️",
    color: "#3B82F6",
    skills: ["Data Structures & Algorithms", "System Design", "Java", "C++", "Python", "OOP", "REST APIs", "Git", "Problem Solving", "Multithreading"],
  },
  "Frontend Developer": {
    icon: "🎨",
    color: "#8B5CF6",
    skills: ["React", "TypeScript", "JavaScript (ES6+)", "HTML5 & CSS3", "Tailwind CSS", "Next.js", "Redux", "Webpack / Vite", "Web Performance", "Testing (Jest, RTL)"],
  },
  "Backend Developer": {
    icon: "🛠️",
    color: "#10B981",
    skills: ["Node.js", "Java Spring Boot", "Python (Django/FastAPI)", "SQL & NoSQL Databases", "REST & GraphQL APIs", "Microservices", "Docker", "Kafka / RabbitMQ", "Redis", "System Design"],
  },
  "Full Stack Developer": {
    icon: "🔗",
    color: "#F59E0B",
    skills: ["React / Vue / Angular", "Node.js / Express", "SQL & MongoDB", "REST APIs", "TypeScript", "Docker & CI/CD", "System Design", "Git", "AWS / GCP Basics", "Authentication (JWT, OAuth)"],
  },
  "Data Scientist": {
    icon: "📊",
    color: "#EC4899",
    skills: ["Python", "Statistics & Probability", "Machine Learning (scikit-learn)", "Deep Learning (TensorFlow/PyTorch)", "Pandas & NumPy", "Data Visualization", "SQL", "Feature Engineering", "Model Evaluation", "Jupyter Notebooks"],
  },
  "AI / ML Engineer": {
    icon: "🤖",
    color: "#06B6D4",
    skills: ["Deep Learning", "NLP (Transformers, BERT)", "Computer Vision (OpenCV)", "PyTorch / TensorFlow", "MLOps (MLflow, DVC)", "Model Deployment (FastAPI, Docker)", "Cloud AI Services", "Reinforcement Learning", "Large Language Models", "Data Pipelines"],
  },
  "DevOps / Cloud Engineer": {
    icon: "☁️",
    color: "#EF4444",
    skills: ["Docker & Kubernetes", "CI/CD (GitHub Actions, Jenkins)", "AWS / GCP / Azure", "Terraform (IaC)", "Linux & Shell Scripting", "Monitoring (Prometheus, Grafana)", "Networking Fundamentals", "Security Best Practices", "Helm Charts", "GitOps"],
  },
  "Cybersecurity Engineer": {
    icon: "🔒",
    color: "#7C3AED",
    skills: ["Network Security", "Penetration Testing", "OWASP Top 10", "Cryptography", "SIEM Tools", "Incident Response", "Vulnerability Assessment", "Linux Security", "Python Scripting", "Cloud Security"],
  },
  "Mobile Developer (Android/iOS)": {
    icon: "📱",
    color: "#D97706",
    skills: ["React Native / Flutter", "Swift / Kotlin", "REST API Integration", "State Management", "App Architecture (MVVM)", "Firebase", "Push Notifications", "App Store Deployment", "Testing (Espresso, XCTest)", "Performance Optimization"],
  },
  "Data Engineer": {
    icon: "🔧",
    color: "#0EA5E9",
    skills: ["Apache Spark / Hadoop", "Python & SQL", "ETL Pipelines", "Kafka / Airflow", "Data Warehousing (Snowflake, Redshift)", "dbt", "Cloud Platforms (AWS/GCP)", "NoSQL Databases", "Data Modeling", "Data Quality & Testing"],
  },
  "Site Reliability Engineer (SRE)": {
    icon: "📡",
    color: "#F97316",
    skills: ["Kubernetes & Docker", "Linux Systems Programming", "Monitoring & Alerting (PagerDuty)", "Incident Management", "Load Balancing", "Python / Go Scripting", "Chaos Engineering", "SLOs & SLAs", "Cloud Infrastructure", "Performance Tuning"],
  },
  "Blockchain Developer": {
    icon: "⛓️",
    color: "#64748B",
    skills: ["Solidity / Rust", "Ethereum & Web3.js", "Smart Contract Auditing", "DeFi Protocols", "Cryptography", "IPFS / Filecoin", "Hardhat / Foundry", "Layer 2 Solutions", "NFT Standards (ERC-721)", "Wallet Integration"],
  },
};

const categoryGroups = {
  "🚀 Core Engineering": ["Software Development Engineer", "Full Stack Developer", "Backend Developer", "Frontend Developer"],
  "🤖 AI & Data": ["AI / ML Engineer", "Data Scientist", "Data Engineer"],
  "☁️ Infrastructure": ["DevOps / Cloud Engineer", "Site Reliability Engineer (SRE)", "Cybersecurity Engineer"],
  "📱 Specialized": ["Mobile Developer (Android/iOS)", "Blockchain Developer"],
};

// FIX: helper — backend returns role as a dict {role, confidence, method, ...}
// or as a plain string when role-select path is used. Normalise to string.
function getRoleName(role) {
  if (!role) return "";
  if (typeof role === "object") return role.role ?? "";
  return role;
}

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [activeCategory, setActiveCategory] = useState("🚀 Core Engineering");
  const [isUploading, setIsUploading] = useState(false);
  const [expandedRole, setExpandedRole] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") setFile(f);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    const roleInfo = jobRoles[role];
    const roleData = {
      role,
      skills: roleInfo.skills,
      matched_skills: [],
      missing_skills: roleInfo.skills,
      coverage_percentage: 0,
    };
    setResult(roleData);
    localStorage.setItem("resumeData", JSON.stringify(roleData));
    setExpandedRole(null);
  };

  const uploadResume = async () => {
    if (!file) { alert("Please select a resume first."); return; }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API}/analyze-resume`, { method: "POST", body: formData,});
      const data = await response.json();
      localStorage.setItem("resumeData", JSON.stringify(data));
      setResult(data);
      // FIX: data.role is a dict from backend; extract the string for selectedRole
      setSelectedRole(getRoleName(data.role));
    } catch (err) {
      alert("Failed to analyze resume. Please try selecting a role manually.");
    } finally {
      setIsUploading(false);
    }
  };

  // FIX: safe coverage calculation — guard against missing/zero skills array
  const coveragePct = result?.coverage_percentage != null
    ? result.coverage_percentage
    : (result?.skills?.length > 0
        ? Math.round((result.matched_skills.length / result.skills.length) * 100)
        : 0);

  return (
    <div style={styles.page}>
      {/* Header — matches site nav */}

      <div style={styles.container}>
        {/* Hero */}
        <div style={styles.hero}>
          <span style={styles.pill}>🚀 AI-Powered Interview Prep</span>
          <h1 style={styles.heroTitle}>
            Smart Resume <span style={styles.heroAccent}>Analyzer</span>
          </h1>
          <p style={styles.heroSub}>
            Upload your resume or select your target role. Our AI matches your skills,<br />
            finds gaps, and generates personalized interview questions to get you placed.
          </p>
        </div>

        <div style={styles.twoCol}>
          {/* LEFT: Upload */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>📄</div>
              <div>
                <h2 style={styles.cardTitle}>Upload Your Resume</h2>
                <p style={styles.cardSub}>PDF format · Max 5MB</p>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              style={{ ...styles.dropZone, ...(isDragging ? styles.dropZoneActive : {}), ...(file ? styles.dropZoneFilled : {}) }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
              {file ? (
                <>
                  <div style={styles.fileIcon}>✅</div>
                  <p style={styles.fileName}>{file.name}</p>
                  <p style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </>
              ) : (
                <>
                  <div style={styles.uploadIcon}>☁️</div>
                  <p style={styles.dropTitle}>Drag & drop your resume here</p>
                  <p style={styles.dropSub}>or <span style={styles.browseLink}>browse files</span></p>
                </>
              )}
            </div>

            <button
              style={{ ...styles.primaryBtn, ...(isUploading ? styles.btnDisabled : {}) }}
              onClick={uploadResume}
              disabled={isUploading}
            >
              {isUploading ? (
                <><span style={styles.spinner}></span> Analyzing...</>
              ) : (
                <> Analyze Resume</>
              )}
            </button>

            <div style={styles.divider}><span style={styles.dividerText}>or skip and pick a role</span></div>
          </div>

          {/* RIGHT: Result */}
          {result ? (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>📊</div>
                <div>
                  <h2 style={styles.cardTitle}>Analysis Result</h2>
                  {/* FIX: result.role may be a dict from backend — normalise to string */}
                  <p style={styles.cardSub}>{getRoleName(result.role)}</p>
                </div>
              </div>

              {/* Coverage Arc */}
              <div style={styles.coverageWrap}>
                <svg width="120" height="70" viewBox="0 0 120 70">
                  <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
                  <path
                    d="M10,60 A50,50 0 0,1 110,60"
                    fill="none"
                    stroke={coveragePct >= 70 ? "#10B981" : coveragePct >= 40 ? "#F59E0B" : "#EF4444"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(coveragePct / 100) * 157} 157`}
                  />
                </svg>
                <div style={styles.coveragePct}>{coveragePct}%</div>
                <div style={styles.coverageLabel}>Skill Coverage</div>
              </div>

              {result.matched_skills?.length > 0 && (
                <div style={styles.skillSection}>
                  <p style={styles.skillLabel}>✅ Matched Skills</p>
                  <div style={styles.skillTags}>
                    {result.matched_skills.map(s => <span key={s} style={{ ...styles.tag, ...styles.tagGreen }}>{s}</span>)}
                  </div>
                </div>
              )}

              <div style={styles.skillSection}>
                <p style={styles.skillLabel}>⚠️ Skills to Strengthen</p>
                <div style={styles.skillTags}>
                  {result.missing_skills.map(s => <span key={s} style={{ ...styles.tag, ...styles.tagOrange }}>{s}</span>)}
                </div>
              </div>

              <button style={styles.primaryBtn} onClick={() => navigate("/practice")}>
                Generate Interview Questions →
              </button>
            </div>
          ) : (
            <div style={{ ...styles.card, ...styles.cardPlaceholder }}>
              <div style={styles.placeholderIcon}>🎯</div>
              <p style={styles.placeholderTitle}>Your analysis will appear here</p>
              <p style={styles.placeholderSub}>Upload your resume or select a role from below to get started</p>
            </div>
          )}
        </div>

        {/* Role Selector */}
        <div style={styles.roleSection}>
          <h2 style={styles.sectionTitle}>Select Your Target Role</h2>
          <p style={styles.sectionSub}>Choose a role to instantly generate skill gap analysis and personalized interview questions</p>

          {/* Category Tabs */}
          <div style={styles.tabs}>
            {Object.keys(categoryGroups).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ ...styles.tab, ...(activeCategory === cat ? styles.tabActive : {}) }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Role Cards */}
          <div style={styles.roleGrid}>
            {categoryGroups[activeCategory].map((role) => {
              const info = jobRoles[role];
              const isSelected = selectedRole === role;
              const isExpanded = expandedRole === role;
              return (
                <div
                  key={role}
                  style={{ ...styles.roleCard, ...(isSelected ? { ...styles.roleCardSelected, borderColor: info.color } : {}) }}
                  onClick={() => setExpandedRole(isExpanded ? null : role)}
                >
                  <div style={styles.roleCardTop}>
                    <div style={{ ...styles.roleIcon, background: info.color + "22", color: info.color }}>{info.icon}</div>
                    <div style={styles.roleInfo}>
                      <p style={styles.roleName}>{role}</p>
                      <p style={styles.roleSkillCount}>{info.skills.length} core skills</p>
                    </div>
                    {isSelected && <span style={{ ...styles.selectedBadge, background: info.color }}>Selected</span>}
                    <span style={styles.chevron}>{isExpanded ? "▲" : "▼"}</span>
                  </div>

                  {isExpanded && (
                    <div style={styles.roleExpanded}>
                      <div style={styles.skillTagsSmall}>
                        {info.skills.map(s => (
                          <span key={s} style={{ ...styles.tagSmall, borderColor: info.color + "55", color: info.color }}>{s}</span>
                        ))}
                      </div>
                      <button
                        style={{ ...styles.selectRoleBtn, background: info.color }}
                        onClick={(e) => { e.stopPropagation(); handleRoleSelect(role); }}
                      >
                        {isSelected ? "✓ Selected" : "Select This Role"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8FAFF",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#1E293B",
  },
  nav: {
    background: "#2563EB",
    padding: "0 24px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  },
  navInner: { width: "100%", maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navLogo: { display: "flex", alignItems: "center", gap: "10px" },
  logoCircle: { width: "36px", height: "36px", borderRadius: "50%", background: "white", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "12px" },
  logoText: { color: "white", fontWeight: "700", fontSize: "18px" },
  navLinks: { display: "flex", alignItems: "center", gap: "12px" },
  navLink: { color: "white", textDecoration: "none", fontSize: "14px", fontWeight: "500" },
  followBtn: { background: "#8B5CF6", color: "white", border: "none", borderRadius: "8px", padding: "6px 16px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  loginBtn: { background: "#F59E0B", color: "white", border: "none", borderRadius: "8px", padding: "6px 16px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },

  container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" },

  hero: { textAlign: "center", marginBottom: "48px" },
  pill: { display: "inline-block", background: "white", border: "1px solid #E2E8F0", borderRadius: "999px", padding: "6px 16px", fontSize: "13px", fontWeight: "600", color: "#2563EB", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  heroTitle: { fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "800", margin: "0 0 12px", letterSpacing: "-1px", color: "#0F172A" },
  heroAccent: { color: "#2563EB" },
  heroSub: { fontSize: "16px", color: "#64748B", lineHeight: "1.7", margin: 0 },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "48px" },

  card: { background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0" },
  cardHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" },
  cardIcon: { fontSize: "28px", width: "48px", height: "48px", background: "#EFF6FF", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: "18px", fontWeight: "700", margin: "0 0 2px", color: "#0F172A" },
  cardSub: { fontSize: "13px", color: "#94A3B8", margin: 0 },

  dropZone: {
    border: "2px dashed #CBD5E1", borderRadius: "12px", padding: "36px 24px", textAlign: "center",
    cursor: "pointer", transition: "all 0.2s", marginBottom: "20px", background: "#FAFBFF",
  },
  dropZoneActive: { border: "2px dashed #2563EB", background: "#EFF6FF" },
  dropZoneFilled: { border: "2px dashed #10B981", background: "#F0FDF4" },
  uploadIcon: { fontSize: "36px", marginBottom: "10px" },
  dropTitle: { fontSize: "15px", fontWeight: "600", color: "#334155", margin: "0 0 4px" },
  dropSub: { fontSize: "13px", color: "#94A3B8", margin: 0 },
  browseLink: { color: "#2563EB", fontWeight: "600", textDecoration: "underline" },
  fileIcon: { fontSize: "32px", marginBottom: "8px" },
  fileName: { fontSize: "14px", fontWeight: "600", color: "#0F172A", margin: "0 0 4px" },
  fileSize: { fontSize: "12px", color: "#94A3B8", margin: 0 },

  primaryBtn: {
    width: "100%", background: "linear-gradient(135deg, #2563EB, #1D4ED8)", color: "white",
    border: "none", borderRadius: "10px", padding: "13px 24px", fontSize: "15px", fontWeight: "700",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    boxShadow: "0 4px 14px rgba(37,99,235,0.35)", transition: "transform 0.1s, box-shadow 0.1s",
  },
  btnDisabled: { opacity: 0.7, cursor: "not-allowed" },
  spinner: {
    width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white", borderRadius: "50%",
    animation: "spin 0.8s linear infinite", display: "inline-block",
  },
  divider: { display: "flex", alignItems: "center", margin: "20px 0 0", gap: "12px" },
  dividerText: { fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap", padding: "0 8px", background: "white" },

  cardPlaceholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "280px", background: "#FAFBFF" },
  placeholderIcon: { fontSize: "48px", marginBottom: "16px", opacity: 0.5 },
  placeholderTitle: { fontSize: "16px", fontWeight: "700", color: "#334155", margin: "0 0 8px" },
  placeholderSub: { fontSize: "13px", color: "#94A3B8", textAlign: "center", margin: 0, lineHeight: "1.6" },

  coverageWrap: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px", position: "relative" },
  coveragePct: { fontSize: "28px", fontWeight: "800", color: "#0F172A", marginTop: "-8px" },
  coverageLabel: { fontSize: "12px", color: "#64748B", fontWeight: "500" },

  skillSection: { marginBottom: "16px" },
  skillLabel: { fontSize: "12px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" },
  skillTags: { display: "flex", flexWrap: "wrap", gap: "6px" },
  tag: { fontSize: "12px", fontWeight: "600", padding: "4px 10px", borderRadius: "6px" },
  tagGreen: { background: "#DCFCE7", color: "#16A34A" },
  tagOrange: { background: "#FFF7ED", color: "#EA580C" },

  roleSection: {},
  sectionTitle: { fontSize: "28px", fontWeight: "800", color: "#0F172A", margin: "0 0 8px", textAlign: "center" },
  sectionSub: { fontSize: "15px", color: "#64748B", textAlign: "center", margin: "0 0 28px" },

  tabs: { display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap", justifyContent: "center" },
  tab: {
    padding: "8px 18px", borderRadius: "999px", border: "1px solid #E2E8F0",
    background: "white", fontSize: "13px", fontWeight: "600", color: "#64748B",
    cursor: "pointer", transition: "all 0.15s",
  },
  tabActive: { background: "#2563EB", color: "white", border: "1px solid #2563EB" },

  roleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
  roleCard: {
    background: "white", borderRadius: "14px", padding: "18px",
    border: "2px solid #E2E8F0", cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "border-color 0.15s, box-shadow 0.15s",
  },
  roleCardSelected: { boxShadow: "0 4px 16px rgba(37,99,235,0.12)" },
  roleCardTop: { display: "flex", alignItems: "center", gap: "12px" },
  roleIcon: { width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 },
  roleInfo: { flex: 1, minWidth: 0 },
  roleName: { fontSize: "14px", fontWeight: "700", color: "#0F172A", margin: "0 0 2px" },
  roleSkillCount: { fontSize: "12px", color: "#94A3B8", margin: 0 },
  selectedBadge: { fontSize: "10px", fontWeight: "700", color: "white", padding: "2px 8px", borderRadius: "999px", flexShrink: 0 },
  chevron: { fontSize: "10px", color: "#94A3B8", flexShrink: 0 },

  roleExpanded: { marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #F1F5F9" },
  skillTagsSmall: { display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "14px" },
  tagSmall: { fontSize: "11px", fontWeight: "500", padding: "3px 8px", borderRadius: "5px", border: "1px solid", background: "transparent" },
  selectRoleBtn: {
    width: "100%", color: "white", border: "none", borderRadius: "8px",
    padding: "9px 16px", fontSize: "13px", fontWeight: "700", cursor: "pointer",
  },
};