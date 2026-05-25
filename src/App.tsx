import { Button, Header } from "@jamsr-ui/react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";

import Courses from "./pages/Courses";
import { Logo } from "./components/Logo";
import ResumeUpload from "./pages/ResumeUpload";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import MockInterview from "./pages/MockInterview";

import DSAPractice from "./pages/DSAPractice";
import FollowUpInterview from "./pages/FollowUpInterview";
import LoginPage from "./pages/LoginPage";
function App() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex">

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#020617] text-white p-6 transform 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 z-50`}
      >

        <h2 className="text-xl font-bold mb-8">GetMePlaced</h2>

        <nav className="flex flex-col gap-4">

          <Link to="/" onClick={() => setSidebarOpen(false)}>Home</Link>
          <Link to="/resume" onClick={() => setSidebarOpen(false)}>Upload Resume</Link>
          <Link to="/practice" onClick={() => setSidebarOpen(false)}>Practice Questions</Link>
          <Link to="/mock" onClick={() => setSidebarOpen(false)}>Mock Interview</Link>
          <Link to="/dsa" onClick={() => setSidebarOpen(false)}>DSA Practice</Link>
          
          <Link to="/login" onClick={() => setSidebarOpen(false)}>Login</Link>

        </nav>

      </div>

      {/* MAIN */}
      <div className="flex-1">

        {/* NAVBAR */}
        <Header className="w-full flex justify-between items-center py-4 px-10 bg-blue-600">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white"
            >
              <Menu size={28} />
            </button>

            <Logo />

          </div>

          <div className="flex items-center gap-4">

            <Link to="/courses">
              <Button className="bg-blue-700 text-white">
                Courses
              </Button>
            </Link>

            <Button
              onClick={() => navigate("/followup")}
              className="bg-purple-500 text-white"
            >
              Follow-Up
            </Button>

           <Button
  onClick={() => navigate("/login")}
  className="bg-orange-500 text-white"
>
  Login
</Button>

          </div>

        </Header>

        {/* ROUTES */}
        <div className="p-6">

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resume" element={<ResumeUpload />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/mock" element={<MockInterview />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/dsa" element={<DSAPractice />} />
            
            <Route path="/followup" element={<FollowUpInterview />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>

        </div>

      </div>

    </div>
  );
}

export default App;
