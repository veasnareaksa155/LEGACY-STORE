import React, { useState, useEffect } from "react";
import { ConfigProvider, notification } from "antd";
import { luxuryTheme, adminDarkTheme } from "./theme/antdTheme";
import { fetchCategories, fetchProducts } from "./services/api";

import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import CheckoutModal from "./components/CheckoutModal";
import OrderSuccessModal from "./components/OrderSuccessModal";
import AuthModal from "./components/AuthModal";
import AdminAuthModal from "./components/AdminAuthModal";
import Footer from "./components/Footer";
import CategoryBar from "./components/CategoryBar";
import ProductGrid from "./components/ProductGrid";

import DeliveryTrackingModal from "./components/DeliveryTrackingModal";
import LuxuryLoader from "./components/LuxuryLoader";

// Full View Pages
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import UserAccountPage from "./pages/UserAccountPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DeliveryDriverPage from "./pages/DeliveryDriverPage";
import NotFoundPage from "./pages/NotFoundPage";

notification.config({
  placement: "bottomRight",
  bottom: 24,
  duration: 3,
  rootClassName: "luxe-vip-notification",
});

function App() {
  // State variables (with instant 0ms local cache initialization)
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem("lx_cached_categories");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem("lx_cached_products");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => products.length === 0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // Multi-Page SPA View State ('home' | 'shop' | 'about' | 'lookbook' | 'contact' | 'account' | 'admin' | 'delivery' | '404')
  const [activePage, setActivePage] = useState("home");
  const [invalidRoutePath, setInvalidRoutePath] = useState("");

  // Modals & Drawers state
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleOpenProduct = (prod) => {
    if (!prod) return;
    setSelectedProduct(prod);
    setActivePage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [deliveryTrackingOpen, setDeliveryTrackingOpen] = useState(false);
  const [activeDeliveryOrder, setActiveDeliveryOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("legacy_last_paid_order");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const hasPaidOrder = !!activeDeliveryOrder;

  const [appliedPromo, setAppliedPromo] = useState(null);

  // Authenticated User Profile State (persisted in localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("alexandre_luxe_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userSessionRole, setUserSessionRole] = useState(() => {
    return currentUser?.role === "admin" ? "admin" : "user";
  });

  // Keep userSessionRole strictly synchronized with currentUser state
  useEffect(() => {
    setUserSessionRole(currentUser?.role === "admin" ? "admin" : "user");
  }, [currentUser]);

  // Save current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(
          "alexandre_luxe_user",
          JSON.stringify(currentUser),
        );
      } else {
        localStorage.removeItem("alexandre_luxe_user");
      }
    } catch (e) {
      console.error("Failed to save user:", e);
    }
  }, [currentUser]);

  // Cart & Wishlist storage keys per user
  const userCartKey = `alexandre_luxe_cart_${currentUser?.email || "guest"}`;
  const userWishlistKey = `alexandre_luxe_wishlist_${currentUser?.email || "guest"}`;

  // Cart Items State (persisted per user in localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(userCartKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist Items State (persisted per user in localStorage)
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(userWishlistKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Re-sync cart & wishlist when logged-in user changes
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(userCartKey);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);

      const savedWishlist = localStorage.getItem(userWishlistKey);
      setWishlistItems(savedWishlist ? JSON.parse(savedWishlist) : []);
    } catch (e) {
      console.error("Failed to re-sync cart/wishlist:", e);
    }
  }, [currentUser?.email]);

  // Save cart to localStorage per user
  useEffect(() => {
    try {
      localStorage.setItem(userCartKey, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [cartItems, userCartKey]);

  // Save wishlist to localStorage per user
  useEffect(() => {
    try {
      localStorage.setItem(userWishlistKey, JSON.stringify(wishlistItems));
    } catch (e) {
      console.error("Failed to save wishlist:", e);
    }
  }, [wishlistItems, userWishlistKey]);

  // Smooth scroll to top on view / page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activePage]);

  // IntersectionObserver for Silky Smooth Scroll Animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else if (
            entry.boundingClientRect.top >
            (window.innerHeight || document.documentElement.clientHeight)
          ) {
            // Only un-reveal if scrolled completely below the viewport
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -15px 0px" },
    );

    const selector =
      ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale";
    const revealElements = document.querySelectorAll(selector);
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, [products, loading, activeCategory, activePage]);

  // Load Categories & Products from Backend API
  const loadData = async () => {
    if (!products || products.length === 0) {
      setLoading(true);
    }
    try {
      const [catData, prodData] = await Promise.allSettled([
        fetchCategories(),
        fetchProducts(),
      ]);

      if (catData.status === "fulfilled" && catData.value) {
        setCategories(catData.value);
        try {
          localStorage.setItem(
            "lx_cached_categories",
            JSON.stringify(catData.value),
          );
        } catch (e) {}
      }

      if (prodData.status === "fulfilled" && prodData.value) {
        setProducts(prodData.value);
        try {
          localStorage.setItem(
            "lx_cached_products",
            JSON.stringify(prodData.value),
          );
        } catch (e) {}
      }
    } catch (error) {
      console.error("API Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cart operations with Strict Stock Validation
  const handleAddToCart = (
    product,
    quantity = 1,
    size = null,
    color = null,
  ) => {
    const itemSize = size || (product.sizes && product.sizes[0]) || "Standard";
    const itemColor =
      color || (product.colors && product.colors[0]) || "Standard";

    const availableStock =
      product.stock !== undefined && product.stock !== null
        ? Number(product.stock)
        : 50;

    let wasCapped = false;
    let addedQuantity = quantity;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) =>
          i.id === product.id && i.size === itemSize && i.color === itemColor,
      );

      const totalInCartForProduct = prevItems
        .filter((i) => i.id === product.id)
        .reduce((sum, i) => sum + i.quantity, 0);

      if (totalInCartForProduct >= availableStock) {
        wasCapped = true;
        addedQuantity = 0;
        return prevItems;
      }

      if (totalInCartForProduct + quantity > availableStock) {
        wasCapped = true;
        addedQuantity = availableStock - totalInCartForProduct;
      }

      if (addedQuantity <= 0) return prevItems;

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += addedQuantity;
        updated[existingIndex].stock = availableStock;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            size: itemSize,
            color: itemColor,
            quantity: addedQuantity,
            stock: availableStock,
          },
        ];
      }
    });

    if (addedQuantity <= 0) {
      notification.warning({
        message: "STOCK LIMIT REACHED",
        description: `Sorry, cannot add more. ${product.name} only has ${availableStock} units in stock.`,
        placement: "bottomRight",
        duration: 3,
      });
      return;
    }

    if (wasCapped) {
      notification.warning({
        message: "LIMITED STOCK ADJUSTED",
        description: `Added ${addedQuantity}x ${product.name} (Maximum available stock limit of ${availableStock} units reached).`,
        placement: "bottomRight",
        duration: 3,
      });
    } else {
      notification.success({
        message: "ADDED TO BAG",
        description: `${addedQuantity}x ${product.name} (${itemSize}) added to your shopping bag.`,
        placement: "bottomRight",
        duration: 2.5,
      });
    }
  };

  const handleBuyNow = (product, size, color) => {
    handleAddToCart(product, size, color, 1);
    if (!currentUser) {
      setAuthModalOpen(true);
      notification.info({
        message: "ACCOUNT REQUIRED TO CHECKOUT",
        description: "Please sign in or register to complete your instant VIP purchase.",
        placement: "bottomRight",
        duration: 3.5,
      });
    } else {
      setCheckoutOpen(true);
    }
  };

  const handleUpdateQuantity = (id, size, color, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id, size, color);
      return;
    }

    const matchedProduct = products.find((p) => p.id === id);
    const availableStock =
      matchedProduct &&
      matchedProduct.stock !== undefined &&
      matchedProduct.stock !== null
        ? Number(matchedProduct.stock)
        : 50;

    setCartItems((prev) => {
      const otherVariantsQty = prev
        .filter((i) => i.id === id && !(i.size === size && i.color === color))
        .reduce((sum, i) => sum + i.quantity, 0);

      const maxAllowed = Math.max(1, availableStock - otherVariantsQty);
      const cappedQty = Math.min(newQty, maxAllowed);

      if (newQty > maxAllowed) {
        notification.warning({
          message: "STOCK LIMIT REACHED",
          description: `Only ${availableStock} units of this item are available in stock.`,
          placement: "bottomRight",
          duration: 2.5,
        });
      }

      return prev.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity: cappedQty, stock: availableStock }
          : item,
      );
    });
  };

  const handleRemoveCartItem = (id, size, color) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id && item.size === size && item.color === color),
      ),
    );
  };

  const handleBulkRemoveCartItems = (selectedKeys) => {
    const keySet = new Set(selectedKeys);
    setCartItems((prev) =>
      prev.filter(
        (item) => !keySet.has(`${item.id}-${item.size}-${item.color}`),
      ),
    );
    notification.info({
      message: "ITEMS REMOVED",
      description: `${selectedKeys.length} items removed from your shopping bag.`,
      placement: "bottomRight",
      duration: 2,
    });
  };

  // Wishlist Operations
  const handleToggleWishlist = (product) => {
    const exists = wishlistItems.some((item) => item.id === product.id);
    if (exists) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
      notification.info({
        message: "REMOVED FROM WISHLIST",
        description: `${product.name} removed from your saved items.`,
        placement: "bottomRight",
        duration: 2,
      });
    } else {
      setWishlistItems((prev) => [...prev, product]);
      notification.success({
        message: "ADDED TO WISHLIST",
        description: `${product.name} saved to your wishlist.`,
        placement: "bottomRight",
        duration: 2,
      });
    }
  };

  const handleRemoveFromWishlist = (product) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
  };

  const handleBulkRemoveWishlist = (selectedIds) => {
    const idSet = new Set(selectedIds);
    setWishlistItems((prev) => prev.filter((item) => !idSet.has(item.id)));
    notification.info({
      message: "WISHLIST UPDATED",
      description: `${selectedIds.length} items removed from your wishlist.`,
      placement: "bottomRight",
      duration: 2,
    });
  };

  const totalCartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalWishlistCount = wishlistItems.length;

  const handleExploreCategory = (catKey) => {
    setActivePage("shop");
    setActiveCategory(catKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOrderSuccess = (order) => {
    setCheckoutOpen(false);
    setCartOpen(false);
    setCartItems([]);
    setOrderSuccessData(order);
    setActiveDeliveryOrder(order);
    try {
      localStorage.setItem("legacy_last_paid_order", JSON.stringify(order));
    } catch (e) {
      console.error("Failed to save paid order:", e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserSessionRole("user");
    try {
      localStorage.removeItem("alexandre_luxe_user");
    } catch (e) {
      console.error(e);
    }
    setActivePage("home");
    notification.info({
      message: "SIGNED OUT",
      description: "You have been signed out of your account.",
      placement: "bottomRight",
      duration: 2,
    });
  };

  // Route Listener for all valid routes & 404 handler
  useEffect(() => {
    const checkRoute = () => {
      const rawPath = window.location.pathname || "";
      const path = rawPath.toLowerCase();
      const search = (window.location.search || "").toLowerCase();

      // 1. Root / Home
      if (
        path === "/" ||
        path === "" ||
        path === "/home" ||
        path === "/home/"
      ) {
        setActivePage("home");
      }
      // 2. Shop / Catalog
      else if (
        path === "/shop" ||
        path === "/shop/" ||
        path === "/collections" ||
        path === "/collections/"
      ) {
        setActivePage("shop");
      }
      // 3. About
      else if (path === "/about" || path === "/about/") {
        setActivePage("about");
      }
      // 4. Contact
      else if (path === "/contact" || path === "/contact/") {
        setActivePage("contact");
      }
      // 5. Lookbook
      else if (path === "/lookbook" || path === "/lookbook/") {
        setActivePage("lookbook");
      }
      // 6. User Account / Profile
      else if (
        path === "/account" ||
        path === "/account/" ||
        path === "/profile" ||
        path === "/profile/" ||
        path === "/dashboard" ||
        path === "/dashboard/"
      ) {
        setActivePage("account");
      }
      // 7. Admin Executive Dashboard
      else if (path === "/admin" || path === "/admin/") {
        setActivePage("admin");
      }
      // 8. Delivery Driver App
      else if (path === "/delivery" || path === "/delivery/") {
        setActivePage("delivery");
      }
      // 9. Single Product Detail Page
      else if (path.startsWith("/product/") || search.includes("product=")) {
        const idMatch =
          path.match(/\/product\/(\d+)/) || search.match(/product=(\d+)/);
        if (idMatch && idMatch[1]) {
          const targetId = Number(idMatch[1]);
          if (products.length > 0) {
            const found = products.find((p) => p.id === targetId);
            if (found) {
              setSelectedProduct(found);
              setActivePage("product");
            } else {
              setInvalidRoutePath(rawPath);
              setActivePage("404");
            }
          }
        } else {
          setInvalidRoutePath(rawPath);
          setActivePage("404");
        }
      }
      // 10. Unknown / 404 Route
      else {
        setInvalidRoutePath(rawPath);
        setActivePage("404");
      }
    };
    checkRoute();
    window.addEventListener("popstate", checkRoute);
    return () => window.removeEventListener("popstate", checkRoute);
  }, [products]);

  // Sync browser URL bar with activePage state
  useEffect(() => {
    if (activePage === "delivery" && window.location.pathname !== "/delivery") {
      window.history.pushState({}, "", "/delivery");
    } else if (
      activePage === "admin" &&
      window.location.pathname !== "/admin"
    ) {
      window.history.pushState({}, "", "/admin");
    } else if (
      activePage === "product" &&
      selectedProduct &&
      window.location.pathname !== `/product/${selectedProduct.id}`
    ) {
      window.history.pushState({}, "", `/product/${selectedProduct.id}`);
    } else if (activePage === "shop" && window.location.pathname !== "/shop") {
      window.history.pushState({}, "", "/shop");
    } else if (activePage === "about" && window.location.pathname !== "/about") {
      window.history.pushState({}, "", "/about");
    } else if (
      activePage === "contact" &&
      window.location.pathname !== "/contact"
    ) {
      window.history.pushState({}, "", "/contact");
    } else if (
      activePage === "lookbook" &&
      window.location.pathname !== "/lookbook"
    ) {
      window.history.pushState({}, "", "/lookbook");
    } else if (
      activePage === "account" &&
      window.location.pathname !== "/account"
    ) {
      window.history.pushState({}, "", "/account");
    } else if (
      activePage === "home" &&
      window.location.pathname !== "/" &&
      window.location.pathname !== "/home"
    ) {
      window.history.pushState({}, "", "/");
    }
  }, [activePage, selectedProduct]);

  // Handle Mobile Delivery Driver App Layout (/delivery route)
  if (activePage === "delivery") {
    return (
      <ConfigProvider theme={luxuryTheme}>
        <DeliveryDriverPage onNavigateHome={() => setActivePage("home")} />
      </ConfigProvider>
    );
  }

  // Handle Admin Isolated Full-Screen Layout vs Store Customer Layout
  if (activePage === "admin") {
    const isVerifiedAdmin =
      currentUser &&
      currentUser.role === "admin" &&
      userSessionRole === "admin";

    if (isVerifiedAdmin) {
      return (
        <ConfigProvider theme={luxuryTheme}>
          <AdminDashboardPage
            products={products}
            categories={categories}
            onRefreshData={loadData}
            onNavigateStore={() => {
              loadData();
              setActivePage("home");
            }}
            onLogout={handleLogout}
          />
        </ConfigProvider>
      );
    } else if (currentUser && currentUser.role !== "admin") {
      // Normal customer is signed in, but visiting /admin - Deny access
      return (
        <ConfigProvider theme={luxuryTheme}>
          <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black opacity-95" />
            <div className="relative z-20 w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-4">
                <CrownOutlined className="text-2xl" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-red-400 block mb-1">
                403 • ACCESS RESTRICTED
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black uppercase text-white mb-2">
                SUPERADMIN REQUIRED
              </h2>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                You are currently signed in as <strong className="text-white">{currentUser.name || currentUser.email}</strong>. This executive portal is strictly restricted to verified Maison Administrators.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActivePage("home");
                    window.history.pushState({}, "", "/");
                  }}
                  className="w-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Return to Boutique
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white font-semibold text-xs py-2.5 rounded-xl border border-neutral-700/60 transition-all cursor-pointer"
                >
                  Sign Out / Switch Account
                </button>
              </div>
            </div>
          </div>
        </ConfigProvider>
      );
    } else {
      // Unauthenticated visitor: Render Secure Admin Login Gateway (strictly validated)
      return (
        <ConfigProvider theme={luxuryTheme}>
          <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Ambient Dark Luxury Background Layer */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-zinc-950 to-black opacity-95" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay opacity-15 filter blur-xs" />

            {/* Header Brand Bar */}
            <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-serif font-black tracking-[0.25em] uppercase text-white">
                  LEGACY STORE
                </span>
                <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-extrabold tracking-wider">
                  EXECUTIVE PORTAL
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full border border-neutral-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                SECURE AUTHENTICATION GATEWAY
              </span>
            </div>

            <div className="relative z-20 w-full max-w-md">
              <AdminAuthModal
                open={true}
                onClose={() => {
                  setActivePage("home");
                  window.history.pushState({}, "", "/");
                }}
                onLoginSuccess={(userData) => {
                  setCurrentUser(userData);
                  setUserSessionRole("admin");
                  setActivePage("admin");
                }}
              />
            </div>
          </div>
        </ConfigProvider>
      );
    }
  }

  return (
    <ConfigProvider theme={luxuryTheme}>
      <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col font-sans selection:bg-black selection:text-white relative justify-between pb-16 md:pb-0">
        {loading && <LuxuryLoader fullScreen text="LEGACY" />}
        {/* Header Navigation Bar */}
        <Navbar
          cartCount={totalCartCount}
          onOpenCart={() => setCartOpen(true)}
          wishlistCount={totalWishlistCount}
          onOpenWishlist={() => setWishlistOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activePage={activePage}
          userRole={userSessionRole}
          user={currentUser}
          onNavigatePage={(pageKey) => {
            setActivePage(pageKey);
            if (pageKey === "shop") {
              setActiveCategory("all");
            }
          }}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenDeliveryTracking={() => setDeliveryTrackingOpen(true)}
          hasPaidOrder={hasPaidOrder}
        />

        {/* Main Content Area */}
        <main className="flex-grow">
          {activePage === "home" && (
            <HomePage
              products={products}
              loading={loading}
              onQuickView={handleOpenProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              wishlistItems={wishlistItems}
              onToggleWishlist={handleToggleWishlist}
              onExploreCategory={handleExploreCategory}
              onNavigatePage={setActivePage}
            />
          )}

          {activePage === "shop" && (
            <ShopPage
              categories={categories}
              products={products}
              loading={loading}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onQuickView={handleOpenProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              wishlistItems={wishlistItems}
              onToggleWishlist={handleToggleWishlist}
            />
          )}

          {activePage === "product" && (
            <ProductDetailPage
              product={selectedProduct}
              allProducts={products}
              onNavigateBack={() => setActivePage("shop")}
              onNavigateShop={() => {
                setActivePage("shop");
                setActiveCategory("all");
              }}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              isWishlisted={
                selectedProduct
                  ? wishlistItems.some((i) => i.id === selectedProduct.id)
                  : false
              }
              onToggleWishlist={handleToggleWishlist}
              onSelectProduct={handleOpenProduct}
              currentUser={currentUser}
              wishlistItems={wishlistItems}
            />
          )}

          {activePage === "about" && (
            <AboutPage onNavigateHome={() => setActivePage("home")} />
          )}

          {activePage === "contact" && <ContactPage />}

          {(activePage === "account" || activePage === "dashboard") && (
            <UserAccountPage
              user={currentUser}
              onNavigateAdmin={() => setActivePage("admin")}
              onUpdateProfile={(updated) => setCurrentUser(updated)}
              onLogout={handleLogout}
              wishlistItems={wishlistItems}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onRemoveFromWishlist={handleRemoveFromWishlist}
              onQuickView={handleOpenProduct}
              onNavigateShop={() => setActivePage("shop")}
              onOpenDeliveryTracking={(ord) => {
                if (ord) setActiveDeliveryOrder(ord);
                setDeliveryTrackingOpen(true);
              }}
            />
          )}

          {activePage === "404" && (
            <NotFoundPage
              invalidPath={invalidRoutePath}
              onNavigateHome={() => {
                setActivePage("home");
                window.history.pushState({}, "", "/");
              }}
              onNavigateShop={() => {
                setActivePage("shop");
                window.history.pushState({}, "", "/shop");
              }}
              onNavigateContact={() => {
                setActivePage("contact");
                window.history.pushState({}, "", "/contact");
              }}
            />
          )}
        </main>

        {/* Auth Modal (Login for Client VIP / Admin Dashboard) */}
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={(userData) => {
            setCurrentUser(userData);
            setUserSessionRole(userData.role);
            if (userData.role === "admin") {
              setActivePage("admin");
            } else if (cartItems.length > 0) {
              setCheckoutOpen(true);
            } else {
              setActivePage("account");
            }
          }}
        />

        {/* Cart Drawer */}
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveCartItem}
          onBulkRemoveItems={handleBulkRemoveCartItems}
          onProceedToCheckout={(promoObj) => {
            setCartOpen(false);
            setAppliedPromo(promoObj);
            if (!currentUser) {
              setAuthModalOpen(true);
              notification.info({
                message: "ACCOUNT REQUIRED TO CHECKOUT",
                description:
                  "Please sign in or register your account before checkout so we can process delivery.",
                placement: "bottomRight",
                duration: 4,
              });
              return;
            }
            setCheckoutOpen(true);
          }}
        />

        {/* Wishlist Drawer */}
        <WishlistDrawer
          open={wishlistOpen}
          onClose={() => setWishlistOpen(false)}
          wishlistItems={wishlistItems}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onBulkRemoveWishlist={handleBulkRemoveWishlist}
          onAddToCart={handleAddToCart}
        />

        {/* Checkout Modal */}
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          cartItems={cartItems}
          onOrderSuccess={handleOrderSuccess}
          currentUser={currentUser}
          appliedPromo={appliedPromo}
        />

        {/* Order Success Modal */}
        <OrderSuccessModal
          open={!!orderSuccessData}
          onClose={() => setOrderSuccessData(null)}
          orderData={orderSuccessData}
          onOpenDeliveryTracking={(ord) => {
            if (ord) setActiveDeliveryOrder(ord);
            setDeliveryTrackingOpen(true);
          }}
        />

        {/* Real Delivery Tracking Modal */}
        <DeliveryTrackingModal
          open={deliveryTrackingOpen}
          onClose={() => setDeliveryTrackingOpen(false)}
          order={activeDeliveryOrder}
          onNavigateDriverApp={() => {
            setDeliveryTrackingOpen(false);
            setActivePage("delivery");
          }}
        />

        {/* Footer */}
        <div className="scroll-reveal">
          <Footer
            onSelectCategory={(catKey) => {
              setActivePage("shop");
              setActiveCategory(catKey);
            }}
            onNavigatePage={setActivePage}
          />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
