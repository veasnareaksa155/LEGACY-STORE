import React, { useState } from "react";
import { Badge, Drawer, Input } from "antd";
import {
  ShoppingOutlined,
  SearchOutlined,
  MenuOutlined,
  CloseOutlined,
  HeartOutlined,
  HomeOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
  CameraOutlined,
  MailOutlined,
  UserOutlined,
  CrownOutlined,
  LeftOutlined,
  CarOutlined,
} from "@ant-design/icons";

const Navbar = ({
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
  activePage,
  userRole,
  user,
  onNavigatePage,
  onOpenAuthModal,
  onLogout,
  onOpenDeliveryTracking,
  hasPaidOrder = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [navSearch, setNavSearch] = useState(searchQuery || "");

  // Sync navSearch if searchQuery is cleared externally
  React.useEffect(() => {
    if (!searchQuery) {
      setNavSearch("");
    }
  }, [searchQuery]);

  const handleHomeClick = () => {
    onNavigatePage("home");
    setMobileMenuOpen(false);
    setShowSearchMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShopClick = () => {
    onNavigatePage("shop");
    setMobileMenuOpen(false);
    setShowSearchMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageClick = (pageKey) => {
    onNavigatePage(pageKey);
    setMobileMenuOpen(false);
    setShowSearchMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setNavSearch(val);
    onSearchChange(val);
    if (val && activePage !== "shop") {
      onNavigatePage("shop");
    }
  };

  const handleClearNavbarSearch = () => {
    setNavSearch("");
    onSearchChange("");
    setShowSearchMobile(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all duration-300">
        {/* Top Announcement Banner (Desktop / Tablet) */}
        <div className="hidden sm:block bg-black text-white text-xs py-2 px-4 text-center font-medium tracking-widest uppercase">
          <span>
            ✨ Free Worldwide Express Shipping on Orders Over $200 | Legacy
            Store
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ========================================================= */}
          {/* MOBILE HEADER LAYOUT (< md screen) */}
          {/* Left: Menu Icon | Center: Logo | Right: Shop Cart Icon */}
          {/* ========================================================= */}
          <div className="flex md:hidden items-center justify-between h-16 relative">
            {/* Left: Hamburger Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 rounded-full bg-neutral-100 text-black hover:bg-neutral-200 transition-colors flex items-center justify-center border border-neutral-200 shadow-xs cursor-pointer"
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <MenuOutlined style={{ fontSize: "18px" }} />
            </button>

            {/* Center: Centered Legacy Store Logo */}
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer gap-2.5"
              onClick={handleHomeClick}
            >
              <img
                src="/images/LOGO.png"
                alt="Legacy Store"
                className="h-10 sm:h-12 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span className="font-serif text-xl sm:text-2xl tracking-[0.2em] uppercase font-black text-black whitespace-nowrap">
                LEGACY
              </span>
            </div>

            {/* Right: Just Shopping Bag Button */}
            <button
              onClick={onOpenCart}
              className="relative w-10 h-10 bg-black text-white rounded-full hover:bg-neutral-800 transition-all flex items-center justify-center shadow-sm cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <Badge
                count={cartCount}
                showZero={false}
                overflowCount={99}
                color="#ffffff"
                style={{ color: "#000000", fontWeight: "bold" }}
              >
                <ShoppingOutlined
                  style={{ fontSize: "18px", color: "#ffffff" }}
                />
              </Badge>
            </button>
          </div>

          {/* ========================================================= */}
          {/* DESKTOP HEADER LAYOUT (>= md screen) */}
          {/* ========================================================= */}
          <div className="hidden md:grid grid-cols-3 items-center h-20">
            {/* Left Navigation (Desktop Site Pages) */}
            <nav className="flex items-center space-x-5 xl:space-x-7 justify-start">
              <button
                onClick={handleHomeClick}
                className={`text-xs font-bold tracking-[0.15em] uppercase py-1 cursor-pointer transition-colors duration-300 relative inline-block whitespace-nowrap ${
                  activePage === "home"
                    ? "text-black after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-0.5 after:bg-black"
                    : "text-neutral-500 hover:text-black after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 hover:after:w-full after:h-0.5 after:bg-black after:transition-all after:duration-300"
                }`}
              >
                HOME
              </button>

              <button
                onClick={handleShopClick}
                className={`text-xs font-bold tracking-[0.15em] uppercase py-1 cursor-pointer transition-colors duration-300 relative inline-block whitespace-nowrap ${
                  activePage === "shop"
                    ? "text-black after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-0.5 after:bg-black"
                    : "text-neutral-500 hover:text-black after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 hover:after:w-full after:h-0.5 after:bg-black after:transition-all after:duration-300"
                }`}
              >
                SHOP & COLLECTIONS
              </button>

              <button
                onClick={() => handlePageClick("about")}
                className={`text-xs font-bold tracking-[0.15em] uppercase py-1 cursor-pointer transition-colors duration-300 relative inline-block whitespace-nowrap ${
                  activePage === "about"
                    ? "text-black after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-0.5 after:bg-black"
                    : "text-neutral-500 hover:text-black after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 hover:after:w-full after:h-0.5 after:bg-black after:transition-all after:duration-300"
                }`}
              >
                ABOUT
              </button>

              <button
                onClick={() => handlePageClick("contact")}
                className={`text-xs font-bold tracking-[0.15em] uppercase py-1 cursor-pointer transition-colors duration-300 relative inline-block whitespace-nowrap ${
                  activePage === "contact"
                    ? "text-black after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-0.5 after:bg-black"
                    : "text-neutral-500 hover:text-black after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 hover:after:w-full after:h-0.5 after:bg-black after:transition-all after:duration-300"
                }`}
              >
                CONTACT
              </button>
            </nav>

            {/* Center Brand Logo (Desktop) */}
            <div
              className="flex items-center justify-center cursor-pointer gap-3.5 group"
              onClick={handleHomeClick}
            >
              <img
                src="/images/LOGO.png"
                alt="Legacy Store"
                className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-[0.25em] uppercase font-black text-black whitespace-nowrap border-l-2 sm:border-l-3 border-black/80 pl-3.5 py-0.5 leading-none transition-transform duration-300 group-hover:scale-105">
                LEGACY
              </span>
            </div>

            {/* Right Actions (Desktop) */}
            <div className="flex items-center justify-end space-x-2.5 sm:space-x-3">
              {/* Desktop Search Bar */}
              <div className="relative flex items-center shrink-0">
                {/* Floating Search Bar (Slides out gracefully to the left without squishing icons) */}
                <div
                  className={`absolute right-12 top-1/2 -translate-y-1/2 z-30 transition-all duration-300 ease-out flex items-center ${
                    showSearchMobile
                      ? "w-52 sm:w-64 opacity-100 scale-100 pointer-events-auto"
                      : "w-0 opacity-0 scale-95 pointer-events-none overflow-hidden"
                  }`}
                >
                  <Input
                    placeholder="Search luxury products..."
                    prefix={
                      <SearchOutlined className="text-neutral-400 mr-1" />
                    }
                    suffix={
                      <button
                        onClick={handleClearNavbarSearch}
                        className="text-neutral-400 hover:text-black transition-colors flex items-center justify-center p-0.5 cursor-pointer"
                        title="Close search"
                      >
                        <CloseOutlined
                          style={{ fontSize: "12px", color: "#666" }}
                        />
                      </button>
                    }
                    value={navSearch}
                    onChange={handleSearchInputChange}
                    className="w-full text-sm sm:text-xs !rounded-full border-neutral-300 py-2 sm:py-1.5 pl-3.5 pr-2.5 shadow-lg bg-white hover:border-black focus:border-black transition-all h-10"
                    autoFocus={showSearchMobile}
                  />
                </div>

                <button
                  onClick={() => setShowSearchMobile(!showSearchMobile)}
                  className={`w-10 h-10 shrink-0 aspect-square rounded-full border transition-all duration-300 flex items-center justify-center shadow-xs cursor-pointer ${
                    showSearchMobile
                      ? "text-black bg-neutral-100 border-black"
                      : "text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 border-neutral-200 hover:border-black"
                  }`}
                  aria-label="Search items"
                  title="Search items"
                >
                  <SearchOutlined style={{ fontSize: "17px" }} />
                </button>
              </div>

              {/* Account Button (Desktop) */}
              <button
                onClick={() => {
                  if (user && (user.role === "admin" || userRole === "admin")) {
                    onNavigatePage("admin");
                  } else if (user) {
                    onNavigatePage("account");
                  } else if (onOpenAuthModal) {
                    onOpenAuthModal();
                  } else {
                    handlePageClick("account");
                  }
                }}
                className={`w-10 h-10 shrink-0 aspect-square p-0 rounded-full flex items-center justify-center border transition-all duration-300 leading-none shadow-xs font-serif font-bold text-sm cursor-pointer overflow-hidden ${
                  activePage === "account" || activePage === "admin"
                    ? "bg-black text-white border-black"
                    : user
                      ? "bg-neutral-900 text-white border-black hover:bg-neutral-800"
                      : "bg-neutral-100 text-black border-neutral-200 hover:bg-neutral-200 hover:border-black"
                }`}
                aria-label="User Account Portal"
                title={
                  user?.role === "admin"
                    ? `Logged in as ${user.name} - View Admin Dashboard`
                    : user
                      ? `Logged in as ${user.name} - View VIP Account`
                      : "Sign In or Register VIP Account"
                }
              >
                {user && (user.avatar || user.avatar_url) ? (
                  <img
                    src={user.avatar || user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : user && user.name ? (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <UserOutlined style={{ fontSize: "17px" }} />
                )}
              </button>

              {/* Delivery Tracker Button (Desktop - Only Shown After User Payout) */}
              {hasPaidOrder && (
                <button
                  onClick={onOpenDeliveryTracking}
                  className="relative w-10 h-10 shrink-0 aspect-square p-0 bg-amber-500 hover:bg-amber-400 text-black rounded-full transition-all duration-300 flex items-center justify-center border border-amber-600 shadow-md leading-none cursor-pointer group"
                  title="Track Live Delivery 🚚"
                  aria-label="Track Live Delivery"
                >
                  <CarOutlined style={{ fontSize: "18px", color: "#000000" }} />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600"></span>
                  </span>
                </button>
              )}

              {/* Wishlist Button (Desktop) */}
              <button
                onClick={onOpenWishlist}
                className="relative w-10 h-10 shrink-0 aspect-square p-0 bg-neutral-100 text-black rounded-full hover:bg-neutral-200 border border-neutral-200 hover:border-black transition-all duration-300 flex items-center justify-center shadow-xs leading-none cursor-pointer"
                aria-label="View Wishlist"
                title="View Wishlist"
              >
                <Badge
                  count={wishlistCount}
                  showZero={false}
                  overflowCount={99}
                  color="#000000"
                  style={{ color: "#ffffff", fontWeight: "bold" }}
                >
                  <HeartOutlined
                    style={{ fontSize: "18px", color: "#000000" }}
                  />
                </Badge>
              </button>

              {/* Cart Button (Desktop) */}
              <button
                onClick={onOpenCart}
                className="relative w-10 h-10 shrink-0 aspect-square p-0 bg-black text-white rounded-full hover:bg-neutral-800 border border-black transition-all duration-300 flex items-center justify-center shadow-xs leading-none cursor-pointer"
                aria-label="View Shopping Cart"
                title="View Shopping Cart"
              >
                <Badge
                  count={cartCount}
                  showZero={false}
                  overflowCount={99}
                  color="#ffffff"
                  style={{ color: "#000000", fontWeight: "bold" }}
                >
                  <ShoppingOutlined
                    style={{ fontSize: "19px", color: "#ffffff" }}
                  />
                </Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay Bar */}
        {showSearchMobile && (
          <div className="md:hidden bg-neutral-50 px-4 py-2.5 border-t border-neutral-200 shadow-inner flex items-center gap-2">
            <Input
              placeholder="Search luxury products..."
              prefix={<SearchOutlined className="text-neutral-400 mr-1" />}
              suffix={
                <button
                  onClick={handleClearNavbarSearch}
                  className="text-neutral-400 hover:text-black p-1 cursor-pointer"
                >
                  <CloseOutlined style={{ fontSize: "12px" }} />
                </button>
              }
              value={navSearch}
              onChange={handleSearchInputChange}
              className="w-full text-xs rounded-full py-1.5 border-neutral-300 focus:border-black"
              autoFocus
            />
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* NATIVE APP-STYLE MOBILE BOTTOM NAVIGATION BAR (< md) */}
      {/* ========================================================= */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-neutral-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around transition-all">
        {/* 1. Home */}
        <button
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            activePage === "home"
              ? "text-black font-extrabold"
              : "text-neutral-400 hover:text-neutral-700 font-medium"
          }`}
        >
          <HomeOutlined style={{ fontSize: "19px" }} />
          <span className="text-[9px] font-mono uppercase tracking-wider mt-0.5">
            HOME
          </span>
        </button>

        {/* 2. Shop */}
        <button
          onClick={handleShopClick}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            activePage === "shop"
              ? "text-black font-extrabold"
              : "text-neutral-400 hover:text-neutral-700 font-medium"
          }`}
        >
          <AppstoreOutlined style={{ fontSize: "19px" }} />
          <span className="text-[9px] font-mono uppercase tracking-wider mt-0.5">
            SHOP
          </span>
        </button>

        {/* 3. Search */}
        <button
          onClick={() => {
            if (activePage !== "shop") handleShopClick();
            setShowSearchMobile((prev) => !prev);
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            showSearchMobile
              ? "text-black font-extrabold"
              : "text-neutral-400 hover:text-neutral-700 font-medium"
          }`}
        >
          <SearchOutlined style={{ fontSize: "19px" }} />
          <span className="text-[9px] font-mono uppercase tracking-wider mt-0.5">
            SEARCH
          </span>
        </button>

        {/* 4. Wishlist */}
        <button
          onClick={onOpenWishlist}
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors text-neutral-400 hover:text-neutral-700 cursor-pointer font-medium"
        >
          <Badge
            count={wishlistCount}
            showZero={false}
            overflowCount={99}
            color="#000000"
            size="small"
            style={{ color: "#ffffff", fontWeight: "bold" }}
          >
            <HeartOutlined style={{ fontSize: "19px", color: "inherit" }} />
          </Badge>
          <span className="text-[9px] font-mono uppercase tracking-wider mt-0.5">
            WISHLIST
          </span>
        </button>

        {/* 5. Account / Admin */}
        <button
          onClick={() => {
            if (user && (user.role === "admin" || userRole === "admin")) {
              onNavigatePage("admin");
            } else if (user) {
              onNavigatePage("account");
            } else if (onOpenAuthModal) {
              onOpenAuthModal();
            } else {
              handlePageClick("account");
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            activePage === "account" || activePage === "admin"
              ? "text-black font-extrabold"
              : "text-neutral-400 hover:text-neutral-700 font-medium"
          }`}
        >
          {user && (user.role === "admin" || userRole === "admin") ? (
            <CrownOutlined style={{ fontSize: "19px", color: "#d4af37" }} />
          ) : (
            <UserOutlined style={{ fontSize: "19px" }} />
          )}
          <span className="text-[9px] font-mono uppercase tracking-wider mt-0.5">
            {user ? (user.role === "admin" ? "ADMIN" : "ACCOUNT") : "LOGIN"}
          </span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* MOBILE SIDE DRAWER MENU (CLEAN DESIGN MATCHING REFERENCE) */}
      {/* ========================================================= */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-1">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={handleHomeClick}
            >
              <img
                src="/images/LOGO.png"
                alt="Logo"
                className="h-9 sm:h-10 w-auto object-contain"
              />
              <span className="font-serif text-lg sm:text-xl font-black tracking-widest uppercase text-black">
                LEGACY
              </span>
            </div>
            {/* Custom Close Icon Button < */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-neutral-800 flex items-center justify-center transition-all cursor-pointer border border-neutral-200 shadow-xs shrink-0"
              title="Close Menu"
              aria-label="Close Menu"
            >
              <LeftOutlined className="text-xs font-bold" />
            </button>
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={310}
        closeIcon={false}
        maskStyle={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.45)",
        }}
        styles={{
          mask: {
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            backgroundColor: "rgba(0, 0, 0, 0.45)",
          },
        }}
      >
        <div className="flex flex-col justify-between h-full pt-2 pb-3">
          <div>
            {/* Top User Profile Card (High-Contrast Professional Luxury Style) */}
            <div className="mb-4">
              {user ? (
                <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-black text-white p-3.5 rounded-2xl border border-neutral-800 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-neutral-800 border-2 border-amber-500/60 text-amber-400 font-serif font-extrabold text-base flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)] overflow-hidden">
                      {user.avatar || user.avatar_url ? (
                        <img
                          src={user.avatar || user.avatar_url}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-extrabold text-white truncate leading-tight">
                        {user.name}
                      </h4>
                      <div className="mt-1 flex items-center gap-1.5">
                        {user.role === "admin" || userRole === "admin" ? (
                          <span className="bg-amber-500 text-black text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded shadow-xs">
                            ⚡ SUPERADMIN
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                            ✨ VIP CLIENTELE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-900 text-white p-3.5 rounded-2xl border border-neutral-800 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center shrink-0">
                      <UserOutlined className="text-base text-neutral-300" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-white">
                        Maison Legacy
                      </h4>
                      <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded inline-block mt-0.5 font-semibold">
                        GUEST CLIENT
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Drawer Dedicated Search Bar */}
            <div className="mb-3.5">
              <Input
                placeholder="Search products in shop..."
                prefix={<SearchOutlined className="text-neutral-400 mr-1.5" />}
                value={navSearch}
                onChange={handleSearchInputChange}
                onPressEnter={() => {
                  setMobileMenuOpen(false);
                  if (activePage !== "shop") onNavigatePage("shop");
                }}
                allowClear
                className="w-full text-base sm:text-xs rounded-xl border-neutral-300 py-2.5 px-3 bg-neutral-50 hover:bg-white hover:border-black focus:border-black transition-all shadow-2xs h-11"
              />
            </div>

            {/* Navigation Menu List with Professional Vivid Accents */}
            <div className="space-y-2">
              <button
                onClick={handleHomeClick}
                className={`w-full text-left text-xs sm:text-sm font-extrabold tracking-wide py-3 px-3.5 rounded-xl flex items-center cursor-pointer transition-all ${
                  activePage === "home"
                    ? "bg-black text-white shadow-md border border-neutral-800"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                }`}
              >
                <HomeOutlined
                  className={`text-base mr-3 ${activePage === "home" ? "text-amber-400" : "text-amber-600"}`}
                />
                <span>Home</span>
              </button>

              <button
                onClick={handleShopClick}
                className={`w-full text-left text-xs sm:text-sm font-extrabold tracking-wide py-3 px-3.5 rounded-xl flex items-center cursor-pointer transition-all ${
                  activePage === "shop"
                    ? "bg-black text-white shadow-md border border-neutral-800"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                }`}
              >
                <AppstoreOutlined
                  className={`text-base mr-3 ${activePage === "shop" ? "text-amber-400" : "text-amber-600"}`}
                />
                <span>Shop & Collections</span>
              </button>

              {/* Sub-category list with colorful badges */}
              <div className="pl-4 py-1 space-y-1.5 ml-3 border-l-2 border-neutral-200">
                <button
                  onClick={() => handlePageClick("shop")}
                  className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-black py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between cursor-pointer"
                >
                  <span>👔 Shirts & Tailoring</span>
                  <span className="bg-amber-100 text-amber-900 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                    NEW
                  </span>
                </button>
                <button
                  onClick={() => handlePageClick("shop")}
                  className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-black py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between cursor-pointer"
                >
                  <span>👕 T-Shirts & Heavyweight Tees</span>
                  <span className="bg-red-100 text-red-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                    HOT
                  </span>
                </button>
                <button
                  onClick={() => handlePageClick("shop")}
                  className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-black py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between cursor-pointer"
                >
                  <span>👟 Luxury Footwear & Sneakers</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                    POPULAR
                  </span>
                </button>
              </div>

              <button
                onClick={() => handlePageClick("lookbook")}
                className={`w-full text-left text-xs sm:text-sm font-extrabold tracking-wide py-3 px-3.5 rounded-xl flex items-center cursor-pointer transition-all ${
                  activePage === "lookbook"
                    ? "bg-black text-white shadow-md border border-neutral-800"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                }`}
              >
                <CameraOutlined
                  className={`text-base mr-3 ${activePage === "lookbook" ? "text-amber-400" : "text-emerald-600"}`}
                />
                <span>Lookbook & Models</span>
              </button>

              <button
                onClick={() => handlePageClick("about")}
                className={`w-full text-left text-xs sm:text-sm font-extrabold tracking-wide py-3 px-3.5 rounded-xl flex items-center cursor-pointer transition-all ${
                  activePage === "about"
                    ? "bg-black text-white shadow-md border border-neutral-800"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                }`}
              >
                <InfoCircleOutlined
                  className={`text-base mr-3 ${activePage === "about" ? "text-amber-400" : "text-blue-600"}`}
                />
                <span>About Our Maison</span>
              </button>

              <button
                onClick={() => handlePageClick("contact")}
                className={`w-full text-left text-xs sm:text-sm font-extrabold tracking-wide py-3 px-3.5 rounded-xl flex items-center cursor-pointer transition-all ${
                  activePage === "contact"
                    ? "bg-black text-white shadow-md border border-neutral-800"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                }`}
              >
                <MailOutlined
                  className={`text-base mr-3 ${activePage === "contact" ? "text-amber-400" : "text-rose-600"}`}
                />
                <span>Contact Concierge</span>
              </button>
            </div>
          </div>

          {/* Bottom Account & Concierge Action Footer */}
          <div className="pt-3 border-t border-neutral-200 space-y-2.5">
            {user ? (
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user.role === "admin" || userRole === "admin") {
                      onNavigatePage("admin");
                    } else {
                      onNavigatePage("account");
                    }
                  }}
                  className="text-xs font-extrabold text-black hover:text-neutral-700 flex items-center gap-2 cursor-pointer py-1 px-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  <UserOutlined className="text-amber-600" />
                  <span>My Account</span>
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-xs font-extrabold text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded-lg border border-red-200 transition-all cursor-pointer"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full bg-gradient-to-r from-neutral-900 to-black text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border border-neutral-800"
              >
                <UserOutlined className="text-amber-400 text-sm" />
                <span>Sign In / Join VIP</span>
              </button>
            )}

            <div className="text-center pt-1">
              <p className="text-[10px] text-neutral-400 font-mono">
                ✉️ concierge@legacystore.com • Paris
              </p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Navbar;
