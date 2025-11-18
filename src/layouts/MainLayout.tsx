// src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5EEDF] text-gray-100">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer /> {/* ✅ new footer */}
    </div>
  );
}
