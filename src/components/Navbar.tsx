// src/components/Navbar.tsx
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import logo from "../assets/logo.png";
import MobileMenu from "./MobileMenu";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { IOrder } from "@/types/order";
import { useLiveUnreadCount } from "@/hooks/useLiveUnreadCount";

type NavLinkItem = { to: string; label: string; hidden?: boolean };

const links: NavLinkItem[] = [
  { to: "/menu", label: "Menu" },
  { to: "/catering", label: "Catering" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [shadow, setShadow] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);
  const orderMenuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const { user, isAdmin, isClient, logout } = useAuth();
  const { count: userLiveUnread } = useLiveUnreadCount({
    forRole: "user",
    enabled: isClient,
  });

  useEffect(() => {
    setOpen(false);
    setOrderMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const handleScroll = () => setShadow(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        orderMenuRef.current &&
        !orderMenuRef.current.contains(event.target as Node)
      ) {
        setOrderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPendingOrders = useCallback(async () => {
    if (!user || !isAdmin) {
      setPendingOrders(0);
      return;
    }

    try {
      const token = await user.getIdToken();
      const res = await api.get<{ items: IOrder[] }>("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const nextCount = (res.data.items || []).filter(
        (order) => order.status === "pending"
      ).length;
      setPendingOrders(nextCount);
    } catch (err) {
      console.error("Failed to load pending orders:", err);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setPendingOrders(0);
      return;
    }
    fetchPendingOrders();
    const id = setInterval(fetchPendingOrders, 60000);
    return () => clearInterval(id);
  }, [fetchPendingOrders, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const handler = () => fetchPendingOrders();
    window.addEventListener("orders-updated", handler);
    return () => window.removeEventListener("orders-updated", handler);
  }, [fetchPendingOrders, isAdmin]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 text-[15px] font-medium transition-colors ${
      isActive ? "text-[#790808]" : "text-neutral-800 hover:text-[#790808]"
    }`;

  const orderLinks = [
    { label: "Order Food", to: "/order" },
    { label: "Catering Order", to: "/order/catering" },
  ];
  const getOrderLink = (path: string) => ({
    to: user ? path : "/register",
    state: user ? undefined : { next: path },
  });

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white/85 backdrop-blur-md text-neutral-900 border-b border-black/5 transition-shadow ${
          shadow ? "shadow-md" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid h-24 grid-cols-3 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="Insomnia Fuel Logo"
                className="h-16 w-auto sm:h-16 md:h-20 lg:h-24 object-contain"
              />
            </Link>

            {/* Center links */}
            <nav className="hidden md:flex items-center justify-center gap-8 text-base font-medium">
              {links
                .filter((l) => !l.hidden)
                .map((l) => (
                  <NavLink key={l.to} to={l.to} className={linkClass}>
                    {l.label}
                  </NavLink>
                ))}

              {/* Role-based dashboard links */}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `${linkClass({ isActive })} whitespace-nowrap`
                  }
                >
                  <span className="relative inline-flex items-center">
                    Admin
                    {pendingOrders > 0 && (
                      <span className="absolute -top-2 -right-3 min-w-[18px] rounded-full bg-[#790808] px-1 text-[10px] font-semibold leading-[18px] text-white text-center">
                        {pendingOrders}
                      </span>
                    )}
                  </span>
                </NavLink>
              )}
              {isClient && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `${linkClass({ isActive })} whitespace-nowrap`
                  }
                >
                  <span className="relative inline-flex items-center">
                    Activity
                    {userLiveUnread > 0 && (
                      <span className="absolute -top-2 -right-3 min-w-[18px] rounded-full bg-[#790808] px-1 text-[10px] font-semibold leading-[18px] text-white text-center">
                        {userLiveUnread}
                      </span>
                    )}
                  </span>
                </NavLink>
              )}
            </nav>

            {/* Right controls */}
            <div className="col-start-3 justify-self-end flex items-center gap-2">
              {/* Login/Logout FIRST (left of Order Online) */}
              {!user ? (
                <Link
                  to="/login"
                  className="hidden md:inline-block text-sm font-medium text-neutral-700 hover:text-[#790808]"
                >
                  Log in
                </Link>
              ) : (
                <button
                  onClick={logout}
                  className="hidden md:inline-block text-sm font-medium text-neutral-700 hover:text-[#790808]"
                >
                  Logout
                </button>
              )}

              {/* Then the CTA (dropdown) */}
              <div
                ref={orderMenuRef}
                className="relative hidden md:inline-flex"
              >
                <button
                  type="button"
                  onClick={() => setOrderMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={orderMenuOpen}
                  className="inline-flex items-center gap-2 rounded-full bg-[#350404] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:bg-[#790808] transition"
                >
                  Order Online
                  <span className="text-[10px] opacity-80">▼</span>
                </button>

                {orderMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 min-w-full w-48 rounded-2xl border border-amber-100/80 bg-white/95 p-2 shadow-[0_16px_36px_-22px_rgba(30,20,10,0.6)] backdrop-blur-md">
                    <div className="h-1.5 w-full rounded-full bg-[#350404] mb-1" />
                    {orderLinks.map((link) => (
                      <Link
                        key={link.to}
                        {...getOrderLink(link.to)}
                        className="group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-[#1E2B4F] hover:bg-amber-50/90 transition"
                        onClick={() => setOrderMenuOpen(false)}
                      >
                        <span>{link.label}</span>
                        <span className="text-[10px] text-amber-700/70 opacity-0 transition group-hover:opacity-100">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Burger */}
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl
                           text-neutral-900 hover:text-[#350404] border border-gray-300/70
                           hover:bg-gray-100 shadow-sm transition"
              >
                <Menu size={26} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu mirrors role links and button order */}
      <MobileMenu
        open={open}
        setOpen={setOpen}
        pendingAdminOrders={pendingOrders}
        userLiveUnread={userLiveUnread}
      />
    </>
  );
}
