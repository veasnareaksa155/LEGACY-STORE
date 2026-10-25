import React, { useState } from "react";
import { Modal, Button, Tooltip } from "antd";
import {
  CheckOutlined,
  CarOutlined,
  PrinterOutlined,
  ShoppingOutlined,
  CopyOutlined,
  MailOutlined,
  CrownFilled,
  QrcodeOutlined,
  CreditCardOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import ReceiptModal from "./ReceiptModal";

const OrderSuccessModal = ({
  open,
  onClose,
  orderData,
  onOpenDeliveryTracking,
}) => {
  const [showReceipt, setShowReceipt] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!orderData) return null;

  const orderNumber =
    orderData.order_number ||
    (orderData.id
      ? `LX-${String(orderData.id).padStart(6, "0")}`
      : "LX-000001");

  const formattedTotal = Number(orderData.total_amount || 0).toFixed(2);
  const customerName = orderData.customer_name || "Valued Patron";
  const customerEmail = orderData.customer_email || "";

  const itemCount =
    Array.isArray(orderData.items) && orderData.items.length > 0
      ? orderData.items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)
      : (orderData.quantity || 1);

  const handleCopyOrderNumber = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPaymentDetails = () => {
    const method = (orderData.payment_method || "").toLowerCase();
    if (method.includes("bakong") || method.includes("khqr")) {
      return {
        label: "Bakong Dynamic KHQR",
        icon: <QrcodeOutlined className="text-red-500 text-xs" />,
        badge: "PAID • BAKONG KHQR",
      };
    }
    if (
      method.includes("card") ||
      method.includes("visa") ||
      method.includes("master")
    ) {
      return {
        label: "VIP Credit / Debit Card",
        icon: <CreditCardOutlined className="text-blue-500 text-xs" />,
        badge: "PAID • SECURE CARD",
      };
    }
    if (method.includes("cash") || method.includes("cod")) {
      return {
        label: "Cash On Delivery (COD)",
        icon: <DollarOutlined className="text-emerald-500 text-xs" />,
        badge: "CONFIRMED • COD",
      };
    }
    return {
      label: orderData.payment_method || "Direct Payment",
      icon: <SafetyCertificateOutlined className="text-amber-600 text-xs" />,
      badge: "PAID • VERIFIED",
    };
  };

  const payment = getPaymentDetails();

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={560}
        destroyOnClose
        className="luxury-success-modal"
      >
        <div className="pt-2 pb-1 text-center">
          {/* Top Gold Ribbon Accent */}
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto rounded-full mb-5" />

          {/* Celebratory Luxury Medallion Badge */}
          <div className="relative inline-flex items-center justify-center mb-4">
            {/* Outer halo with gentle pulse */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400/20 via-amber-100 to-amber-500/20 border border-amber-300/60 flex items-center justify-center shadow-lg shadow-amber-500/10">
              {/* Inner Jet-Black Core */}
              <div className="w-14 h-14 rounded-full bg-neutral-950 flex items-center justify-center shadow-md ring-4 ring-amber-400/25">
                <CheckOutlined className="text-amber-400 text-2xl font-black" />
              </div>
            </div>

            {/* Tiny Floating Atelier Crown Badge */}
            <span className="absolute -top-1 -right-1 bg-white text-amber-500 rounded-full p-1 shadow-sm border border-amber-200 flex items-center justify-center">
              <CrownFilled style={{ fontSize: "12px" }} />
            </span>
          </div>

          {/* Subtitle Brand Badge */}
          <div className="mb-2">
            <span className="inline-block bg-amber-50/90 text-amber-800 border border-amber-200/80 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-0.5 rounded-full shadow-2xs">
              Legacy Atelier • Payment Verified
            </span>
          </div>

          {/* Headline Typography */}
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif uppercase tracking-tight text-neutral-900 mb-1.5">
            ORDER CONFIRMED!
          </h2>

          <p className="text-[11px] text-neutral-500 uppercase tracking-widest font-semibold mb-5">
            Thank you for curating with Alexandre Luxe
          </p>

          {/* Luxury Atelier Order Summary Card */}
          <div className="bg-gradient-to-b from-neutral-50 via-white to-neutral-50/70 rounded-2xl border border-neutral-200/90 p-4 sm:p-5 text-left mb-4 shadow-xs">
            {/* Order Ref & Payment Status Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                  REF NO:
                </span>
                <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 bg-neutral-100 px-2.5 py-0.5 rounded-md border border-neutral-200">
                  {orderNumber}
                </span>
                <Tooltip title={copied ? "Copied to Clipboard!" : "Copy Order Ref"}>
                  <button
                    type="button"
                    onClick={handleCopyOrderNumber}
                    className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer rounded"
                  >
                    {copied ? (
                      <CheckCircleFilled className="text-emerald-500 text-xs" />
                    ) : (
                      <CopyOutlined className="text-xs" />
                    )}
                  </button>
                </Tooltip>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{payment.badge}</span>
              </div>
            </div>

            {/* Client & Payment Info Rows */}
            <div className="py-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium uppercase tracking-wider text-[11px]">
                  Customer:
                </span>
                <span className="font-semibold text-neutral-900">
                  {customerName}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium uppercase tracking-wider text-[11px]">
                  Email:
                </span>
                <span className="font-medium text-neutral-800 font-mono text-[11px] truncate max-w-[240px]">
                  {customerEmail || "Not Provided"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium uppercase tracking-wider text-[11px]">
                  Payment Method:
                </span>
                <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                  {payment.icon}
                  <span>{payment.label}</span>
                </span>
              </div>
            </div>

            {/* Total Paid Highlight Row */}
            <div className="flex justify-between items-center pt-3 border-t border-neutral-200/70 bg-neutral-100/40 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-4 sm:px-5 py-3 rounded-b-2xl">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  TOTAL PAID
                </span>
                <span className="text-[11px] text-amber-700 font-semibold">
                  {itemCount} {itemCount === 1 ? "Piece" : "Pieces"} • Express Priority
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black text-neutral-950 font-sans tracking-tight">
                  ${formattedTotal}
                </span>
                <span className="text-[10px] font-bold text-neutral-400 ml-1">
                  USD
                </span>
              </div>
            </div>
          </div>

          {/* Email Confirmation Notice Banner */}
          {customerEmail && (
            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 mb-5 bg-neutral-50 py-2 px-3 rounded-xl border border-neutral-100">
              <MailOutlined className="text-amber-600 text-xs shrink-0" />
              <span className="truncate">
                Dispatch confirmation & tracking details sent to{" "}
                <strong className="text-neutral-900">{customerEmail}</strong>
              </span>
            </div>
          )}

          {/* Action Buttons Section - Fixed Responsive Hierarchy (No Overflow!) */}
          <div className="space-y-2.5">
            {/* Primary Action: Track Live Delivery */}
            {onOpenDeliveryTracking && (
              <Button
                type="primary"
                onClick={() => {
                  onClose();
                  onOpenDeliveryTracking(orderData);
                }}
                className="w-full h-12 !bg-neutral-950 hover:!bg-black text-white font-extrabold text-xs tracking-widest uppercase rounded-xl shadow-md border !border-neutral-900 flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200 active:scale-[0.99]"
              >
                <CarOutlined className="text-amber-400 text-base" />
                <span>TRACK LIVE DELIVERY</span>
                <span className="bg-amber-400/20 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-400/30">
                  🚚 LIVE
                </span>
              </Button>
            )}

            {/* Secondary Actions: 2 Balanced Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                onClick={() => setShowReceipt(true)}
                className="w-full h-11 bg-white hover:!bg-neutral-50 text-neutral-900 border-neutral-300 font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <PrinterOutlined className="text-sm text-neutral-600" />
                <span>DOWNLOAD RECEIPT</span>
              </Button>

              <Button
                onClick={onClose}
                className="w-full h-11 bg-neutral-100 hover:!bg-neutral-200 text-neutral-900 border-neutral-200 font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ShoppingOutlined className="text-sm text-neutral-600" />
                <span>CONTINUE SHOPPING</span>
              </Button>
            </div>
          </div>

          {/* Luxury Atelier Watermark / Guarantee */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-center gap-3 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
            <span>🛡️ 100% Authentic Guarantee</span>
            <span>•</span>
            <span>🔒 Encrypted Checkout</span>
            <span>•</span>
            <span>✨ White-Glove Concierge</span>
          </div>
        </div>
      </Modal>

      {/* Official Downloadable Receipt Modal */}
      <ReceiptModal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        order={orderData}
      />
    </>
  );
};

export default OrderSuccessModal;
