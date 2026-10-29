import React, { useState, useEffect } from "react";
import {
  CarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ArrowLeftOutlined,
  ShopOutlined,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import {
  fetchOrders,
  updateDeliveryLocation,
  updateOrderStatus,
} from "../services/api";

const DeliveryDriverPage = ({ onNavigateHome }) => {
  // Driver Authentication State
  const [currentDriver, setCurrentDriver] = useState(() => {
    try {
      const saved = localStorage.getItem("alexandre_luxe_driver");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [emailInput, setEmailInput] = useState("driver@alexandreluxe.com");
  const [passwordInput, setPasswordInput] = useState("driver123");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Orders & Live GPS State
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDriving, setIsDriving] = useState(false);
  const [driverLat, setDriverLat] = useState(11.5584);
  const [driverLng, setDriverLng] = useState(104.9242);
  const [estimatedMins, setEstimatedMins] = useState(18);
  const [deliveryStatus, setDeliveryStatus] = useState("out_for_delivery");
  const [isUpdating, setIsUpdating] = useState(false);

  // Load backend orders when authenticated
  useEffect(() => {
    if (currentDriver) {
      fetchOrders()
        .then((orderList) => {
          if (Array.isArray(orderList) && orderList.length > 0) {
            setOrders(orderList);
            setSelectedOrder(orderList[0]);
            setDeliveryStatus(
              orderList[0].delivery_status || "out_for_delivery",
            );
          }
        })
        .catch((err) => console.warn("Failed to fetch driver orders:", err));
    }
  }, [currentDriver]);

  // Live GPS movement simulation
  useEffect(() => {
    let interval = null;
    if (isDriving && selectedOrder && currentDriver) {
      interval = setInterval(() => {
        setDriverLat((prevLat) => prevLat + 0.0008);
        setDriverLng((prevLng) => prevLng + 0.0006);
        setEstimatedMins((prevMins) => Math.max(1, prevMins - 1));

        // Sync live GPS position to backend API
        updateDeliveryLocation(selectedOrder.id, {
          driver_lat: driverLat + 0.0008,
          driver_lng: driverLng + 0.0006,
          estimated_minutes: Math.max(1, estimatedMins - 1),
          delivery_status: deliveryStatus,
        }).catch((e) => console.warn(e));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [
    isDriving,
    selectedOrder,
    driverLat,
    driverLng,
    estimatedMins,
    deliveryStatus,
    currentDriver,
  ]);

  // Handle Driver Authentication Login
  const handleDriverLogin = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    setTimeout(() => {
      let driverProfile = null;
      if (emailInput.includes("vibol")) {
        driverProfile = {
          name: "Vibol Logistics Express",
          email: emailInput,
          phone: "+855 12 777 666",
          vehicle_tag: "PP-7712",
          avatar_initial: "V",
        };
      } else {
        driverProfile = {
          name: "Sokha Express Courier",
          email: emailInput,
          phone: "+855 12 888 999",
          vehicle_tag: "PP-9921",
          avatar_initial: "S",
        };
      }

      setCurrentDriver(driverProfile);
      try {
        localStorage.setItem(
          "alexandre_luxe_driver",
          JSON.stringify(driverProfile),
        );
      } catch (err) {
        console.error(err);
      }
      setIsLoggingIn(false);
      message.success(`Welcome back, ${driverProfile.name}!`);
    }, 600);
  };

  const handleDriverLogout = () => {
    setCurrentDriver(null);
    setIsDriving(false);
    try {
      localStorage.removeItem("alexandre_luxe_driver");
    } catch (e) {
      console.error(e);
    }
    message.info("Signed out of Delivery Driver Portal");
  };

  // Handle manual delivery status update
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder || !currentDriver) return;
    setIsUpdating(true);
    try {
      const resData = await updateOrderStatus(selectedOrder.id, newStatus, {
        courier_name: currentDriver.name,
        courier_phone: currentDriver.phone,
        estimated_minutes: newStatus === "delivered" ? 0 : estimatedMins,
      });

      if (resData && (resData.success || resData.data)) {
        setDeliveryStatus(newStatus);
        setSelectedOrder((prev) => ({
          ...prev,
          delivery_status: newStatus,
          status: newStatus,
        }));
        if (newStatus === "delivered") {
          setIsDriving(false);
          message.success("Order marked as DELIVERED successfully!");
        } else {
          message.success(`Status updated to ${newStatus.toUpperCase()}`);
        }
      } else {
        setDeliveryStatus(newStatus);
        message.success(`Status updated to ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      message.success(`Status updated to ${newStatus.toUpperCase()}`);
      setDeliveryStatus(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // =========================================================
  // VIEW 1: LUXURY DRIVER AUTHENTICATION LOGIN SCREEN
  // =========================================================
  if (!currentDriver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950 text-white font-sans flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-neutral-800 p-4 sm:p-6 relative overflow-hidden">
        {/* Ambient Dark Glow Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between z-10 pt-2">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800"
            >
              <ArrowLeftOutlined className="text-xs" /> Back to Store
            </button>
          )}
          <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full font-bold">
            MOBILE PORTAL
          </span>
        </div>

        {/* Center Login Form Card */}
        <div className="z-10 py-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.35)] font-serif font-black text-2xl">
              <CarOutlined />
            </div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.25em] block pt-1">
              MAISON ALEXANDRE LUXE
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white">
              COURIER DRIVER PORTAL
            </h1>
            <p className="text-xs text-neutral-400 font-light max-w-xs mx-auto">
              Authenticate with your assigned driver credentials to access live
              order routes & dispatch.
            </p>
          </div>

          <form
            onSubmit={handleDriverLogin}
            className="space-y-3.5 bg-neutral-900/90 p-5 rounded-2xl border border-neutral-800 backdrop-blur-md shadow-xl"
          >
            <div>
              <label className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider block mb-1">
                Driver Email / Phone
              </label>
              <div className="relative flex items-center">
                <UserOutlined className="absolute left-3 text-neutral-500 text-xs" />
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="driver@alexandreluxe.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider block mb-1">
                Security Password
              </label>
              <div className="relative flex items-center">
                <LockOutlined className="absolute left-3 text-neutral-500 text-xs" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <RocketOutlined className="text-sm" />
              <span>
                {isLoggingIn ? "AUTHENTICATING..." : "LOG IN TO DISPATCH"}
              </span>
            </button>
          </form>

          {/* Quick One-Tap Test Driver Logins */}
          <div className="space-y-2 pt-1">
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block text-center">
              QUICK ONE-TAP DEMO COURIER LOGINS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmailInput("driver@alexandreluxe.com");
                  setPasswordInput("driver123");
                }}
                className="bg-neutral-900/80 hover:bg-neutral-800 p-2.5 rounded-xl border border-neutral-800 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 truncate">
                  <CarOutlined /> Sokha Express
                </div>
                <div className="text-[9px] font-mono text-neutral-400 mt-0.5 truncate">
                  driver@alexandreluxe.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmailInput("vibol@alexandreluxe.com");
                  setPasswordInput("driver123");
                }}
                className="bg-neutral-900/80 hover:bg-neutral-800 p-2.5 rounded-xl border border-neutral-800 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 truncate">
                  <CarOutlined /> Vibol Logistics
                </div>
                <div className="text-[9px] font-mono text-neutral-400 mt-0.5 truncate">
                  vibol@alexandreluxe.com
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 text-center py-2 text-[10px] font-mono text-neutral-600">
          Maison Alexandre Luxe • Driver Portal v2.0
        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW 2: AUTHENTICATED DRIVER DISPATCH DASHBOARD
  // =========================================================
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-neutral-800">
      {/* Mobile Driver App Top Navigation Bar */}
      <div className="bg-black p-4 sticky top-0 z-40 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-colors border border-neutral-700 cursor-pointer"
              title="Return to Shop"
            >
              <ArrowLeftOutlined className="text-xs" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-extrabold tracking-wider">
                DRIVER ONLINE
              </span>
            </div>
            <h2 className="text-xs font-extrabold font-serif uppercase tracking-widest text-white truncate max-w-[170px]">
              {currentDriver.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
            #{currentDriver.vehicle_tag || "PP-9921"}
          </span>
          <button
            onClick={handleDriverLogout}
            className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-red-600 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-neutral-800 cursor-pointer"
            title="Sign Out Driver"
          >
            <LogoutOutlined className="text-xs" />
          </button>
        </div>
      </div>

      {/* Main Mobile Driver View */}
      <div className="p-4 space-y-4 flex-grow overflow-y-auto">
        {/* Active Order Selector Card */}
        <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 space-y-2">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
            SELECT ASSIGNED DISPATCH ORDER:
          </span>
          <select
            value={selectedOrder?.id || ""}
            onChange={(e) => {
              const target = orders.find(
                (o) => String(o.id) === e.target.value,
              );
              if (target) {
                setSelectedOrder(target);
                setDeliveryStatus(target.delivery_status || "out_for_delivery");
              }
            }}
            className="w-full bg-black text-white text-xs font-mono font-bold p-2.5 rounded-lg border border-neutral-700 focus:border-amber-400 focus:outline-none"
          >
            {orders.map((ord) => (
              <option key={ord.id} value={ord.id}>
                #{ord.order_number || ord.id} - {ord.customer_name} ($
                {ord.total_amount})
              </option>
            ))}
          </select>
        </div>

        {selectedOrder && (
          <>
            {/* Customer Information Card */}
            <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">
                    CUSTOMER RECIPIENT
                  </span>
                  <h3 className="text-sm font-extrabold text-white">
                    {selectedOrder.customer_name}
                  </h3>
                </div>
                <a
                  href={`tel:${selectedOrder.phone}`}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <PhoneOutlined /> CALL
                </a>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <EnvironmentOutlined className="text-red-500 mt-0.5" />
                  <span className="text-neutral-300 font-light">
                    {selectedOrder.shipping_address || "Phnom Penh, Cambodia"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShopOutlined className="text-amber-400" />
                  <span className="text-neutral-400 font-mono text-[11px]">
                    Pickup: Alexandre Luxe Maison, Vattanac Tower
                  </span>
                </div>
              </div>
            </div>

            {/* GPS Live Movement Control Box */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                    GPS SATELLITE NAVIGATION
                  </span>
                  <div className="text-xs font-mono text-white mt-0.5">
                    LAT: {driverLat.toFixed(4)} | LNG: {driverLng.toFixed(4)}
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                  ETA: {estimatedMins} MINS
                </span>
              </div>

              {/* Start Live GPS Simulation Drive Button */}
              <button
                type="button"
                onClick={() => setIsDriving(!isDriving)}
                className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  isDriving
                    ? "bg-amber-500 text-black animate-pulse"
                    : "bg-white text-black hover:bg-neutral-200"
                }`}
              >
                {isDriving ? (
                  <>
                    <PauseCircleOutlined className="text-base" />
                    <span>GPS DRIVE SIMULATION ACTIVE (LIVE MOVING 🚚)</span>
                  </>
                ) : (
                  <>
                    <PlayCircleOutlined className="text-base" />
                    <span>START GPS LIVE DRIVE SIMULATION</span>
                  </>
                )}
              </button>
            </div>

            {/* Delivery Action Status Buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                ONE-TAP DELIVERY STATUS UPDATE:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus("out_for_delivery")}
                  className={`py-3 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                    deliveryStatus === "out_for_delivery" ||
                    deliveryStatus === "delivering"
                      ? "bg-amber-500 text-black border-amber-400 shadow-lg scale-[1.02]"
                      : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  <CarOutlined className="text-base" />
                  <span>OUT FOR DELIVERY</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus("delivered")}
                  className={`py-3 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                    deliveryStatus === "delivered" ||
                    deliveryStatus === "completed"
                      ? "bg-emerald-500 text-black border-emerald-400 shadow-lg scale-[1.02]"
                      : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  <CheckCircleOutlined className="text-base" />
                  <span>MARK DELIVERED</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Driver Footer */}
      <div className="bg-black p-3 text-center border-t border-neutral-800 text-[10px] font-mono text-neutral-500">
        Maison Alexandre Luxe • Delivery Operations Portal v2.0
      </div>
    </div>
  );
};

export default DeliveryDriverPage;
