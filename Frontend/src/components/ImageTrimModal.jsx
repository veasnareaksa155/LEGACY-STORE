import React, { useState, useEffect, useRef } from "react";
import { Modal, Slider, Button, Tag, Space, notification } from "antd";
import {
  ScissorOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
  ZoomInOutlined,
  CheckOutlined,
  RotateRightOutlined,
  UndoOutlined,
} from "@ant-design/icons";

const ImageTrimModal = ({
  open,
  onClose,
  imageSrc,
  onCropComplete,
  title = "TRIM & POSITION AVATAR IMAGE",
}) => {
  const [verticalOffset, setVerticalOffset] = useState(10); // 0 = top, 100 = bottom (default 10 for head focus)
  const [horizontalOffset, setHorizontalOffset] = useState(50); // 0 = left, 100 = right
  const [zoomLevel, setZoomLevel] = useState(1.1); // 1.0x to 3.0x
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        setImgLoaded(true);
        // Default to top alignment if height is significantly larger than width (portrait)
        if (img.height > img.width * 1.2) {
          setVerticalOffset(5);
        } else {
          setVerticalOffset(50);
        }
      };
      img.src = imageSrc;
    }
  }, [imageSrc, open]);

  // Reset controls to standard defaults
  const handleReset = () => {
    setVerticalOffset(10);
    setHorizontalOffset(50);
    setZoomLevel(1.1);
    setRotation(0);
  };

  const handleApplyTrim = () => {
    if (!imageRef.current || !imgLoaded) {
      notification.error({
        message: "Error",
        description: "Image is still loading. Please try again.",
      });
      return;
    }

    const img = imageRef.current;
    const canvas = document.createElement("canvas");
    const outputSize = 360; // Optimal high-resolution square avatar canvas output
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");

    // Enable high-quality image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Clear background
    ctx.clearRect(0, 0, outputSize, outputSize);

    // Save context state for rotation handling
    ctx.save();
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-outputSize / 2, -outputSize / 2);

    // Calculate crop rectangle from source image
    const isPortrait = img.height > img.width;
    const minDim = Math.min(img.width, img.height);
    const cropSize = minDim / zoomLevel;

    // Calculate maximum available pan range
    const maxSourceX = img.width - cropSize;
    const maxSourceY = img.height - cropSize;

    // Compute source X and Y based on percentage sliders
    const sourceX = Math.max(
      0,
      Math.min(maxSourceX, (horizontalOffset / 100) * maxSourceX),
    );
    const sourceY = Math.max(
      0,
      Math.min(maxSourceY, (verticalOffset / 100) * maxSourceY),
    );

    // Draw source cropped region onto output canvas
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      cropSize,
      cropSize,
      0,
      0,
      outputSize,
      outputSize,
    );

    ctx.restore();

    // Export high-quality optimized base64 image data URL (~25-35KB for fast sync & instant render)
    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
    onCropComplete(croppedDataUrl);
    onClose();

    notification.success({
      message: "AVATAR TRIMMED SUCCESSFULLY",
      description: "Top/Bottom image position updated cleanly.",
      placement: "bottomRight",
      duration: 2,
    });
  };

  // Preview styling calculations for live preview frame
  const getPreviewStyle = () => {
    if (!imgLoaded || !imageRef.current) return {};
    const img = imageRef.current;

    // Scale calculation for preview div
    const objectPositionX = `${horizontalOffset}%`;
    const objectPositionY = `${verticalOffset}%`;

    return {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: `${objectPositionX} ${objectPositionY}`,
      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
      transition: "transform 0.15s ease-out, object-position 0.15s ease-out",
    };
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      destroyOnClose
      title={
        <div className="flex items-center space-x-2 border-b border-neutral-200 pb-3">
          <ScissorOutlined className="text-black text-lg" />
          <span className="font-serif font-black text-base uppercase tracking-wider text-black">
            {title}
          </span>
        </div>
      }
    >
      <div className="pt-2 space-y-4">
        {/* Live Circular Avatar Preview Box */}
        <div className="flex flex-col items-center justify-center p-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-inner">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl bg-black">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Trim Preview"
                style={getPreviewStyle()}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500 font-mono text-xs">
                No image
              </div>
            )}
            {/* Target Crosshair Mask Overlay */}
            <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-400/60 ring-4 ring-black/40"></div>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mt-2">
            ✨ LIVE CIRCULAR AVATAR PREVIEW
          </span>
        </div>

        {/* Quick Position Alignment Presets (Top / Center / Bottom) */}
        <div>
          <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-neutral-700 mb-2 flex justify-between items-center">
            <span>⚡ QUICK VERTICAL TRIM PRESETS</span>
            <Tag color="black" className="m-0 text-[9px] font-mono">
              FIX TOP CUTOFF
            </Tag>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setVerticalOffset(0)}
              className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                verticalOffset === 0
                  ? "bg-black text-white border-black shadow-xs"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
              }`}
            >
              <VerticalAlignTopOutlined className="text-amber-400" />
              <span>TRIM TOP</span>
            </button>

            <button
              type="button"
              onClick={() => setVerticalOffset(50)}
              className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                verticalOffset === 50
                  ? "bg-black text-white border-black shadow-xs"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
              }`}
            >
              <VerticalAlignMiddleOutlined />
              <span>CENTER</span>
            </button>

            <button
              type="button"
              onClick={() => setVerticalOffset(100)}
              className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                verticalOffset === 100
                  ? "bg-black text-white border-black shadow-xs"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
              }`}
            >
              <VerticalAlignBottomOutlined />
              <span>TRIM BOTTOM</span>
            </button>
          </div>
        </div>

        {/* Fine-Tune Vertical Shift Slider */}
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-3">
          <div>
            <div className="flex justify-between items-center text-xs font-mono font-bold text-neutral-800 mb-1">
              <span>↕️ Vertical Position (Top / Bottom Trim)</span>
              <span className="text-black font-extrabold bg-neutral-200 px-2 py-0.5 rounded text-[10px]">
                {verticalOffset === 0
                  ? "TOP (0%)"
                  : verticalOffset === 100
                    ? "BOTTOM (100%)"
                    : `${verticalOffset}%`}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              value={verticalOffset}
              onChange={(val) => setVerticalOffset(val)}
              tooltip={{ formatter: (val) => `${val}% Position` }}
            />
          </div>

          {/* Zoom Level Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono font-bold text-neutral-800 mb-1">
              <span>
                <ZoomInOutlined className="mr-1" /> Zoom Level Focus
              </span>
              <span className="text-black font-extrabold bg-neutral-200 px-2 py-0.5 rounded text-[10px]">
                {zoomLevel.toFixed(1)}x
              </span>
            </div>
            <Slider
              min={1.0}
              max={2.5}
              step={0.1}
              value={zoomLevel}
              onChange={(val) => setZoomLevel(val)}
              tooltip={{ formatter: (val) => `${val.toFixed(1)}x Zoom` }}
            />
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-mono font-bold text-neutral-600 hover:text-black uppercase cursor-pointer"
          >
            <UndoOutlined /> Reset Position
          </button>

          <div className="flex items-center gap-2">
            <Button onClick={onClose} className="text-xs font-mono font-bold">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleApplyTrim}
              className="bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs uppercase px-5 h-9 border-0 rounded-lg flex items-center gap-1.5 shadow-md"
            >
              <CheckOutlined className="text-amber-400" /> APPLY & SAVE PHOTO
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ImageTrimModal;
