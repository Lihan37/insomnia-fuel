import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#FAF6EF] text-[#5C5C5C] border-t border-[#E8E1D8]">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">

          {/* Left — Logo + tagline */}
          <div className="flex flex-col items-center md:items-start">
            <img src={logo} alt="Insomnia Fuel" className="w-28 mb-4" />
            <p className="text-sm leading-relaxed max-w-xs">
              Serving energy, caffeine, and bold bites for the sleepless souls.
              Fuel your nights — the Insomnia way.
            </p>
          </div>

          {/* Center — Contact */}
          <div className="flex flex-col items-center">
            <h3 className="text-[#1E1E1E] font-semibold mb-4 text-base">
              Contact Us
            </h3>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 justify-center">
                <Phone size={16} className="text-[#FF004C]" />
                +61 4 1234 5678
              </li>
              <li className="flex items-center gap-2 justify-center">
                <Mail size={16} className="text-[#FF004C]" />
                hello@insomniafuel.com
              </li>
              <li>Parramatta, NSW, Australia</li>
            </ul>
          </div>

          {/* Right — Socials */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-[#1E1E1E] font-semibold mb-4 text-base">
              Follow Us
            </h3>

            <div className="flex gap-5">
              <a
                href="#"
                className="hover:text-[#FF004C] transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="hover:text-[#FF004C] transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

        </div>

        {/* Divider + bottom credit */}
        <div className="border-t border-[#E8E1D8] mt-10 pt-4 text-center text-xs text-[#5C5C5C]">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-[#1E1E1E]">Insomnia Fuel</span>.
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}
