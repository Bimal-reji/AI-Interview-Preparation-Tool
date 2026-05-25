import { useNavigate } from "react-router-dom";
import Orb from "../components/Orb";

export default function Home() {

  const navigate = useNavigate();

  const features = [

    {
      icon: "🤖",
      title: "AI Mock Interviews",
      desc: "Practice adaptive AI interviews with intelligent follow-up questions.",
    },

    {
      icon: "📄",
      title: "Resume Analysis",
      desc: "Upload resumes and get AI-powered ATS feedback instantly.",
    },

    {
      icon: "🧩",
      title: "DSA Practice",
      desc: "Solve coding problems with real interview-style challenges.",
    },

    {
      icon: "🎤",
      title: "Voice Interview",
      desc: "Answer naturally using built-in voice recognition support.",
    },

    {
      icon: "📊",
      title: "Progress Tracking",
      desc: "Track interview performance and skill growth over time.",
    },

    {
      icon: "⚡",
      title: "Real-Time AI",
      desc: "Powered by Groq LLM APIs for ultra-fast responses.",
    },
  ];

  return (

    <div className="min-h-screen bg-white text-black overflow-hidden">

      {/* ================================================= */}
      {/* HERO SECTION */}
      {/* ================================================= */}

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f5f7fb]">

        {/* ORB */}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

          <div className="scale-[2.75] opacity-90">

            <Orb
              hoverIntensity={2}
              rotateOnHover={true}
              hue={360}
              forceHoverState={false}
            />

          </div>

        </div>

        {/* CONTENT */}

        <div className="relative z-10 max-w-5xl mx-auto text-center px-6">

          {/* TITLE */}

          <h1 className="text-4xl md:text-4xl font-extrabold text-black mb-8 tracking-tight leading-tight">

            AI Interview  Preparation Tool

            <br />

          </h1>

          {/* DESCRIPTION */}

          <p className="text-xl md:text-2xl text-gray-600 leading-10 max-w-4xl mx-auto mb-14">

            Practice interviews, improve coding skills,
            and get ready for your dream job using
            AI-powered preparation.

          </p>

          {/* BUTTONS */}

          <div className="flex flex-wrap justify-center gap-5">

            <button

              onClick={() =>
                navigate("/resume")
              }

            
    className="
      px-7
      py-3
      rounded-xl
      bg-orange-500
      text-white
      font-semibold
      text-base
      shadow-lg
      hover:bg-orange-600
      hover:scale-105
      transition-all
      duration-300
              "
            >
              Start Practicing
            </button>

            <button

              onClick={() =>
                navigate("/courses")
              }

              
    className="
      px-7
      py-3
      rounded-xl
      bg-[#2f3b52]
      text-white
      font-medium
      text-base
      shadow-md
      hover:bg-[#1f2937]
      hover:scale-105
      transition-all
      duration-300
              "
            >
              Learn Courses
            </button>

          </div>

        </div>

      </section>

      {/* ================================================= */}
      {/* FEATURES */}
      {/* ================================================= */}

      <section className="py-24 px-6 bg-gray-50">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-extrabold mb-6">
              Everything You Need
            </h2>

            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              GetMePlaced provides a complete AI-powered interview preparation ecosystem.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {features.map((feature) => (

              <div
                key={feature.title}

                className="bg-white border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >

                <div className="text-5xl mb-6">
                  {feature.icon}
                </div>

                <h3 className="text-2xl font-bold mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-8">
                  {feature.desc}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================================================= */}
      {/* ABOUT */}
      {/* ================================================= */}

      <section className="py-24 px-6 bg-white">

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

          {/* LEFT */}

          <div>

            <div className="inline-block px-5 py-2 rounded-full border border-purple-200 bg-purple-50 text-purple-600 text-sm font-semibold mb-6">
              ✨ About GetMePlaced
            </div>

            <h2 className="text-5xl font-extrabold leading-tight mb-8">

              Built for
              <br />

              Modern Engineers

            </h2>

            <p className="text-gray-600 text-lg leading-8 mb-8">

              GetMePlaced helps students and professionals prepare for technical interviews using adaptive AI technology, intelligent follow-up conversations, resume analysis, and DSA practice.

            </p>

            <div className="space-y-5">

              {[
                "AI-powered adaptive interview engine",
                "Real-time voice interaction",
                "Resume ATS analysis",
                "DSA preparation platform",
                "Modern recruiter-style interview flow",
              ].map((item) => (

                <div
                  key={item}

                  className="flex items-center gap-4"
                >

                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    ✓
                  </div>

                  <span className="text-gray-700 text-lg">
                    {item}
                  </span>

                </div>

              ))}

            </div>

          </div>

          {/* RIGHT */}

          <div className="grid grid-cols-2 gap-6">

            {[
              ["2400+", "Users"],
              ["150+", "DSA Problems"],
              ["98%", "Success Rate"],
              ["24/7", "AI Support"],
            ].map(([num, label]) => (

              <div
                key={label}

                className="bg-gray-50 border border-gray-200 rounded-3xl p-10 text-center shadow-lg"
              >

                <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-4">
                  {num}
                </div>

                <div className="text-gray-600 font-medium">
                  {label}
                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================================================= */}
      {/* CTA */}
      {/* ================================================= */}

      <section className="py-24 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white">

        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-5xl font-extrabold mb-8">
            Ready to Crack Your Dream Job?
          </h2>

          <p className="text-xl leading-8 mb-10 opacity-90">
            Start practicing with AI-powered interviews today.
          </p>

          <button
            onClick={() =>
              navigate("/mock")
            }

            className="px-10 py-5 rounded-2xl bg-white text-black font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Start Now →
          </button>

        </div>

      </section>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="py-10 text-center text-gray-500 border-t border-gray-200">

        © 2026 GetMePlaced. Built with React + FastAPI + Groq AI.

      </footer>

    </div>
  );
}