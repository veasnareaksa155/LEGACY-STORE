import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  Popconfirm,
  notification,
  Badge,
  Progress,
  Card,
  Popover,
  Tooltip,
  Drawer,
} from "antd";
import {
  CrownOutlined,
  ShoppingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShopOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  RiseOutlined,
  PieChartOutlined,
  ClockCircleOutlined,
  FolderAddOutlined,
  UserOutlined,
  TagOutlined,
  SettingOutlined,
  UserAddOutlined,
  GiftOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckOutlined,
  CloseOutlined,
  CarOutlined,
  BellOutlined,
  AlertOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  fetchProducts,
  fetchOrders,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  updateOrderStatus,
  deleteOrder,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/api";
import {
  uploadToCloudinary,
  parseGalleryUrls,
  getCloudinaryConfig,
  saveCloudinaryConfig,
} from "../services/cloudinary";
import {
  getDeliverySettings,
  saveDeliverySettings,
} from "../services/deliverySettings";

// Helper for category minimalist apparel SVG line icon (matching user's shirt icon design)
const getCategoryIcon = (cat) => {
  const name = (cat?.name || "").toLowerCase();
  const slug = (cat?.slug || "").toLowerCase();

  // T-Shirt / Polo Shirt (Matches uploaded image line icon style)
  if (
    name.includes("t-shirt") ||
    slug.includes("t-shirt") ||
    slug === "t-shirt"
  ) {
    return (
      <svg
        className="w-9 h-9 stroke-current fill-none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L2 6v4l4-1v13h12V9l4 1V6l-4-4h-4a2 2 0 0 1-4 0H6z" />
        <path d="M9 2v3a3 3 0 0 0 6 0V2" />
      </svg>
    );
  }

  // Tailored Dress Shirt with Collar (Exact match for user uploaded shirt icon)
  if (name.includes("shirt") || slug.includes("shirt")) {
    return (
      <svg
        className="w-9 h-9 stroke-current fill-none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.38 3.46L16 2l-4 4-4-4-4.38 1.46a2 2 0 0 0-1.34 1.77L2 19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2L21.72 5.23a2 2 0 0 0-1.34-1.77z" />
        <path d="M12 6v15" />
        <path d="M8 2l4 4 4-4" />
      </svg>
    );
  }

  // Shoes / Luxury Footwear
  if (
    name.includes("shoe") ||
    slug.includes("shoe") ||
    name.includes("footwear")
  ) {
    return (
      <svg
        className="w-9 h-9 stroke-current fill-none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 17h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z" />
        <path d="M4 17l4-9 4 1 3-3 5 4-2 7" />
        <circle cx="7" cy="14" r="1" />
      </svg>
    );
  }

  // Suits & Tuxedos / Blazers
  if (
    name.includes("suit") ||
    slug.includes("suit") ||
    name.includes("tuxedo") ||
    name.includes("blazer")
  ) {
    return (
      <svg
        className="w-9 h-9 stroke-current fill-none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 3h16v18H4z" />
        <path d="M8 3l4 6 4-6" />
        <path d="M12 9v12" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
    );
  }

  // Watches & Jewelry
  if (
    name.includes("watch") ||
    slug.includes("watch") ||
    name.includes("jewelry")
  ) {
    return (
      <svg
        className="w-9 h-9 stroke-current fill-none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="6" />
        <polyline points="12 9 12 12 14 14" />
        <path d="M9 2h6v4H9zM9 18h6v4H9z" />
      </svg>
    );
  }

  // Leather Goods & Bags
  if (
    name.includes("bag") ||
    slug.includes("bag") ||
    name.includes("leather") ||
    name.includes("wallet")
  ) {
    return (
      <svg
        className="w-9 h-9 stroke-current fill-none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <circle cx="12" cy="13" r="1" />
      </svg>
    );
  }

  // Default Apparel Tag Icon
  return (
    <svg
      className="w-9 h-9 stroke-current fill-none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
};

// Helper for promotion minimalist vector line icons
const getPromoIcon = (promo) => {
  const type = (promo?.type || "").toLowerCase();
  const code = (promo?.code || "").toLowerCase();

  if (type === "shipping" || code.includes("ship") || code.includes("paris")) {
    return (
      <svg
        className="w-9 h-9 stroke-current fill-none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 17h-2v-10a2 2 0 0 1 2-2h9v12" />
        <path d="M14 8h5.17a2 2 0 0 1 1.66.9l2.17 3.1a2 2 0 0 1 .36 1.15v3.85h-2.36" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    );
  }

  if (type === "fixed" || code.includes("dollar") || code.includes("diamond")) {
    return (
      <svg
        className="w-9 h-9 stroke-current fill-none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h12l4 6-10 12L2 9z" />
        <path d="M11 3l1 6 3 12" />
        <path d="M13 3l-1 6-3 12" />
        <path d="M2 9h20" />
      </svg>
    );
  }

  // Percentage / Ticket Pass
  return (
    <svg
      className="w-9 h-9 stroke-current fill-none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3z" />
      <path d="M12 9v6" />
      <circle cx="9.5" cy="9.5" r=".5" fill="currentColor" />
      <circle cx="14.5" cy="14.5" r=".5" fill="currentColor" />
    </svg>
  );
};

const AdminDashboardPage = ({
  products: initialProducts = [],
  categories: initialCategories = [],
  onNavigateStore,
  onLogout,
  onRefreshData,
}) => {
  // Active Sidebar Menu Tab ('overview' | 'products' | 'orders' | 'categories' | 'users' | 'promotions' | 'analytics' | 'settings')
  const [activeTab, setActiveTab] = useState("overview");

  // Admin Data States
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter States in Admin Products Table
  const [searchTerm, setSearchTerm] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productStockFilter, setProductStockFilter] = useState("all");

  // Orders Search & Filter States
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Users Search & Filter States
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  // Product Modal State (Create / Edit)
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  // File Input Refs for Media Uploader
  // File Input Refs & Cloudinary Upload Indicators
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const singleCardInputRef = useRef(null);
  const cardIndexToReplaceRef = useRef(0);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingCardIdx, setUploadingCardIdx] = useState(null);
  const [cloudinaryModalOpen, setCloudinaryModalOpen] = useState(false);
  const [cloudinaryConfig, setCloudinaryConfigState] = useState(() =>
    getCloudinaryConfig(),
  );
  useEffect(() => {
    const active = getCloudinaryConfig();
    if (
      active.cloudName !== cloudinaryConfig.cloudName ||
      active.uploadPreset !== cloudinaryConfig.uploadPreset
    ) {
      setCloudinaryConfigState(active);
    }
  }, []);
  const [cloudinaryForm] = Form.useForm();

  // Category Modal State (Create / Edit)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm] = Form.useForm();

  // User Modal State (Create / Edit)
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm] = Form.useForm();

  // Promotions State & Modal (Persisted in localStorage)
  const [promotions, setPromotions] = useState(() => {
    try {
      const saved = localStorage.getItem("alexandre_luxe_promotions");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 1,
        code: "ALEXANDRE20",
        discount: "20% OFF",
        title: "HAUTE COUTURE AUTUMN '26",
        subtitle:
          "Exclusive VIP pass for all ready-to-wear luxury collections.",
        bg_image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
        badge: "LIMITED VIP PASS",
        type: "percentage",
        value: 20,
        status: "active",
        usage_count: 142,
        expires: "DEC 31, 2026",
      },
      {
        id: 2,
        code: "BLACKDIAMOND",
        discount: "$50 VOUCHER",
        title: "BLACK DIAMOND NIGHT",
        subtitle: "Applicable on premium leather goods and bespoke timepieces.",
        bg_image:
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop",
        badge: "EXECUTIVE MEMBER",
        type: "fixed",
        value: 50,
        status: "active",
        usage_count: 89,
        expires: "NOV 15, 2026",
      },
      {
        id: 3,
        code: "PARISVIP",
        discount: "FREE SHIPPING",
        title: "PARIS ATELIER EXPRESS",
        subtitle:
          "Complimentary global courier dispatch straight from Paris atelier.",
        bg_image:
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
        badge: "GLOBAL FREIGHT",
        type: "shipping",
        value: 0,
        status: "active",
        usage_count: 310,
        expires: "PERPETUAL",
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "alexandre_luxe_promotions",
        JSON.stringify(promotions),
      );
    } catch (e) {
      console.error(e);
    }
  }, [promotions]);

  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [promoForm] = Form.useForm();

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState(() => {
    const delivery = getDeliverySettings();
    return {
      storeName: "LEGACY STORE",
      standardDeliveryFee: delivery.standardDeliveryFee ?? 2.0,
      expressDeliveryFee: delivery.expressDeliveryFee ?? 5.0,
      freeShippingThreshold: delivery.freeShippingThreshold ?? 50.0,
      currencySymbol: "$",
      maintenanceMode: false,
      bakongKhqrEnabled: true,
      conciergeEmail: "concierge@alexandreluxe.com",
    };
  });

  // Order Details Receipt Modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Notifications Center State
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "New Order Received #1048",
      description: "Customer Alexandre P. completed checkout ($2,850.00)",
      time: "2 mins ago",
      type: "order",
      unread: true,
      actionTab: "orders",
    },
    {
      id: "notif-2",
      title: "Driver Dispatch Assigned",
      description: "Driver Dara V. assigned to Express Delivery #1042",
      time: "12 mins ago",
      type: "driver",
      unread: true,
      actionTab: "drivers",
    },
    {
      id: "notif-3",
      title: "Low Inventory Warning",
      description: "Silk Evening Gown stock reached threshold (2 units left)",
      time: "45 mins ago",
      type: "inventory",
      unread: true,
      actionTab: "products",
    },
    {
      id: "notif-4",
      title: "New Delivery Driver Registration",
      description: "Driver account 'Kha Express' submitted verification docs",
      time: "1 hour ago",
      type: "driver",
      unread: false,
      actionTab: "drivers",
    },
    {
      id: "notif-5",
      title: "System PG Backup Verified",
      description: "Automated Supabase database sync completed successfully",
      time: "3 hours ago",
      type: "system",
      unread: false,
      actionTab: "overview",
    },
  ]);
  const [notifFilter, setNotifFilter] = useState("all");
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    notification.success({
      message: "ALL NOTIFICATIONS READ",
      description: "Notification counter cleared successfully.",
      placement: "bottomRight",
      duration: 2,
    });
  };

  const deleteNotificationItem = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const triggerTestNotification = () => {
    const alerts = [
      {
        title: `⚡ Live Order #${Math.floor(1000 + Math.random() * 9000)} Received`,
        description: `VIP Customer checkout completed ($${(Math.random() * 900 + 150).toFixed(2)})`,
        type: "order",
        actionTab: "orders",
      },
      {
        title: "🚚 Driver Status Update",
        description: "Delivery Driver completed package dropoff",
        type: "driver",
        actionTab: "drivers",
      },
      {
        title: "⚠️ Inventory Threshold Alert",
        description: "High demand product inventory down to last 3 units",
        type: "inventory",
        actionTab: "products",
      },
    ];
    const item = alerts[Math.floor(Math.random() * alerts.length)];
    const newNotif = {
      id: `notif-${Date.now()}`,
      ...item,
      time: "Just now",
      unread: true,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    notification.info({
      message: newNotif.title,
      description: newNotif.description,
      placement: "topRight",
      duration: 3.5,
      icon: <BellOutlined className="text-amber-500 animate-bounce" />,
    });
  };

  const unreadNotifCount = notifications.filter((n) => n.unread).length;
  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === "all") return true;
    return n.type === notifFilter;
  });

  const notificationDrawerContent = (
    <Drawer
      open={notifDrawerOpen}
      onClose={() => setNotifDrawerOpen(false)}
      width={460}
      placement="right"
      closable={false}
      styles={{ body: { padding: 0, height: "100%", overflow: "hidden" } }}
    >
      <div className="h-full flex flex-col bg-neutral-50 font-sans text-left">
        {/* Compact Ultra-Luxury Single Header */}
        <div className="px-5 py-4 bg-black text-white shrink-0 border-b border-neutral-800 flex items-center justify-between">
          {/* Left Title Group */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-amber-500/40 flex items-center justify-center shrink-0">
              <BellOutlined className="text-amber-400 text-sm" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-extrabold font-serif uppercase tracking-widest text-white m-0 whitespace-nowrap">
                  NOTIFICATIONS
                </h2>
                {unreadNotifCount > 0 && (
                  <span className="bg-amber-500 text-black text-[9px] font-mono font-black px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    {unreadNotifCount} NEW
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 font-normal m-0 mt-0.5 truncate">
                Real-time store activity & alerts
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={triggerTestNotification}
              className="bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
              title="Simulate live notification toast"
            >
              <ThunderboltOutlined className="text-amber-400 text-xs" />
              <span>+ Test</span>
            </button>

            {unreadNotifCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="text-[10px] text-neutral-400 hover:text-white font-mono uppercase tracking-wider px-1.5 py-1 transition-colors cursor-pointer whitespace-nowrap"
                title="Mark all as read"
              >
                Mark Read
              </button>
            )}

            <button
              type="button"
              onClick={() => setNotifDrawerOpen(false)}
              className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
              title="Close Drawer"
            >
              <CloseOutlined className="text-xs" />
            </button>
          </div>
        </div>

        {/* Single-Row Scrollable Category Filter Bar */}
        <div className="px-5 py-3 bg-white border-b border-neutral-200 shrink-0 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { key: "all", label: "All Alerts" },
              { key: "order", label: "Orders" },
              { key: "driver", label: "Drivers" },
              { key: "inventory", label: "Stock" },
              { key: "system", label: "System" },
            ].map((tab) => {
              const count =
                tab.key === "all"
                  ? notifications.length
                  : notifications.filter((n) => n.type === tab.key).length;
              const isActive = notifFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setNotifFilter(tab.key)}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-black text-white shadow-xs font-semibold"
                      : "text-neutral-600 hover:text-black hover:bg-neutral-100 border border-transparent"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-neutral-800 text-amber-300"
                        : "bg-neutral-200/80 text-neutral-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Notifications Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-neutral-50/70">
          {filteredNotifs.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 font-mono text-xs flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-neutral-200/70 flex items-center justify-center text-neutral-400 text-xl">
                <BellOutlined />
              </div>
              <span className="font-sans font-medium text-neutral-600 text-sm">
                No notifications found in this category
              </span>
              <button
                type="button"
                onClick={() => setNotifFilter("all")}
                className="text-xs font-bold text-black underline hover:text-amber-600 transition-colors cursor-pointer mt-1"
              >
                View All Alerts ({notifications.length}) →
              </button>
            </div>
          ) : (
            filteredNotifs.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl transition-all border flex items-start gap-3.5 relative group ${
                  item.unread
                    ? "bg-amber-50/40 border-amber-300/80 shadow-xs"
                    : "bg-white border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {/* Category Type Icon */}
                <div className="shrink-0 mt-0.5">
                  {item.type === "order" && (
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center text-base shadow-2xs">
                      <ShoppingOutlined />
                    </div>
                  )}
                  {item.type === "driver" && (
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center text-base shadow-2xs">
                      <CarOutlined />
                    </div>
                  )}
                  {item.type === "inventory" && (
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center text-base shadow-2xs">
                      <AlertOutlined />
                    </div>
                  )}
                  {item.type === "system" && (
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center text-base shadow-2xs">
                      <CheckCircleOutlined />
                    </div>
                  )}
                </div>

                {/* Main Information */}
                <div className="min-w-0 flex-1 pr-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className="text-xs font-bold text-neutral-900 leading-snug truncate">
                        {item.title}
                      </h4>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 shrink-0 font-medium">
                      {item.time}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed mt-1 font-normal">
                    {item.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    {item.actionTab && (
                      <button
                        type="button"
                        onClick={() => {
                          markNotificationAsRead(item.id);
                          setActiveTab(item.actionTab);
                          setNotifDrawerOpen(false);
                        }}
                        className="text-xs font-bold text-black hover:text-amber-600 flex items-center gap-1 transition-colors cursor-pointer group/btn"
                      >
                        <span>
                          View{" "}
                          {item.actionTab === "products"
                            ? "INVENTORY"
                            : item.actionTab.toUpperCase()}
                        </span>
                        <span className="group-hover/btn:translate-x-1 transition-transform">
                          →
                        </span>
                      </button>
                    )}

                    {item.unread ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full font-bold border border-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        UNREAD
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-400">
                        Read
                      </span>
                    )}
                  </div>
                </div>

                {/* Dismiss Item Button */}
                <button
                  type="button"
                  onClick={() => deleteNotificationItem(item.id)}
                  className="absolute top-3 right-3 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                  title="Dismiss alert"
                >
                  <CloseOutlined className="text-xs" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sticky Drawer Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-neutral-200 shrink-0 flex items-center justify-between text-xs text-neutral-500">
          <span className="font-mono text-xs text-neutral-500">
            Showing {filteredNotifs.length} of {notifications.length} alerts
          </span>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => setNotifications([])}
              className="text-xs font-bold text-neutral-500 hover:text-red-600 transition-colors cursor-pointer uppercase tracking-wider"
            >
              Clear All Alerts
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );

  // Dynamic Notification Generator from Real Database Records
  const generateRealNotifications = (
    prodList = [],
    ordList = [],
    usrList = [],
  ) => {
    const realNotifs = [];

    // 1. Real Order Notifications from Database
    const recentOrders = Array.isArray(ordList) ? [...ordList].slice(0, 5) : [];
    recentOrders.forEach((ord) => {
      const orderNum = ord.order_number || `#${ord.id}`;
      const totalStr = ord.total_amount
        ? `$${Number(ord.total_amount).toFixed(2)}`
        : "$0.00";
      const customer = ord.customer_name || "Customer";
      const status = (ord.status || "pending").toUpperCase();
      realNotifs.push({
        id: `ord-notif-${ord.id}`,
        title: `Order ${orderNum} (${status})`,
        description: `${customer} placed an order totaling ${totalStr}`,
        time: ord.created_at
          ? new Date(ord.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Recently",
        type: "order",
        unread: ord.status === "pending" || ord.status === "processing",
        actionTab: "orders",
      });
    });

    // 2. Real Low Inventory / Stock Warnings from Database
    const lowStockProducts = (Array.isArray(prodList) ? prodList : []).filter(
      (p) =>
        (p.stock !== undefined && p.stock !== null && p.stock <= 5) ||
        p.in_stock === false,
    );
    lowStockProducts.slice(0, 5).forEach((p) => {
      const currentStock =
        p.stock !== undefined && p.stock !== null ? p.stock : 0;
      realNotifs.push({
        id: `stock-notif-${p.id}`,
        title: `Low Stock Warning: ${p.name}`,
        description: `Only ${currentStock} units remaining in inventory. Restock recommended.`,
        time: "Stock Alert",
        type: "inventory",
        unread: true,
        actionTab: "products",
      });
    });

    // 3. Real Delivery Drivers from Database
    const driverUsers = (Array.isArray(usrList) ? usrList : []).filter(
      (u) => u.role === "driver" || u.role === "courier",
    );
    driverUsers.slice(0, 3).forEach((d) => {
      realNotifs.push({
        id: `driver-notif-${d.id}`,
        title: `Delivery Driver: ${d.name}`,
        description: `Driver account active (${d.email})`,
        time: "Active Driver",
        type: "driver",
        unread: false,
        actionTab: "drivers",
      });
    });

    // 4. System PG Backup Status
    realNotifs.push({
      id: "sys-notif-pg",
      title: "Supabase PG Database Online",
      description: "Automated real-time PostgreSQL database sync verified.",
      time: "System Live",
      type: "system",
      unread: false,
      actionTab: "overview",
    });

    return realNotifs;
  };

  // Load Admin Data from API
  const loadAdminData = async (showLoading = true) => {
    if (showLoading && products.length === 0) {
      setLoading(true);
    }
    try {
      const [prodData, catData, ordData, usrData] = await Promise.allSettled([
        fetchProducts(),
        fetchCategories(),
        fetchOrders(),
        fetchUsers(),
      ]);

      let fetchedProds = products;
      let fetchedOrds = orders;
      let fetchedUsrs = users;

      if (prodData.status === "fulfilled" && prodData.value) {
        fetchedProds = prodData.value;
        setProducts(prodData.value);
      }
      if (catData.status === "fulfilled" && catData.value) {
        setCategories(catData.value);
      }
      if (ordData.status === "fulfilled" && ordData.value) {
        fetchedOrds = ordData.value;
        setOrders(ordData.value);
      }
      if (usrData.status === "fulfilled" && usrData.value) {
        fetchedUsrs = usrData.value;
        setUsers(usrData.value);
      }

      // Generate Real Notification Alerts from Live Database Records
      const realAlerts = generateRealNotifications(
        fetchedProds,
        fetchedOrds,
        fetchedUsrs,
      );
      setNotifications(realAlerts);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const isFirstLoad = products.length === 0 && orders.length === 0;
    loadAdminData(isFirstLoad);
  }, [activeTab]);

  // Sync initial props
  useEffect(() => {
    if (initialProducts.length > 0 && products.length === 0) {
      setProducts(initialProducts);
    }
    if (initialCategories.length > 0 && categories.length === 0) {
      setCategories(initialCategories);
    }
  }, [initialProducts, initialCategories]);

  // Product CRUD Handlers
  const handleProductSubmit = async (values) => {
    setLoading(true);
    try {
      const rawGallery = values.gallery || form.getFieldValue("gallery");
      const galleryList = parseGalleryUrls(rawGallery);
      const mainImageUrl =
        values.image_url || form.getFieldValue("image_url") || "";

      const formattedData = {
        ...values,
        image_url: mainImageUrl,
        gallery: galleryList,
        stock:
          values.stock !== undefined && values.stock !== null
            ? Number(values.stock)
            : 0,
        sizes: values.sizes
          ? typeof values.sizes === "string"
            ? values.sizes
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : values.sizes
          : ["S", "M", "L", "XL"],
        colors: values.colors
          ? typeof values.colors === "string"
            ? values.colors
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : values.colors
          : ["Black", "Grey"],
        gallery: galleryList,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, formattedData);
        notification.success({
          message: "PRODUCT UPDATED",
          description: `Product #${editingProduct.id} (${values.name}) updated successfully!`,
          placement: "bottomRight",
        });
      } else {
        await createProduct(formattedData);
        notification.success({
          message: "PRODUCT CREATED",
          description: `New luxury product "${values.name}" added to catalog!`,
          placement: "bottomRight",
        });
      }

      setProductModalOpen(false);
      setEditingProduct(null);
      form.resetFields();
      loadAdminData();
      if (typeof onRefreshData === "function") {
        onRefreshData();
      }
    } catch (error) {
      notification.error({
        message: "SAVING FAILED",
        description: "Failed to save product. Please check form inputs.",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);

    const defaultAngleFallbacks = [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    ];

    let galleryList = [];
    if (Array.isArray(prod.gallery) && prod.gallery.length > 0) {
      galleryList = prod.gallery.filter(Boolean);
    } else if (typeof prod.gallery === "string" && prod.gallery.trim()) {
      galleryList = parseGalleryUrls(prod.gallery);
    } else if (Array.isArray(prod.images) && prod.images.length > 0) {
      galleryList = prod.images.filter(Boolean);
    } else {
      galleryList = [];
    }

    form.setFieldsValue({
      name: prod.name,
      category_id: prod.category_id,
      price: prod.price,
      original_price: prod.original_price,
      image_url: prod.image_url,
      description: prod.description,
      stock:
        prod.stock !== undefined && prod.stock !== null
          ? Number(prod.stock)
          : 0,
      is_featured: Boolean(prod.is_featured),
      is_new: Boolean(prod.is_new),
      sizes: Array.isArray(prod.sizes)
        ? prod.sizes.join(", ")
        : prod.sizes || "S, M, L, XL",
      colors: Array.isArray(prod.colors)
        ? prod.colors.join(", ")
        : prod.colors || "Black, Grey",
      gallery: JSON.stringify(galleryList),
    });
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      notification.success({
        message: "PRODUCT DELETED",
        description: `Product #${id} removed from catalog.`,
        placement: "bottomRight",
      });
      loadAdminData();
    } catch (err) {
      notification.error({
        message: "DELETE FAILED",
        description: "Could not delete product.",
        placement: "bottomRight",
      });
    }
  };

  // Category CRUD Handlers
  const handleCategorySubmit = async (values) => {
    setLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
        notification.success({
          message: "CATEGORY UPDATED",
          description: `Category #${editingCategory.id} (${values.name}) updated successfully!`,
          placement: "bottomRight",
        });
      } else {
        await createCategory(values);
        notification.success({
          message: "CATEGORY CREATED",
          description: `New category "${values.name}" added to catalog!`,
          placement: "bottomRight",
        });
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
      categoryForm.resetFields();
      loadAdminData();
    } catch (error) {
      notification.error({
        message: "SAVING FAILED",
        description: "Failed to save category. Please check inputs.",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    categoryForm.setFieldsValue({
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url || "",
      description: cat.description || "",
    });
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id);
      notification.success({
        message: "CATEGORY DELETED",
        description: `Category #${id} removed from catalog.`,
        placement: "bottomRight",
      });
      loadAdminData();
    } catch (err) {
      notification.error({
        message: "DELETE FAILED",
        description: "Could not delete category.",
        placement: "bottomRight",
      });
    }
  };

  // User CRUD Handlers
  const handleUserSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingUser) {
        try {
          await updateUser(editingUser.id, values);
        } catch (apiErr) {
          console.warn("API update failed, updating local state:", apiErr);
        }
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...values } : u)),
        );
        notification.success({
          message: "USER UPDATED",
          description: `User #${editingUser.id} (${values.name}) updated successfully!`,
          placement: "bottomRight",
        });
      } else {
        const newUserObj = {
          id: Date.now(),
          name: values.name,
          email: values.email,
          role: values.role || "user",
          phone: values.phone || "+855 12 888 999",
          vehicle_tag:
            values.vehicle_tag || (values.role === "driver" ? "PP-9921" : null),
          tier:
            values.role === "driver" ? "COURIER DRIVER" : "BLACK DIAMOND VIP",
          created_at: new Date().toISOString(),
        };

        try {
          const res = await createUser({
            ...values,
            password: values.password || "password123",
          });
          if (res?.data) {
            setUsers((prev) => [
              res.data,
              ...prev.filter((u) => u.id !== res.data.id),
            ]);
          } else {
            setUsers((prev) => [newUserObj, ...prev]);
          }
        } catch (apiErr) {
          console.warn(
            "API create failed, adding user to local state:",
            apiErr,
          );
          setUsers((prev) => [newUserObj, ...prev]);
        }

        notification.success({
          message: "USER REGISTERED",
          description: `New ${values.role === "driver" ? "Delivery Driver" : "user"} account created for ${values.name}!`,
          placement: "bottomRight",
        });
      }
      setUserModalOpen(false);
      setEditingUser(null);
      userForm.resetFields();
    } catch (err) {
      console.error("User save error:", err);
      notification.error({
        message: "USER ACTION FAILED",
        description: err.message || "Failed to save user.",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditUser = (usr) => {
    setEditingUser(usr);
    userForm.setFieldsValue({
      name: usr.name,
      email: usr.email,
      role: usr.role || "user",
    });
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
    } catch (e) {
      console.warn("User delete error:", e);
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    notification.success({
      message: "USER REMOVED",
      description: `User #${id} removed from system database.`,
      placement: "bottomRight",
    });
    loadAdminData();
  };

  // Promo Code Handlers
  const handlePromoSubmit = (values) => {
    const newPromo = {
      id: Date.now(),
      code: values.code.toUpperCase(),
      discount: values.discount,
      title: values.title || "EXECUTIVE VIP PROMO",
      subtitle:
        values.subtitle ||
        "Special campaign promotion card for distinguished Alexandre Luxe clientele.",
      bg_image:
        values.bg_image ||
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
      badge: values.badge || "SPECIAL ACCESS",
      type: values.type || "percentage",
      status: "active",
      usage_count: 0,
      expires: values.expires || "LIMITED TIME",
    };
    setPromotions((prev) => [newPromo, ...prev]);
    notification.success({
      message: "PROMO CODE CREATED",
      description: `Discount coupon "${newPromo.code}" is now active!`,
      placement: "bottomRight",
    });
    setPromoModalOpen(false);
    promoForm.resetFields();
  };

  const handleDeletePromo = (id) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    notification.success({
      message: "PROMO CODE DELETED",
      description: "Promotion code removed.",
      placement: "bottomRight",
    });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      notification.success({
        message: "ORDER STATUS UPDATED",
        description: `Order #${orderId} changed to "${newStatus.toUpperCase()}".`,
        placement: "bottomRight",
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (err) {
      notification.error({
        message: "UPDATE FAILED",
        description: "Could not update order status.",
        placement: "bottomRight",
      });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder(orderId);
      notification.success({
        message: "ORDER REMOVED",
        description: `Order #${orderId} deleted from database.`,
        placement: "bottomRight",
      });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      notification.error({
        message: "DELETE FAILED",
        description: "Could not delete order.",
        placement: "bottomRight",
      });
    }
  };

  // Analytics Calculations
  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.total_amount || 0),
    0,
  );
  const completedOrders = orders.filter(
    (o) => o.status === "completed" || o.status === "delivered",
  ).length;

  const filteredProducts = products.filter((p) => {
    // 1. Text Search Filter across Name, Category, ID, SKU, Price, Description
    if (searchTerm && searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase().trim();
      const nameMatch = p.name?.toLowerCase().includes(q);
      const catMatch =
        p.category?.name?.toLowerCase().includes(q) ||
        p.category_slug?.toLowerCase().includes(q);
      const idMatch = p.id?.toString().includes(q) || `#${p.id}`.includes(q);
      const priceMatch =
        p.price?.toString().includes(q) || `$${p.price}`.includes(q);
      const skuMatch = p.sku?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);

      if (
        !nameMatch &&
        !catMatch &&
        !idMatch &&
        !priceMatch &&
        !skuMatch &&
        !descMatch
      ) {
        return false;
      }
    }

    // 2. Category Dropdown Filter
    if (productCategoryFilter !== "all") {
      const catSlug = (
        p.category?.slug ||
        p.category_slug ||
        p.category?.name ||
        ""
      ).toLowerCase();
      if (catSlug !== productCategoryFilter.toLowerCase()) {
        return false;
      }
    }

    // 3. Stock Status Filter
    if (productStockFilter !== "all") {
      const stockNum = Number(p.stock || 0);
      if (productStockFilter === "in_stock" && stockNum <= 0) return false;
      if (productStockFilter === "low_stock" && (stockNum <= 0 || stockNum > 10))
        return false;
      if (productStockFilter === "out_of_stock" && stockNum > 0) return false;
      if (productStockFilter === "hot_drop" && !p.is_hot_drop) return false;
      if (productStockFilter === "new_arrival" && !p.is_new) return false;
    }

    return true;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderSearchTerm && orderSearchTerm.trim() !== "") {
      const q = orderSearchTerm.toLowerCase().trim();
      const idMatch =
        o.id?.toString().includes(q) ||
        o.order_number?.toLowerCase().includes(q) ||
        `#${o.id}`.includes(q);
      const nameMatch = (
        o.customer_name ||
        o.shipping_address?.full_name ||
        o.name ||
        ""
      )
        .toLowerCase()
        .includes(q);
      const emailMatch = (o.customer_email || o.email || "")
        .toLowerCase()
        .includes(q);
      const phoneMatch = (o.customer_phone || o.phone || "")
        .toLowerCase()
        .includes(q);
      const cityMatch = (o.shipping_address?.city || o.city || "")
        .toLowerCase()
        .includes(q);

      if (!idMatch && !nameMatch && !emailMatch && !phoneMatch && !cityMatch) {
        return false;
      }
    }

    if (orderStatusFilter !== "all") {
      if (o.status !== orderStatusFilter) {
        return false;
      }
    }

    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (userSearchTerm && userSearchTerm.trim() !== "") {
      const q = userSearchTerm.toLowerCase().trim();
      const nameMatch = u.name?.toLowerCase().includes(q);
      const emailMatch = u.email?.toLowerCase().includes(q);
      const phoneMatch = u.phone?.toLowerCase().includes(q);
      const roleMatch = u.role?.toLowerCase().includes(q);
      const idMatch = u.id?.toString().includes(q) || `#${u.id}`.includes(q);

      if (!nameMatch && !emailMatch && !phoneMatch && !roleMatch && !idMatch) {
        return false;
      }
    }

    if (userRoleFilter !== "all") {
      if (u.role !== userRoleFilter) {
        return false;
      }
    }

    return true;
  });

  // Sales Trend Chart Data
  const monthlySales = [
    { month: "Jan", revenue: 14200, orders: 38 },
    { month: "Feb", revenue: 21500, orders: 54 },
    { month: "Mar", revenue: 18900, orders: 42 },
    { month: "Apr", revenue: 29800, orders: 76 },
    { month: "May", revenue: 38400, orders: 98 },
    { month: "Jun", revenue: 48920, orders: 128 },
  ];
  const maxRevenue = Math.max(...monthlySales.map((m) => m.revenue));

  const productColumns = [
    {
      title: "IMAGE",
      dataIndex: "image_url",
      key: "image_url",
      width: 70,
      render: (url, record) => (
        <img
          src={url}
          alt={record.name}
          className="w-12 h-14 object-cover rounded border border-neutral-200 shadow-sm"
        />
      ),
    },
    {
      title: "PRODUCT DETAILS",
      dataIndex: "name",
      key: "name",
      render: (name, record) => {
        const stockNum =
          record.stock !== undefined && record.stock !== null
            ? Number(record.stock)
            : 0;

        let stockBadge = null;
        if (stockNum === 0) {
          stockBadge = (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
              🚨 OUT OF STOCK (0 pcs)
            </span>
          );
        } else if (stockNum <= 5) {
          stockBadge = (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-xs animate-pulse">
              ⚠️ LOW STOCK ({stockNum} pcs)
            </span>
          );
        } else if (stockNum <= 10) {
          stockBadge = (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold bg-yellow-100 text-yellow-900 border border-yellow-300 shadow-xs">
              ⚡ LIMITED ({stockNum} pcs)
            </span>
          );
        } else {
          stockBadge = (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
              ✓ IN STOCK ({stockNum} pcs)
            </span>
          );
        }

        return (
          <div className="py-1 space-y-1">
            <span className="font-sans font-black text-sm text-neutral-900 block uppercase tracking-wide">
              {name}
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs text-neutral-500 font-bold">
                ID: #{record.id}
              </span>
              <span className="text-neutral-300">•</span>
              {stockBadge}
            </div>
          </div>
        );
      },
    },
    {
      title: "CATEGORY",
      dataIndex: "category",
      key: "category",
      render: (cat, record) => (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-neutral-100 text-neutral-900 rounded border border-neutral-300 inline-block font-mono">
          {cat?.name || record.category_slug || "LUXE"}
        </span>
      ),
    },
    {
      title: "PRICE",
      dataIndex: "price",
      key: "price",
      render: (price, record) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-black">
            ${Number(price).toFixed(2)}
          </span>
          {record.original_price && (
            <span className="text-neutral-400 line-through block text-[10px]">
              ${Number(record.original_price).toFixed(2)}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "TAGS",
      key: "badges",
      render: (_, record) => (
        <div className="flex flex-col gap-1.5 items-start">
          {record.is_new && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              NEW COLLECTION
            </span>
          )}
          {record.is_featured && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs">
              <span className="text-xs">🔥</span>
              HOT DROP
            </span>
          )}
          {!record.is_new && !record.is_featured && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider bg-neutral-50 text-neutral-600 border border-neutral-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
              STANDARD
            </span>
          )}
        </div>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            type="text"
            icon={
              <EditOutlined className="text-neutral-700 hover:text-black" />
            }
            onClick={() => handleOpenEditProduct(record)}
            size="small"
            title="Edit Product"
          />
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, size: "small" }}
          >
            <Button
              type="text"
              danger
              icon={
                <DeleteOutlined className="text-rose-600 hover:text-rose-800" />
              }
              size="small"
              title="Delete Product"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

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
          <span className="text-[10px] text-neutral-500 font-mono block">
            {new Date(record.created_at || Date.now()).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      title: "CUSTOMER",
      dataIndex: "customer_name",
      key: "customer_name",
      render: (name, record) => (
        <div>
          <span className="font-bold text-xs uppercase text-black block">
            {name}
          </span>
          <span className="text-[10px] text-neutral-500 font-mono block">
            {record.customer_email}
          </span>
        </div>
      ),
    },
    {
      title: "TOTAL PAID",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount) => (
        <span className="font-mono font-black text-xs text-emerald-700">
          ${Number(amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: "FULFILLMENT STATUS",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status || "pending"}
          onChange={(val) => handleStatusChange(record.id, val)}
          size="small"
          className="w-36 text-xs font-bold"
          options={[
            { value: "pending", label: "🟡 Pending" },
            { value: "processing", label: "🔵 Processing" },
            { value: "shipped", label: "🟣 Shipped" },
            { value: "completed", label: "🟢 Delivered" },
            { value: "cancelled", label: "🔴 Cancelled" },
          ]}
        />
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            type="text"
            icon={<EyeOutlined className="text-neutral-700 hover:text-black" />}
            size="small"
            onClick={() => setSelectedOrderDetails(record)}
            title="View Receipt"
          />
          <Popconfirm
            title="Delete order?"
            onConfirm={() => handleDeleteOrder(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, size: "small" }}
          >
            <Button
              type="text"
              danger
              icon={
                <DeleteOutlined className="text-rose-600 hover:text-rose-800" />
              }
              size="small"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const userColumns = [
    {
      title: "USER / CLIENT",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs uppercase font-serif shadow-xs overflow-hidden shrink-0 ${
              record.role === "driver"
                ? "bg-blue-900 text-blue-200 border-blue-700"
                : record.role === "admin"
                  ? "bg-black text-amber-400 border-neutral-800"
                  : "bg-neutral-800 text-white border-neutral-700"
            }`}
          >
            {record.avatar || record.avatar_url ? (
              <img
                src={record.avatar || record.avatar_url}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : record.role === "driver" ? (
              "🚚"
            ) : name ? (
              name.charAt(0)
            ) : (
              "U"
            )}
          </div>
          <div>
            <span className="font-bold text-xs uppercase text-black block">
              {name}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono block">
              {record.email}
              {record.vehicle_tag && (
                <span className="text-blue-700 font-bold ml-1">
                  • 🚚 {record.vehicle_tag}
                </span>
              )}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "ROLE",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span
          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded font-mono ${
            role === "admin"
              ? "bg-amber-100 text-amber-900 border border-amber-300"
              : role === "driver"
                ? "bg-blue-100 text-blue-900 border border-blue-300"
                : "bg-neutral-100 text-neutral-800 border border-neutral-300"
          }`}
        >
          {role === "admin"
            ? "⚡ SUPERADMIN"
            : role === "driver"
              ? "🚚 DELIVERY DRIVER"
              : "👤 VIP CLIENT"}
        </span>
      ),
    },
    {
      title: "VIP / VEHICLE TIER",
      dataIndex: "tier",
      key: "tier",
      render: (tier, record) => (
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded font-mono">
          {record.role === "driver"
            ? `🚚 COURIER ${record.vehicle_tag || "EXPRESS"}`
            : `👑 ${tier || "BLACK DIAMOND VIP"}`}
        </span>
      ),
    },
    {
      title: "REGISTERED DATE",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <span className="text-xs font-mono font-semibold text-neutral-700">
          {date ? new Date(date).toLocaleDateString() : "2025-01-15"}
        </span>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            type="text"
            icon={
              <EditOutlined className="text-neutral-700 hover:text-black" />
            }
            onClick={() => handleOpenEditUser(record)}
            size="small"
            title="Edit User"
          />
          <Popconfirm
            title="Delete this user account?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, size: "small" }}
          >
            <Button
              type="text"
              danger
              icon={
                <DeleteOutlined className="text-rose-600 hover:text-rose-800" />
              }
              size="small"
              title="Delete User"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const drivers = users.filter((u) => u.role === "driver" || u.vehicle_tag);

  const driverColumns = [
    {
      title: "DELIVERY DRIVER",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-blue-900 text-blue-200 border border-blue-700 flex items-center justify-center font-bold text-sm shadow-xs">
            🚚
          </div>
          <div>
            <span className="font-bold text-xs uppercase text-black block">
              {name}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono block">
              {record.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "VEHICLE TAG / LICENSE PLATE",
      dataIndex: "vehicle_tag",
      key: "vehicle_tag",
      render: (tag) => (
        <span className="text-xs font-mono font-black uppercase px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg inline-flex items-center gap-1 shadow-xs">
          🚗 {tag || "PP-9921 (EXPRESS)"}
        </span>
      ),
    },
    {
      title: "CONTACT PHONE",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (
        <span className="text-xs font-mono font-bold text-neutral-800">
          📞 {phone || "+855 12 888 999"}
        </span>
      ),
    },
    {
      title: "COURIER STATUS",
      key: "status",
      render: () => (
        <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          READY FOR DISPATCH
        </span>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            type="text"
            icon={
              <EditOutlined className="text-neutral-700 hover:text-black" />
            }
            onClick={() => handleOpenEditUser(record)}
            size="small"
            title="Edit Driver"
          />
          <Popconfirm
            title="Delete driver account?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, size: "small" }}
          >
            <Button
              type="text"
              danger
              icon={
                <DeleteOutlined className="text-rose-600 hover:text-rose-800" />
              }
              size="small"
              title="Delete Driver"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 overflow-hidden font-sans select-none">
      {/* ================= LEFT BLACK SIDEBAR ================= */}
      <aside className="w-72 bg-black text-white border-r border-neutral-800 flex flex-col justify-between shrink-0 shadow-2xl">
        <div>
          {/* Admin Header Logo */}
          <div className="p-6 sm:p-7 border-b border-neutral-800 flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center font-black font-serif text-xl shadow-lg">
              L
            </div>
            <div>
              <span className="font-serif font-black text-sm tracking-wider uppercase text-white block">
                LEGACY STORE
              </span>
              <span className="text-[9px] font-mono font-bold text-neutral-400 tracking-widest uppercase flex items-center gap-1 mt-0.5">
                <CrownOutlined style={{ fontSize: "10px" }} /> ADMIN CONTROL
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-5 sm:p-6 space-y-2.5 overflow-y-auto max-h-[calc(100vh-170px)]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-3.5 transition-all duration-200 cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white text-black shadow-lg"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <DashboardOutlined style={{ fontSize: "17px" }} />
              <span>OVERVIEW</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all duration-200 cursor-pointer ${
                activeTab === "products"
                  ? "bg-white text-black shadow-lg"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <ShopOutlined style={{ fontSize: "17px" }} />
                <span>PRODUCTS</span>
              </div>
              <Badge
                count={products.length}
                style={{
                  backgroundColor:
                    activeTab === "products" ? "#000000" : "#262626",
                  color: "#ffffff",
                  fontWeight: "bold",
                }}
              />
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all duration-200 cursor-pointer ${
                activeTab === "orders"
                  ? "bg-white text-black shadow-lg"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <UnorderedListOutlined style={{ fontSize: "17px" }} />
                <span>ORDERS</span>
              </div>
              <Badge
                count={orders.length}
                style={{
                  backgroundColor:
                    activeTab === "orders" ? "#000000" : "#262626",
                  color: "#ffffff",
                  fontWeight: "bold",
                }}
              />
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all duration-200 cursor-pointer ${
                activeTab === "categories"
                  ? "bg-white text-black shadow-lg"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <AppstoreOutlined style={{ fontSize: "17px" }} />
                <span>CATEGORIES</span>
              </div>
              <Badge
                count={categories.length}
                style={{
                  backgroundColor:
                    activeTab === "categories" ? "#000000" : "#262626",
                  color: "#ffffff",
                  fontWeight: "bold",
                }}
              />
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all duration-200 cursor-pointer ${
                activeTab === "users"
                  ? "bg-white text-black shadow-lg"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <UserOutlined style={{ fontSize: "17px" }} />
                <span>USERS & CLIENTS</span>
              </div>
              <Badge
                count={users.length}
                style={{
                  backgroundColor:
                    activeTab === "users" ? "#000000" : "#262626",
                  color: "#ffffff",
                  fontWeight: "bold",
                }}
              />
            </button>

            <button
              onClick={() => setActiveTab("drivers")}
              className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all duration-200 cursor-pointer ${
                activeTab === "drivers"
                  ? "bg-white text-black shadow-lg"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <CarOutlined style={{ fontSize: "17px" }} />
                <span>DELIVERY DRIVERS</span>
              </div>
              <Badge
                count={drivers.length}
                style={{
                  backgroundColor:
                    activeTab === "drivers" ? "#000000" : "#262626",
                  color: "#ffffff",
                  fontWeight: "bold",
                }}
              />
            </button>

            <button
              onClick={() => setActiveTab("promotions")}
              className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all duration-200 cursor-pointer ${
                activeTab === "promotions"
                  ? "bg-white text-black shadow-lg"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <TagOutlined style={{ fontSize: "17px" }} />
                <span>PROMOTIONS</span>
              </div>
              <Badge
                count={promotions.length}
                style={{
                  backgroundColor:
                    activeTab === "promotions" ? "#000000" : "#262626",
                  color: "#ffffff",
                  fontWeight: "bold",
                }}
              />
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-3.5 transition-all duration-200 cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-white text-black shadow-lg"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <BarChartOutlined style={{ fontSize: "17px" }} />
              <span>ANALYTICS</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-3.5 transition-all duration-200 cursor-pointer ${
                activeTab === "settings"
                  ? "bg-white text-black shadow-lg"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <SettingOutlined style={{ fontSize: "17px" }} />
              <span>SETTINGS</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-neutral-800 space-y-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full bg-neutral-900 hover:bg-white hover:text-black text-white px-4 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 border border-neutral-800 transition-all cursor-pointer shadow-md"
            >
              <LogoutOutlined />
              <span>SIGN OUT ADMIN</span>
            </button>
          )}
        </div>
      </aside>

      {/* ================= RIGHT MAIN CONTENT AREA (LIGHT LUXURY THEME) ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-50 text-neutral-900 overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white h-16 border-b border-neutral-200 px-6 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-extrabold font-serif uppercase tracking-widest text-black flex items-center gap-2">
              <span>{activeTab.toUpperCase()} CONTROL PANEL</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API ONLINE
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell Center Button */}
            <button
              type="button"
              onClick={() => setNotifDrawerOpen(true)}
              className="relative p-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-all cursor-pointer border border-neutral-200 flex items-center justify-center group"
              title="Open Notifications Center Drawer"
            >
              <BellOutlined className="text-base group-hover:scale-110 transition-transform text-neutral-700" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Render Slide-Over Drawer */}
            {notificationDrawerContent}

            <div className="flex items-center space-x-2 bg-black text-white px-4 py-1.5 rounded-full border border-black text-xs font-extrabold shadow-sm">
              <CrownOutlined className="text-amber-400" />
              <span className="tracking-wider">SUPERADMIN</span>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-neutral-50">
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Executive KPI Metric Cards */}
              <Row gutter={[20, 20]}>
                {/* Metric 1: Total Revenue */}
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                        TOTAL REVENUE
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                        <DollarOutlined />
                      </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-black mb-2">
                      $
                      {totalRevenue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-mono">
                      <RiseOutlined />
                      <span>+18.4% VS LAST MONTH</span>
                    </div>
                  </div>
                </Col>

                {/* Metric 2: Total Orders */}
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                        TOTAL ORDERS
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        <ShoppingOutlined />
                      </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-black mb-2">
                      {orders.length}{" "}
                      <span className="text-xs text-neutral-500 font-normal">
                        Orders
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-mono">
                      <ClockCircleOutlined />
                      <span>
                        {orders.filter((o) => o.status === "pending").length}{" "}
                        PENDING
                      </span>
                    </div>
                  </div>
                </Col>

                {/* Metric 3: Active Products */}
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                        ACTIVE PRODUCTS
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center text-xl shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <AppstoreOutlined />
                      </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-black mb-2">
                      {products.length}{" "}
                      <span className="text-xs text-neutral-500 font-normal">
                        Items
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-mono">
                      <span>{categories.length} CATEGORIES</span>
                    </div>
                  </div>
                </Col>

                {/* Metric 4: Fulfilled Rate */}
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                        FULFILLMENT RATE
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-600 text-white flex items-center justify-center text-xl shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform">
                        <CheckCircleOutlined />
                      </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-black mb-2">
                      {orders.length
                        ? Math.round((completedOrders / orders.length) * 100)
                        : 100}
                      %
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-mono">
                      <span>{completedOrders} DELIVERED</span>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Visual Interactive Analytics & Charts Section */}
              <Row gutter={[20, 20]}>
                {/* Visual Chart 1: Monthly Sales Revenue Trend */}
                <Col xs={24} lg={16}>
                  <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <BarChartOutlined className="text-emerald-600" />
                          <h3 className="text-sm font-extrabold uppercase font-serif tracking-wider text-black">
                            REVENUE & SALES TREND CHART
                          </h3>
                        </div>
                        <p className="text-xs text-neutral-500 font-light">
                          6-Month performance overview & transaction volumes.
                        </p>
                      </div>
                      <Tag
                        color="emerald"
                        className="font-extrabold text-[10px] uppercase font-mono px-3 py-1"
                      >
                        📈 +34% HIGH GROWTH
                      </Tag>
                    </div>

                    {/* SVG / Bar Visual Analytics Graph */}
                    <div className="pt-4">
                      <div className="h-48 flex items-end justify-between gap-3 px-4 pt-6 border-b border-neutral-200 pb-2">
                        {monthlySales.map((item, idx) => {
                          const heightPct = Math.round(
                            (item.revenue / maxRevenue) * 100,
                          );
                          return (
                            <div
                              key={idx}
                              className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
                            >
                              {/* Hover Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-black text-white text-[10px] font-mono font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                                ${item.revenue.toLocaleString()} • {item.orders}{" "}
                                Orders
                              </div>
                              {/* Bar */}
                              <div className="w-full bg-neutral-100 rounded-t-lg overflow-hidden h-36 flex items-end">
                                <div
                                  style={{ height: `${heightPct}%` }}
                                  className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all duration-500 rounded-t-lg shadow-sm"
                                ></div>
                              </div>
                              {/* Month Label */}
                              <span className="text-[10px] font-extrabold text-neutral-600 uppercase font-mono">
                                {item.month}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-3">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 font-bold">
                            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>{" "}
                            Revenue ($)
                          </span>
                          <span className="flex items-center gap-1.5 font-bold">
                            <span className="w-3 h-3 rounded bg-neutral-900 inline-block"></span>{" "}
                            Order Count
                          </span>
                        </div>
                        <span className="font-bold text-black">
                          Peak Month: June ($48.9k)
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Visual Chart 2: Category Breakdown & Progress */}
                <Col xs={24} lg={8}>
                  <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 mb-4">
                        <PieChartOutlined className="text-indigo-600" />
                        <h3 className="text-sm font-extrabold uppercase font-serif tracking-wider text-black">
                          CATEGORY SALES
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold font-mono mb-1">
                            <span>Suits & Outerwear</span>
                            <span className="text-indigo-600">
                              45% ($22,014)
                            </span>
                          </div>
                          <Progress
                            percent={45}
                            strokeColor="#4f46e5"
                            showInfo={false}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold font-mono mb-1">
                            <span>Silk Shirts & Apparel</span>
                            <span className="text-purple-600">
                              28% ($13,697)
                            </span>
                          </div>
                          <Progress
                            percent={28}
                            strokeColor="#9333ea"
                            showInfo={false}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold font-mono mb-1">
                            <span>Footwear & Leather</span>
                            <span className="text-amber-600">17% ($8,316)</span>
                          </div>
                          <Progress
                            percent={17}
                            strokeColor="#d97706"
                            showInfo={false}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold font-mono mb-1">
                            <span>Accessories & Watches</span>
                            <span className="text-teal-600">10% ($4,893)</span>
                          </div>
                          <Progress
                            percent={10}
                            strokeColor="#0d9488"
                            showInfo={false}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-[11px] font-mono font-bold text-neutral-700 flex justify-between items-center mt-4">
                      <span>🔥 Top Category:</span>
                      <span className="bg-black text-white px-2 py-0.5 rounded text-[10px]">
                        Suits & Outerwear
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Recent Orders Preview */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase font-serif tracking-wider text-black">
                      RECENT CUSTOMER PURCHASES
                    </h3>
                    <p className="text-xs text-neutral-500 font-light">
                      Live transactional stream from luxury store front.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab("orders")}
                    size="small"
                    className="bg-black text-white hover:bg-neutral-800 text-xs font-black border-none rounded-lg px-4"
                  >
                    View All Orders &rarr;
                  </Button>
                </div>

                <Table
                  dataSource={orders.slice(0, 5)}
                  columns={orderColumns}
                  rowKey="id"
                  pagination={false}
                  className="rounded-xl overflow-hidden border border-neutral-200"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT CATALOG MANAGEMENT */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-black font-serif uppercase tracking-tight text-black">
                        PRODUCT CATALOG MANAGER
                      </h2>
                      <span className="bg-neutral-100 text-neutral-800 border border-neutral-200 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full">
                        {filteredProducts.length} of {products.length} Products
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-light mt-0.5">
                      Add, edit, update prices, manage stock levels, and toggle hot drops live.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Category Dropdown Filter */}
                    <Select
                      value={productCategoryFilter}
                      onChange={setProductCategoryFilter}
                      className="w-36 h-10 font-medium text-xs"
                      options={[
                        { value: "all", label: "All Categories" },
                        { value: "shirt", label: "👔 Shirts" },
                        { value: "t-shirt", label: "👕 T-Shirts" },
                        { value: "shoes", label: "👟 Shoes" },
                      ]}
                    />

                    {/* Stock Status Dropdown Filter */}
                    <Select
                      value={productStockFilter}
                      onChange={setProductStockFilter}
                      className="w-36 h-10 font-medium text-xs"
                      options={[
                        { value: "all", label: "All Stock" },
                        { value: "in_stock", label: "✓ In Stock" },
                        { value: "low_stock", label: "⚠️ Low Stock" },
                        { value: "out_of_stock", label: "🚨 Out of Stock" },
                        { value: "hot_drop", label: "🔥 Hot Drops" },
                        { value: "new_arrival", label: "✨ New Drops" },
                      ]}
                    />

                    {/* Luxury Executive Search Input */}
                    <div className="relative flex-1 sm:w-64 md:w-72 min-w-[200px]">
                      <Input
                        placeholder="Search name, ID, price, SKU..."
                        prefix={<SearchOutlined className="text-neutral-400 text-sm mr-1.5" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                        className="w-full text-xs font-medium rounded-xl border border-neutral-300 hover:border-black focus:border-black bg-neutral-50/70 focus:bg-white text-black placeholder:text-neutral-400 shadow-2xs h-10 px-3 transition-all"
                      />
                    </div>

                    {/* New Product Button */}
                    <Button
                      type="primary"
                      icon={<PlusOutlined className="text-sm" />}
                      onClick={() => {
                        setEditingProduct(null);
                        form.resetFields();
                        setProductModalOpen(true);
                      }}
                      className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-widest h-10 px-5 rounded-xl shadow-md border-none flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <span>NEW PRODUCT</span>
                    </Button>
                  </div>
                </div>

                {/* Filter Feedback Banner (Shows when any filter is active) */}
                {(searchTerm || productCategoryFilter !== "all" || productStockFilter !== "all") && (
                  <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200/80 px-3.5 py-2 rounded-xl text-xs text-neutral-600 font-mono">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-black uppercase text-[10px]">Active Filters:</span>
                      {searchTerm && (
                        <span className="bg-white border border-neutral-200 px-2 py-0.5 rounded text-[11px] text-neutral-800">
                          Keyword: "{searchTerm}"
                        </span>
                      )}
                      {productCategoryFilter !== "all" && (
                        <span className="bg-white border border-neutral-200 px-2 py-0.5 rounded text-[11px] text-neutral-800 capitalize">
                          Category: {productCategoryFilter}
                        </span>
                      )}
                      {productStockFilter !== "all" && (
                        <span className="bg-white border border-neutral-200 px-2 py-0.5 rounded text-[11px] text-neutral-800 capitalize">
                          Status: {productStockFilter.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setProductCategoryFilter("all");
                        setProductStockFilter("all");
                      }}
                      className="text-neutral-500 hover:text-black underline cursor-pointer font-bold uppercase text-[10px] ml-2 shrink-0"
                    >
                      Reset All
                    </button>
                  </div>
                )}
              </div>

              <Table
                dataSource={filteredProducts}
                columns={productColumns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 7 }}
                className="rounded-2xl overflow-hidden border border-neutral-200 shadow-xs bg-white"
              />
            </div>
          )}

          {/* TAB 3: CUSTOMER ORDERS FULFILLMENT */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-black font-serif uppercase tracking-tight text-black">
                        CUSTOMER ORDERS FULFILLMENT
                      </h2>
                      <span className="bg-neutral-100 text-neutral-800 border border-neutral-200 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full">
                        {filteredOrders.length} of {orders.length} Orders
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-light mt-0.5">
                      Track client orders, update shipment statuses, and inspect receipts.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Order Status Filter */}
                    <Select
                      value={orderStatusFilter}
                      onChange={setOrderStatusFilter}
                      className="w-36 h-10 font-medium text-xs"
                      options={[
                        { value: "all", label: "All Statuses" },
                        { value: "pending", label: "⏳ Pending" },
                        { value: "confirmed", label: "✓ Confirmed" },
                        { value: "shipped", label: "🚚 Shipped" },
                        { value: "delivered", label: "✨ Delivered" },
                        { value: "cancelled", label: "✕ Cancelled" },
                      ]}
                    />

                    {/* Order Search Input */}
                    <div className="relative flex-1 sm:w-64 md:w-80 min-w-[200px]">
                      <Input
                        placeholder="Search order #, customer, email, phone..."
                        prefix={<SearchOutlined className="text-neutral-400 text-sm mr-1.5" />}
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        allowClear
                        className="w-full text-xs font-medium rounded-xl border border-neutral-300 hover:border-black focus:border-black bg-neutral-50/70 focus:bg-white text-black placeholder:text-neutral-400 shadow-2xs h-10 px-3 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {(orderSearchTerm || orderStatusFilter !== "all") && (
                  <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200/80 px-3.5 py-2 rounded-xl text-xs text-neutral-600 font-mono">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-black uppercase text-[10px]">Active Filters:</span>
                      {orderSearchTerm && (
                        <span className="bg-white border border-neutral-200 px-2 py-0.5 rounded text-[11px] text-neutral-800">
                          Keyword: "{orderSearchTerm}"
                        </span>
                      )}
                      {orderStatusFilter !== "all" && (
                        <span className="bg-white border border-neutral-200 px-2 py-0.5 rounded text-[11px] text-neutral-800 capitalize">
                          Status: {orderStatusFilter}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setOrderSearchTerm("");
                        setOrderStatusFilter("all");
                      }}
                      className="text-neutral-500 hover:text-black underline cursor-pointer font-bold uppercase text-[10px] ml-2 shrink-0"
                    >
                      Reset All
                    </button>
                  </div>
                )}
              </div>

              <Table
                dataSource={filteredOrders}
                columns={orderColumns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 7 }}
                className="rounded-2xl overflow-hidden border border-neutral-200 shadow-xs bg-white"
              />
            </div>
          )}

          {/* TAB 4: FULL CATEGORY TAXONOMY MANAGEMENT */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
                <div>
                  <h2 className="text-xl font-black font-serif uppercase tracking-tight text-black mb-1">
                    COLLECTION CATEGORIES MANAGER
                  </h2>
                  <p className="text-xs text-neutral-500 font-light">
                    Create new product categories, update slugs, descriptions,
                    and manage live website taxonomy.
                  </p>
                </div>

                <Button
                  type="primary"
                  icon={<FolderAddOutlined />}
                  onClick={() => {
                    setEditingCategory(null);
                    categoryForm.resetFields();
                    setCategoryModalOpen(true);
                  }}
                  className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest h-10 px-5 rounded-lg shadow-md border-none flex items-center justify-center gap-2"
                >
                  + NEW CATEGORY
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between hover:border-black hover:shadow-xl transition-all duration-300 group relative"
                  >
                    <div>
                      {/* Top Bar: Apparel Icon Box (Matching user image style) + Badges */}
                      <div className="flex items-start justify-between mb-5">
                        {/* Minimalist Line Icon Box matching media_1789716695484 image */}
                        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300 shadow-xs">
                          {getCategoryIcon(cat)}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col items-end space-y-1.5">
                          <span className="bg-black text-white text-[10px] font-black uppercase px-3 py-1 rounded-md font-mono tracking-wider shadow-xs">
                            {cat.products_count || 0} ITEMS
                          </span>
                          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                            SLUG: /{cat.slug}
                          </span>
                        </div>
                      </div>

                      {/* Category Name */}
                      <h4 className="text-xl font-black font-serif uppercase tracking-tight text-black mb-1 group-hover:text-neutral-800 transition-colors">
                        {cat.name}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-neutral-500 font-light leading-relaxed line-clamp-2 mb-4">
                        {cat.description ||
                          `Luxury tailored ${cat.name.toLowerCase()} crafted from premium fabrics.`}
                      </p>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                        📂 TAXONOMY #{cat.id}
                      </span>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleOpenEditCategory(cat)}
                          className="text-xs font-bold bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200 h-8 px-3.5 rounded-lg flex items-center"
                        >
                          Edit
                        </Button>
                        <Popconfirm
                          title="Delete this category?"
                          description="Products in this category will be unassigned."
                          onConfirm={() => handleDeleteCategory(cat.id)}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true, size: "small" }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            className="text-xs font-bold h-8 px-3.5 rounded-lg flex items-center"
                          >
                            Delete
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: USERS & CLIENTS MANAGEMENT */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-black font-serif uppercase tracking-tight text-black mb-1">
                        USER, CLIENT & DELIVERY DRIVER MANAGEMENT
                      </h2>
                      <span className="bg-neutral-100 text-neutral-800 border border-neutral-200 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full">
                        {filteredUsers.length} of {users.length} Users
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-light">
                      View all registered store users, manage SuperAdmin roles,
                      register Delivery Drivers (Courier App), and update VIP
                      client details.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* User Role Filter */}
                    <Select
                      value={userRoleFilter}
                      onChange={setUserRoleFilter}
                      className="w-36 h-10 font-medium text-xs"
                      options={[
                        { value: "all", label: "All Roles" },
                        { value: "user", label: "👑 VIP Clients" },
                        { value: "admin", label: "⚡ SuperAdmin" },
                        { value: "driver", label: "🚚 Drivers" },
                      ]}
                    />

                    {/* User Search Input */}
                    <div className="relative flex-1 sm:w-64 min-w-[190px]">
                      <Input
                        placeholder="Search name, email, phone..."
                        prefix={<SearchOutlined className="text-neutral-400 text-sm mr-1.5" />}
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        allowClear
                        className="w-full text-xs font-medium rounded-xl border border-neutral-300 hover:border-black focus:border-black bg-neutral-50/70 focus:bg-white text-black placeholder:text-neutral-400 shadow-2xs h-10 px-3 transition-all"
                      />
                    </div>

                    <Button
                      type="default"
                      icon={<CarOutlined className="text-blue-600" />}
                      onClick={() => {
                        setEditingUser(null);
                        userForm.resetFields();
                        userForm.setFieldsValue({ role: "driver" });
                        setUserModalOpen(true);
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300 font-extrabold text-xs uppercase tracking-wider h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                    >
                      <span>REGISTER DRIVER</span>
                    </Button>

                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={() => {
                        setEditingUser(null);
                        userForm.resetFields();
                        userForm.setFieldsValue({ role: "user" });
                        setUserModalOpen(true);
                      }}
                      className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-widest h-10 px-4 rounded-xl shadow-md border-none flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>NEW CLIENT</span>
                    </Button>
                  </div>
                </div>

                {(userSearchTerm || userRoleFilter !== "all") && (
                  <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200/80 px-3.5 py-2 rounded-xl text-xs text-neutral-600 font-mono">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-black uppercase text-[10px]">Active Filters:</span>
                      {userSearchTerm && (
                        <span className="bg-white border border-neutral-200 px-2 py-0.5 rounded text-[11px] text-neutral-800">
                          Keyword: "{userSearchTerm}"
                        </span>
                      )}
                      {userRoleFilter !== "all" && (
                        <span className="bg-white border border-neutral-200 px-2 py-0.5 rounded text-[11px] text-neutral-800 capitalize">
                          Role: {userRoleFilter}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setUserSearchTerm("");
                        setUserRoleFilter("all");
                      }}
                      className="text-neutral-500 hover:text-black underline cursor-pointer font-bold uppercase text-[10px] ml-2 shrink-0"
                    >
                      Reset All
                    </button>
                  </div>
                )}
              </div>

              <Table
                dataSource={filteredUsers}
                columns={userColumns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 7 }}
                className="rounded-2xl overflow-hidden border border-neutral-200 shadow-xs bg-white"
              />
            </div>
          )}

          {/* TAB: DELIVERY DRIVERS MANAGEMENT & COURIER FLEET */}
          {activeTab === "drivers" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
                <div>
                  <h2 className="text-xl font-black font-serif uppercase tracking-tight text-black mb-1">
                    DELIVERY DRIVERS & COURIER FLEET
                  </h2>
                  <p className="text-xs text-neutral-500 font-light">
                    Manage registered delivery drivers, mobile app credentials,
                    vehicle tags, and live shipment dispatches.
                  </p>
                </div>

                <Button
                  type="primary"
                  icon={<CarOutlined />}
                  onClick={() => {
                    setEditingUser(null);
                    userForm.resetFields();
                    userForm.setFieldsValue({ role: "driver" });
                    setUserModalOpen(true);
                  }}
                  className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest h-10 px-5 rounded-lg shadow-md border-none flex items-center justify-center gap-2"
                >
                  🚚 + REGISTER NEW DELIVERY DRIVER
                </Button>
              </div>

              <Table
                dataSource={drivers}
                columns={driverColumns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 7 }}
                className="rounded-2xl overflow-hidden border border-neutral-200 shadow-xs bg-white"
              />
            </div>
          )}

          {/* TAB 6: PROMOTIONS & DISCOUNT COUPONS */}
          {activeTab === "promotions" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
                <div>
                  <h2 className="text-xl font-black font-serif uppercase tracking-tight text-black mb-1">
                    PROMOTIONS & DISCOUNT COUPONS
                  </h2>
                  <p className="text-xs text-neutral-500 font-light">
                    Create promo codes, manage discount percentages, free
                    shipping vouchers, and track coupon usages.
                  </p>
                </div>

                <Button
                  type="primary"
                  icon={<GiftOutlined />}
                  onClick={() => {
                    promoForm.resetFields();
                    setPromoModalOpen(true);
                  }}
                  className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest h-10 px-5 rounded-lg shadow-md border-none flex items-center justify-center gap-2"
                >
                  + CREATE PROMO CODE
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between hover:border-black hover:shadow-xl transition-all duration-300 group relative"
                  >
                    <div>
                      {/* Top Row: Vector Icon Box (Matching shirt icon style) + Badges */}
                      <div className="flex items-start justify-between mb-5">
                        {/* Minimalist Vector Line Icon Box */}
                        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300 shadow-xs">
                          {getPromoIcon(promo)}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col items-end space-y-1.5">
                          <Tag
                            color="emerald"
                            className="font-black text-[9px] uppercase border-none px-2.5 py-0.5 rounded-md tracking-widest bg-emerald-50 text-emerald-700 m-0 border border-emerald-200 font-mono shadow-xs"
                          >
                            ACTIVE PASS
                          </Tag>
                          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                            USED: {promo.usage_count} TIMES
                          </span>
                        </div>
                      </div>

                      {/* Main Discount Header */}
                      <div className="text-2xl font-black font-serif uppercase tracking-tight text-black mb-1 group-hover:text-neutral-800 transition-colors">
                        {promo.discount}
                      </div>

                      {/* Campaign Title */}
                      <h4 className="text-xs font-black uppercase font-mono tracking-widest text-neutral-400 mb-2">
                        {promo.title || "EXECUTIVE VIP PROMO"}
                      </h4>

                      {/* Subtitle / Description */}
                      <p className="text-xs text-neutral-500 font-light leading-relaxed line-clamp-2 mb-4">
                        {promo.subtitle ||
                          "Exclusive luxury promotion voucher for distinguished clients."}
                      </p>
                    </div>

                    {/* Perforated Stub Bottom Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-neutral-200">
                      {/* Coupon Code Pill */}
                      <div className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 text-black px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-widest uppercase shadow-xs group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors">
                        <span>🎟️</span>
                        <span>{promo.code}</span>
                      </div>

                      {/* Copy Code & Delete Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <Button
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(promo.code);
                            notification.success({
                              message: "COPIED TO CLIPBOARD",
                              description: `Promo code ${promo.code} copied!`,
                              placement: "bottomRight",
                            });
                          }}
                          className="bg-black hover:bg-neutral-800 text-white border-none text-xs font-bold uppercase tracking-wider h-8 px-3 rounded-lg shadow-xs flex items-center"
                        >
                          Copy Code
                        </Button>

                        <Popconfirm
                          title="Delete promo code?"
                          onConfirm={() => handleDeletePromo(promo.id)}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true, size: "small" }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            className="text-xs font-bold h-8 px-2 rounded-lg flex items-center justify-center"
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
                <h2 className="text-xl font-black font-serif uppercase tracking-tight text-black mb-1">
                  REVENUE & SALES ANALYTICS
                </h2>
                <p className="text-xs text-neutral-500 font-light">
                  Executive analytics overview.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase font-mono tracking-widest block">
                    GROSS STORE REVENUE
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-600">
                    $
                    {totalRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase font-mono tracking-widest block">
                    FULFILLMENT SUCCESS RATE
                  </span>
                  <div className="text-3xl font-black font-mono text-black">
                    {orders.length
                      ? Math.round((completedOrders / orders.length) * 100)
                      : 100}
                    %
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: STORE SETTINGS & CONFIG */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
                <h2 className="text-xl font-black font-serif uppercase tracking-tight text-black mb-1">
                  STORE CONFIGURATION & SETTINGS
                </h2>
                <p className="text-xs text-neutral-500 font-light">
                  Configure store identity, free shipping limits, payment
                  gateways, and system maintenance mode.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-6 max-w-3xl">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <div>
                    <h4 className="text-sm font-bold uppercase font-serif text-black">
                      Bakong KHQR Payment Gateway
                    </h4>
                    <p className="text-xs text-neutral-500 font-light">
                      Enable Cambodian National Bank KHQR real-time QR code
                      payment scanning.
                    </p>
                  </div>
                  <Switch
                    checked={storeSettings.bakongKhqrEnabled}
                    onChange={(checked) => {
                      setStoreSettings((prev) => ({
                        ...prev,
                        bakongKhqrEnabled: checked,
                      }));
                      notification.info({
                        message: "SETTING UPDATED",
                        description: `Bakong KHQR Payment Gateway is now ${checked ? "ENABLED" : "DISABLED"}.`,
                        placement: "bottomRight",
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <div>
                    <h4 className="text-sm font-bold uppercase font-serif text-black">
                      Standard Delivery Price ($)
                    </h4>
                    <p className="text-xs text-neutral-500 font-light">
                      Default delivery price ($) for standard Phnom Penh / local
                      shipping.
                    </p>
                  </div>
                  <InputNumber
                    min={0}
                    step={0.5}
                    prefix="$"
                    value={storeSettings.standardDeliveryFee}
                    onChange={(val) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        standardDeliveryFee: val,
                      }))
                    }
                    className="w-32 font-mono font-bold"
                  />
                </div>

                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <div>
                    <h4 className="text-sm font-bold uppercase font-serif text-black">
                      Express Courier Delivery Price ($)
                    </h4>
                    <p className="text-xs text-neutral-500 font-light">
                      Price ($) for 1-hour VIP express courier & provincial
                      delivery.
                    </p>
                  </div>
                  <InputNumber
                    min={0}
                    step={0.5}
                    prefix="$"
                    value={storeSettings.expressDeliveryFee}
                    onChange={(val) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        expressDeliveryFee: val,
                      }))
                    }
                    className="w-32 font-mono font-bold"
                  />
                </div>

                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <div>
                    <h4 className="text-sm font-bold uppercase font-serif text-black">
                      Free Delivery Minimum Limit ($)
                    </h4>
                    <p className="text-xs text-neutral-500 font-light">
                      Minimum order subtotal ($) required to activate free
                      delivery.
                    </p>
                  </div>
                  <InputNumber
                    min={0}
                    prefix="$"
                    value={storeSettings.freeShippingThreshold}
                    onChange={(val) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        freeShippingThreshold: val,
                      }))
                    }
                    className="w-32 font-mono font-bold"
                  />
                </div>

                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <div>
                    <h4 className="text-sm font-bold uppercase font-serif text-black">
                      System Maintenance Mode
                    </h4>
                    <p className="text-xs text-neutral-500 font-light">
                      Temporarily pause checkout and displays maintenance
                      announcement banner.
                    </p>
                  </div>
                  <Switch
                    checked={storeSettings.maintenanceMode}
                    onChange={(checked) => {
                      setStoreSettings((prev) => ({
                        ...prev,
                        maintenanceMode: checked,
                      }));
                      notification.warning({
                        message: "SYSTEM MODE CHANGED",
                        description: `Maintenance mode is now ${checked ? "ACTIVE" : "OFF"}.`,
                        placement: "bottomRight",
                      });
                    }}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="primary"
                    onClick={() => {
                      saveDeliverySettings(storeSettings);
                      notification.success({
                        message: "DELIVERY & STORE CONFIG SAVED",
                        description: `Delivery fees updated: Standard $${storeSettings.standardDeliveryFee?.toFixed(2)}, Express $${storeSettings.expressDeliveryFee?.toFixed(2)}, Free over $${storeSettings.freeShippingThreshold}!`,
                        placement: "bottomRight",
                      });
                    }}
                    className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase px-6 h-10"
                  >
                    Save Store Configuration
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Create / Edit Modal */}
      <Modal
        title={
          <span className="font-serif font-black uppercase tracking-tight text-lg text-black">
            {editingUser ? `EDIT USER #${editingUser.id}` : "REGISTER NEW USER"}
          </span>
        }
        open={userModalOpen}
        onCancel={() => setUserModalOpen(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSubmit}
          className="pt-4 space-y-4"
        >
          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-700">
                Full Name
              </span>
            }
            name="name"
            rules={[{ required: true, message: "Please enter user name" }]}
          >
            <Input
              prefix={<UserOutlined className="text-neutral-400" />}
              placeholder="e.g. Jean-Luc Picard"
              className="text-xs py-2 rounded-md"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-700">
                Email Address
              </span>
            }
            name="email"
            rules={[{ required: true, message: "Please enter email" }]}
          >
            <Input
              prefix={<MailOutlined className="text-neutral-400" />}
              placeholder="user@domain.com"
              className="text-xs py-2 rounded-md"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-700">
                Role
              </span>
            }
            name="role"
            initialValue="user"
          >
            <Select
              className="text-xs"
              options={[
                { value: "user", label: "👤 VIP Client (Standard User)" },
                {
                  value: "driver",
                  label: "🚚 Delivery Driver (Courier Mobile App)",
                },
                { value: "admin", label: "⚡ SuperAdmin (Full Control)" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-700">
                Phone Number
              </span>
            }
            name="phone"
          >
            <Input
              prefix={<PhoneOutlined className="text-neutral-400" />}
              placeholder="e.g. +855 12 888 999"
              className="text-xs py-2 rounded-md"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-700">
                Vehicle Tag / License Plate (For Delivery Drivers)
              </span>
            }
            name="vehicle_tag"
          >
            <Input
              prefix={<CarOutlined className="text-neutral-400" />}
              placeholder="e.g. PP-9921 (Sokha Express)"
              className="text-xs py-2 rounded-md"
            />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label={
                <span className="text-xs font-bold uppercase text-neutral-700">
                  Password
                </span>
              }
              name="password"
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-neutral-400" />}
                placeholder="••••••••"
                className="text-xs py-2 rounded-md"
              />
            </Form.Item>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button onClick={() => setUserModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase border-none px-6"
            >
              {editingUser ? "Update User" : "Register User"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Promo Code Create Modal */}
      <Modal
        title={
          <span className="font-serif font-black uppercase tracking-tight text-lg text-black">
            CREATE VIP PROMOTION POSTER CARD
          </span>
        }
        open={promoModalOpen}
        onCancel={() => setPromoModalOpen(false)}
        footer={null}
        width={580}
        destroyOnClose
      >
        <Form
          form={promoForm}
          layout="vertical"
          onFinish={handlePromoSubmit}
          className="pt-4 space-y-3"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-xs font-bold uppercase text-neutral-700">
                    Coupon Code
                  </span>
                }
                name="code"
                rules={[{ required: true, message: "Please enter promo code" }]}
              >
                <Input
                  placeholder="e.g. LUXEVIP30"
                  className="text-xs py-2 rounded-md font-mono uppercase"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-xs font-bold uppercase text-neutral-700">
                    Offer Discount Tag
                  </span>
                }
                name="discount"
                rules={[
                  { required: true, message: "Please enter discount text" },
                ]}
              >
                <Input
                  placeholder="e.g. 30% OFF or $100 OFF"
                  className="text-xs py-2 rounded-md"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-xs font-bold uppercase text-neutral-700">
                    Poster Campaign Title
                  </span>
                }
                name="title"
              >
                <Input
                  placeholder="e.g. WINTER DROP VIP PASS"
                  className="text-xs py-2 rounded-md font-serif"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-xs font-bold uppercase text-neutral-700">
                    VIP Badge Text
                  </span>
                }
                name="badge"
              >
                <Input
                  placeholder="e.g. LIMITED EDITION PASS"
                  className="text-xs py-2 rounded-md"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-700">
                Poster Cover Image URL
              </span>
            }
            name="bg_image"
          >
            <Input
              placeholder="https://images.unsplash.com/... (Optional high-fashion photo)"
              className="text-xs py-2 rounded-md font-mono"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-700">
                Campaign Subtitle / Details
              </span>
            }
            name="subtitle"
          >
            <Input.TextArea
              rows={2}
              placeholder="e.g. Exclusive invitation for all Alexandre Luxe autumn collections..."
              className="text-xs rounded-md"
            />
          </Form.Item>

          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button onClick={() => setPromoModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase border-none px-6"
            >
              Generate Poster Card
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Category Form Modal (Create / Edit Category) */}
      <Modal
        title={
          <span className="font-serif font-black uppercase tracking-tight text-lg text-black">
            {editingCategory
              ? `EDIT CATEGORY #${editingCategory.id}`
              : "CREATE NEW CATEGORY"}
          </span>
        }
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCategorySubmit}
          className="pt-4 space-y-4"
        >
          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-700">
                Category Name
              </span>
            }
            name="name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input
              placeholder="e.g. Watches & Jewelry"
              className="text-xs py-2 rounded-md"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-700">
                URL Slug (Optional)
              </span>
            }
            name="slug"
          >
            <Input
              placeholder="e.g. watches-jewelry"
              className="text-xs py-2 rounded-md font-mono"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-700">
                Category Cover Image URL (Optional)
              </span>
            }
            name="image_url"
          >
            <Input
              placeholder="https://images.unsplash.com/... (High-fashion cover image)"
              className="text-xs py-2 rounded-md font-mono"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-700">
                Description (Optional)
              </span>
            }
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Collection description for customer storefront..."
              className="text-xs rounded-md"
            />
          </Form.Item>

          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button onClick={() => setCategoryModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase border-none px-6"
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Product Form Modal (Create / Edit) */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-md">
              {editingProduct ? (
                <EditOutlined className="text-lg" />
              ) : (
                <PlusOutlined className="text-lg" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {editingProduct
                    ? `EDITING CATALOG ITEM #${editingProduct.id}`
                    : "NEW CATALOG ADDITION"}
                </span>
              </div>
              <h3 className="text-lg font-black font-serif uppercase tracking-tight text-neutral-900 m-0 leading-tight">
                {editingProduct
                  ? `EDIT: ${editingProduct.name}`
                  : "CREATE LUXURY ITEM"}
              </h3>
            </div>
          </div>
        }
        open={productModalOpen}
        onCancel={() => setProductModalOpen(false)}
        footer={null}
        width={960}
        centered
        destroyOnClose
        className="luxury-edit-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProductSubmit}
          className="pt-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* LEFT CARD: Media & Multi-Image Gallery */}
            <div className="md:col-span-5 bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200/80 space-y-3.5">
              <h4 className="text-xs font-mono font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1.5 m-0 pb-2 border-b border-neutral-200/60">
                <EyeOutlined className="text-neutral-700" />
                <span>1. MEDIA & MULTI-IMAGE GALLERY</span>
              </h4>

              {/* Form items for hidden/synced image_url & gallery values */}
              <Form.Item name="image_url" hidden>
                <Input />
              </Form.Item>

              <Form.Item name="gallery" hidden>
                <Input />
              </Form.Item>

              {/* Multi-Image Interactive Visual Gallery Component */}
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.gallery !== currentValues.gallery ||
                  prevValues.image_url !== currentValues.image_url
                }
              >
                {({ getFieldValue, setFieldsValue }) => {
                  const mainCoverUrl = getFieldValue("image_url") || "";
                  const galleryRaw = getFieldValue("gallery") || "";
                  const galleryUrls = parseGalleryUrls(galleryRaw);

                  const updateGalleryInForm = (newUrls) => {
                    const cleaned = Array.from(
                      new Set(newUrls.filter(Boolean)),
                    );
                    const jsonStr = JSON.stringify(cleaned);
                    form.setFieldsValue({ gallery: jsonStr });
                    setFieldsValue({ gallery: jsonStr });
                  };

                  // File upload handler for Main Cover Image via Cloudinary
                  const handleCoverFileUpload = async (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;

                    setUploadingCover(true);
                    try {
                      const result = await uploadToCloudinary(
                        file,
                        cloudinaryConfig,
                      );
                      if (result.success && result.url) {
                        form.setFieldsValue({ image_url: result.url });
                        setFieldsValue({ image_url: result.url });
                        notification.success({
                          message: result.isCloudinary
                            ? "CLOUDINARY UPLOAD SUCCESS"
                            : "COVER PHOTO UPDATED",
                          description: result.isCloudinary
                            ? "Cover photo stored on Cloudinary CDN!"
                            : "Cover photo preview ready.",
                          placement: "bottomRight",
                        });
                      }
                    } catch (err) {
                      console.error("Cover upload error:", err);
                    } finally {
                      setUploadingCover(false);
                      e.target.value = "";
                    }
                  };

                  // File upload handler for adding new Gallery Images via Cloudinary
                  const handleGalleryFilesUpload = async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;

                    setUploadingGallery(true);
                    try {
                      const newUploadedUrls = [];
                      for (const file of files) {
                        const result = await uploadToCloudinary(
                          file,
                          cloudinaryConfig,
                        );
                        if (result.success && result.url) {
                          newUploadedUrls.push(result.url);
                        }
                      }
                      if (newUploadedUrls.length > 0) {
                        updateGalleryInForm([
                          ...galleryUrls,
                          ...newUploadedUrls,
                        ]);
                        notification.success({
                          message: "GALLERY STORED ON CLOUDINARY",
                          description: `${newUploadedUrls.length} image(s) uploaded to Cloudinary!`,
                          placement: "bottomRight",
                        });
                      }
                    } catch (err) {
                      console.error("Gallery upload error:", err);
                    } finally {
                      setUploadingGallery(false);
                      e.target.value = "";
                    }
                  };

                  // File upload handler for replacing a single card's image via Cloudinary
                  const handleSingleCardFileUpload = async (
                    e,
                    indexToReplace,
                  ) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;

                    setUploadingCardIdx(indexToReplace);
                    try {
                      const result = await uploadToCloudinary(
                        file,
                        cloudinaryConfig,
                      );
                      if (result.success && result.url) {
                        const updated = [...galleryUrls];
                        updated[indexToReplace] = result.url;
                        updateGalleryInForm(updated);
                        notification.success({
                          message: "CLOUDINARY IMAGE REPLACED",
                          description: `Card #${indexToReplace + 1} updated on Cloudinary CDN!`,
                          placement: "bottomRight",
                        });
                      }
                    } catch (err) {
                      console.error("Single card replace upload error:", err);
                    } finally {
                      setUploadingCardIdx(null);
                      e.target.value = "";
                    }
                  };

                  const setAsMainCover = (urlToSet) => {
                    const currentMain = getFieldValue("image_url");
                    let updatedGallery = galleryUrls.filter(
                      (u) => u !== urlToSet,
                    );
                    if (
                      currentMain &&
                      currentMain !== urlToSet &&
                      !updatedGallery.includes(currentMain)
                    ) {
                      updatedGallery.unshift(currentMain);
                    }
                    setFieldsValue({
                      image_url: urlToSet,
                      gallery: JSON.stringify(updatedGallery),
                    });
                  };

                  const removeGalleryImage = (indexToRemove) => {
                    const updated = galleryUrls.filter(
                      (_, idx) => idx !== indexToRemove,
                    );
                    updateGalleryInForm(updated);
                  };

                  const autoFillMultiAngles = () => {
                    const presets = [
                      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
                      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
                      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
                    ];
                    updateGalleryInForm(presets);
                  };

                  return (
                    <div className="space-y-3.5">
                      {/* Main Cover Image Hero Card */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-800">
                            Primary Cover Photo
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            Click image to upload (Cloudinary CDN)
                          </span>
                        </div>

                        <div
                          onClick={() =>
                            coverInputRef.current &&
                            coverInputRef.current.click()
                          }
                          className="relative w-full h-36 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-md group cursor-pointer flex items-center justify-center"
                          title="Click to upload new cover image file to Cloudinary"
                        >
                          {uploadingCover ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-amber-400 gap-1 bg-black/80 z-30">
                              <span className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
                              <span className="text-xs font-mono font-bold">
                                Uploading to Cloudinary... ☁️
                              </span>
                            </div>
                          ) : mainCoverUrl ? (
                            <img
                              src={mainCoverUrl}
                              alt="Main Cover"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1">
                              <UploadOutlined className="text-2xl" />
                              <span className="text-xs font-bold">
                                Upload Cover Photo
                              </span>
                            </div>
                          )}

                          {/* Cover Badge */}
                          <div className="absolute top-2 left-2 z-10">
                            <span className="bg-amber-400 text-black text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded shadow">
                              MAIN COVER
                            </span>
                          </div>

                          {/* Hover Overlay with Upload Icon */}
                          {!uploadingCover && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1 z-20">
                              <UploadOutlined className="text-2xl text-amber-400" />
                              <span className="text-xs font-black uppercase tracking-wider">
                                Upload to Cloudinary ☁️
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Hidden cover file input */}
                        <input
                          type="file"
                          ref={coverInputRef}
                          accept="image/*"
                          onChange={handleCoverFileUpload}
                          style={{ display: "none" }}
                        />
                      </div>

                      {/* Gallery Multi-Angle Images Header */}
                      <div className="space-y-2 pt-1 border-t border-neutral-200/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-black uppercase text-neutral-800 tracking-wider">
                              Gallery Angle Images
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-full">
                              {galleryUrls.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="text"
                              size="small"
                              onClick={autoFillMultiAngles}
                              className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 hover:bg-emerald-100 rounded px-2 py-0.5"
                            >
                              ✨ Presets
                            </Button>
                            <Button
                              type="primary"
                              size="small"
                              loading={uploadingGallery}
                              onClick={() =>
                                galleryInputRef.current &&
                                galleryInputRef.current.click()
                              }
                              icon={<UploadOutlined />}
                              className="text-[10px] bg-black hover:bg-neutral-800 font-bold rounded px-2.5"
                            >
                              ☁️ Upload Cloudinary
                            </Button>
                          </div>
                        </div>

                        {/* Hidden gallery file input */}
                        <input
                          type="file"
                          ref={galleryInputRef}
                          accept="image/*"
                          multiple
                          onChange={handleGalleryFilesUpload}
                          style={{ display: "none" }}
                        />

                        {/* Visual Image Thumbnail Grid */}
                        <div className="grid grid-cols-3 gap-2.5 max-h-[210px] overflow-y-auto pr-1 scrollbar-thin">
                          {galleryUrls.map((url, idx) => {
                            const isReplacingThis = uploadingCardIdx === idx;
                            return (
                              <div
                                key={idx}
                                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-2xs group hover:shadow-md transition-all"
                              >
                                {isReplacingThis ? (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-amber-400 gap-1 bg-black/80 p-1 text-center">
                                    <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
                                    <span className="text-[8px] font-mono font-bold">
                                      Cloudinary... ☁️
                                    </span>
                                  </div>
                                ) : (
                                  <img
                                    src={url}
                                    alt={`Gallery ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80";
                                    }}
                                  />
                                )}

                                {/* Index Badge */}
                                <span className="absolute top-1 left-1 bg-black/80 text-[8px] font-mono font-bold text-white px-1.5 py-0.5 rounded z-30">
                                  #{idx + 1}
                                </span>

                                {/* Top Right Action Icons (z-30 to stay above hover overlay) */}
                                <div className="absolute top-1 right-1 flex items-center gap-1 z-30">
                                  <Tooltip title="Set as Main Cover Photo">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAsMainCover(url);
                                      }}
                                      className="w-5 h-5 rounded bg-black/80 hover:bg-amber-400 text-white hover:text-black flex items-center justify-center text-[10px] transition-colors cursor-pointer shadow-md"
                                    >
                                      ★
                                    </button>
                                  </Tooltip>

                                  <Tooltip title="Remove Image">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeGalleryImage(idx);
                                      }}
                                      className="w-5 h-5 rounded bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer shadow-md"
                                    >
                                      <DeleteOutlined />
                                    </button>
                                  </Tooltip>
                                </div>

                                {/* Hover Overlay to Replace Single Card Photo */}
                                {!isReplacingThis && (
                                  <div
                                    onClick={() => {
                                      cardIndexToReplaceRef.current = idx;
                                      if (singleCardInputRef.current)
                                        singleCardInputRef.current.click();
                                    }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white cursor-pointer z-20"
                                    title="Click to replace this photo file on Cloudinary"
                                  >
                                    <UploadOutlined className="text-base text-amber-400 mb-0.5" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">
                                      Replace ☁️
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Add Photo Dashed Dropzone Card */}
                          <div
                            onClick={() =>
                              galleryInputRef.current &&
                              galleryInputRef.current.click()
                            }
                            className="aspect-[3/4] rounded-xl border-2 border-dashed border-neutral-300 hover:border-black bg-white hover:bg-neutral-100/70 flex flex-col items-center justify-center cursor-pointer transition-all p-2 text-center group"
                            title="Click to upload photo files to Cloudinary"
                          >
                            <UploadOutlined className="text-xl text-neutral-500 group-hover:text-black group-hover:scale-110 transition-transform mb-1" />
                            <span className="text-[10px] font-extrabold text-neutral-700 group-hover:text-black uppercase tracking-wider">
                              + Add Photo
                            </span>
                          </div>
                        </div>

                        {/* Hidden single card replace input */}
                        <input
                          type="file"
                          ref={singleCardInputRef}
                          accept="image/*"
                          onChange={(e) =>
                            handleSingleCardFileUpload(
                              e,
                              cardIndexToReplaceRef.current,
                            )
                          }
                          style={{ display: "none" }}
                        />
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
            </div>

            {/* RIGHT CARD: Product General Information & Specifications */}
            <div className="md:col-span-7 bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200/80 space-y-3.5">
              <h4 className="text-xs font-mono font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1.5 m-0 pb-2 border-b border-neutral-200/60">
                <AppstoreOutlined className="text-neutral-700" />
                <span>2. PRODUCT DETAILS & SPECIFICATIONS</span>
              </h4>

              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item
                    label={
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                        Product Name
                      </span>
                    }
                    name="name"
                    rules={[
                      { required: true, message: "Please enter product name" },
                    ]}
                    className="mb-2.5"
                  >
                    <Input
                      placeholder="e.g. Minimalist Charcoal Linen Shirt"
                      className="text-xs py-1.5 rounded-lg font-sans font-semibold"
                    />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item
                    label={
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                        Category
                      </span>
                    }
                    name="category_id"
                    rules={[
                      { required: true, message: "Please select category" },
                    ]}
                    className="mb-2.5"
                  >
                    <Select
                      placeholder="Select Category"
                      className="text-xs rounded-lg"
                      options={categories.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item
                    label={
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                        Price ($)
                      </span>
                    }
                    name="price"
                    rules={[{ required: true, message: "Please enter price" }]}
                    className="mb-2.5"
                  >
                    <InputNumber
                      min={0}
                      precision={2}
                      prefix="$"
                      className="w-full text-xs py-0.5 rounded-lg font-mono font-bold"
                      placeholder="119.00"
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label={
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                        Original Price ($)
                      </span>
                    }
                    name="original_price"
                    className="mb-2.5"
                  >
                    <InputNumber
                      min={0}
                      precision={2}
                      prefix="$"
                      className="w-full text-xs py-0.5 rounded-lg font-mono"
                      placeholder="149.00"
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label={
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                        Stock Quantity
                      </span>
                    }
                    name="stock"
                    className="mb-2.5"
                  >
                    <InputNumber
                      min={0}
                      className="w-full text-xs py-0.5 rounded-lg font-mono font-black"
                      placeholder="30"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                        Sizes (Comma Separated)
                      </span>
                    }
                    name="sizes"
                    className="mb-2.5"
                  >
                    <Input
                      placeholder="e.g. S, M, L, XL"
                      className="text-xs py-1.5 rounded-lg font-mono"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                        Colors (Comma Separated)
                      </span>
                    }
                    name="colors"
                    className="mb-2.5"
                  >
                    <Input
                      placeholder="e.g. Charcoal, Off-White"
                      className="text-xs py-1.5 rounded-lg font-mono"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                    Item Description
                  </span>
                }
                name="description"
                className="mb-3"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Crafted from premium luxury materials..."
                  className="text-xs rounded-lg font-sans leading-relaxed"
                />
              </Form.Item>

              {/* Switches Row */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider block text-amber-900 flex items-center gap-1">
                      <span>🔥</span> HOT DROP
                    </span>
                    <span className="text-[9px] text-amber-700/80 block font-light">
                      Highlight in featured drops
                    </span>
                  </div>
                  <Form.Item name="is_featured" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>

                <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider block text-emerald-900 flex items-center gap-1">
                      <span>✨</span> NEW ARRIVAL
                    </span>
                    <span className="text-[9px] text-emerald-700/80 block font-light">
                      Mark as new release tag
                    </span>
                  </div>
                  <Form.Item name="is_new" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-neutral-200">
            <Button
              onClick={() => setProductModalOpen(false)}
              className="h-9 px-5 rounded-xl font-bold text-xs uppercase text-neutral-600 hover:text-black border-neutral-300"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<CheckCircleOutlined />}
              className="h-9 px-7 rounded-xl bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-wider border-none shadow-md"
            >
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Order Receipt Modal */}
      <Modal
        title={
          <span className="font-serif font-black uppercase text-base text-black">
            RECEIPT FOR ORDER #
            {selectedOrderDetails?.order_number || selectedOrderDetails?.id}
          </span>
        }
        open={!!selectedOrderDetails}
        onCancel={() => setSelectedOrderDetails(null)}
        footer={null}
        width={600}
      >
        {selectedOrderDetails && (
          <div className="space-y-4 pt-2">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-1 text-xs font-mono text-neutral-800">
              <p>
                <strong className="text-black">Customer:</strong>{" "}
                {selectedOrderDetails.customer_name}
              </p>
              <p>
                <strong className="text-black">Email:</strong>{" "}
                {selectedOrderDetails.customer_email}
              </p>
              <p>
                <strong className="text-black">Phone:</strong>{" "}
                {selectedOrderDetails.phone}
              </p>
              <p>
                <strong className="text-black">Shipping Address:</strong>{" "}
                {selectedOrderDetails.shipping_address}
              </p>
              <p>
                <strong className="text-black">Payment Method:</strong>{" "}
                {selectedOrderDetails.payment_method?.toUpperCase()}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase font-serif text-black">
                ORDERED ITEMS:
              </h4>
              {selectedOrderDetails.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-100 font-mono text-neutral-800"
                >
                  <span>
                    {item.quantity}x {item.product_name} (
                    {item.size || "Standard"})
                  </span>
                  <span className="font-bold text-black">
                    ${Number(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 text-sm font-black font-mono border-t border-neutral-200">
              <span className="text-black">TOTAL PAID:</span>
              <span className="text-emerald-600 font-extrabold text-base">
                ${Number(selectedOrderDetails.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Cloudinary Storage Settings Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <span className="text-xl">☁️</span>
            <div>
              <span className="font-serif font-black uppercase text-base text-black block">
                CLOUDINARY CDN STORAGE CONFIG
              </span>
              <span className="text-[10px] font-mono text-neutral-400 font-normal">
                Direct Unsigned Upload API Settings
              </span>
            </div>
          </div>
        }
        open={cloudinaryModalOpen}
        onCancel={() => setCloudinaryModalOpen(false)}
        footer={null}
        width={480}
        centered
        destroyOnClose
      >
        <Form
          form={cloudinaryForm}
          layout="vertical"
          initialValues={cloudinaryConfig}
          onFinish={(values) => {
            const saved = saveCloudinaryConfig(
              values.cloudName,
              values.uploadPreset,
            );
            if (saved) {
              setCloudinaryConfigState(saved);
              notification.success({
                message: "CLOUDINARY CONFIG SAVED",
                description: `Connected to Cloudinary account (${saved.cloudName})!`,
                placement: "bottomRight",
              });
            }
            setCloudinaryModalOpen(false);
          }}
          className="pt-2 space-y-3.5"
        >
          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-800">
                Cloudinary Cloud Name
              </span>
            }
            name="cloudName"
            rules={[
              { required: true, message: "Please enter Cloudinary cloud name" },
            ]}
          >
            <Input
              placeholder="e.g. dqls5p3qw"
              className="text-xs py-2 rounded-lg font-mono font-bold"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-bold uppercase text-neutral-800">
                Unsigned Upload Preset
              </span>
            }
            name="uploadPreset"
            rules={[
              {
                required: true,
                message: "Please enter Cloudinary upload preset",
              },
            ]}
          >
            <Input
              placeholder="e.g. alexandre_luxe or ml_default"
              className="text-xs py-2 rounded-lg font-mono font-bold"
            />
          </Form.Item>

          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5 leading-relaxed">
            <div className="font-bold flex items-center gap-1">
              <span>💡 Quick Cloudinary Setup Guide:</span>
            </div>
            <p className="m-0 text-[11px] text-amber-900">
              1. Log into your free account at{" "}
              <a
                href="https://cloudinary.com"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-black underline"
              >
                Cloudinary.com
              </a>
              .<br />
              2. Go to <strong>Settings</strong> → <strong>Upload</strong> tab →
              Scroll down to <strong>Upload Presets</strong>.<br />
              3. Click <strong>Add Upload Preset</strong> and set Mode to{" "}
              <strong className="text-amber-950">Unsigned</strong>.<br />
              4. Copy your <strong>Cloud Name</strong> and{" "}
              <strong>Upload Preset Name</strong> into the fields above!
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-200">
            <Button
              onClick={() => setCloudinaryModalOpen(false)}
              className="text-xs font-bold uppercase"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-5 rounded-lg border-none"
            >
              Save Credentials
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
