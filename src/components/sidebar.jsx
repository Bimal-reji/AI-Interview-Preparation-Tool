import { Link } from "react-router-dom";

export default function Sidebar({ isOpen }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#0f172a] text-white w-64 p-6 transform 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      transition-transform duration-300`}
    >
      <h2 className="text-xl font-bold mb-8">GetMePlaced</h2>

      <nav className="flex flex-col gap-4">
        <Link to="/">Dashboard</Link>
        <Link to="/upload">Upload Resume</Link>
        <Link to="/practice">Practice Questions</Link>
        <Link to="/mock">Mock Interview</Link>
        <Link to="/dsa">DSA Practice</Link>
      </nav>
    </div>
  );
}