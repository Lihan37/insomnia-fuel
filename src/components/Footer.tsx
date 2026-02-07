import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#FAF6EF] text-[#5C5C5C] border-t border-[#E8E1D8]">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {/* Left - Logo + tagline */}
          <div className="flex flex-col items-center md:items-start">
            <img src={logo} alt="Insomnia Fuel" className="w-28 mb-4" />
            <p className="text-sm leading-relaxed max-w-xs">
              Serving energy, caffeine, and bold bites for the sleepless souls.
              Fuel your day - the Insomnia way.
            </p>
          </div>

          {/* Center - Contact */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-[#1E1E1E] font-semibold mb-4 text-base">
              Contact
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-[#1E1E1E]">Phone</dt>
                <dd className="flex items-center gap-2 justify-center">
                  <Phone size={16} className="text-[#FF004C]" />
                  <a
                    href="tel:+61449605427"
                    className="hover:text-[#FF004C] transition-colors"
                  >
                    +61 449 605 427
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[#1E1E1E]">Address</dt>
                <dd className="flex items-start gap-2 justify-center">
                  <MapPin size={16} className="text-[#FF004C] mt-0.5" />
                  <span>Shop-2, 60 Park Street, Sydney, NSW 2000</span>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[#1E1E1E]">Email</dt>
                <dd className="flex items-center gap-2 justify-center">
                  <Mail size={16} className="text-[#FF004C]" />
                  <a
                    href="mailto:insomniafuel12@gmail.com"
                    className="hover:text-[#FF004C] transition-colors"
                  >
                    insomniafuel12@gmail.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Right - Socials */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-[#1E1E1E] font-semibold mb-4 text-base">
              Social profiles
            </h3>

            <div className="flex flex-col items-center md:items-end gap-2 text-sm">
              <a
                href="https://www.facebook.com/profile.php?id=61586130992006"
                className="hover:text-[#FF004C] transition-colors"
              >
                <Facebook size={28} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider + bottom credit */}
        <div className="border-t border-[#E8E1D8] mt-10 pt-4 text-center text-xs text-[#5C5C5C]">
          Copyright {new Date().getFullYear()}{" "}
          <span className="font-medium text-[#1E1E1E]">Insomnia Fuel</span>.
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}
