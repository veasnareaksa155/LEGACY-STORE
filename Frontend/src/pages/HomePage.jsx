import React, { useState, useEffect, useRef } from "react";
import { Rate, Collapse, Tag } from "antd";
import {
  StarFilled,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  TagOutlined,
  ArrowRightOutlined,
  InstagramOutlined,
} from "@ant-design/icons";

import HeroSlider from "../components/HeroSlider";
import ProductCard from "../components/ProductCard";
import LuxuryLoader from "../components/LuxuryLoader";
import RibbonGlow from "../components/RibbonGlow";
import HoverFaqAccordion from "../components/HoverFaqAccordion";

const GALLERY_ROW_1 = [
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
];

const GALLERY_ROW_2 = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=800&q=80",
];

// 3D Elastic Card Component with Mouse Tilt, Spring Bounce & Glare (Divi Motion Elastic Cards)
const ElasticCard = ({ children, className = "", style = {} }) => {
  const [tilt, setTilt] = useState({
    x: 0,
    y: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const x = px - 0.5;
    const y = py - 0.5;

    setTilt({
      x: -y * 8, // Max 8 degree tilt on X axis
      y: x * 8, // Max 8 degree tilt on Y axis
      glareX: px * 100,
      glareY: py * 100,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform overflow-hidden cursor-pointer ${className}`}
      style={{
        ...style,
        transform: tilt.isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.025, 1.025, 1.025) translateY(-6px)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateY(0px)",
        transition: tilt.isHovered
          ? "transform 0.08s ease-out, box-shadow 0.2s ease-out"
          : "transform 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease-out",
        boxShadow: tilt.isHovered
          ? "0 25px 45px -12px rgba(0, 0, 0, 0.18), 0 0 20px rgba(53, 211, 255, 0.12)"
          : "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* 3D Elastic Glare Lighting Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
        style={{
          opacity: tilt.isHovered ? 0.35 : 0,
          background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 65%)`,
        }}
      />
      {children}
    </div>
  );
};

// Elastic Overlapping Card Stack with Fanning/Spread Hover Interaction (Divi Motion Elastic Card Demo 03)
const ElasticCardStack = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const stackImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
      title: "MULBERRY SILK",
      subtitle: "PARISIAN TAILORING",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
      title: "HEAVYWEIGHT COTTON",
      subtitle: "280 GSM STREETWEAR",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
      title: "GOODYEAR DERBY",
      subtitle: "CALFSKIN FOOTWEAR",
    },
  ];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * 10, y: x * 10 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-[300px] sm:w-[380px] h-[360px] sm:h-[440px] flex items-center justify-center cursor-pointer py-4"
    >
      {stackImages.map((img, idx) => {
        let transformStyle = "";
        if (isHovered) {
          if (idx === 0) {
            transformStyle = `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y - 12}deg) translateX(-110px) translateY(-10px) rotate(-8deg) scale(1.08)`;
          } else if (idx === 1) {
            transformStyle = `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateX(0px) translateY(-20px) rotate(0deg) scale(1.15)`;
          } else {
            transformStyle = `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y + 12}deg) translateX(110px) translateY(-10px) rotate(8deg) scale(1.08)`;
          }
        } else {
          if (idx === 0) {
            transformStyle =
              "perspective(1000px) translateX(-45px) translateY(10px) rotate(-6deg) scale(0.95)";
          } else if (idx === 1) {
            transformStyle =
              "perspective(1000px) translateX(0px) translateY(0px) rotate(0deg) scale(1)";
          } else {
            transformStyle =
              "perspective(1000px) translateX(45px) translateY(-10px) rotate(6deg) scale(0.95)";
          }
        }

        return (
          <div
            key={img.id}
            className="absolute w-[180px] sm:w-[220px] h-[250px] sm:h-[300px] rounded-[32px] overflow-hidden border-2 border-neutral-700/80 shadow-2xl transition-all duration-500 will-change-transform group/card bg-neutral-900"
            style={{
              transform: transformStyle,
              zIndex: idx === 1 ? 30 : idx === 2 ? 20 : 10,
              transition: isHovered
                ? "transform 0.12s ease-out, box-shadow 0.2s ease-out"
                : "transform 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              boxShadow: isHovered
                ? "0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 255, 255, 0.1)"
                : "0 15px 35px -10px rgba(0, 0, 0, 0.4)",
            }}
          >
            <img
              src={img.src}
              alt={img.title}
              className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                {img.subtitle}
              </span>
              <h4 className="text-xs sm:text-sm font-bold font-serif text-white uppercase tracking-wider">
                {img.title}
              </h4>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 3D Round Carousel Component (Originkit)
const RoundCarousel = ({
  images = [],
  imageWidth = 260,
  imageHeight = 320,
  spacing = 2.5,
  speed = 6,
  direction = "right",
  drag = true,
  sensitivity = 5,
  tilt = -6,
  perspective = 2500,
  cornerRadius = 24,
  innerDim = 3.5,
  background = "#000000",
  style = {},
}) => {
  const defaultImages = [
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  ];

  const items = images.length > 0 ? images : defaultImages;
  const count = items.length;

  const ringRef = useRef(null);
  const rafRef = useRef(0);
  const rotYRef = useRef(0);
  const velRef = useRef(0);
  const lastRef = useRef(0);
  const dragRef = useRef({ active: false, x: 0 });

  const angle = 360 / count;
  const factor = 1 + spacing * 0.15;
  const radius = (imageWidth * factor) / (2 * Math.tan(Math.PI / count));
  const radiusPx = cornerRadius;
  const degPerSec = speed * 6 * (direction === "left" ? -1 : 1);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const apply = () =>
      (ring.style.transform = `translateZ(${-radius}px) rotateY(${rotYRef.current}deg)`);
    apply();

    const draw = (now) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      const f = Math.min(dt, 0.1);
      const d = dragRef.current;
      if (!d.active) {
        if (Math.abs(velRef.current) > 0.01) {
          rotYRef.current += velRef.current * f;
          velRef.current *= 0.94;
        } else {
          rotYRef.current += degPerSec * f;
        }
      }
      apply();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [radius, degPerSec, count]);

  const onPointerDown = (e) => {
    if (!drag) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { active: true, x: e.clientX };
    velRef.current = 0;
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    const k = 0.3 * sensitivity;
    rotYRef.current += dx * k;
    velRef.current = dx * k * 60;
  };
  const onPointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current.active = false;
  };

  const faceBase = {
    position: "absolute",
    inset: 0,
    borderRadius: radiusPx,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div
      style={{
        ...style,
        width: "100%",
        height: "460px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background,
        perspective: `${perspective}px`,
        cursor: drag ? "grab" : "default",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt}deg)`,
        }}
      >
        <div
          ref={ringRef}
          style={{
            position: "relative",
            width: imageWidth,
            height: imageHeight,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((img, i) => {
            const src = typeof img === "string" ? img : img?.src;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  style={{
                    ...faceBase,
                    backgroundColor: src ? "transparent" : "#222",
                    backgroundImage: src ? `url(${src})` : undefined,
                    boxShadow:
                      "0 20px 50px rgba(0,0,0,0.7), 0 0 25px rgba(245,158,11,0.25)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                />
                <div
                  style={{
                    ...faceBase,
                    transform: "rotateY(180deg)",
                    backgroundColor: src ? "transparent" : "#181818",
                    backgroundImage: src ? `url(${src})` : undefined,
                    filter: `brightness(${innerDim / 10})`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// WebGL2 Ribbon Glow Background Animation (Originkit)
const RIBBON_LAYERS = 84;
const RIBBON_TWIST = 1.25;
const RIBBON_DRAG = 0.18;
const RIBBON_MAX_DPR = 2;
const RIBBON_NAME = "RibbonGlow";

const RIBBON_VERT_SRC = `#version 300 es
const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }
`;

const RIBBON_FIELD_SRC = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uSize;
uniform float uAngle;
uniform vec2 uMouse;
uniform float uOn;
uniform float uReach;
uniform vec2 uVel;
out vec4 o;

const float TAU = 6.28318530718;
const float LAYERS = ${RIBBON_LAYERS.toFixed(1)};
const float TWIST = ${RIBBON_TWIST.toFixed(3)};
const float DRAG = ${RIBBON_DRAG.toFixed(3)};
const float GAIN = 0.62;
const vec2 CENTRE = vec2(-0.62, 0.24);
const float TILT = 0.6;
const float ZOOM = 1.05;
const float THETA = 2.13;
const float SHEAR = 0.963;
const float SHRINK = 0.953;
const vec2 WARP_FREQ = vec2(0.42, 2.4);
const vec2 WARP_AMP = vec2(0.13, 0.027);
const vec2 ASPECT = vec2(2.1, 0.17);
const float OFFSET = 0.36;
const float GLOW = 0.0021;
const float SOFT = 0.0019;
const float FALLOFF = 0.37;
const float PHASE = 12.0;
const float CYCLE = 0.16;
const float HUE_TRAVEL = 2.0;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

void main() {
  vec2 R = uRes;
  vec2 pos = (gl_FragCoord.xy - 0.5 * R) / R.y;

  vec2 d = pos - uMouse;
  float w = uOn * exp(-dot(d, d) / (uReach * uReach));
  if (w > 1e-4) pos = uMouse + rot(w * TWIST) * d * (1.0 - 0.3 * min(w, 1.0)) - uVel * min(w, 1.0) * DRAG;

  pos = rot(uAngle) * pos / uSize;
  float t = uTime * 0.49 + PHASE;
  float breath = (-sin(uTime * 0.735) + sin(uTime * 0.49 + 1.0)) * 0.25 + 0.5;
  vec2 u = rot(TILT) * ((pos - CENTRE) * (ZOOM - breath * 0.085));
  mat2 fold = mat2(cos(THETA), sin(THETA), -SHEAR, cos(THETA));

  vec3 col = vec3(0.0);
  for (float i = 1.0; i <= LAYERS; i += 1.0) {
    u.x -= sin(u.y * WARP_FREQ.x + t + i * 0.007) * WARP_AMP.x;
    u.y -= sin(u.x * WARP_FREQ.y - t + i * 0.02) * WARP_AMP.y;
    u = fold * u * SHRINK;
    vec2 q = (u - vec2(OFFSET + breath * 0.1, 0.0)) * ASPECT;
    float g = GLOW / (dot(q, q) + SOFT) * (0.25 + breath * 0.4);
    float r = length(u);
    float k = sin(i * CYCLE + t * 1.2 + r * HUE_TRAVEL) * 0.5 + 0.5;
    col += g * mix(uC1, uC2, k) * (0.62 + 0.5 * k) * exp2(-r * FALLOFF);
  }
  vec3 x = max(col * GAIN, 0.0);
  col = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  col = pow(clamp(col, 0.0, 1.0), vec3(0.85, 0.92, 0.98));
  col *= 1.0 - smoothstep(0.5, 1.6, length(pos)) * 0.07;
  o = vec4(col, 1.0);
}
`;

const RIBBON_FINISH_SRC = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBg;
uniform float uPaper;
out vec4 o;

float ign(vec2 p, float f) { p += 5.588238 * mod(f, 64.0); return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y)); }

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec3 L = max(texture(uField, frag / uRes).rgb, 0.0);

  vec3 dark = uBg + L * (1.0 - uBg);
  float strength = clamp(max(L.r, max(L.g, L.b)), 0.0, 1.0);
  vec3 paper = uBg * (1.0 - strength) + L * 0.96;
  vec3 col = mix(dark, paper, uPaper);
  col += (ign(frag, floor(uTime * 24.0)) - 0.5) / 255.0;
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const ribbonColorCache = new Map();

function parseRibbonColor(input) {
  if (!input) return null;
  const key = String(input);
  if (ribbonColorCache.has(key)) return ribbonColorCache.get(key) ?? null;
  let s = key.trim();
  const v = s.match(/^var\(\s*--[^,]+,\s*(.+)\)$/);
  if (v) s = v[1].trim();
  let out = null;
  if (s.charAt(0) === "#") {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4)
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length >= 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b))
        out = [r / 255, g / 255, b / 255];
    }
  } else {
    const m = s.match(/^(rgba?|hsla?)\(([^)]*)\)/i);
    if (m) {
      const parts = m[2].split(/[\s,/]+/).filter(Boolean);
      const f = (i) => parseFloat(parts[i]);
      if (parts.length >= 3 && [0, 1, 2].every((i) => Number.isFinite(f(i)))) {
        if (m[1].toLowerCase().startsWith("rgb")) {
          const ch = (i) => (parts[i].endsWith("%") ? f(i) / 100 : f(i) / 255);
          out = [ch(0), ch(1), ch(2)];
        } else {
          const hh = (((f(0) % 360) + 360) % 360) / 360;
          const ss = f(1) / 100;
          const ll = f(2) / 100;
          const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
          const p = 2 * ll - q;
          const hue = (t) => {
            t = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
          };
          out = [hue(hh + 1 / 3), hue(hh), hue(hh - 1 / 3)];
        }
        out = out.map((c) => Math.min(1, Math.max(0, c)));
      }
    }
  }
  ribbonColorCache.set(key, out);
  return out;
}

