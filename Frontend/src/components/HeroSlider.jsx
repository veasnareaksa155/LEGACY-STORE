import React, { useEffect, useRef, useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { getSiteContent } from "../services/siteContent";

const HeroSlider = ({ onExploreCategory }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 140 });

  const [verticalImages, setVerticalImages] = useState(() => {
    return getSiteContent().heroMarqueeImages;
  });

  useEffect(() => {
    const handleUpdate = () => {
      setVerticalImages(getSiteContent().heroMarqueeImages);
    };
    window.addEventListener("legacy_site_content_updated", handleUpdate);
    return () =>
      window.removeEventListener("legacy_site_content_updated", handleUpdate);
  }, []);

  const marqueeVerticalImages = [
    ...verticalImages,
    ...verticalImages,
    ...verticalImages,
  ];

  // Particle Engine matching CARTER LED dot matrix style exactly
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let particles = [];
    const textToRender = "LEGACY";

    const initParticles = () => {
      if (!canvas.parentElement) return;
      const width = (canvas.width = canvas.parentElement.clientWidth);
      const height = (canvas.height = canvas.parentElement.clientHeight || 350);

      ctx.clearRect(0, 0, width, height);

      // Render Geist 900 extra-bold geometric display sans-serif matching CARTER proportions exactly
      const fontSize = Math.min(width * 0.22, height * 0.75, 310);
      const letterSpacingPx = Math.max(2, Math.floor(fontSize * 0.03));
      ctx.font = `900 ${fontSize}px "Geist", "Syne", "Montserrat", "Helvetica Neue", "Arial", sans-serif`;
      ctx.letterSpacing = `${letterSpacingPx}px`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(textToRender, width / 2, height / 2);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      particles = [];

      // Exact aligned graph-paper LED matrix grid sampling step
      const gap = Math.max(3, Math.floor(width / 140));

      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];
          if (alpha > 80) {
            particles.push({
              x: x,
              y: y,
              originX: x,
              originY: y,
              size: width < 640 ? 1.2 : 1.5,
              color: "#ffffff",
            });
          }
        }
      }
    };

    initParticles();

    const handleResize = () => {
      initParticles();
    };
    window.addEventListener("resize", handleResize);

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    canvas.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    canvas.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });
    canvas.addEventListener("pointerup", handlePointerLeave, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Physics: Repel from cursor (repelRadius: 140px)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = Math.pow((mouse.radius - dist) / mouse.radius, 2);
          const pushX = Math.cos(angle) * force * 12;
          const pushY = Math.sin(angle) * force * 12;
          p.x -= pushX;
          p.y -= pushY;
        } else {
          // Snap back to exact origin on the LED matrix grid
          p.x += (p.originX - p.x) * 0.2;
          p.y += (p.originY - p.y) * 0.2;

          if (Math.abs(p.x - p.originX) < 0.1) p.x = p.originX;
          if (Math.abs(p.y - p.originY) < 0.1) p.y = p.originY;
        }

        // Render clean LED matrix dot
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        canvas.removeEventListener("pointermove", handlePointerMove);
        canvas.removeEventListener("pointerleave", handlePointerLeave);
        canvas.removeEventListener("pointerup", handlePointerLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative w-full h-[65vh] sm:min-h-screen bg-[#0f1316] text-white flex flex-col justify-center md:justify-between py-6 sm:py-9 px-4 sm:px-8 select-none border-b border-neutral-800 overflow-hidden">
      {/* Background Image from Divi JSON (particle-text-1-bg-min.webp) */}
      <div
        className="absolute inset-0 bg-cover bg-[center_top] bg-no-repeat pointer-events-none opacity-90 transition-opacity duration-500"
        style={{
          backgroundImage:
            "url('https://divimotion.com/wp-content/uploads/2026/09/particle-text-1-bg-min.webp')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0f1316] pointer-events-none" />

      {/* ROW 1: Max width 1720px, 90% width container — HIDDEN ON MOBILE (< md), VISIBLE ON DESKTOP (>= md) */}
      <div className="hidden md:flex relative max-w-[1720px] w-full sm:w-[90%] mx-auto z-10 flex-col md:flex-row justify-between items-center md:items-stretch gap-6 md:gap-8 pt-2 sm:pt-4">
        {/* GROUP 1: Left Text & Button (maxWidth: 480px) */}
        <div className="w-full max-w-[480px] space-y-4 sm:space-y-6 text-center md:text-left">
          <p className="text-lg sm:text-2xl md:text-3xl font-medium tracking-tight text-white uppercase leading-[1.3em]">
            // ELEVATING MENSWEAR THROUGH BESPOKE TAILORING & SILK LEGACY
          </p>

          <div className="flex justify-center md:justify-start">
            <button
              onClick={() => onExploreCategory("all")}
              className="px-8 sm:px-10 py-3 sm:py-3.5 rounded-[40px] border border-white bg-white text-[#0f1316] hover:bg-[#151316] hover:text-white font-medium text-xs sm:text-base uppercase tracking-wider transition-all duration-300 shadow-xl cursor-pointer inline-flex items-center gap-2 group"
            >
              <span>Let’s Talk</span>
              <ArrowRightOutlined className="text-xs group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* GROUP 2: Right Links & Image Showcase (maxWidth: 340px) */}
        <div className="w-full max-w-[340px] flex flex-col items-center md:items-end justify-between space-y-4 sm:space-y-6">
          {/* Icon / Nav Links List */}
          <ul className="flex flex-wrap justify-center md:flex-col gap-2 sm:gap-2.5 text-center md:text-right font-medium text-xs sm:text-base uppercase tracking-wider text-white">
            <li>
              <button
                onClick={() => onExploreCategory("shirt")}
                className="px-3 py-1.5 sm:p-0 rounded-full border sm:border-none border-neutral-700/80 bg-neutral-900/40 sm:bg-transparent hover:underline hover:underline-offset-2 transition-all cursor-pointer whitespace-nowrap"
              >
                Tailored Shirts
              </button>
            </li>
            <li>
              <button
                onClick={() => onExploreCategory("t-shirt")}
                className="px-3 py-1.5 sm:p-0 rounded-full border sm:border-none border-neutral-700/80 bg-neutral-900/40 sm:bg-transparent hover:underline hover:underline-offset-2 transition-all cursor-pointer whitespace-nowrap"
              >
                Heavyweight Tees
              </button>
            </li>
            <li>
              <button
                onClick={() => onExploreCategory("shoes")}
                className="px-3 py-1.5 sm:p-0 rounded-full border sm:border-none border-neutral-700/80 bg-neutral-900/40 sm:bg-transparent hover:underline hover:underline-offset-2 transition-all cursor-pointer whitespace-nowrap"
              >
                Handmade Footwear
              </button>
            </li>
            <li>
              <button
                onClick={() => onExploreCategory("all")}
                className="px-3 py-1.5 sm:p-0 rounded-full border sm:border-none border-amber-500/40 sm:border-none bg-amber-500/10 sm:bg-transparent hover:underline hover:underline-offset-2 transition-all cursor-pointer text-amber-400 font-bold whitespace-nowrap"
              >
                VIP Concierge &bull; 2026
              </button>
            </li>
          </ul>

          {/* Right Image Feature with Continuous Vertical Marquee Scroll */}
          <div className="w-full max-w-[325px] h-[140px] sm:h-[170px] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl relative bg-black group/card shrink-0">
            <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#0f1316] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#0f1316] to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-vertical flex flex-col gap-2 p-1">
              {marqueeVerticalImages.map((imgUrl, i) => (
                <div
                  key={`divi-vimg-${i}`}
                  className="h-[130px] sm:h-[150px] w-full rounded-xl overflow-hidden shrink-0 relative border border-neutral-800/60 cursor-pointer"
                  onClick={() => onExploreCategory("all")}
                >
                  <img
                    src={imgUrl}
                    alt="Particle Showcase"
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Center Giant Canvas Particle Text LEGACY® — VISIBLE ON ALL DEVICES */}
      <div className="relative w-full z-10 my-auto py-2 sm:pt-6 space-y-4">
        {/* Divi Particle Text Container */}
        <div className="w-full h-[220px] sm:h-[280px] md:h-[325px] relative overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair relative z-10"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
