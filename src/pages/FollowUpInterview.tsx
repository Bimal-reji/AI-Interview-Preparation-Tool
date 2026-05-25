import {
  useState,
  useRef,
  useEffect,
} from "react";

const API = import.meta.env.VITE_API_URL;

const JOB_ROLES = [

  {
    name: "Software Developer",
    icon: "💻",
    color: "#4f46e5",
  },

  {
    name: "Frontend Developer",
    icon: "🎨",
    color: "#06b6d4",
  },

  {
    name: "Backend Developer",
    icon: "⚙️",
    color: "#22c55e",
  },

  {
    name: "Data Scientist",
    icon: "📊",
    color: "#0ea5e9",
  },

  {
    name: "AI / ML Engineer",
    icon: "🤖",
    color: "#f59e0b",
  },

  {
    name: "DevOps Engineer",
    icon: "☁️",
    color: "#8b5cf6",
  },
];

interface Message {

  sender:
    | "ai"
    | "user";

  text: string;
}

export default function FollowUpInterview() {

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [answer, setAnswer] =
    useState("");

  const [selectedRole, setSelectedRole] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [started, setStarted] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [questionCount, setQuestionCount] =
    useState(0);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  // =================================================
  // AUTO SCROLL
  // =================================================

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  // =================================================
  // TEXT TO SPEECH
  // =================================================

  const speak = (
    text: string
  ) => {

    if (!text) return;

    const speech =
      new SpeechSynthesisUtterance(
        text
      );

    speech.lang = "en-US";

    speech.rate = 1;

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(
      speech
    );
  };

  // =================================================
  // START INTERVIEW
  // =================================================

  const startInterview =
    async () => {

      if (!selectedRole) {

        alert(
          "Please select a role"
        );

        return;
      }

      setLoading(true);

      setMessages([]);

      setQuestionCount(0);

      try {

        const response =
          await fetch(
            `${API}/start-interview`,
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                role: selectedRole,
              }),
            }
          );

        if (!response.ok) {

          throw new Error(
            "Failed to start interview"
          );
        }

        const data =
          await response.json();

        const firstQuestion =
          data.question ||
          "Tell me about yourself.";

        setMessages([
          {
            sender: "ai",
            text: firstQuestion,
          },
        ]);

        setStarted(true);

        setQuestionCount(1);

        speak(firstQuestion);

      } catch (error) {

        console.error(error);

        const fallback =
          "Tell me about your most challenging project.";

        setMessages([
          {
            sender: "ai",
            text: fallback,
          },
        ]);

        setStarted(true);

        setQuestionCount(1);

        speak(fallback);
      }

      setLoading(false);
    };

  // =================================================
  // SEND ANSWER
  // =================================================

  const sendAnswer =
    async () => {

      const trimmed =
        answer.trim();

      if (
        !trimmed ||
        loading
      ) return;

      const lastQuestion =
        messages
          .filter(
            (m) =>
              m.sender === "ai"
          )
          .pop()?.text || "";

      const history =
        messages.map(
          (m) => ({

            role:
              m.sender === "ai"
                ? "assistant"
                : "user",

            content: m.text,
          })
        );

      // ADD USER MESSAGE

      setMessages((prev) => [

        ...prev,

        {
          sender: "user",
          text: trimmed,
        },
      ]);

      setAnswer("");

      setLoading(true);

      try {

        const response =
          await fetch(
            `${API}/follow-up-question`,
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                role:
                  selectedRole,

                question:
                  lastQuestion,

                answer:
                  trimmed,

                history,
              }),
            }
          );

        if (!response.ok) {

          throw new Error(
            "Failed follow-up"
          );
        }

        const data =
          await response.json();

        const reply =
          data.follow_up ||
          "Can you explain further?";

        setMessages((prev) => [

          ...prev,

          {
            sender: "ai",
            text: reply,
          },
        ]);

        setQuestionCount(
          (p) => p + 1
        );

        speak(reply);

      } catch (error) {

        console.error(error);

        const fallback =
          "Interesting answer. Can you explain your approach in more detail?";

        setMessages((prev) => [

          ...prev,

          {
            sender: "ai",
            text: fallback,
          },
        ]);

        speak(fallback);
      }

      setLoading(false);
    };

  // =================================================
  // VOICE INPUT
  // =================================================

  const startVoiceInput =
    () => {

      const SpeechRecognition =
        window.SpeechRecognition ||
        (window as any)
          .webkitSpeechRecognition;

      if (!SpeechRecognition) {

        alert(
          "Speech recognition not supported"
        );

        return;
      }

      const recognition =
        new SpeechRecognition();

      recognition.lang =
        "en-US";

      recognition.interimResults =
        false;

      setListening(true);

      recognition.onresult =
        (e: any) => {

          setAnswer(
            e.results[0][0]
              .transcript
          );

          setListening(false);
        };

      recognition.onerror =
        () => {

          setListening(false);
        };

      recognition.onend =
        () => {

          setListening(false);
        };

      recognition.start();
    };

  // =================================================
  // ENTER KEY
  // =================================================

  const handleKeyDown =
    (
      e:
        React.KeyboardEvent<HTMLInputElement>
    ) => {

      if (
        e.key === "Enter" &&
        !e.shiftKey
      ) {

        e.preventDefault();

        sendAnswer();
      }
    };

  // =================================================
  // UI
  // =================================================

  return (

    <div className="min-h-screen bg-white px-6 py-20">

      <div className="max-w-5xl mx-auto">

        {/* HERO */}
        <div className="text-center mb-16">

          <div className="inline-block px-5 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-sm font-semibold mb-6">
            🤖 AI Mock Interview
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-gray-900">

            Adaptive
            <br />

            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Follow-Up Interview
            </span>

          </h1>

          <p className="max-w-3xl mx-auto text-gray-600 text-lg leading-8">
            Practice real AI-powered technical interviews
            with intelligent follow-up questions based on
            your answers.
          </p>

        </div>

        {/* ROLE CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-10">

          {JOB_ROLES.map((role) => (

            <button
              key={role.name}

              onClick={() =>
                setSelectedRole(
                  role.name
                )
              }

              className={`p-6 rounded-3xl border transition-all duration-300 text-left shadow-md hover:shadow-xl hover:-translate-y-1
              ${
                selectedRole ===
                role.name
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >

              <div className="text-4xl mb-4">
                {role.icon}
              </div>

              <h3 className="font-bold text-gray-900 text-lg">
                {role.name}
              </h3>

            </button>

          ))}

        </div>

        {/* START BUTTON */}
        <button

          onClick={startInterview}

          disabled={
            !selectedRole ||
            loading
          }

          className="w-full py-4 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-40 mb-10"
        >

          {loading && !started
            ? "Starting Interview..."
            : started
            ? "Restart Interview"
            : "Start Interview"}

        </button>

        {/* QUESTION COUNT */}
        {started && (

          <div className="mb-5 text-gray-500 font-medium">
            Questions Asked:
            {" "}
            {questionCount}
          </div>

        )}

        {/* CHAT */}
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 h-[550px] overflow-y-auto mb-6 shadow-lg">

          {messages.length === 0 && (

            <div className="flex items-center justify-center h-full text-gray-400 text-lg">
              Start the interview to begin 🚀
            </div>

          )}

          <div className="space-y-5">

            {messages.map(
              (
                msg,
                index
              ) => (

                <div
                  key={index}

                  className={`flex ${
                    msg.sender ===
                    "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[80%] px-6 py-4 rounded-3xl text-sm leading-8 shadow-md
                    ${
                      msg.sender ===
                      "ai"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-tl-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-tr-none"
                    }`}
                  >
                    {msg.text}
                  </div>

                </div>

              )
            )}

            {loading && started && (

              <div className="flex justify-start">

                <div className="px-5 py-4 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white animate-pulse shadow-lg">
                  AI is thinking...
                </div>

              </div>

            )}

            <div ref={bottomRef} />

          </div>

        </div>

        {/* INPUT */}
        <div className="flex gap-4">

          <input

            value={answer}

            onChange={(e) =>
              setAnswer(
                e.target.value
              )
            }

            onKeyDown={
              handleKeyDown
            }

            placeholder="Type your answer..."

            disabled={
              !started ||
              loading
            }

            className="flex-1 px-5 py-4 rounded-2xl border border-gray-200 bg-white shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
          />

          {/* MIC */}
          <button

            onClick={
              startVoiceInput
            }

            disabled={
              listening ||
              loading ||
              !started
            }

            className="px-6 rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all"
          >

            {listening
              ? "🔴"
              : "🎤"}

          </button>

          {/* SEND */}
          <button

            onClick={sendAnswer}

            disabled={
              !answer.trim() ||
              loading ||
              !started
            }

            className="px-8 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold shadow-lg hover:shadow-2xl transition-all disabled:opacity-40"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}