import { Menu } from "lucide-react";

export default function Navbar({ toggleSidebar }) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#020617] text-white">

      <button onClick={toggleSidebar}>
        <Menu size={28} />
      </button>

      <h1 className="text-lg font-semibold">
        AI Interview Preparation Tool
      </h1>

    </div>
  );
}