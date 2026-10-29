import React, { useState, useEffect, useRef } from "react";
import { Table, Tag, Button, Modal, Form, Input, notification } from "antd";
import ImageTrimModal from "../components/ImageTrimModal";
import ReceiptModal from "../components/ReceiptModal";
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
  ScissorOutlined,
} from "@ant-design/icons";
import { fetchOrders, updateUser } from "../services/api";

const UserAccountPage = ({
  user: currentUser,
  onUpdateProfile,
  onLogout,
  wishlistItems = [],
  onAddToCart,
  onRemoveFromWishlist,
  onQuickView,
  onNavigateShop,
  onOpenDeliveryTracking,
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
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
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

  const handleOpenTrimForCurrent = () => {
    if (avatarImage) {
      setTrimImageSrc(avatarImage);
      setTrimModalOpen(true);
    }
  };

  const handleCropComplete = async (croppedDataUrl) => {
    setAvatarImage(croppedDataUrl);
    const updated = {
      ...profile,
      avatar: croppedDataUrl,
      avatar_url: croppedDataUrl,
    };

    // Update local state and localStorage immediately
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }

    const userId = profile.id || currentUser?.id;
    if (userId) {
      try {
        const res = await updateUser(userId, { avatar: croppedDataUrl });
        if (res?.data) {
          const syncedUser = {
            ...updated,
            ...res.data,
            avatar: res.data.avatar || croppedDataUrl,
            avatar_url: res.data.avatar || croppedDataUrl,
          };
          if (onUpdateProfile) {
            onUpdateProfile(syncedUser);
          }
        }
        notification.success({
          message: "PROFILE PHOTO SAVED",
          description: "Your VIP profile avatar has been securely saved to your account.",
          placement: "bottomRight",
          duration: 3,
        });
      } catch (err) {
        console.error("Failed to save avatar to DB:", err);
      }
    }
  };

  if (currentUser?.role === "admin") {
    return (
      <div className="min-h-[70vh] bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <CrownOutlined className="text-4xl sm:text-5xl text-yellow-400 mb-3" />
        <h2 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white mb-2">
          SUPERADMIN CONTROL SESSION ACTIVE
        </h2>
        <p className="text-xs text-neutral-400 max-w-md mb-6 font-light leading-relaxed">
          You are currently logged in with SuperAdmin privileges. Admin accounts
          do not have customer VIP purchase profiles or personal order tracking.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onNavigateShop && (
            <Button
              onClick={onNavigateShop}
              className="bg-neutral-800 text-white hover:bg-neutral-700 border-neutral-700 text-xs font-bold uppercase tracking-wider h-10 px-5"
            >
              BROWSE STORE CATALOG
            </Button>
          )}
          {onLogout && (
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={onLogout}
              className="text-xs font-bold uppercase tracking-wider h-10 px-5"
            >
              SIGN OUT ADMIN
            </Button>
          )}
        </div>
      </div>
    );
  }

  const loadCustomerOrders = async () => {
    setLoading(true);
    try {
      const ordData = await fetchOrders(profile?.email);
      if (ordData) {
        setOrders(ordData);
        try {
          localStorage.setItem(userCacheKey, JSON.stringify(ordData));
        } catch (e) {
          console.error("Failed to save cached orders:", e);
        }
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
      description:
        "Your personal account details have been updated successfully.",
      placement: "bottomRight",
      duration: 2.5,
    });

    setEditModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
      case "arrived":
        return (
          <span className="inline-flex items-center gap-1 bg-black text-white border border-black text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shadow-2xs">
            <CheckCircleOutlined className="text-[10px] text-emerald-400" />{" "}
            DELIVERED
          </span>
        );
      case "shipped":
      case "delivering":
      case "out_for_delivery":
        return (
          <span className="inline-flex items-center gap-1 bg-neutral-800 text-white border border-neutral-700 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shadow-2xs">
            <CarOutlined className="text-[10px] text-amber-400" /> SHIPPED
          </span>
        );
      case "processing":
      case "preparing":
        return (
          <span className="inline-flex items-center gap-1 bg-neutral-700 text-white border border-neutral-600 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shadow-2xs">
            <SyncOutlined spin className="text-[10px] text-amber-400" />{" "}
            PREPARING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-900 border border-neutral-300 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shadow-2xs">
            <ClockCircleOutlined className="text-[10px] text-neutral-700" />{" "}
            PENDING
          </span>
        );
    }
  };

  const orderColumns = [
    {
      title: "ORDER #",
      dataIndex: "order_number",
      key: "order_number",
      render: (num, record) => (
        <div>
          <span className="font-mono font-extrabold text-xs text-black block">
            {num || `LX-${record.id}`}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono block">
            {new Date(record.created_at || Date.now()).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      title: "ITEMS",
      key: "items",
      render: (_, record) => (
        <span className="text-xs font-medium text-neutral-700">
          {record.items ? `${record.items.length} Luxury Items` : "1 Item"}
        </span>
      ),
    },
    {
      title: "TOTAL",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount) => (
        <span className="font-mono font-black text-xs text-black">
          ${Number(amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: "DELIVERY STATUS",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <div
          onClick={() =>
            onOpenDeliveryTracking && onOpenDeliveryTracking(record)
          }
          className="cursor-pointer hover:opacity-80 transition-opacity inline-block"
          title="Click to track live delivery"
        >
          {getStatusBadge(status)}
        </div>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          {onOpenDeliveryTracking && (
            <Button
              type="primary"
              size="small"
              icon={<CarOutlined />}
              onClick={() => onOpenDeliveryTracking(record)}
              className="bg-amber-500 hover:!bg-amber-400 text-black border-none text-[10px] font-mono font-bold uppercase h-6 px-2 shadow-2xs"
            >
              Track
            </Button>
          )}
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => setSelectedOrderDetails(record)}
            className="text-xs font-semibold text-neutral-600 hover:text-black"
          >
            Receipt
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white text-neutral-900 pb-20 min-h-screen">
      {/* Header Banner (Luxury Parisian Gold Crest Style) */}
      <div className="relative bg-gradient-to-r from-neutral-950 via-neutral-900 to-black text-white py-4 sm:py-5 px-4 sm:px-8 border-b border-amber-500/20 shadow-xs overflow-hidden">
        {/* Subtle Ambient Gold Glow Background Effect */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[8px] sm:text-[9px] font-bold text-amber-400/90 uppercase tracking-[0.2em] font-mono">
                PARIS HAUTE COUTURE • CLIENT PORTAL
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black font-serif uppercase tracking-tight text-white m-0 flex items-center gap-2 truncate">
              <span>MY VIP ACCOUNT</span>
            </h1>
          </div>

          <div className="shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 shadow-2xs backdrop-blur-md">
              <CrownOutlined className="text-xs text-amber-400" />
              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider">
                {profile.tier || "BLACK DIAMOND VIP"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        {/* User Profile Card (Sleek, Compact, Luxury Parisian Style) */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 scroll-reveal">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 w-full md:w-auto text-center sm:text-left">
            {/* Interactive Hover-to-Upload Profile Avatar Circle (BIGGER PROMINENT PHOTO) */}
            <div
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
              className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-black text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0 cursor-pointer border-2 border-neutral-300 hover:border-black transition-all mx-auto sm:mx-0"
              title="Click or hover to change profile photo"
            >
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={profile.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <span>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
                </span>
              )}

              {/* Hover Overlay with Camera Icon */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white z-10">
                <CameraOutlined className="text-base sm:text-lg mb-0.5" />
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider">
                  CHANGE
                </span>
              </div>

              {/* Hidden Native File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-base sm:text-lg font-bold font-serif uppercase tracking-tight text-black m-0">
                  {profile.name}
                </h2>
                <Tag
                  color="gold"
                  className="text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 m-0 border-0 bg-amber-50 text-amber-800 rounded-full"
                >
                  <CrownOutlined className="mr-0.5 text-amber-600" /> VIP MEMBER
                </Tag>
              </div>

              <p className="text-[11px] sm:text-xs text-neutral-500 font-mono mb-2">
                📧 {profile.email} • 📞 {profile.phone || "+33 1 42 68 55 00"}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-950 text-white hover:bg-black text-[10px] font-mono font-bold uppercase tracking-widest border border-neutral-900 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <EditOutlined className="text-amber-400 text-xs" />
                  <span>EDIT PROFILE</span>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-600 border border-neutral-200 hover:border-red-200 text-[10px] font-mono font-bold uppercase tracking-widest shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <LogoutOutlined className="text-xs text-neutral-400 group-hover:text-red-500" />
                    <span>SIGN OUT</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Micro Stat Badges (Ultra-Compact, Low-Profile & Sleek) */}
          <div className="flex items-center justify-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
            <div className="bg-neutral-50 px-3 py-1 rounded-md border border-neutral-200/80 text-center font-mono shrink-0 min-w-[90px]">
              <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-widest block leading-tight">
                WISHLIST
              </span>
              <span className="text-[10px] font-black text-black block leading-tight mt-0.5">
                {wishlistItems.length} SAVED
              </span>
            </div>
            <div className="bg-neutral-50 px-3 py-1 rounded-md border border-neutral-200/80 text-center font-mono shrink-0 min-w-[90px]">
              <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-widest block leading-tight">
                VIP STATUS
              </span>
              <span className="text-[10px] font-black text-emerald-600 block leading-tight mt-0.5">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="scroll-reveal-scale">
          <div className="flex items-center justify-between mb-3 border-b border-neutral-200 pb-2 gap-2">
            <div>
              <span className="text-[8px] sm:text-[9px] font-bold text-neutral-500 uppercase tracking-widest block font-mono">
                ✦ PERSONAL PURCHASES
              </span>
              <h3 className="text-base sm:text-lg font-bold font-serif uppercase tracking-tight text-black m-0">
                MY ORDER HISTORY & TRACKING
              </h3>
            </div>
            <span className="bg-black text-white border border-black text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
              {orders.length} ORDERS
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-neutral-50 py-8 text-center rounded-lg border border-dashed border-neutral-300 space-y-2 px-4">
              <ShoppingOutlined className="text-2xl text-neutral-400" />
              <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider m-0">
                No orders placed yet. Explore our haute couture collections!
              </p>
              {onNavigateShop && (
                <Button
                  onClick={onNavigateShop}
                  type="primary"
                  className="bg-black hover:bg-neutral-800 text-white font-extrabold text-[10px] uppercase px-4 h-7.5 rounded-md border border-black"
                >
                  EXPLORE SHOP & COLLECTIONS
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block">
                <Table
                  dataSource={orders}
                  columns={orderColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 5 }}
                  size="small"
                  className="bg-white rounded-lg overflow-hidden border border-neutral-200 shadow-2xs"
                />
              </div>

              {/* Mobile & Tablet 2-Column Monochromatic Order Cards (< md) */}
              <div className="grid grid-cols-2 gap-2.5 block md:hidden">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-lg border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-black transition-all"
                  >
                    {/* Black Header Bar */}
                    <div className="bg-black px-2.5 py-1.5 flex items-center justify-between gap-1 border-b border-neutral-800 text-white">
                      <span className="font-mono font-extrabold text-[10px] text-white truncate">
                        {ord.order_number || `LX-${ord.id}`}
                      </span>
                      <div className="shrink-0 scale-75 origin-right">
                        {getStatusBadge(ord.status)}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-2.5 bg-white space-y-2 flex-1 flex flex-col justify-between">
                      {/* Items & Date */}
                      <div className="flex items-center justify-between text-[8px] text-neutral-500 font-mono pt-0.5">
                        <span className="font-semibold text-neutral-700">
                          {ord.items ? `${ord.items.length} Item(s)` : "1 Item"}
                        </span>
                        <span>
                          {new Date(
                            ord.created_at || Date.now(),
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Bottom Price & RECEIPT Button */}
                      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-neutral-100">
                        <span className="font-mono font-black text-[11px] text-black bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded shrink-0">
                          ${Number(ord.total_amount || 0).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="bg-black hover:bg-neutral-800 text-white border border-black text-[8px] font-mono font-bold uppercase tracking-wider h-5.5 px-2 rounded flex items-center gap-1 cursor-pointer transition-all shrink-0 shadow-2xs"
                        >
                          <EyeOutlined className="text-[8px] text-white" />
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

        {/* Wishlist Section */}
        <div className="scroll-reveal">
          <div className="flex items-center justify-between mb-3 border-b border-neutral-200 pb-2">
            <div>
              <span className="text-[8px] sm:text-[9px] font-bold text-neutral-500 uppercase tracking-widest block font-mono">
                ✦ SAVED FAVORITES
              </span>
              <h3 className="text-base sm:text-lg font-bold font-serif uppercase tracking-tight text-black flex items-center gap-1.5 m-0">
                <HeartFilled className="text-red-500 text-base" />
                <span>MY SAVED WISHLIST ({wishlistItems.length})</span>
              </h3>
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-gradient-to-r from-amber-50/60 via-rose-50/40 to-amber-50/60 py-7 text-center rounded-xl border border-amber-200/60 shadow-2xs space-y-2 px-4">
              <HeartFilled className="text-2xl text-red-500/80 mx-auto" />
              <p className="text-xs font-semibold text-neutral-800 uppercase tracking-wider m-0">
                Your wishlist is empty. Tap the heart icon on any piece to save
                it here!
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 scroll-reveal-stagger">
              {wishlistItems.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white p-2 rounded-xl border border-neutral-200/90 flex flex-col justify-between hover:border-neutral-900 shadow-2xs transition-all space-y-1.5 w-[160px] sm:w-[180px] md:w-[200px] shrink-0"
                >
                  <div
                    className="relative w-full h-32 sm:h-36 md:h-40 rounded-lg overflow-hidden bg-neutral-100 cursor-pointer group shrink-0"
                    onClick={() => onQuickView && onQuickView(prod)}
                  >
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-between space-y-1">
                    <div>
                      <h4 className="text-[10px] sm:text-[11px] font-bold text-black line-clamp-1 font-serif uppercase m-0">
                        {prod.name}
                      </h4>
                      <span className="font-mono text-[10px] sm:text-[11px] font-black text-emerald-700 block">
                        ${Number(prod.price).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onAddToCart) onAddToCart(prod);
                        if (onRemoveFromWishlist) onRemoveFromWishlist(prod);
                        notification.success({
                          message: "MOVED TO BAG",
                          description: `${prod.name} added to bag and removed from wishlist.`,
                          placement: "bottomRight",
                          duration: 2,
                        });
                      }}
                      className="w-full bg-black hover:bg-neutral-800 text-white text-[9px] font-mono font-bold uppercase tracking-wider h-7 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs border border-neutral-900"
                    >
                      <ShoppingOutlined className="text-amber-400 text-xs" />
                      <span>ADD TO BAG</span>
                    </button>
                  </div>
                </div>
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
        width={540}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
          className="pt-2 space-y-3"
        >
          {/* Circular Avatar Direct File Uploader in Modal */}
          <div className="flex flex-col items-center justify-center pb-3 border-b border-neutral-100">
            <div
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
              className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-black text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md cursor-pointer border-2 border-neutral-300 hover:border-black transition-all mb-2"
              title="Click to upload new photo"
            >
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={profile.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <span>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
                </span>
              )}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white z-10">
                <CameraOutlined className="text-lg mb-0.5" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                  UPLOAD
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
              className="text-xs font-bold font-mono text-neutral-600 hover:text-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-full transition-colors"
            >
              <CameraOutlined /> Upload Avatar Photo
            </button>
          </div>

          <Form.Item
            name="name"
            label={
              <span className="text-xs font-bold uppercase">Full Name</span>
            }
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              prefix={<IdcardOutlined className="text-neutral-400" />}
              autoComplete="name"
              className="text-sm sm:text-xs py-2.5 sm:py-2 rounded-xl h-11 sm:h-10"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={
              <span className="text-xs font-bold uppercase">Email Address</span>
            }
            rules={[{ required: true, message: "Please enter email" }]}
          >
            <Input
              prefix={<MailOutlined className="text-neutral-400" />}
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="email"
              className="text-sm sm:text-xs py-2.5 sm:py-2 rounded-xl h-11 sm:h-10"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label={
              <span className="text-xs font-bold uppercase">Phone Number</span>
            }
          >
            <Input
              prefix={<PhoneOutlined className="text-neutral-400" />}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="text-sm sm:text-xs py-2.5 sm:py-2 rounded-xl h-11 sm:h-10"
            />
          </Form.Item>

          <Form.Item
            name="address"
            label={
              <span className="text-xs font-bold uppercase">
                Shipping Address
              </span>
            }
          >
            <Input.TextArea
              rows={3}
              prefix={<HomeOutlined className="text-neutral-400" />}
              className="text-sm sm:text-xs p-2.5 rounded-xl"
            />
          </Form.Item>

          <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-200">
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase px-6"
            >
              Save Profile Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Professional Downloadable Order Receipt Modal */}
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
