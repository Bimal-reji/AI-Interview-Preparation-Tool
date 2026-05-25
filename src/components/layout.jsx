import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex">

      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 min-h-screen bg-[#020617] text-white">

        <Navbar toggleSidebar={toggleSidebar} />

        <main className="p-6">
          {children}
        </main>

      </div>

    </div>
  );
}