// src/components/MobileMenu.tsx
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface MobileMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  pendingAdminOrders?: number;
}

const baseLinks = [
  { to: "/menu", label: "Menu" },
  { to: "/catering", label: "Catering" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export default function MobileMenu({
  open,
  setOpen,
  pendingAdminOrders = 0,
}: MobileMenuProps) {
  const { user, isAdmin, isClient, logout } = useAuth();

  // Same order logic as Navbar
  const orderLinks = [
    { label: "Order Food", to: "/order" },
    { label: "Catering Order", to: "/order/catering" },
  ];
  const getOrderLink = (path: string) => ({
    to: user ? path : "/register",
    state: user ? undefined : { next: path },
  });

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 80, damping: 16 }}
            className="absolute right-0 top-0 h-full w-64 sm:w-72 bg-[#0A0A12] text-gray-200 border-l border-gray-800 shadow-[0_0_30px_rgba(255,102,0,0.25)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white tracking-wide">
                Menu
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-orange-400 transition"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Links (same as Navbar + role-based) */}
            <nav className="flex-1 flex flex-col justify-center space-y-5 px-8 text-center">
              {baseLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium tracking-wide hover:text-orange-400 transition relative group"
                >
                  {link.label}
                  <span className="pointer-events-none absolute -bottom-1 left-1/2 w-0 h-[2px] bg-orange-400 transition-all group-hover:w-full group-hover:left-0" />
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium tracking-wide hover:text-orange-400 transition relative"
                >
                  <span className="relative inline-flex items-center justify-center">
                    Admin
                    {pendingAdminOrders > 0 && (
                      <span className="absolute -top-2 -right-4 min-w-[18px] rounded-full bg-orange-500 px-1 text-[10px] font-semibold leading-[18px] text-white text-center">
                        {pendingAdminOrders}
                      </span>
                    )}
                  </span>
                </Link>
              )}

              {isClient && (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium tracking-wide hover:text-orange-400 transition"
                >
                  Activity
                </Link>
              )}

              <div className="pt-4 space-y-3">
                {orderLinks.map((link, index) => (
                  <Link
                    key={link.to}
                    {...getOrderLink(link.to)}
                    onClick={() => setOpen(false)}
                    className={
                      index === 0
                        ? "block w-full rounded-full bg-[#350404] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:bg-[#790808] transition text-center"
                        : "block w-full rounded-full border border-gray-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-gray-200 hover:border-orange-400 hover:text-orange-400 transition text-center"
                    }
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Auth actions */}
            <div className="px-6 pb-6 space-y-3 border-t border-gray-800">
              {!user ? (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full text-sm font-medium text-gray-300 hover:text-orange-400 text-center"
                >
                  Log in
                </Link>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="block w-full text-sm font-medium text-gray-300 hover:text-orange-400 text-center"
                >
                  Logout
                </button>
              )}

              <p className="text-[11px] text-center text-gray-500 pt-2">
                © {new Date().getFullYear()} Insomnia Fuel
              </p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
