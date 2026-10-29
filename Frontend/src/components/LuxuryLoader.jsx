import React from "react";

const LuxuryLoader = ({
  text = "LEGACY",
  fullScreen = false,
  size = "3.2em",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen
          ? "fixed inset-0 z-[9999] bg-[#0B0A10]/95 backdrop-blur-xl"
          : "py-12"
      }`}
    >
      <style>{`
        .luxe-loader-wrapper {
          --main-size: ${size};
          --text-color: #ffffff;
          --shine-color: rgba(245, 158, 11, 0.4);
          --shadow-color: #888888;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          user-select: none;
          position: relative;
          font-size: var(--main-size);
          font-weight: 900;
          text-transform: uppercase;
          color: var(--text-color);
          width: 7em;
          height: 1.8em;
          filter: drop-shadow(0 0 0.1em var(--shine-color));
          font-family: 'Playfair Display', 'Cinzel', serif, sans-serif;
          letter-spacing: 0.12em;
        }

        .luxe-loader-wrapper .text-layer {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          position: absolute;
        }

        .luxe-loader-wrapper .text-layer:nth-child(1) {
          clip-path: polygon(0% 0%, 11.11% 0%, 11.11% 100%, 0% 100%);
          font-size: calc(var(--main-size) / 20);
          margin-left: -2.1em;
          opacity: 0.6;
        }

        .luxe-loader-wrapper .text-layer:nth-child(2) {
          clip-path: polygon(11.11% 0%, 22.22% 0%, 22.22% 100%, 11.11% 100%);
          font-size: calc(var(--main-size) / 16);
          margin-left: -0.98em;
          opacity: 0.7;
        }

        .luxe-loader-wrapper .text-layer:nth-child(3) {
          clip-path: polygon(22.22% 0%, 33.33% 0%, 33.33% 100%, 22.22% 100%);
          font-size: calc(var(--main-size) / 13);
          margin-left: -0.33em;
          opacity: 0.8;
        }

        .luxe-loader-wrapper .text-layer:nth-child(4) {
          clip-path: polygon(33.33% 0%, 44.44% 0%, 44.44% 100%, 33.33% 100%);
          font-size: calc(var(--main-size) / 11);
          margin-left: -0.05em;
          opacity: 0.9;
        }

        .luxe-loader-wrapper .text-layer:nth-child(5) {
          clip-path: polygon(44.44% 0%, 55.55% 0%, 55.55% 100%, 44.44% 100%);
          font-size: calc(var(--main-size) / 10);
          margin-left: 0em;
          opacity: 1;
        }

        .luxe-loader-wrapper .text-layer:nth-child(6) {
          clip-path: polygon(55.55% 0%, 66.66% 0%, 66.66% 100%, 55.55% 100%);
          font-size: calc(var(--main-size) / 11);
          margin-left: 0.05em;
          opacity: 0.9;
        }

        .luxe-loader-wrapper .text-layer:nth-child(7) {
          clip-path: polygon(66.66% 0%, 77.77% 0%, 77.77% 100%, 66.66% 100%);
          font-size: calc(var(--main-size) / 13);
          margin-left: 0.33em;
          opacity: 0.8;
        }

        .luxe-loader-wrapper .text-layer:nth-child(8) {
          clip-path: polygon(77.77% 0%, 88.88% 0%, 88.88% 100%, 77.77% 100%);
          font-size: calc(var(--main-size) / 16);
          margin-left: 0.98em;
          opacity: 0.7;
        }

        .luxe-loader-wrapper .text-layer:nth-child(9) {
          clip-path: polygon(88.88% 0%, 100% 0%, 100% 100%, 88.88% 100%);
          font-size: calc(var(--main-size) / 20);
          margin-left: 2.1em;
          opacity: 0.6;
        }

        .luxe-loader-wrapper .text-layer span {
          animation:
            luxe-scrolling 2s cubic-bezier(0.1, 0.6, 0.9, 0.4) infinite,
            luxe-shadow 2s cubic-bezier(0.1, 0.6, 0.9, 0.4) infinite;
        }

        .luxe-loader-wrapper .text-layer:nth-child(1) span {
          background: linear-gradient(to right, var(--text-color) 4%, var(--shadow-color) 7%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .luxe-loader-wrapper .text-layer:nth-child(2) span {
          background: linear-gradient(to right, var(--text-color) 9%, var(--shadow-color) 13%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .luxe-loader-wrapper .text-layer:nth-child(3) span {
          background: linear-gradient(to right, var(--text-color) 15%, var(--shadow-color) 18%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .luxe-loader-wrapper .text-layer:nth-child(4) span {
          background: linear-gradient(to right, var(--text-color) 20%, var(--shadow-color) 23%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .luxe-loader-wrapper .text-layer:nth-child(6) span {
          background: linear-gradient(to right, var(--shadow-color) 29%, var(--text-color) 32%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .luxe-loader-wrapper .text-layer:nth-child(7) span {
          background: linear-gradient(to right, var(--shadow-color) 34%, var(--text-color) 37%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .luxe-loader-wrapper .text-layer:nth-child(8) span {
          background: linear-gradient(to right, var(--shadow-color) 39%, var(--text-color) 42%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .luxe-loader-wrapper .text-layer:nth-child(9) span {
          background: linear-gradient(to right, var(--shadow-color) 45%, var(--text-color) 48%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .luxe-loader-wrapper .line {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          height: 0.05em;
          width: calc(var(--main-size) * 0.7);
          margin-top: 1.1em;
          border-radius: 0.05em;
        }

        .luxe-loader-wrapper .line::before {
          content: "";
          position: absolute;
          height: 100%;
          width: 100%;
          background-color: var(--text-color);
          opacity: 0.3;
        }

        .luxe-loader-wrapper .line::after {
          content: "";
          position: absolute;
          height: 100%;
          width: 100%;
          background-color: #f59e0b;
          border-radius: 0.05em;
          transform: translateX(-90%);
          animation: luxe-wobble 2s cubic-bezier(0.5, 0.8, 0.5, 0.2) infinite;
        }

        @keyframes luxe-wobble {
          0% { transform: translateX(-90%); }
          50% { transform: translateX(90%); }
          100% { transform: translateX(-90%); }
        }

        @keyframes luxe-scrolling {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes luxe-shadow {
          0% { background-position: -98% 0; }
          100% { background-position: 102% 0; }
        }
      `}</style>

      <div className="luxe-loader-wrapper">
        <div className="text-layer">
          <span>{text}</span>
        </div>
        <div className="text-layer">
          <span>{text}</span>
        </div>
        <div className="text-layer">
          <span>{text}</span>
        </div>
        <div className="text-layer">
          <span>{text}</span>
        </div>
        <div className="text-layer">
          <span>{text}</span>
        </div>
        <div className="text-layer">
          <span>{text}</span>
        </div>
        <div className="text-layer">
          <span>{text}</span>
        </div>
        <div className="text-layer">
          <span>{text}</span>
        </div>
        <div className="text-layer">
          <span>{text}</span>
        </div>
        <div className="line" />
      </div>

      <p className="mt-4 text-xs font-mono tracking-widest text-neutral-400 uppercase">
        LEGACY STORE
      </p>
    </div>
  );
};

export default LuxuryLoader;
