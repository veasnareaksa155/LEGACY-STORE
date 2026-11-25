import React, { useRef, useState } from "react";
import { Modal, Tooltip } from "antd";
import {
  PrinterOutlined,
  CloseOutlined,
  SafetyCertificateOutlined,
  CopyOutlined,
  CheckOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

// Realistic 1D Barcode (Code-128 aesthetic with crisp SVG vertical bars)
const RealisticBarcode = ({ value }) => {
  const str = String(value || "LX-000000").toUpperCase();
  const bars = [];
  let x = 0;

  // Start Guard Pattern
  bars.push({ x: 0, w: 2.5 }, { x: 4.5, w: 1.5 }, { x: 8, w: 3 });
  x = 13;

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const pattern = [
      (code % 3) + 1,
      ((code >> 1) % 2) + 1.2,
      ((code >> 2) % 3) + 1,
      ((code >> 3) % 2) + 1.5,
    ];
    for (let p of pattern) {
      bars.push({ x, w: p });
      x += p + ((code % 2) + 1.2);
    }
  }

  // Stop Guard Pattern
  bars.push({ x: x + 2, w: 3 }, { x: x + 6.5, w: 1.5 }, { x: x + 10, w: 2.5 });
  const totalWidth = x + 14;

  return (
    <div className="flex flex-col items-center select-none">
      <svg
        viewBox={`0 0 ${totalWidth} 40`}
        className="w-full max-w-[260px] h-10"
        preserveAspectRatio="none"
      >
        {bars.map((b, idx) => (
          <rect key={idx} x={b.x} y="0" width={b.w} height="40" fill="#111111" />
        ))}
      </svg>
      <span className="font-mono text-[9px] tracking-[0.25em] font-black text-neutral-800 uppercase mt-1">
        * {str} *
      </span>
    </div>
  );
};

// Official Red Wet-Ink Rubber Stamp of Authenticity
const AtelierRedStamp = ({ orderNumber, dateStr }) => {
  return (
    <div
      className="pointer-events-none select-none rotate-[-9deg] transition-transform duration-300 hover:rotate-[-5deg]"
      style={{
        filter: "drop-shadow(0 2px 5px rgba(185, 28, 28, 0.18))",
      }}
    >
      <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-full border-[2px] border-red-700/85 p-1 relative flex items-center justify-center">
        {/* Inner Dotted Ring */}
        <div className="w-full h-full rounded-full border border-dashed border-red-600/75 flex flex-col items-center justify-center text-center p-1 relative overflow-hidden bg-red-600/[0.04]">
          <span className="text-[6.5px] font-mono font-black uppercase tracking-[0.2em] text-red-700 block leading-none">
            LEGACY ATELIER
          </span>
          <span className="text-[5px] font-mono tracking-widest text-red-600/80 uppercase block mt-0.5">
            12 PLACE VENDÔME
          </span>

          {/* Central Bold Banner */}
          <div className="my-1 py-0.5 px-2 bg-red-700 text-white rounded-xs transform -rotate-1 shadow-2xs">
            <span className="text-[8.5px] font-serif font-black tracking-widest uppercase block leading-none">
              VERIFIED
            </span>
          </div>

          <span className="text-[6px] font-mono font-extrabold uppercase tracking-wider text-red-700 block leading-tight">
            PAID & AUDITED
          </span>
          <span className="text-[5px] font-mono text-red-600/75 block mt-0.5 tracking-tight font-semibold">
            PARIS • 2026
          </span>
        </div>
      </div>
    </div>
  );
};

