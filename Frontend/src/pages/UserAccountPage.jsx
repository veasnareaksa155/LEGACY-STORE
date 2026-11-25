import React, { useState, useEffect, useRef, useMemo } from "react";
import { Table, Tag, Button, Modal, Form, Input, notification, Tooltip } from "antd";
import ImageTrimModal from "../components/ImageTrimModal";
import ReceiptModal from "../components/ReceiptModal";
import ProductCard from "../components/ProductCard";
import {
  UserOutlined,
  ShoppingOutlined,
  CrownOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  CheckCircleOutlined,
  CarOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  EditOutlined,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  CameraOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { fetchOrders, updateUser } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";

const UserAccountPage = ({
  user: currentUser,
  onUpdateProfile,
  onLogout,
  wishlistItems = [],
  onAddToCart,
  onBuyNow,
  onRemoveFromWishlist,
  onQuickView,
  onNavigateShop,
  onOpenDeliveryTracking,
  onNavigateAdmin,
}) => {
  // Active User Profile object with fallbacks
  const profile = currentUser || {
    name: "Alexandre Client",
    email: "vip.client@alexandreluxe.com",
    tier: "BLACK DIAMOND VIP",
    memberSince: "2026",
    phone: "+855 12 888 999",
    address: "Phnom Penh, Cambodia",
    avatar: null,
  };

  const userCacheKey = profile?.email
    ? `lx_cached_orders_${profile.email}`
    : "lx_cached_orders";

  // Instant 0ms cached orders initialization per user
  const [orders, setOrders] = useState(() => {
    try {
      const cached = localStorage.getItem(userCacheKey);
      let list = cached ? JSON.parse(cached) : [];
      if (!Array.isArray(list)) list = [];
      const lastOrderStr = localStorage.getItem("legacy_last_paid_order");
      if (lastOrderStr) {
        const lastOrder = JSON.parse(lastOrderStr);
        if (lastOrder) {
          const exists = list.some(
            (o) =>
              (o.id && o.id === lastOrder.id) ||
              (o.order_number && o.order_number === lastOrder.order_number),
          );
          if (!exists) {
            list = [lastOrder, ...list];
          }
        }
      }
      return list;
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderFilter, setOrderFilter] = useState("all"); // 'all' | 'active' | 'delivered'
  const fileInputRef = useRef(null);

  // Edit Profile Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Image Trim & Position Modal State
  const [trimModalOpen, setTrimModalOpen] = useState(false);
  const [trimImageSrc, setTrimImageSrc] = useState(null);

  const [avatarImage, setAvatarImage] = useState(
    profile.avatar || profile.avatar_url || null,
  );

  useEffect(() => {
    setAvatarImage(
      currentUser?.avatar ||
        currentUser?.avatar_url ||
        profile.avatar ||
        profile.avatar_url ||
        null,
    );
  }, [
    currentUser?.avatar,
    currentUser?.avatar_url,
    currentUser?.id,
    profile.avatar,
    profile.avatar_url,
  ]);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setTrimImageSrc(dataUrl);
        setTrimModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = "";
  };

  const handleCropComplete = async (croppedDataUrl) => {
    setAvatarImage(croppedDataUrl);

    let finalAvatarUrl = croppedDataUrl;
    try {
      // 1. Upload cropped avatar to Cloudinary CDN
      const uploadRes = await uploadToCloudinary(croppedDataUrl);
      if (uploadRes?.success && uploadRes?.url) {
        finalAvatarUrl = uploadRes.url;
        setAvatarImage(finalAvatarUrl);
      }
    } catch (e) {
      console.warn("Cloudinary upload failed, falling back to data URL:", e);
    }

    const updated = {
      ...profile,
      avatar: finalAvatarUrl,
      avatar_url: finalAvatarUrl,
    };

    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }

    // 2. Persist avatar URL directly to Supabase Database via API
    const userId = profile.id || currentUser?.id;
    if (userId) {
      try {
        const res = await updateUser(userId, { avatar: finalAvatarUrl });
        if (res?.data) {
          const syncedUser = {
            ...updated,
            ...res.data,
            avatar: res.data.avatar || finalAvatarUrl,
            avatar_url: res.data.avatar || finalAvatarUrl,
          };
          if (onUpdateProfile) {
            onUpdateProfile(syncedUser);
          }
        }
        notification.success({
          message: "PROFILE PHOTO SAVED",
          description: "Your VIP profile avatar has been securely saved to Cloudinary and Supabase.",
          placement: "bottomRight",
          duration: 3,
        });
      } catch (err) {
        console.error("Failed to save avatar to DB:", err);
      }
    }
  };


  const loadCustomerOrders = async () => {
    setLoading(true);
    try {
      const email = currentUser?.email || profile?.email;
      const ordData = await fetchOrders(email);
      let mergedOrders = Array.isArray(ordData) ? [...ordData] : [];

      // Check if there is an active/recent order in localStorage to merge
      try {
        const lastOrderStr = localStorage.getItem("legacy_last_paid_order");
        if (lastOrderStr) {
          const lastOrder = JSON.parse(lastOrderStr);
          if (
            lastOrder &&
            (!lastOrder.customer_email ||
              !email ||
              lastOrder.customer_email.toLowerCase().trim() === email.toLowerCase().trim())
          ) {
            const exists = mergedOrders.some(
              (o) =>
                (o.id && o.id === lastOrder.id) ||
                (o.order_number && o.order_number === lastOrder.order_number),
            );
            if (!exists) {
              mergedOrders.unshift(lastOrder);
            }
          }
        }
      } catch (e) {}

      setOrders(mergedOrders);
      try {
        localStorage.setItem(userCacheKey, JSON.stringify(mergedOrders));
      } catch (e) {
        console.error("Failed to save cached orders:", e);
      }
    } catch (err) {
      console.error("Error loading customer orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCustomerOrders();
  }, [profile?.email]);

  const handleOpenEditModal = () => {
    form.setFieldsValue({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || "",
      address: profile.address || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (values) => {
    const updated = {
      ...profile,
      ...values,
      avatar: avatarImage,
      avatar_url: avatarImage,
    };

    const userId = profile.id || currentUser?.id;
    if (userId) {
      try {
        const res = await updateUser(userId, {
          name: values.name,
          phone: values.phone,
          address: values.address,
          avatar: avatarImage,
        });
        if (res?.data) {
          updated.avatar = res.data.avatar || avatarImage;
          updated.avatar_url = res.data.avatar || avatarImage;
        }
      } catch (err) {
        console.warn("Could not sync profile to DB:", err);
      }
    }

    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }

    notification.success({
      message: "VIP PROFILE UPDATED",
      description: "Your personal account details have been updated successfully.",
      placement: "bottomRight",
      duration: 2.5,
    });

    setEditModalOpen(false);
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const totalSpent = orders.reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0,
    );
    const activeOrders = orders.filter((o) => {
      const st = String(o.delivery_status || o.status || "").toLowerCase();
      return (
        st === "pending" ||
        st === "processing" ||
        st === "preparing" ||
        st === "shipped" ||
        st === "delivering" ||
        st === "out_for_delivery"
      );
    });
    const deliveredOrders = orders.filter((o) => {
      const st = String(o.delivery_status || o.status || "").toLowerCase();
      return st === "delivered" || st === "completed" || st === "arrived";
    });

    return {
      totalOrders: orders.length,
      totalSpent: totalSpent.toFixed(2),
      activeCount: activeOrders.length,
      deliveredCount: deliveredOrders.length,
      wishlistCount: wishlistItems.length,
    };
  }, [orders, wishlistItems.length]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    if (orderFilter === "active") {
      return orders.filter((o) => {
        const st = String(o.delivery_status || o.status || "").toLowerCase();
        return (
          st === "pending" ||
          st === "processing" ||
          st === "preparing" ||
          st === "shipped" ||
          st === "delivering" ||
          st === "out_for_delivery"
        );
      });
    }
    if (orderFilter === "delivered") {
      return orders.filter((o) => {
        const st = String(o.delivery_status || o.status || "").toLowerCase();
        return st === "delivered" || st === "completed" || st === "arrived";
      });
    }
    return orders;
  }, [orders, orderFilter]);

  const getStatusBadge = (status) => {
    const st = String(status || "pending").toLowerCase();
    switch (st) {
      case "completed":
      case "delivered":
      case "arrived":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>DELIVERED</span>
          </span>
        );
      case "shipped":
      case "delivering":
      case "out_for_delivery":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>COURIER EN ROUTE</span>
          </span>
        );
      case "processing":
      case "preparing":
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-300 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full shadow-2xs">
            <SyncOutlined spin className="text-[10px] text-blue-600" />
            <span>PREPARING AT ATELIER</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 border border-neutral-300 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full shadow-2xs">
            <ClockCircleOutlined className="text-[10px] text-neutral-500" />
            <span>ORDER CONFIRMED</span>
          </span>
        );
    }
  };

  const getItemThumbnails = (record) => {
    const items = record.items || record.order_items || [];
    if (!items || items.length === 0) {
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
            <InboxOutlined className="text-neutral-500 text-base" />
          </div>
          <div>
            <span className="text-xs font-serif font-bold text-neutral-900 block truncate max-w-[200px]">
              {record.product_name || "Alexandre Luxe Garment"}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              Qty: {record.quantity || 1}
            </span>
          </div>
        </div>
      );
    }

    const firstItem = items[0];
    const imageSrc =
      firstItem.image_url ||
      (firstItem.product && firstItem.product.image_url) ||
      null;

    return (
      <div className="flex items-center gap-3">
        {imageSrc ? (
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-2xs group">
            <img
              src={imageSrc}
              alt={firstItem.name || "Item"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {items.length > 1 && (
              <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[8px] font-mono px-1 rounded-tl-sm font-bold">
                +{items.length - 1}
              </span>
            )}
          </div>
        ) : (
          <div className="w-11 h-11 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
            <ShoppingOutlined className="text-neutral-500 text-base" />
          </div>
        )}

        <div className="min-w-0">
          <span className="text-xs font-serif font-bold text-neutral-900 block truncate max-w-[200px] leading-tight">
            {firstItem.name || firstItem.product_name || "Haute Couture Piece"}
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-neutral-500">
            <span>
              {items.length} {items.length === 1 ? "Piece" : "Pieces"}
            </span>
            {firstItem.size && (
              <>
                <span>•</span>
                <span className="bg-neutral-100 px-1.5 py-0.2 rounded border border-neutral-200 text-neutral-700">
                  {firstItem.size}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const formatPaymentMethod = (method) => {
    const m = String(method || "").toLowerCase();
    if (
      m.includes("cod") ||
      m.includes("cash") ||
      m.includes("doorstep") ||
      m.includes("delivery")
    ) {
      return "CASH ON DELIVERY";
    }
    if (m.includes("khqr") || m.includes("bakong") || m.includes("aba")) {
      return "BAKONG KHQR";
    }
    if (
      m.includes("card") ||
      m.includes("credit") ||
      m.includes("debit") ||
      m.includes("stripe") ||
      m.includes("visa") ||
      m.includes("master")
    ) {
      return "CREDIT / CARD";
    }
    return method ? String(method).toUpperCase() : "STANDARD";
  };

  const orderColumns = [
    {
      title: "ORDER REFERENCE",
      dataIndex: "order_number",
      key: "order_number",
      width: 170,
      render: (num, record) => (
        <div>
          <span className="font-mono font-extrabold text-xs text-neutral-900 block tracking-wider">
            {num || `LX-${record.id}`}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
            {new Date(record.created_at || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      title: "CURATED ITEMS",
      key: "items",
      render: (_, record) => getItemThumbnails(record),
    },
    {
      title: "TOTAL AMOUNT",
      dataIndex: "total_amount",
      key: "total_amount",
      width: 140,
      render: (amount, record) => (
        <div>
          <span className="font-mono font-black text-sm text-neutral-950 block">
            ${Number(amount || 0).toFixed(2)}
          </span>
          <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-tight block">
            {formatPaymentMethod(record.payment_method)}
          </span>
        </div>
      ),
    },
    {
      title: "DELIVERY STATUS",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status, record) => (
        <div
          onClick={() => onOpenDeliveryTracking && onOpenDeliveryTracking(record)}
          className="cursor-pointer hover:opacity-90 transition-opacity inline-block"
          title="Click to open live delivery tracker"
        >
          {getStatusBadge(status || record.delivery_status)}
        </div>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 180,
      align: "right",
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          {onOpenDeliveryTracking && (
            <button
              type="button"
              onClick={() => onOpenDeliveryTracking(record)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-black text-white text-[10px] font-mono font-bold uppercase tracking-wider transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
            >
              <CarOutlined className="text-amber-400 text-xs" />
              <span>TRACK</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedOrderDetails(record)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider border border-neutral-200 transition-all active:scale-95 cursor-pointer"
            title="Download or print luxury receipt"
          >
            <FileTextOutlined className="text-neutral-500 text-xs" />
            <span>RECEIPT</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-neutral-50 text-neutral-900 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* 1. CLEAN LUXURY CLIENT PROFILE CARD (WITH GOLD & ACCENT COLORS) */}
        <div className="bg-gradient-to-br from-white via-[#fcfaf7] to-[#f9f6ef] rounded-3xl border border-amber-200/80 shadow-[0_10px_35px_-10px_rgba(212,175,55,0.12)] p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle Ambient Colorful Glow Accents */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-gradient-to-br from-amber-400/15 via-rose-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-gradient-to-tr from-blue-300/10 via-amber-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
            
            {/* Left: Avatar, Name & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 min-w-0">
              {/* Circular Avatar with Gold Rim & Crown Emblem */}
              <div className="relative shrink-0">
                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="relative group w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden bg-neutral-100 ring-4 ring-amber-400/90 ring-offset-2 ring-offset-white border-2 border-white shadow-lg cursor-pointer transition-all hover:scale-105"
                  title="Click to change profile photo"
                >
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt={profile.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 font-serif font-black text-2xl">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : "V"}
                    </div>
                  )}

                  {/* Subtle Hover Overlay */}
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
                    <CameraOutlined className="text-base text-amber-300 mb-0.5" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-200">
                      EDIT
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>

                {/* VIP Crown Mini Badge */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-neutral-950 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-md">
                  <CrownOutlined />
                </div>
              </div>

              {/* Name, Email, Phone & Quick Actions */}
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-tight text-neutral-950 m-0 leading-tight">
                    {profile.name}
                  </h1>
                  {currentUser?.role === "admin" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 text-amber-400 border border-amber-400/70 text-[10.5px] font-mono font-black uppercase tracking-wider shadow-xs">
                      <CrownOutlined className="text-amber-400 text-xs" />
                      <span>SUPERADMIN</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-neutral-950 text-[10.5px] font-mono font-black uppercase tracking-wider shadow-xs">
                      <CrownOutlined className="text-neutral-950 text-xs" />
                      <span>{profile.tier || "BLACK DIAMOND VIP"}</span>
                    </span>
                  )}
                </div>

                {/* Contact Pill Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50/90 border border-amber-200/80 text-xs font-mono text-neutral-800 shadow-2xs">
                    <MailOutlined className="text-amber-700 text-xs" />
                    <span>{profile.email}</span>
                  </span>
                  {profile.phone && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-100/90 border border-neutral-200/80 text-xs font-mono text-neutral-700 shadow-2xs">
                      <PhoneOutlined className="text-neutral-500 text-xs" />
                      <span>{profile.phone}</span>
                    </span>
                  )}
                </div>

                {/* Profile Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                  {currentUser?.role === "admin" && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateAdmin ? onNavigateAdmin() : undefined
                      }
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-mono font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2 active:scale-95"
                      title="Open Executive Admin Dashboard"
                    >
                      <CrownOutlined className="text-black text-xs" />
                      <span>ADMIN DASHBOARD</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <EditOutlined className="text-xs text-amber-400" />
                    <span>Edit Profile</span>
                  </button>

                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-neutral-700 hover:text-rose-600 border border-neutral-300 hover:border-rose-300 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs"
                    >
                      <LogoutOutlined className="text-xs text-neutral-400 group-hover:text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: 4 Vibrant Colored Luxury Stat Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5 w-full xl:w-auto mt-2 xl:mt-0">
              {/* Card 1: Purchases (Royal Sapphire Blue) */}
              <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white border border-blue-200/90 hover:border-blue-300 rounded-2xl p-4 text-center shadow-2xs hover:shadow-md transition-all group min-w-[115px]">
                <span className="text-[9.5px] font-mono font-extrabold tracking-widest text-blue-800 uppercase block mb-1">
                  PURCHASES
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-blue-950 block leading-tight my-0.5">
                  {stats.totalOrders}
                </span>
                <span className="inline-flex items-center gap-1 bg-blue-100/90 text-blue-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mt-1.5">
                  <ShoppingOutlined className="text-[10px]" />
                  <span>Orders</span>
                </span>
              </div>

              {/* Card 2: Total Value (Imperial Amber Gold) */}
              <div className="bg-gradient-to-br from-amber-50/90 via-yellow-50/40 to-white border border-amber-200/90 hover:border-amber-300 rounded-2xl p-4 text-center shadow-2xs hover:shadow-md transition-all group min-w-[115px]">
                <span className="text-[9.5px] font-mono font-extrabold tracking-widest text-amber-800 uppercase block mb-1">
                  TOTAL VALUE
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-amber-600 block leading-tight my-0.5">
                  ${stats.totalSpent}
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-100/90 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mt-1.5">
                  <DollarOutlined className="text-[10px]" />
                  <span>Invested</span>
                </span>
              </div>

              {/* Card 3: Deliveries (Vivid Emerald Green Active) */}
              <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200/90 hover:border-emerald-300 rounded-2xl p-4 text-center shadow-2xs hover:shadow-md transition-all group min-w-[115px]">
                <span className="text-[9.5px] font-mono font-extrabold tracking-widest text-emerald-800 uppercase block mb-1">
                  DELIVERIES
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-700 block leading-tight my-0.5">
                  {stats.activeCount}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-100/90 text-emerald-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mt-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                  </span>
                  <span>In Transit</span>
                </span>
              </div>

              {/* Card 4: Wishlist (Haute Crimson Rose) */}
              <div className="bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white border border-rose-200/90 hover:border-rose-300 rounded-2xl p-4 text-center shadow-2xs hover:shadow-md transition-all group min-w-[115px]">
                <span className="text-[9.5px] font-mono font-extrabold tracking-widest text-rose-800 uppercase block mb-1">
                  WISHLIST
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-rose-600 block leading-tight my-0.5">
                  {stats.wishlistCount}
                </span>
                <span className="inline-flex items-center gap-1 bg-rose-100/90 text-rose-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mt-1.5">
                  <HeartFilled className="text-[10px] text-rose-500" />
                  <span>Saved</span>
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 2. ORDER HISTORY & TRACKING TABLE */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm overflow-hidden">
          {/* Header & Filter Tabs */}
          <div className="p-5 sm:p-6 border-b border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                CLIENT DISPATCH & LOGISTICS
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-serif uppercase tracking-tight text-neutral-900 m-0">
                ORDER HISTORY & REAL-TIME TRACKING
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-mono">
              <button
                type="button"
                onClick={() => setOrderFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                  orderFilter === "all"
                    ? "bg-black text-white shadow-xs"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                ALL ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter("active")}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                  orderFilter === "active"
                    ? "bg-black text-white shadow-xs"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                IN TRANSIT ({stats.activeCount})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter("delivered")}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                  orderFilter === "delivered"
                    ? "bg-black text-white shadow-xs"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                DELIVERED ({stats.deliveredCount})
              </button>
            </div>
          </div>

          {/* Table Container */}
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 text-2xl border border-neutral-200">
                <ShoppingOutlined />
              </div>
              <h4 className="text-sm font-bold font-serif uppercase tracking-wider text-neutral-800 m-0">
                NO ORDERS FOUND IN THIS VIEW
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
                {orderFilter !== "all"
                  ? "There are currently no orders matching your selected status filter."
                  : "You haven't placed any orders yet. Discover our curated collection of luxury apparel."}
              </p>
              {onNavigateShop && (
                <button
                  type="button"
                  onClick={onNavigateShop}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer mt-2"
                >
                  DISCOVER COLLECTION
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table
                  dataSource={filteredOrders}
                  columns={orderColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 6,
                    showSizeChanger: false,
                    className: "px-6 py-4",
                  }}
                  className="luxury-portal-table"
                />
              </div>

              {/* Mobile Order Cards View (< md) */}
              <div className="md:hidden divide-y divide-neutral-100">
                {filteredOrders.map((ord) => (
                  <div key={ord.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-extrabold text-xs text-neutral-900 block">
                          {ord.order_number || `LX-${ord.id}`}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(ord.created_at || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <div>{getStatusBadge(ord.delivery_status || ord.status)}</div>
                    </div>

                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80">
                      {getItemThumbnails(ord)}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase block">
                          TOTAL PAID
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono font-black text-sm text-neutral-900">
                            ${Number(ord.total_amount || 0).toFixed(2)}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">
                            {formatPaymentMethod(ord.payment_method)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {onOpenDeliveryTracking && (
                          <button
                            type="button"
                            onClick={() => onOpenDeliveryTracking(ord)}
                            className="px-3 py-1.5 bg-neutral-950 hover:bg-black text-white text-[10px] font-mono font-bold uppercase rounded-lg flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer transition-all"
                          >
                            <CarOutlined className="text-amber-400 text-xs" />
                            <span>TRACK</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-mono font-bold uppercase rounded-lg border border-neutral-200 active:scale-95 cursor-pointer transition-all flex items-center gap-1"
                        >
                          <FileTextOutlined className="text-neutral-500 text-xs" />
                          <span>RECEIPT</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 4. SAVED WISHLIST PIECES (Luxury Private Curation) */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                PRIVATE ATELIER CURATION
              </span>
              <h2 className="text-lg sm:text-2xl font-bold font-serif uppercase tracking-tight text-neutral-900 m-0 flex items-center gap-2.5">
                <HeartFilled className="text-rose-500 text-lg" />
                <span>SAVED WISHLIST</span>
                <span className="font-mono text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200">
                  {wishlistItems.length} {wishlistItems.length === 1 ? "PIECE" : "PIECES"}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {wishlistItems.length > 0 && onAddToCart && (
                <button
                  type="button"
                  onClick={() => {
                    wishlistItems.forEach((p) => onAddToCart(p));
                    notification.success({
                      message: "ALL PIECES MOVED TO BAG",
                      description: `${wishlistItems.length} curated pieces have been added to your shopping bag.`,
                      placement: "bottomRight",
                      duration: 3,
                    });
                  }}
                  className="text-xs font-mono font-bold uppercase text-neutral-900 hover:text-white bg-white hover:bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-300 hover:border-neutral-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                >
                  <ShoppingOutlined className="text-xs" />
                  <span>ADD ALL TO BAG</span>
                </button>
              )}

              {onNavigateShop && (
                <button
                  type="button"
                  onClick={onNavigateShop}
                  className="text-xs font-mono font-bold uppercase text-neutral-600 hover:text-black inline-flex items-center gap-1.5 transition-colors cursor-pointer bg-neutral-50 hover:bg-neutral-100 px-4 py-2 rounded-xl border border-neutral-200/80 shadow-2xs active:scale-95"
                >
                  <span>EXPLORE CATALOGUE</span>
                  <ArrowRightOutlined className="text-[10px]" />
                </button>
              )}
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-neutral-50/70 rounded-2xl border border-dashed border-neutral-300">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-2xl border border-rose-200 shadow-2xs">
                <HeartOutlined />
              </div>
              <h4 className="text-sm font-bold font-serif uppercase tracking-wider text-neutral-900 m-0">
                YOUR PRIVATE CURATION IS CURRENTLY EMPTY
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto font-sans leading-relaxed">
                Save your favorite haute couture pieces by tapping the heart icon in our catalogue to keep them curated here.
              </p>
              {onNavigateShop && (
                <button
                  type="button"
                  onClick={onNavigateShop}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer mt-2"
                >
                  <ShoppingOutlined className="text-amber-400 text-xs" />
                  <span>DISCOVER COLLECTIONS</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlistItems.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                  isWishlisted={true}
                  onToggleWishlist={(p) => {
                    if (onRemoveFromWishlist) onRemoveFromWishlist(p);
                    notification.info({
                      message: "REMOVED FROM WISHLIST",
                      description: `${p.name} removed from your private curation.`,
                      placement: "bottomRight",
                      duration: 2.5,
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit VIP Profile Modal */}
      <Modal
        title={
          <span className="font-serif font-black uppercase tracking-tight text-base sm:text-lg text-black">
            EDIT VIP CLIENT PROFILE
          </span>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
          className="pt-2 space-y-3"
        >
          {/* Avatar Upload in Edit Modal */}
          <div className="flex flex-col items-center justify-center pb-3 border-b border-neutral-100">
            <div
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="relative group w-20 h-20 rounded-2xl overflow-hidden bg-neutral-900 border-2 border-neutral-300 hover:border-black transition-all cursor-pointer shadow-md mb-2"
              title="Click to choose a new photo"
            >
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={profile.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black text-amber-400 font-serif font-black text-xl">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "V"}
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white z-10">
                <CameraOutlined className="text-base text-amber-300 mb-0.5" />
                <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-amber-200">
                  CHANGE
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="text-xs font-mono font-bold text-neutral-600 hover:text-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-full transition-colors"
            >
              <CameraOutlined /> Upload Avatar Photo
            </button>
          </div>

          <Form.Item
            name="name"
            label={<span className="text-xs font-bold uppercase font-mono">Full Name</span>}
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              prefix={<IdcardOutlined className="text-neutral-400" />}
              autoComplete="name"
              className="text-sm py-2 rounded-xl"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-xs font-bold uppercase font-mono">Email Address</span>}
            rules={[{ required: true, message: "Please enter email" }]}
          >
            <Input
              prefix={<MailOutlined className="text-neutral-400" />}
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="email"
              className="text-sm py-2 rounded-xl"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label={<span className="text-xs font-bold uppercase font-mono">Phone Number</span>}
          >
            <Input
              prefix={<PhoneOutlined className="text-neutral-400" />}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="text-sm py-2 rounded-xl"
            />
          </Form.Item>

          <Form.Item
            name="address"
            label={<span className="text-xs font-bold uppercase font-mono">Shipping Address</span>}
          >
            <Input.TextArea
              rows={3}
              prefix={<HomeOutlined className="text-neutral-400" />}
              className="text-sm p-2.5 rounded-xl"
            />
          </Form.Item>

          <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-200">
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase px-6 rounded-lg"
            >
              Save Profile Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Printable / Downloadable Order Receipt Modal */}
      <ReceiptModal
        open={!!selectedOrderDetails}
        onClose={() => setSelectedOrderDetails(null)}
        order={selectedOrderDetails}
      />

      {/* Image Trim & Position Modal */}
      <ImageTrimModal
        open={trimModalOpen}
        onClose={() => setTrimModalOpen(false)}
        imageSrc={trimImageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default UserAccountPage;
