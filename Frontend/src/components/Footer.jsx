import React from "react";
import { Input, Button } from "antd";
import {
  ArrowRightOutlined,
  InstagramOutlined,
  TwitterOutlined,
  FacebookOutlined,
} from "@ant-design/icons";
import BeyondHorizon from "./BeyondHorizon";

const Footer = ({ onSelectCategory, onNavigatePage }) => {
  const handleCategoryNav = (catKey) => {
    if (onNavigatePage) onNavigatePage("shop");
    onSelectCategory(catKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageNav = (pageKey) => {
    if (onNavigatePage) onNavigatePage(pageKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-white relative">
      {/* 1. Originkit Beyond Horizon WebGL Section (ABOVE Footer Grid) */}
      <div className="relative w-full h-[320px] sm:h-[400px] overflow-hidden border-b border-neutral-900/80">
        <BeyondHorizon
          background="#08080A"
          coreColor="#FFFFFF"
          midColor="#CA121D"
          deepColor="#D61830"
          brightness={2.2}
          coreSize={0.025}
          coreHover={0.045}
          haze={3.2}
          speed={1}
          parallax={3}
          style={{ width: "100%", height: "100%" }}
        />

        {/* Floating Luxury Overlay Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center z-10">
          <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 uppercase tracking-[0.4em] mb-2">
            BEYOND HORIZON
          </span>
          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black uppercase text-white tracking-widest drop-shadow-2xl opacity-90">
            LEGACY PARIS
          </h3>
        </div>
      </div>

      {/* 2. Main Footer Navigation Grid & Copyright */}
      <div className="pt-16 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Responsive Grid Layout - Column 1 gets 2 columns width on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-neutral-800">
          {/* Column 1: Brand Info & Logo */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div
              className="flex items-center space-x-3.5 mb-4 cursor-pointer group"
              onClick={() => handlePageNav("home")}
            >
              <img
                src="/images/LOGO.png"
                alt="Legacy"
                className="h-12 sm:h-16 w-auto filter invert brightness-200 object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-[0.25em] font-black text-white uppercase whitespace-nowrap border-l-2 sm:border-l-3 border-amber-400 pl-3.5 py-0.5 leading-none transition-transform duration-300 group-hover:scale-105">
                LEGACY
              </span>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed font-normal mb-6 max-w-sm">
              Curated Parisian luxury apparel featuring tailored silk shirts,
              heavyweight cotton tees, and handmade calfskin footwear.
            </p>
            <div className="flex space-x-5 text-neutral-300">
              <a
                href="#"
                className="hover:text-white transition-colors"
                title="Instagram"
              >
                <InstagramOutlined style={{ fontSize: "22px" }} />
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
                title="Twitter"
              >
                <TwitterOutlined style={{ fontSize: "22px" }} />
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
                title="Facebook"
              >
                <FacebookOutlined style={{ fontSize: "22px" }} />
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-extrabold uppercase tracking-widest text-white mb-4 font-mono">
              COLLECTIONS
            </h4>
            <ul className="space-y-3 text-sm text-neutral-300 font-medium">
              <li>
                <button
                  onClick={() => handleCategoryNav("all")}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  All Collections
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav("shirt")}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Tailored Shirts
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav("t-shirt")}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Heavyweight T-Shirts
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav("shoes")}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Handmade Footwear & Shoes
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Pages */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-extrabold uppercase tracking-widest text-white mb-4 font-mono">
              CLIENT CARE
            </h4>
            <ul className="space-y-3 text-sm text-neutral-300 font-medium">
              <li>
                <button
                  onClick={() => handlePageNav("about")}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  About Legacy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePageNav("contact")}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  VIP Contact & Concierge
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Express Worldwide Shipping
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Returns & Exchanges
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Privileges */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-extrabold uppercase tracking-widest text-white mb-4 font-mono">
              LUXE PRIVILEGES
            </h4>
            <p className="text-sm text-neutral-300 mb-4 font-normal leading-relaxed">
              Subscribe to receive exclusive access to drop releases & sales.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="Enter your email"
                className="footer-newsletter-input h-12 sm:h-11 text-base sm:text-sm"
              />
              <Button
                type="primary"
                icon={
                  <ArrowRightOutlined
                    style={{ color: "#000000", fontSize: "16px" }}
                  />
                }
                className="footer-newsletter-btn h-12 sm:h-11 px-5"
              />
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-neutral-400 font-mono font-medium">
          <p>&copy; {new Date().getFullYear()} LEGACY. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span>VISA</span>
            <span>MASTERCARD</span>
            <span>AMEX</span>
            <span>APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
