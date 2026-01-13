// src/pages/admin/AdminLayout.tsx
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  Shield,
  Home,
  UtensilsCrossed,
  ReceiptText,
  MessageCircleMore,        // ðŸ‘ˆ NEW
} from "lucide-react";

const navItem =
  "flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition";
const muted = "text-neutral-200/90 hover:bg-white/10";
const active = "bg-white text-[#1E2B4F] shadow-sm hover:bg-white";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF5EF]">
      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#1E2B4F] to-[#2b3b68] text-white px-4 py-5 transition-transform duration-200 shadow-2xl",
            open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <button
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/20 px-2 py-1 text-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            <Menu className="h-4 w-4" /> Close
          </button>

          {/* Brand */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold tracking-tight">
                  Insomnia Fuel
                </div>
                <div className="text-xs text-white/70">Admin Suite</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : muted}`
              }
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Overview</span>
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : muted}`
              }
            >
              <Users className="h-5 w-5" />
              <span>Users</span>
            </NavLink>

            <NavLink
              to="/admin/menu"
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : muted}`
              }
            >
              <UtensilsCrossed className="h-5 w-5" />
              <span>Menu</span>
            </NavLink>

            {/* Orders */}
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : muted}`
              }
            >
              <ReceiptText className="h-5 w-5" />
              <span>Orders</span>
            </NavLink>

            {/* ðŸ‘‡ NEW: Messages */}
            <NavLink
              to="/admin/messages"
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : muted}`
              }
            >
              <MessageCircleMore className="h-5 w-5" />
              <span>Messages</span>
            </NavLink>

            {/* Go back home */}
            <div className="pt-4 mt-4 border-t border-white/20">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? active : muted}`
                }
              >
                <Home className="h-5 w-5" />
                <span>Go Back Home</span>
              </NavLink>
            </div>
          </nav>

          {/* Footer info */}
          <div className="mt-6 rounded-xl bg-white/10 p-3 text-xs text-white/80">
            Sydney CBD, NSW - v1.0
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              // TODO: hook to AuthContext.logout()
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        {/* Mobile trigger */}
        <button
          className="fixed right-4 top-4 z-40 rounded-xl bg-[#1E2B4F] p-2 text-white shadow hover:bg-[#263567] transition lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Content */}
        <main className="flex-1 lg:ml-72 w-full">
          <div className="p-5 md:p-8">
            {/* Page header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1E2B4F]">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                Manage insights, users, and content.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 shadow-sm">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}


