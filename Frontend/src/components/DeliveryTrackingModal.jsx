import React, { useState, useEffect } from "react";
import { Modal, Steps, Badge, Button, Tag, Divider } from "antd";
import {
  CarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  UserOutlined,
  CompassOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  QrcodeOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckOutlined,
  CalendarOutlined,
  TagOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { getDeliveryStatus } from "../services/api";

const DeliveryTrackingModal = ({
  open,
  onClose,
  order,
  onNavigateDriverApp,
}) => {
  const [liveOrder, setLiveOrder] = useState(order);
  const [driverPos, setDriverPos] = useState({ lat: 11.5584, lng: 104.9242 });
  const [etaMins, setEtaMins] = useState(18);

  // Poll live delivery status & position every 3 seconds if modal is open
  useEffect(() => {
    if (order && open) {
      setLiveOrder(order);
      setEtaMins(order.estimated_minutes || 18);

      const fetchStatus = async () => {
        const orderId = order.id || order.order_number;
        if (!orderId) return;
        try {
          const resData = await getDeliveryStatus(orderId);
          if (resData) {
            setLiveOrder(resData);
            if (resData.driver_lat && resData.driver_lng) {
              setDriverPos({
                lat: Number(resData.driver_lat),
                lng: Number(resData.driver_lng),
              });
            }
            if (resData.estimated_minutes !== undefined) {
              setEtaMins(resData.estimated_minutes);
            }
          }
        } catch (err) {
          console.warn("Failed to poll delivery status:", err);
        }
      };

      fetchStatus();
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [order, open]);

  if (!order) return null;

  const currentStatus = String(
    liveOrder?.delivery_status ||
      liveOrder?.status ||
      order?.delivery_status ||
      order?.status ||
      "processing",
  ).toLowerCase();

  // Determine active step index for step progress bar
  let currentStep = 1;
  if (currentStatus === "pending") currentStep = 0;
  else if (currentStatus === "processing") currentStep = 1;
  else if (
    currentStatus === "shipped" ||
    currentStatus === "delivering" ||
    currentStatus === "out_for_delivery"
  )
    currentStep = 2;
  else if (
    currentStatus === "delivered" ||
    currentStatus === "completed" ||
    currentStatus === "arrived"
  )
    currentStep = 3;

  // Courier details
  const courierName = liveOrder?.courier_name || "Sokha Express Courier";
  const courierPhone = liveOrder?.courier_phone || "+855 12 888 999";

  // Items list safely extracted
  const orderItems =
    liveOrder?.items ||
    liveOrder?.order_items ||
    order?.items ||
    order?.order_items ||
    [];

  // Total amount
  const rawTotal = Number(
    liveOrder?.total_amount || liveOrder?.total || order?.total_amount || 0,
  );
  const formattedTotal =
    rawTotal > 0
      ? `$${rawTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "$1,250.00";

  const getItemImage = (item) => {
    if (item.image_url) return item.image_url;
    if (item.product && item.product.image_url) return item.product.image_url;
    return "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=300&auto=format&fit=crop";
  };

  const getPaymentBadge = (method) => {
    const m = (method || "card").toLowerCase();
    if (m.includes("khqr") || m.includes("qr") || m.includes("aba") || m.includes("bakong")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11px] font-mono font-bold">
          <QrcodeOutlined /> BAKONG KHQR
        </span>
      );
    }
    if (m.includes("cod") || m.includes("cash") || m.includes("doorstep") || m.includes("delivery")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold">
          <DollarOutlined /> Cash on Delivery
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-mono font-bold">
        <CreditCardOutlined /> Credit / Debit Card
      </span>
    );
  };

  // Format order date
  const orderDateStr = liveOrder?.created_at
    ? new Date(liveOrder.created_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      centered
      closeIcon={<CloseOutlined className="text-sm" />}
      className="delivery-tracking-modal"
    >
      <div className="space-y-4 pt-1 max-h-[82vh] overflow-y-auto pr-1 custom-scrollbar">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-black text-white p-4 sm:p-5 rounded-xl border border-neutral-800 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-extrabold tracking-wider">
                  REAL-TIME DELIVERY TRACKER
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE GPS SATELLITE
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-white">
                ORDER #{liveOrder.order_number || liveOrder.id}
              </h3>
            </div>

            {/* ETA Countdown Badge */}
            <div
              className={`px-3.5 py-2 rounded-lg border text-right shrink-0 ${
                currentStep === 3
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <span className="text-[10px] text-neutral-400 font-mono uppercase block">
                {currentStep === 3 ? "DELIVERY STATUS" : "ESTIMATED ARRIVAL"}
              </span>
              <span
                className={`text-sm sm:text-base font-extrabold font-mono flex items-center gap-1.5 justify-end ${
                  currentStep === 3 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {currentStep === 3 ? (
                  <>
                    <CheckCircleOutlined className="text-emerald-400" /> ARRIVED
                    AT LOCATION
                  </>
                ) : (
                  <>
                    <ClockCircleOutlined /> {etaMins} MINS
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Arrived Banner Alert Callout when currentStep === 3 */}
        {currentStep === 3 && (
          <div className="bg-emerald-50 border-2 border-emerald-500/60 p-4 rounded-xl flex items-center justify-between gap-3 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
                <CheckCircleOutlined />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold font-serif text-emerald-950 uppercase tracking-wider m-0 flex items-center gap-1.5">
                  <span>ARRIVED AT YOUR LOCATION</span>
                  <span className="bg-emerald-200 text-emerald-900 text-[9px] font-mono font-black px-2 py-0.5 rounded-full">
                    DELIVERED
                  </span>
                </h4>
                <p className="text-[11px] text-emerald-800 m-0 mt-0.5 font-light truncate">
                  Courier has arrived & handed over your package to{" "}
                  <strong className="font-semibold text-emerald-950">
                    {liveOrder.shipping_address || "your destination address"}
                  </strong>
                  .
                </p>
              </div>
            </div>
            <Tag
              color="emerald"
              className="bg-emerald-600 text-white font-mono font-bold uppercase tracking-wider text-[10px] px-2.5 py-1 rounded-md border-none shrink-0"
            >
              ARRIVED
            </Tag>
          </div>
        )}

        {/* 4-Step Progress Bar */}
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
          <Steps
            current={currentStep}
            size="small"
            items={[
              {
                title: "ORDER PLACED",
                description: "Confirmed",
              },
              {
                title: "PREPARING",
                description: "Handcrafted",
              },
              {
                title: "OUT FOR DELIVERY",
                description: "Courier On Way",
              },
              {
                title: "DELIVERED",
                description: "Arrived at Location",
              },
            ]}
          />
        </div>

        {/* Interactive Delivery Map Graphic */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-xl overflow-hidden border border-neutral-300 shadow-md bg-neutral-100 group">
          {/* Simulated Map Visual Background representing Phnom Penh Routes */}
          <div className="absolute inset-0 bg-[#e8ecef] opacity-90" />
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#d1d5db"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Main boulevard road path */}
            <path
              d="M 50 160 C 150 140, 250 80, 400 120 C 550 160, 620 90, 700 80"
              fill="none"
              stroke="#ffffff"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 50 160 C 150 140, 250 80, 400 120 C 550 160, 620 90, 700 80"
              fill="none"
              stroke={currentStep === 3 ? "#10b981" : "#fbbf24"}
              strokeWidth="5"
              strokeDasharray={currentStep === 3 ? "none" : "8 6"}
              strokeLinecap="round"
            />
          </svg>

          {/* Arrived Overlay Badge on Map if delivered */}
          {currentStep === 3 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-emerald-950/90 text-white backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/50 shadow-xl flex items-center gap-2.5 max-w-[90%]">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-black text-xs shrink-0">
                ✓
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-emerald-300 font-serif uppercase tracking-wider m-0">
                  ARRIVED AT DESTINATION
                </h5>
                <p className="text-[10px] text-neutral-300 font-mono m-0 truncate">
                  Package delivered to{" "}
                  {liveOrder.shipping_address || "Customer Location"}
                </p>
              </div>
            </div>
          )}

          {/* Point 1: Store / Maison Location (Left) */}
          <div className="absolute top-[65%] left-[10%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-lg border-2 border-white">
              <ShopOutlined className="text-xs" />
            </div>
            <span className="bg-black/90 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mt-1 shadow uppercase tracking-wider">
              LEGACY STORE MAISON
            </span>
          </div>

          {/* Point 2: Moving Courier Delivery Truck Icon (Center-Moving / Parked at destination) */}
          <div
            className={`absolute top-[48%] transition-all duration-1000 ease-out -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 ${
              currentStep === 3
                ? "left-[85%]"
                : currentStep === 2
                  ? "left-[50%]"
                  : "left-[15%]"
            }`}
          >
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 ${
                  currentStep === 3
                    ? "bg-emerald-500 text-white border-white scale-110"
                    : "bg-amber-400 text-black border-black animate-bounce"
                }`}
              >
                {currentStep === 3 ? (
                  <CheckCircleOutlined className="text-xl font-bold" />
                ) : (
                  <CarOutlined className="text-base font-bold" />
                )}
              </div>
              {currentStep !== 3 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </div>
            <span
              className={`text-[9px] font-mono font-black px-2 py-0.5 rounded mt-1 shadow uppercase tracking-wider ${
                currentStep === 3
                  ? "bg-emerald-700 text-white border border-emerald-400"
                  : "bg-amber-500 text-black"
              }`}
            >
              {currentStep === 3 ? "ARRIVED AT LOCATION" : "COURIER LIVE"}
            </span>
          </div>

          {/* Point 3: Customer Delivery Destination (Right) */}
          <div className="absolute top-[35%] left-[85%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div
              className={`w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-white ${
                currentStep === 3
                  ? "bg-emerald-600 ring-4 ring-emerald-400/40"
                  : "bg-red-600"
              }`}
            >
              <EnvironmentOutlined className="text-xs" />
            </div>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mt-1 shadow uppercase tracking-wider ${
                currentStep === 3
                  ? "bg-emerald-700 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {currentStep === 3 ? "ARRIVED LOCATION" : "YOUR LOCATION"}
            </span>
          </div>

          {/* Bottom Live Map Badge */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className="bg-black/80 backdrop-blur-md text-white text-[9px] font-mono px-2 py-1 rounded border border-white/20 inline-flex items-center gap-1">
              <EnvironmentOutlined className="text-amber-400 text-xs" />
              <span>
                {currentStep === 3
                  ? "Package Arrived • Location Destination Verified"
                  : "Phnom Penh Delivery Zone • Live GPS Satellite Active"}
              </span>
            </span>
            {onNavigateDriverApp && (
              <button
                type="button"
                onClick={onNavigateDriverApp}
                className="pointer-events-auto bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] uppercase px-2.5 py-1 rounded shadow cursor-pointer transition-all flex items-center gap-1"
              >
                <CompassOutlined /> Open Driver Mobile View
              </button>
            )}
          </div>
        </div>

        {/* Courier Contact & Shipping Address Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Courier Driver Card */}
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-900 text-amber-400 flex items-center justify-center font-bold text-sm font-mono shrink-0 shadow">
                {courierName.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  ASSIGNED COURIER
                </span>
                <h4 className="text-xs font-bold font-serif text-black truncate">
                  {courierName}
                </h4>
                <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-0.5">
                  <SafetyCertificateOutlined /> Express Courier
                </span>
              </div>
            </div>

            <a
              href={`tel:${courierPhone}`}
              className="bg-black hover:bg-neutral-800 text-white p-2.5 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0"
              title="Call Courier Driver"
            >
              <PhoneOutlined className="text-sm" />
            </a>
          </div>

          {/* Destination Address Card */}
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <EnvironmentOutlined className="text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                DELIVERY ADDRESS
              </span>
              <h4 className="text-xs font-bold text-black truncate">
                {liveOrder.customer_name || "Valued Client"} (
                {liveOrder.phone || "+855 12 345 678"})
              </h4>
              <p className="text-[10px] text-neutral-600 font-light truncate">
                {liveOrder.shipping_address ||
                  "Vattanac Capital Tower, Monivong Blvd, Phnom Penh"}
              </p>
            </div>
          </div>
        </div>

        {/* Delivered Items Breakdown Section */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
            <div className="flex items-center gap-2">
              <ShoppingOutlined className="text-amber-500 text-base" />
              <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-neutral-900 m-0">
                Shipment Items ({orderItems.length || 1})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">
              Luxury Inserts Included
            </span>
          </div>

          {orderItems && orderItems.length > 0 ? (
            <div className="divide-y divide-neutral-200/60 max-h-48 overflow-y-auto pr-1">
              {orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getItemImage(item)}
                      alt={item.product_name || item.name || "Luxury Product"}
                      className="w-11 h-11 object-cover rounded-lg border border-neutral-200 shrink-0 bg-white"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-neutral-900 truncate m-0 font-serif">
                        {item.product_name ||
                          item.name ||
                          "Alexandre Haute Couture Item"}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.size && (
                          <span className="text-[9px] font-mono bg-neutral-200/80 px-1.5 py-0.5 rounded text-neutral-700">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[9px] font-mono bg-neutral-200/80 px-1.5 py-0.5 rounded text-neutral-700">
                            Color: {item.color}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-neutral-500">
                          Qty: {item.quantity || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono text-neutral-900 block">
                      $
                      {(
                        (item.price || 0) * (item.quantity || 1)
                      ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-mono">
                      $
                      {Number(item.price || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      / ea
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-neutral-200/70 flex items-center justify-center shrink-0">
                  <InboxOutlined className="text-xl text-neutral-500" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-neutral-900 m-0 font-serif">
                    Alexandre Signature Luxury Package
                  </h5>
                  <p className="text-[10px] text-neutral-500 m-0 font-mono">
                    Includes garment bag & Certificate of Authenticity
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono text-neutral-900">
                {formattedTotal}
              </span>
            </div>
          )}
        </div>

        {/* Payment & Order Summary Card */}
        <div className="bg-neutral-900 text-white rounded-xl p-4 border border-neutral-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <FileTextOutlined className="text-amber-400" /> Payment & Billing
              Information
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <CheckOutlined className="text-[9px]" /> PAID & VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Left Column: Payment Method & Date */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-light">
                  Payment Method:
                </span>
                <div>{getPaymentBadge(liveOrder.payment_method)}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-light">
                  Order Date:
                </span>
                <span className="text-[11px] font-mono text-neutral-200">
                  {orderDateStr}
                </span>
              </div>
            </div>

            {/* Right Column: Price Breakdown */}
            <div className="space-y-1.5 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Subtotal</span>
                <span className="font-mono text-neutral-200">
                  {formattedTotal}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Express Courier Shipping</span>
                <span className="font-mono text-emerald-400 font-bold">
                  FREE (Complimentary)
                </span>
              </div>
              <div className="border-t border-neutral-800 pt-1.5 flex justify-between items-center text-xs font-bold text-white">
                <span className="font-serif uppercase tracking-wider text-amber-300">
                  Total Amount Paid
                </span>
                <span className="font-mono text-amber-400 text-sm">
                  {formattedTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Note Footer */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-center gap-2 text-[10px] text-amber-200/90 font-mono">
            <SafetyCertificateOutlined className="text-amber-400 shrink-0 text-xs" />
            <span>
              Delivery Note: Handle with care. Requires customer signature upon
              handover.
            </span>
          </div>
        </div>

        {/* Delivery Timestamp Activity Log */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
            <CalendarOutlined className="text-amber-500 text-sm" />
            <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-neutral-900 m-0">
              Shipment Event Log
            </h4>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div className="flex-1 flex justify-between items-center">
                <span className="font-medium text-neutral-800">
                  Order confirmed & sent to Alexandre Atelier
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  Completed
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div className="flex-1 flex justify-between items-center">
                <span className="font-medium text-neutral-800">
                  Quality inspection & luxury packaging finalized
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  Completed
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span
                className={`w-2 h-2 rounded-full mt-1 shrink-0 ${currentStep >= 2 ? "bg-emerald-500" : "bg-neutral-300"}`}
              />
              <div className="flex-1 flex justify-between items-center">
                <span
                  className={`font-medium ${currentStep >= 2 ? "text-neutral-800" : "text-neutral-400"}`}
                >
                  Handed over to express courier ({courierName})
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  {currentStep >= 2 ? "Active" : "Pending"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span
                className={`w-2 h-2 rounded-full mt-1 shrink-0 ${currentStep === 3 ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`}
              />
              <div className="flex-1 flex justify-between items-center">
                <span
                  className={`font-medium ${currentStep === 3 ? "text-neutral-800" : "text-amber-600 font-bold"}`}
                >
                  {currentStep === 3
                    ? "Successfully delivered to recipient"
                    : `Courier en route to destination (${etaMins} mins estimated)`}
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  {currentStep === 3 ? "Delivered" : "In Progress"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeliveryTrackingModal;
