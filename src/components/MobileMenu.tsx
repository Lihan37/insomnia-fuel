import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface MobileMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navLinks = [
  { to: "/menu", label: "Menu" },
  { to: "/catering", label: "Catering" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export default function MobileMenu({ open, setOpen }: MobileMenuProps) {
  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
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
          // HIGH z-index so nothing bleeds through
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
              <h2 className="text-lg font-semibold text-white tracking-wide">Menu</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-orange-400 transition"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 flex flex-col justify-center space-y-6 px-8 text-center">
              {navLinks.map((link) => (
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
            </nav>

            {/* Footer */}
            <div className="text-xs text-center text-gray-500 pb-6">
              © {new Date().getFullYear()} Insomnia Fuel
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