function ribbonColor(input, fallback) {
  return parseRibbonColor(input) ?? parseRibbonColor(fallback);
}

function ribbonNum(v, fb) {
  return typeof v === "number" && isFinite(v) ? v : fb;
}

function ribbonClampN(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function ribbonLink(gl, frag, label) {
  const shader = (type, src) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(`${RIBBON_NAME} ${label} shader:`, gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  };
  const vs = shader(gl.VERTEX_SHADER, RIBBON_VERT_SRC);
  const fs = shader(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(`${RIBBON_NAME} ${label} link:`, gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

function ribbonLocations(gl, prog, names) {
  const out = {};
  for (const n of names) out[n] = gl.getUniformLocation(prog, n);
  return out;
}

function ribbonFieldTarget(gl) {
  const fbo = gl.createFramebuffer();
  let tex = null;
  let w = 0;
  let h = 0;
  let half = !!gl.getExtension("EXT_color_buffer_float");
  return {
    fbo,
    texture: () => tex,
    width: () => w,
    height: () => h,
    resize(nw, nh) {
      if (nw === w && nh === h && tex) return;
      for (let attempt = 0; attempt < 2; attempt++) {
        if (tex) gl.deleteTexture(tex);
        tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          half ? gl.RGBA16F : gl.RGBA8,
          nw,
          nh,
          0,
          gl.RGBA,
          half ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
          null,
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          tex,
          0,
        );
        const ok =
          gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (ok || !half) break;
        half = false;
      }
      w = nw;
      h = nh;
    },
    dispose() {
      if (tex) gl.deleteTexture(tex);
      gl.deleteFramebuffer(fbo);
    },
  };
}

function ribbonTrackPointer(root) {
  const p = { tx: 0, ty: 0, inside: false, seen: false };
  const read = (e) => {
    const r = root.getBoundingClientRect();
    const sx = root.offsetWidth / (r.width || 1);
    const sy = root.offsetHeight / (r.height || 1);
    p.tx = (e.clientX - r.left) * sx;
    p.ty = (e.clientY - r.top) * sy;
    p.inside =
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom;
    p.seen = true;
  };
  const out = (e) => {
    if (!e.relatedTarget) p.inside = false;
  };
  window.addEventListener("pointermove", read, { passive: true });
  window.addEventListener("pointerdown", read, { passive: true });
  document.addEventListener("pointerout", out);
  return {
    p,
    dispose() {
      window.removeEventListener("pointermove", read);
      window.removeEventListener("pointerdown", read);
      document.removeEventListener("pointerout", out);
    },
  };
}

const RIBBON_DEFAULTS = {
  background: "#0B0A10",
  color1: "#2FD3F2",
  color2: "#7B61FF",
};

// RibbonGlow imported from components/RibbonGlow

const HomePage = ({
  products = [],
  loading = false,
  onQuickView,
  onAddToCart,
  wishlistItems = [],
  onToggleWishlist,
  onExploreCategory,
  onNavigatePage,
}) => {
  const [activeTab, setActiveTab] = useState("viral"); // "viral" | "discount"

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  // Track viewport width for responsive layout adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Filter products for Home Page curations
  const viralProducts = products
    .filter((p) => p.is_featured || p.is_new)
    .slice(0, 4);
  const discountProducts = products
    .filter(
      (p) => p.original_price && Number(p.original_price) > Number(p.price),
    )
    .slice(0, 4);

  // Fallback to slice if filters yield empty
  const displayProducts =
    activeTab === "viral"
      ? viralProducts.length > 0
        ? viralProducts
        : products.slice(0, 4)
      : discountProducts.length > 0
        ? discountProducts
        : products.slice(0, 4);

  // Elastic Testimonial Cards Data (Divi Motion Elastic Card Demo 05)
  const elasticTestimonials = [
    {
      id: 1,
      rating: 5,
      comment:
        "Their team delivered a stunning website that perfectly reflects our vision. Communication was seamless, deadlines were met, and the final result speaks for itself.",
      stats: [
        { value: "+42%", label: "Lead Generation" },
        { value: "+63%", label: "User Engagement" },
      ],
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      name: "Daniel Carter",
      role: "CEO, BrightWave Studio",
    },
    {
      id: 2,
      rating: 5,
      comment:
        "Working with this agency completely transformed our brand identity. The creative thinking, attention to detail, and strategic approach exceeded all expectations.",
      stats: [
        { value: "+34%", label: "Brand Engagement" },
        { value: "+57%", label: "Website Conversions" },
      ],
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      name: "Sarah Mitchell",
      role: "Marketing Director",
    },
    {
      id: 3,
      rating: 5,
      comment:
        "Lyniq helps companies create stunning and strategically sound experiences that engage luxury audiences. Our experts work closely with you to ensure every detail is perfection.",
      stats: [
        { value: "+28%", label: "Customer Retention" },
        { value: "+61%", label: "Conversion Rate" },
      ],
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      name: "Andy Styles",
      role: "Founder, Tech Startup",
    },
    {
      id: 4,
      rating: 5,
      comment:
        "From branding to digital experience, every detail was executed with creativity and precision. We've seen measurable business growth since launching our new identity.",
      stats: [
        { value: "+29%", label: "Customer Retention" },
        { value: "+54%", label: "Sales Growth" },
      ],
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      name: "Emma Rodriguez",
      role: "Founder, Elevate Brands",
    },
  ];

  // FAQ Items
  const faqItems = [
    {
      key: "1",
      label: (
        <span className="font-serif font-bold uppercase text-black text-xs sm:text-sm">
          HOW LONG DOES WORLDWIDE EXPRESS SHIPPING TAKE?
        </span>
      ),
      children: (
        <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
          Express shipments via DHL Express deliver in 2–4 business days
          worldwide. Tracking details are dispatched immediately via email.
        </p>
      ),
    },
    {
      key: "2",
      label: (
        <span className="font-serif font-bold uppercase text-black text-xs sm:text-sm">
          WHAT IS YOUR RETURN & EXCHANGE POLICY?
        </span>
      ),
      children: (
        <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
          We offer a 30-day complimentary return and size exchange guarantee.
          Items must be unworn in original luxury packaging with tags intact.
        </p>
      ),
    },
    {
      key: "3",
      label: (
        <span className="font-serif font-bold uppercase text-black text-xs sm:text-sm">
          ARE THE GARMENTS INDEED 100% ORGANIC & HANDMADE?
        </span>
      ),
      children: (
        <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
          Yes. Our shirts utilize certified 100% Mulberry silk, tees are knitted
          from 280 GSM combed cotton, and footwear is Goodyear welted in Porto
          ateliers.
        </p>
      ),
    },
  ];

  // Instagram Feed Photos
  const instaPhotos = [
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80",
  ];

  return (
    <div className="bg-white text-neutral-900 pb-16">
      {/* 1. Animated Hero Carousel */}
      <HeroSlider onExploreCategory={onExploreCategory} />

      {/* 3. Curated Home Product Showcase with White Luxury Background */}
      <div
        className="relative overflow-hidden py-16 sm:py-20 scroll-reveal bg-white border-t border-b border-neutral-200"
        id="products-section"
      >
        {/* Originkit Ribbon Glow WebGL Animated Backdrop (Light Mode) */}
        <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
          <RibbonGlow
            background="#FFFFFF"
            color1="#F59E0B"
            color2="#CBD5E1"
            speed={35}
            size={110}
            angle={-180}
            reach={300}
          />
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
              CURATED SELECTION
            </span>
            <h2 className="text-2xl sm:text-5xl font-black font-serif uppercase tracking-tight text-black mb-4">
              FEATURED DROPS & SPECIAL OFFERS
            </h2>
            <div className="w-16 h-0.5 bg-black mx-auto mb-6" />

            {/* Curation Filter Tabs */}
            <div className="inline-flex p-1.5 bg-neutral-100/90 backdrop-blur-md rounded-full border border-neutral-200/90 shadow-sm">
              <button
                onClick={() => setActiveTab("viral")}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "viral"
                    ? "bg-amber-400 text-black shadow-md scale-105"
                    : "text-neutral-600 hover:text-black font-semibold"
                }`}
              >
                <ThunderboltOutlined className="text-sm" />
                <span>VIRAL & HOT DROPS</span>
              </button>
              <button
                onClick={() => setActiveTab("discount")}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "discount"
                    ? "bg-amber-400 text-black shadow-md scale-105"
                    : "text-neutral-600 hover:text-black font-semibold"
                }`}
              >
                <TagOutlined className="text-sm" />
                <span>SPECIAL OFFERS ({discountProducts.length})</span>
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <LuxuryLoader text="LOADING" size="2.5em" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-10 scroll-reveal-stagger">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                  isWishlisted={wishlistItems.some((i) => i.id === product.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          )}

          {/* View Full Collection Button */}
          <div className="text-center pt-4">
            <button
              onClick={() => onExploreCategory("all")}
              className="bg-black text-white hover:bg-amber-400 hover:text-black font-extrabold text-xs tracking-widest uppercase px-8 h-12 rounded-full shadow-lg transition-all hover:scale-105 inline-flex items-center space-x-2 cursor-pointer"
            >
              <span>EXPLORE ENTIRE CATALOGUE ({products.length} ITEMS)</span>
              <ArrowRightOutlined />
            </button>
          </div>
        </div>
      </div>

      {/* 4. High-Fashion "IMAGINE DESIGN DELIVER" Elastic Cards Showcase (Divi Motion Demo 03) */}
      <div className="bg-[#0f1316] text-white py-20 sm:py-28 relative overflow-hidden border-t border-neutral-900 scroll-reveal">
        {/* Subtle Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/30 via-[#0f1316] to-[#0f1316] pointer-events-none" />

        <div className="max-w-[1720px] w-[90%] mx-auto relative z-10">
          {/* Top Header Row: EST. 2021 + Red Accent Line */}
          <div className="flex items-center gap-4 sm:gap-6 mb-8">
            <span className="text-lg sm:text-2xl font-medium font-sans text-white tracking-widest uppercase">
              EST. 2021
            </span>
            <div className="w-24 sm:w-40 h-[2px] bg-[#cd6459]" />
          </div>

          {/* Grid Layout: Big Typography + Overlapping Fanning Elastic Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12 sm:mb-16">
            {/* Left Typography Block: IMAGINE & DESIGN */}
            <div className="lg:col-span-7">
              <h1 className="text-5xl sm:text-7xl md:text-[110px] lg:text-[140px] xl:text-[170px] font-black font-serif uppercase tracking-tighter text-white leading-none mb-2 sm:mb-4">
                IMAGINE
              </h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-32 h-16 sm:w-48 sm:h-24 rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl shrink-0 hidden sm:block">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80"
                    alt="Atelier Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-5xl sm:text-7xl md:text-[110px] lg:text-[140px] xl:text-[170px] font-black font-serif uppercase tracking-tighter text-white leading-none">
                  DESIGN
                </h1>
              </div>
            </div>

            {/* Right Overlapping Elastic Cards Stack (Fans out on hover!) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end my-6 lg:my-0">
              <ElasticCardStack />
            </div>
          </div>

          {/* Bottom Grid: DELIVER Typography + Atelier Description */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-t border-neutral-800/80 pt-10">
            <div className="lg:col-span-8 relative">
              <h1 className="text-5xl sm:text-7xl md:text-[110px] lg:text-[140px] xl:text-[170px] font-black font-serif uppercase tracking-tighter text-white leading-none">
                DELIVER
              </h1>
              {/* Floating Union 16 Badge Accent Image */}
              <div className="absolute -top-4 right-4 sm:right-16 w-16 sm:w-24 h-20 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl rotate-12 hidden sm:block pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80"
                  alt="Haute Couture Badge"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-4">
              <p className="text-neutral-300 font-sans text-sm sm:text-lg font-normal leading-relaxed mb-6">
                Creating timeless luxury fashion that blends innovation,
                Parisian craftsmanship, and haute-couture elegance into every
                carefully designed piece.
              </p>
              <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>PARISIAN LUXURY ATELIER</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="text-center pt-12">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
              [ SCROLL ]
            </span>
          </div>
        </div>
      </div>

      {/* 5. Elastic Cards Client Reviews & Testimonials Section (Divi Motion Demo 05) */}
      <div className="bg-[#eaf7ff] py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-sky-100 overflow-hidden scroll-reveal">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-14 text-center sm:text-left flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-black inline-block" />
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-800">
                  OUR TESTIMONIALS
                </span>
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-serif uppercase tracking-tight text-[#121212] leading-[0.95]">
                REAL STORIES <br className="hidden sm:block" />
                FROM REAL CLIENTS
              </h2>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-xs font-bold font-mono text-neutral-500 uppercase tracking-widest block mb-1">
                OVERALL SATISFACTION
              </span>
              <div className="flex items-center justify-center sm:justify-end gap-1 text-amber-400 text-lg">
                {[...Array(5)].map((_, i) => (
                  <StarFilled key={i} />
                ))}
                <span className="text-black font-bold font-mono text-sm ml-2">
                  4.98 / 5.0
                </span>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {elasticTestimonials.map((item) => (
              <ElasticCard
                key={item.id}
                className="bg-white border-[8px] sm:border-[10px] border-[#eaf7ff] rounded-[36px] sm:rounded-[50px] p-7 sm:p-9 flex flex-col justify-between group"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center space-x-1 text-amber-400 mb-6">
                    {[...Array(item.rating)].map((_, i) => (
                      <StarFilled key={i} className="text-sm" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-neutral-900 text-base sm:text-lg font-medium leading-relaxed mb-8">
                    "{item.comment}"
                  </p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {item.stats.map((st, idx) => (
                      <div key={idx}>
                        <h4 className="font-serif text-3xl sm:text-4xl font-normal text-[#121212]">
                          {st.value}
                        </h4>
                        <p className="text-xs text-neutral-400 font-medium">
                          {st.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Divider */}
                  <div className="w-full h-px bg-neutral-100 my-5" />

                  {/* Profile Footer */}
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-lg text-[#000000] leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-neutral-400 font-normal">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </div>
              </ElasticCard>
            ))}

            {/* Dark Highlight Summary Card (Card 5) */}
            <ElasticCard className="bg-[#121212] text-white border-[8px] sm:border-[10px] border-[#eaf7ff] rounded-[36px] sm:rounded-[50px] p-7 sm:p-9 flex flex-col justify-between md:col-span-2 lg:col-span-1">
              <div>
                {/* Rating Score */}
                <div className="mb-4">
                  <span className="font-serif text-5xl sm:text-6xl text-white font-normal">
                    4.9 /{" "}
                    <sub className="text-2xl text-neutral-400 font-light">
                      5
                    </sub>
                  </span>
                </div>

                <p className="text-neutral-300 text-base sm:text-lg font-medium leading-relaxed mb-8">
                  Helping companies grow through{" "}
                  <span className="text-white font-bold underline decoration-amber-400 underline-offset-4">
                    56+ successful
                  </span>{" "}
                  creative projects.
                </p>
              </div>

              <div>
                {/* Avatars + G2 Ratings */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex -space-x-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                      alt="Reviewer"
                      className="w-9 h-9 rounded-full border-2 border-[#121212] object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                      alt="Reviewer"
                      className="w-9 h-9 rounded-full border-2 border-[#121212] object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                      alt="Reviewer"
                      className="w-9 h-9 rounded-full border-2 border-[#121212] object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex text-amber-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <StarFilled key={i} />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-400 font-mono">
                      G2 ratings (120+ reviews)
                    </span>
                  </div>
                </div>

                {/* Leave a Review Button */}
                <button
                  onClick={() => alert("Thank you for sharing your feedback!")}
                  className="w-full bg-white text-[#121212] hover:bg-[#35d3ff] hover:text-black font-semibold rounded-full py-4 text-center transition-colors duration-300 text-sm tracking-wide shadow-md cursor-pointer relative z-20"
                >
                  Leave a review
                </button>
              </div>
            </ElasticCard>
          </div>
        </div>
      </div>

      {/* 6. FAQ Accordion Section with Divi Motion Style Hover Accordion */}
      <div className="bg-neutral-50 py-16 border-t border-neutral-200 scroll-reveal-scale">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">
              QUESTIONS & ANSWERS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-serif uppercase tracking-tight text-black mb-2">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <div className="w-12 h-0.5 bg-black mx-auto mb-8" />
          </div>

          <HoverFaqAccordion />
        </div>
      </div>

      {/* 7. 3D Round Carousel Gallery & Community Section (Originkit) */}
      <div className="pt-16 pb-14 bg-black text-white relative overflow-hidden border-t border-neutral-900">
        <div className="text-center mb-6 px-4 relative z-10">
          <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
            @LEGACY
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-serif uppercase tracking-tight text-white flex items-center justify-center gap-2">
            <InstagramOutlined className="text-amber-400" />
            <span>JOIN OUR STYLE COMMUNITY</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto mt-2 font-light">
            Drag or swipe left & right to rotate our 3D interactive Parisian
            gallery showcase.
          </p>
        </div>

        {/* Originkit 3D Round Carousel */}
        <RoundCarousel
          images={[...GALLERY_ROW_1, ...GALLERY_ROW_2]}
          imageWidth={260}
          imageHeight={320}
          spacing={2.5}
          speed={5}
          tilt={-7}
        />
      </div>
    </div>
  );
};

export default HomePage;