const ReceiptModal = ({ open, onClose, order }) => {
  const ticketRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [printing, setPrinting] = useState(false);

  if (!order) return null;

  const orderNumber =
    order.order_number || (order.id ? `LX-${order.id}` : "LX-000001");

  const orderDateObj = order.created_at ? new Date(order.created_at) : new Date();
  const formattedDate = orderDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = orderDateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const items =
    Array.isArray(order.items) && order.items.length > 0
      ? order.items
      : [
          {
            id: 1,
            product_name: order.product_name || "Haute Couture Piece",
            size: order.size || "Standard",
            quantity: order.quantity || 1,
            price: order.total_amount || 0,
          },
        ];

  const totalAmount = Number(order.total_amount || 0).toFixed(2);
  const shippingFee = Number(order.shipping_fee || 0);
  const discountAmount = Number(order.discount_amount || 0);
  const subtotal = Math.max(
    0,
    Number(order.total_amount || 0) - shippingFee + discountAmount,
  ).toFixed(2);

  // KHR Conversion (1 USD = 4,100 KHR)
  const khrAmount = (Number(order.total_amount || 0) * 4100).toLocaleString(
    "en-US",
    { maximumFractionDigits: 0 },
  );

  const handleCopyOrderNumber = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPaymentDetails = (method) => {
    const m = String(method || "bakong").toLowerCase();
    if (m.includes("khqr") || m.includes("bakong") || m.includes("aba")) {
      return {
        label: "BAKONG KHQR",
        sub: "NBC Central Instant Clearing",
        code: "SETTLED • VERIFIED",
        icon: <QrcodeOutlined className="text-red-600" />,
      };
    }
    if (m.includes("cod") || m.includes("cash") || m.includes("doorstep") || m.includes("delivery")) {
      return {
        label: "CASH ON DELIVERY",
        sub: "Verified Doorstep Handover",
        code: "COD • ATELIER DISPATCH",
        icon: <DollarOutlined className="text-emerald-600" />,
      };
    }
    return {
      label: "CREDIT / DEBIT CARD",
      sub: "256-Bit SSL Encrypted EMV",
      code: "AUTH #894102 • APPROVED",
      icon: <CreditCardOutlined className="text-blue-600" />,
    };
  };

  const paymentInfo = getPaymentDetails(order.payment_method);

  const handlePrint = () => {
    const ticketEl = ticketRef.current;
    if (!ticketEl || printing) return;

    setPrinting(true);

    try {
      // Remove any previously created print iframe
      const oldIframe = document.getElementById("receipt-print-iframe");
      if (oldIframe) {
        try {
          oldIframe.remove();
        } catch (e) {}
      }

      // Create an on-screen positioned iframe at (0, 0)
      // Note: Chromium print engines evaluate bounding box at (0, 0).
      // Placing it at -9999px causes blank page in Chrome print preview.
      const iframe = document.createElement("iframe");
      iframe.id = "receipt-print-iframe";
      iframe.style.position = "fixed";
      iframe.style.top = "0";
      iframe.style.left = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.style.zIndex = "999999";
      iframe.style.background = "#ffffff";
      iframe.style.opacity = "0.01"; // Invisible to eye during preparation, yet in viewport
      iframe.style.pointerEvents = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;

      // Extract all active styles & fonts from the document head
      let stylesHtml = "";
      document.querySelectorAll("link[rel='stylesheet'], style").forEach((node) => {
        stylesHtml += node.outerHTML + "\n";
      });

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>Receipt_${orderNumber}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700;800&display=swap" rel="stylesheet">
            ${stylesHtml}
            <style>
              @page {
                size: portrait;
                margin: 6mm 10mm;
              }
              *, *::before, *::after {
                box-sizing: border-box !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              html, body {
                display: block !important;
                visibility: visible !important;
                background: #ffffff !important;
                background-color: #ffffff !important;
                margin: 0 !important;
                padding: 12px 0 !important;
                font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
                color: #111111 !important;
                opacity: 1 !important;
              }
              /* Typography Helpers */
              .font-serif { font-family: 'Cinzel', Georgia, serif !important; }
              .font-mono { font-family: 'JetBrains Mono', monospace !important; }
              .font-sans { font-family: 'Plus Jakarta Sans', sans-serif !important; }
              
              /* Self-Contained Layout Styles */
              .flex { display: flex !important; }
              .flex-col { flex-direction: column !important; }
              .items-center { align-items: center !important; }
              .items-start { align-items: flex-start !important; }
              .justify-between { justify-content: space-between !important; }
              .justify-center { justify-content: center !important; }
              .grid { display: grid !important; }
              .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
              .w-full { width: 100% !important; }
              .max-w-lg { max-width: 32rem !important; }
              .truncate { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
              
              /* Printable Root Ticket */
              .receipt-ticket-printable-root {
                display: block !important;
                visibility: visible !important;
                width: 100% !important;
                max-width: 580px !important;
                margin: 0 auto !important;
                background: #faf8f5 !important;
                background-color: #faf8f5 !important;
                box-shadow: none !important;
                border: 1px solid #d4d0c8 !important;
                border-radius: 16px !important;
                overflow: hidden !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              
              /* Paper notches */
              .receipt-ticket-printable-root [class*="-left-9"],
              .receipt-ticket-printable-root [class*="-right-9"] {
                background-color: #ffffff !important;
                border-color: #d4d0c8 !important;
                box-shadow: none !important;
              }
              
              img {
                max-width: 100% !important;
                -webkit-print-color-adjust: exact !important;
              }
              svg {
                shape-rendering: geometricPrecision;
              }

              @media print {
                html, body {
                  background: #ffffff !important;
                  opacity: 1 !important;
                  padding: 0 !important;
                }
                .receipt-ticket-printable-root {
                  border: 1px solid #c5c0b6 !important;
                  box-shadow: none !important;
                }
              }
            </style>
          </head>
          <body>
            <div style="width: 100%; display: flex; justify-content: center; align-items: flex-start; padding: 10px 0;">
              ${ticketEl.outerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      const executePrint = () => {
        try {
          iframe.style.opacity = "1";
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (err) {
          console.warn("Iframe print error, falling back to window.print():", err);
          window.print();
        } finally {
          setPrinting(false);
          // Safely remove printable iframe after print dialog completes
          setTimeout(() => {
            try {
              iframe.remove();
            } catch (e) {}
          }, 3500);
        }
      };

      // Ensure images/fonts finish loading in iframe before triggering print
      const images = doc.images;
      if (!images || images.length === 0) {
        setTimeout(executePrint, 300);
      } else {
        let loaded = 0;
        let finished = false;
        const total = images.length;
        const onImgDone = () => {
          loaded++;
          if (loaded >= total && !finished) {
            finished = true;
            setTimeout(executePrint, 200);
          }
        };

        for (let i = 0; i < total; i++) {
          if (images[i].complete) {
            onImgDone();
          } else {
            images[i].onload = onImgDone;
            images[i].onerror = onImgDone;
          }
        }

        setTimeout(() => {
          if (!finished) {
            finished = true;
            executePrint();
          }
        }, 1200);
      }
    } catch (e) {
      console.error("Print generation failed:", e);
      setPrinting(false);
      window.print();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      destroyOnClose
      closeIcon={false}
      className="luxury-real-receipt-modal"
      styles={{
        content: { padding: 0, background: "transparent", boxShadow: "none" },
        body: { padding: 0, background: "transparent", overflow: "visible" },
        mask: {
          backgroundColor: "rgba(10, 10, 10, 0.82)",
          backdropFilter: "blur(6px)",
        },
      }}
      bodyStyle={{ padding: 0, background: "transparent", overflow: "visible" }}
      maskStyle={{
        backgroundColor: "rgba(10, 10, 10, 0.82)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="relative py-2 sm:py-4 select-none">
        {/* Floating Top Control Bar (Print, Copy, Close) */}
        <div className="print-controls-bar flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-[0.25em] text-neutral-300">
              OFFICIAL ATELIER RECEIPT
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Reference Pill */}
            <Tooltip title={copied ? "Copied to clipboard!" : "Copy Receipt #"}>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                className="h-8 px-3 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {copied ? (
                  <CheckOutlined className="text-emerald-400 text-xs" />
                ) : (
                  <CopyOutlined className="text-neutral-400 text-xs" />
                )}
                <span>{copied ? "COPIED" : orderNumber}</span>
              </button>
            </Tooltip>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={printing}
              className={`h-8 px-3.5 rounded-full font-mono font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 border ${
                printing
                  ? "bg-amber-100 text-amber-950 border-amber-300 opacity-80 cursor-wait"
                  : "bg-white hover:bg-amber-100 text-neutral-950 border-white"
              }`}
            >
              <PrinterOutlined className="text-xs text-neutral-950" />
              <span>{printing ? "PREPARING..." : "PRINT / SAVE PDF"}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-900/90 hover:bg-white hover:text-black text-neutral-300 flex items-center justify-center transition-all cursor-pointer border border-neutral-700 shadow-sm shrink-0"
              title="Close Receipt"
            >
              <CloseOutlined className="text-xs" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* REALISTIC LUXURY ATELIER RECEIPT TICKET CANVAS           */}
        {/* ======================================================== */}
        <div
          ref={ticketRef}
          id="legacy-receipt-printable-ticket"
          className="receipt-ticket-printable-root relative mx-auto rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65),0_0_35px_rgba(212,175,55,0.08)] border border-neutral-300/80"
        >
          {/* Top Sawtooth Serrated Paper Cut */}
          <div className="w-full overflow-hidden leading-none select-none text-[#faf8f5] bg-transparent">
            <svg
              viewBox="0 0 1200 16"
              className="w-full h-2.5 sm:h-3 fill-current block"
              preserveAspectRatio="none"
            >
              <path d="M0,16 L15,0 L30,16 L45,0 L60,16 L75,0 L90,16 L105,0 L120,16 L135,0 L150,16 L165,0 L180,16 L195,0 L210,16 L225,0 L240,16 L255,0 L270,16 L285,0 L300,16 L315,0 L330,16 L345,0 L360,16 L375,0 L390,16 L405,0 L420,16 L435,0 L450,16 L465,0 L480,16 L495,0 L510,16 L525,0 L540,16 L555,0 L570,16 L585,0 L600,16 L615,0 L630,16 L645,0 L660,16 L675,0 L690,16 L705,0 L720,16 L735,0 L750,16 L765,0 L780,16 L795,0 L810,16 L825,0 L840,16 L855,0 L870,16 L885,0 L900,16 L915,0 L930,16 L945,0 L960,16 L975,0 L990,16 L1005,0 L1020,16 L1035,0 L1050,16 L1065,0 L1080,16 L1095,0 L1110,16 L1125,0 L1140,16 L1155,0 L1170,16 L1185,0 L1200,16 Z" />
            </svg>
          </div>

          {/* Main Paper Content Area */}
          <div
            className="bg-[#faf8f5] text-neutral-900 px-6 sm:px-9 py-6 sm:py-8 space-y-6 relative overflow-hidden font-sans"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.02) 0%, transparent 80%)",
            }}
          >
            {/* Subtle Security Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025] select-none">
              <span className="font-serif text-8xl font-black tracking-widest text-black rotate-[-25deg]">
                LEGACY
              </span>
            </div>

            {/* 1. Header: Brand Crest, Parisian Atelier & POS Metadata */}
            <div className="border-b border-dashed border-neutral-300 pb-5 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
                {/* Brand Logo & Address */}
                <div className="flex flex-col sm:flex-row items-center gap-3.5">
                  <img
                    src="/images/LOGO.png"
                    alt="LEGACY"
                    className="h-11 sm:h-13 w-auto object-contain filter drop-shadow-xs"
                  />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-[0.2em] text-neutral-950 m-0 leading-tight">
                      LEGACY
                    </h1>
                    <span className="text-[9px] font-mono font-bold tracking-[0.3em] uppercase text-neutral-600 block mt-0.5">
                      HAUTE COUTURE • PARIS
                    </span>
                    <p className="text-[9px] font-mono text-neutral-500 m-0 mt-1 leading-tight">
                      12 Place Vendôme, 75001 Paris, France
                    </p>
                  </div>
                </div>

                {/* Right: Tax Receipt Label & Timestamp */}
                <div className="sm:text-right font-mono">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-[9px] font-extrabold uppercase tracking-wider mb-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>TAX INVOICE / RECEIPT</span>
                  </div>
                  <div className="text-[11px] font-extrabold text-neutral-900 tracking-wider">
                    {orderNumber}
                  </div>
                  <div className="text-[9px] text-neutral-500 mt-0.5">
                    {formattedDate} • {formattedTime}
                  </div>
                  <div className="text-[8px] text-neutral-400 uppercase tracking-tight mt-0.5">
                    POS: ATELIER-01 • REG #08
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Client Patron & Fulfillment Dossier Box */}
            <div className="bg-[#f2efe9] rounded-xl border border-neutral-300/80 p-3.5 sm:p-4 text-xs font-mono relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Left: Patron Info */}
                <div>
                  <span className="text-[8.5px] font-extrabold uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                    CLIENT PATRON
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-black text-sm text-neutral-950 uppercase tracking-wide">
                      {order.customer_name || order.name || "VIP Client"}
                    </span>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded font-extrabold tracking-tighter">
                      VIP
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-600 mt-1 space-y-0.5 leading-tight">
                    <div className="truncate">
                      {order.customer_email || order.email || "client@legacystore.com"}
                    </div>
                    {order.phone && <div>Tel: {order.phone}</div>}
                  </div>
                </div>

                {/* Right: Delivery & Payment Details */}
                <div className="sm:border-l sm:border-neutral-300 sm:pl-3.5">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                    DESTINATION & SETTLEMENT
                  </span>
                  <div className="text-[10px] text-neutral-800 leading-snug">
                    <div className="flex items-start gap-1 font-semibold text-neutral-900">
                      <EnvironmentOutlined className="text-[10px] text-neutral-500 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">
                        {order.shipping_address || order.address || "Phnom Penh, Cambodia"}
                      </span>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-neutral-300/70 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-[9.5px]">
                        {paymentInfo.icon}
                        <span>{paymentInfo.label}</span>
                      </div>
                      <span className="text-[8px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded uppercase">
                        SETTLED ✓
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Itemized Acquisition Table */}
            <div>
              {/* Table Header */}
              <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-950 font-mono text-[9px] font-black uppercase tracking-widest text-neutral-600">
                <span className="w-1/2">CURATED PIECE</span>
                <span className="w-12 text-center">QTY</span>
                <span className="w-20 text-right">UNIT</span>
                <span className="w-20 text-right">AMOUNT</span>
              </div>

              {/* Items Rows */}
              <div className="divide-y divide-neutral-200/80">
                {items.map((item, index) => {
                  const qty = Number(item.quantity || 1);
                  const unitPrice = Number(item.price || 0);
                  const lineTotal = (unitPrice * qty).toFixed(2);
                  const itemImg =
                    item.image_url ||
                    (item.product && item.product.image_url) ||
                    null;

                  return (
                    <div
                      key={index}
                      className="py-3 flex items-center justify-between text-xs font-mono group"
                    >
                      {/* Left: Thumbnail & Name */}
                      <div className="w-1/2 pr-3 flex items-center gap-2.5 min-w-0">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={item.product_name || "Piece"}
                            className="w-10 h-10 object-cover rounded-md border border-neutral-300 bg-white shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-[#eeebe3] border border-neutral-300 flex items-center justify-center shrink-0">
                            <ShoppingOutlined className="text-neutral-500 text-sm" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <span className="font-serif font-black text-xs text-neutral-950 block truncate leading-tight uppercase">
                            {item.product_name || item.name || "Haute Couture Garment"}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-neutral-500">
                            {item.size && (
                              <span className="bg-neutral-200/80 px-1 py-0.2 rounded text-neutral-700 font-bold">
                                {item.size}
                              </span>
                            )}
                            <span className="text-[8px] text-neutral-400">
                              ART. #{orderNumber.replace("LX-", "")}-{index + 1}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* QTY */}
                      <span className="w-12 text-center font-bold text-neutral-800">
                        {qty}
                      </span>

                      {/* UNIT PRICE */}
                      <span className="w-20 text-right text-neutral-600 font-medium">
                        ${unitPrice.toFixed(2)}
                      </span>

                      {/* LINE TOTAL */}
                      <span className="w-20 text-right font-black text-neutral-950 text-xs">
                        ${lineTotal}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Financial Ledger Breakdown & Real Stamp */}
            <div className="pt-3 border-t-2 border-neutral-950 relative">
              {/* Official Red Stamp Layered on top */}
              <div className="absolute left-2 sm:left-4 -top-8 sm:-top-6 z-10">
                <AtelierRedStamp
                  orderNumber={orderNumber}
                  dateStr={formattedDate}
                />
              </div>

              {/* Numerical Ledger (Right-Aligned) */}
              <div className="flex flex-col items-end space-y-1.5 font-mono text-xs">
                <div className="flex justify-between w-full max-w-[240px] text-neutral-600 text-[11px]">
                  <span>SUBTOTAL:</span>
                  <span className="font-bold text-neutral-800">${subtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between w-full max-w-[240px] text-emerald-700 text-[11px]">
                    <span>VIP PRIVILEGE:</span>
                    <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between w-full max-w-[240px] text-neutral-600 text-[11px]">
                  <span>DELIVERY:</span>
                  <span className="font-bold text-neutral-900">
                    {shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : "FREE (Complimentary)"}
                  </span>
                </div>

                <div className="flex justify-between w-full max-w-[240px] text-neutral-500 text-[10px]">
                  <span>TVA / VAT (INCL.):</span>
                  <span className="font-semibold text-neutral-700">20% INCLUDED</span>
                </div>

                {/* Grand Total Highlight */}
                <div className="flex justify-between items-baseline w-full max-w-[240px] pt-2.5 mt-1 border-t-2 border-neutral-950 text-neutral-950">
                  <span className="font-serif font-black text-sm tracking-wide">
                    TOTAL PAID:
                  </span>
                  <div className="text-right">
                    <span className="font-mono text-xl sm:text-2xl font-black block leading-none">
                      ${totalAmount}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500 tracking-tight block mt-0.5">
                      ≈ ៛{khrAmount} KHR
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Perforated Tear Line with Authentic Side Ticket Notches */}
            <div className="relative pt-6 pb-2">
              {/* Left & Right Paper Ticket Cutouts */}
              <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-5 h-5 rounded-r-full bg-[#0a0a0a] border-r border-neutral-400/60 shadow-inner" />
              <div className="absolute -right-9 top-1/2 -translate-y-1/2 w-5 h-5 rounded-l-full bg-[#0a0a0a] border-l border-neutral-400/60 shadow-inner" />

              {/* Dotted Tear Line */}
              <div className="border-b-2 border-dashed border-neutral-400/80 w-full relative flex items-center justify-center">
                <span className="bg-[#faf8f5] px-3 font-mono text-[8px] font-extrabold uppercase tracking-[0.25em] text-neutral-400">
                  TEAR FOR ATELIER WARRANTY CLAIM
                </span>
              </div>
            </div>

            {/* 6. Authentic Barcode & Maison Archive Provenance */}
            <div className="space-y-4 pt-1">
              {/* Centered Code-128 Barcode */}
              <div className="flex flex-col items-center justify-center">
                <RealisticBarcode value={orderNumber} />
              </div>

              {/* Certificate of Authenticity Banner */}
              <div className="bg-[#f0ece3] rounded-xl p-3 border border-neutral-300 flex items-center justify-between gap-3 text-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                    <SafetyCertificateOutlined className="text-sm" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-neutral-950 block">
                      100% ORIGINAL HAUTE COUTURE PROVENANCE
                    </span>
                    <span className="text-[8px] font-mono text-neutral-500 block leading-tight">
                      Archived in Maison Registry • Lifetime Tailoring Guarantee
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded block">
                    GENUINE ✓
                  </span>
                </div>
              </div>

              {/* Legal / Microprint Disclaimer */}
              <div className="text-center font-mono text-[7.5px] text-neutral-400 uppercase tracking-widest leading-relaxed pt-1">
                MAISON LEGACY PARIS • 12 PLACE VENDÔME, 75001 PARIS
                <br />
                RETAIN THIS DOCUMENT AS CERTIFIED PROOF OF ACQUISITION
              </div>
            </div>
          </div>

          {/* Bottom Sawtooth Serrated Paper Cut */}
          <div className="w-full overflow-hidden leading-none select-none text-[#faf8f5] bg-transparent">
            <svg
              viewBox="0 0 1200 16"
              className="w-full h-2.5 sm:h-3 fill-current block"
              preserveAspectRatio="none"
            >
              <path d="M0,0 L15,16 L30,0 L45,16 L60,0 L75,16 L90,0 L105,16 L120,0 L135,16 L150,0 L165,16 L180,0 L195,16 L210,0 L225,16 L240,0 L255,16 L270,0 L285,16 L300,0 L315,16 L330,0 L345,16 L360,0 L375,16 L390,0 L405,16 L420,0 L435,16 L450,0 L465,16 L480,0 L495,16 L510,0 L525,16 L540,0 L555,16 L570,0 L585,16 L600,0 L615,16 L630,0 L645,16 L660,0 L675,16 L690,0 L705,16 L720,0 L735,16 L750,0 L765,16 L780,0 L795,16 L810,0 L825,16 L840,0 L855,16 L870,0 L885,16 L900,0 L915,16 L930,0 L945,16 L960,0 L975,16 L990,0 L1005,16 L1020,0 L1035,16 L1050,0 L1065,16 L1080,0 L1095,16 L1110,0 L1125,16 L1140,0 L1155,16 L1170,0 L1185,16 L1200,0 Z" />
            </svg>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
