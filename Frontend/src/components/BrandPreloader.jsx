import React from "react";

const BrandPreloader = ({ text = "INITIALIZING ALEXANDRE LUXE..." }) => {
  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-white transition-opacity duration-500 animate-in fade-in">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-black/80 to-black pointer-events-none" />

      {/* Main Animated Circular Loader Container */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-6">
        {/* Outer Spinning Golden Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-500/60 animate-spin-slow shadow-[0_0_30px_rgba(212,175,55,0.2)]" />

        {/* Counter-Rotating Inner Ring */}
        <div className="absolute inset-2.5 rounded-full border border-dashed border-neutral-700 animate-spin-reverse" />

        {/* Circular SVG Orbit Text */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin-slow"
          viewBox="0 0 100 100"
        >
          <path
            id="preloaderCirclePath"
            d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
            fill="none"
          />
          <text className="text-[6.5px] font-mono font-extrabold fill-amber-300 uppercase tracking-[0.25em]">
            <textPath href="#preloaderCirclePath" startOffset="0%">
              • ALEXANDRE LUXE • HAUTE COUTURE • EST. 2026 • PARIS • MILAN •
            </textPath>
          </text>
        </svg>

        {/* Center Pulsing Logo Emblem */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-950 border border-amber-500/40 flex items-center justify-center shadow-2xl z-10 p-2.5 animate-pulse">
          <img
            src="/images/LOGO.png"
            alt="Alexandre Luxe Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
          <span className="hidden font-serif font-extrabold text-amber-400 text-lg">
            LX
          </span>
        </div>
      </div>

      {/* Loading Status Text & Shimmer Bar */}
      <div className="relative z-10 text-center space-y-2">
        <h3 className="font-serif font-bold text-xs sm:text-sm tracking-[0.25em] uppercase text-white animate-pulse">
          {text}
        </h3>

        {/* Animated Progress Line */}
        <div className="w-48 h-0.5 bg-neutral-800 rounded-full overflow-hidden mx-auto">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-marquee-infinite" />
        </div>

        <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest pt-1">
          Parisian Tailoring • Authentic Worldwide Express
        </p>
      </div>
    </div>
  );
};

export default BrandPreloader;
