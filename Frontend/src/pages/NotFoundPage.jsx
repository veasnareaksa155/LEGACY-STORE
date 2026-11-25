import React from "react";
import { Button } from "antd";
import {
  HomeOutlined,
  ShoppingOutlined,
  CompassOutlined,
  ArrowRightOutlined,
  MailOutlined,
  CrownOutlined,
} from "@ant-design/icons";

const NotFoundPage = ({
  invalidPath = "",
  onNavigateHome,
  onNavigateShop,
  onNavigateContact,
}) => {
  return (
    <div className="relative min-h-[75vh] flex items-center justify-center bg-white px-4 py-16 sm:py-24 overflow-hidden">
      {/* Background Architectural Accent Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-black" />
        <div className="absolute right-1/4 top-0 bottom-0 w-px bg-black" />
        <div className="absolute top-1/3 left-0 right-0 h-px bg-black" />
      </div>

      {/* Radial Ambient Gold Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
        {/* Emblem Crest */}
        <div className="inline-flex items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neutral-900 border-2 border-amber-400/60 flex items-center justify-center text-amber-400 shadow-xl">
              <CompassOutlined className="text-4xl sm:text-5xl animate-[spin_12s_linear_infinite]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center font-serif font-black text-xs shadow-md">
              <CrownOutlined />
            </div>
          </div>
        </div>

        {/* 404 Dramatic Monospace Display */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-extrabold uppercase tracking-[0.3em] text-amber-600 block">
            ✦ ERROR 404 • LA PAGE INTROUVABLE ✦
          </span>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black font-serif uppercase tracking-tight text-neutral-950 m-0 leading-none">
            404
          </h1>
          <h2 className="text-lg sm:text-xl font-serif font-bold uppercase tracking-widest text-neutral-800 pt-2">
            PAGE NOT FOUND IN ARCHIVES
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-md mx-auto leading-relaxed">
            The bespoke creation, catalog corridor, or atelier page you are searching
            for does not exist or has been relocated to our private vault.
          </p>
        </div>

        {/* Path Indicator Pill */}
        {invalidPath && (
          <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-4 py-1.5 rounded-full text-xs font-mono text-neutral-600 shadow-2xs">
            <span className="text-neutral-400">REQUESTED:</span>
            <span className="font-bold text-neutral-900 truncate max-w-xs sm:max-w-md">
              {invalidPath}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-mono font-extrabold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <HomeOutlined className="text-amber-400 text-sm" />
            <span>RETURN TO HOME</span>
          </button>

          <button
            type="button"
            onClick={onNavigateShop}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs font-mono font-bold uppercase tracking-widest transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ShoppingOutlined className="text-sm" />
            <span>EXPLORE COLLECTIONS</span>
            <ArrowRightOutlined className="text-xs text-neutral-500" />
          </button>

          {onNavigateContact && (
            <button
              type="button"
              onClick={onNavigateContact}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-neutral-50 text-neutral-600 hover:text-black border border-neutral-200 text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MailOutlined className="text-xs" />
              <span>CONCIERGE</span>
            </button>
          )}
        </div>

        {/* Quick Links Card */}
        <div className="pt-8 border-t border-neutral-200/80 max-w-lg mx-auto">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-3">
            SUGGESTED MAISON DIRECTORIES
          </span>
          <div className="grid grid-cols-3 gap-2.5 text-left">
            <button
              type="button"
              onClick={onNavigateShop}
              className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 transition-all cursor-pointer text-left group"
            >
              <span className="text-[10px] font-mono font-bold text-amber-600 block">01</span>
              <span className="text-xs font-serif font-bold text-neutral-900 group-hover:text-black block mt-0.5 truncate">
                Ready-to-Wear
              </span>
            </button>
            <button
              type="button"
              onClick={onNavigateShop}
              className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 transition-all cursor-pointer text-left group"
            >
              <span className="text-[10px] font-mono font-bold text-amber-600 block">02</span>
              <span className="text-xs font-serif font-bold text-neutral-900 group-hover:text-black block mt-0.5 truncate">
                Footwear
              </span>
            </button>
            <button
              type="button"
              onClick={onNavigateShop}
              className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 transition-all cursor-pointer text-left group"
            >
              <span className="text-[10px] font-mono font-bold text-amber-600 block">03</span>
              <span className="text-xs font-serif font-bold text-neutral-900 group-hover:text-black block mt-0.5 truncate">
                Accessories
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
