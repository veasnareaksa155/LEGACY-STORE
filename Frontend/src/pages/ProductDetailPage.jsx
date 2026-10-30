import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LeftOutlined,
  RightOutlined,
  DownOutlined,
  HeartOutlined,
  HeartFilled,
  ShoppingOutlined,
  StarFilled,
  CheckOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  CarOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  ZoomInOutlined,
  CloseOutlined,
  EditOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { Rate, message, Tooltip, Modal } from "antd";
import { parseGalleryUrls } from "../services/cloudinary";
import { fetchProductReviews, submitProductReview } from "../services/api";

const ProductDetailPage = ({
  product,
  allProducts = [],
  onNavigateBack,
  onNavigateShop,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
  onSelectProduct,
  currentUser,
}) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Rating & Review State
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userName, setUserName] = useState("");
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveRating, setLiveRating] = useState(null);
  const [liveReviewsCount, setLiveReviewsCount] = useState(null);

  const reviewsSectionRef = useRef(null);
  const thumbnailsContainerRef = useRef(null);

  // Color mapping dictionary for visual color swatch circles
  const colorMap = {
    black: "#171717",
    white: "#FFFFFF",
    charcoal: "#36454F",
    burgundy: "#6b1d2f",
    navy: "#0a192f",
    emerald: "#0d5c3a",
    gold: "#d4af37",
    beige: "#e8e0d5",
    gray: "#6b7280",
    grey: "#6b7280",
    red: "#991b1b",
    blue: "#1e3a8a",
    brown: "#4a2e1b",
    tan: "#d2b48c",
    "black/white": "#171717",
  };

  // Dynamic user-uploaded multi-angle gallery array (Front + Gallery Angle Images)
  const productAngleGallery = useMemo(() => {
    if (!product) return [];
    const mainImg = product.image_url;
    const galleryUrls = parseGalleryUrls(product.gallery);
    const items = [];

    if (mainImg) {
      items.push({ id: "front", label: "COVER PHOTO", url: mainImg });
    }

    galleryUrls.forEach((gUrl, idx) => {
      if (gUrl && gUrl !== mainImg && !items.some((it) => it.url === gUrl)) {
        items.push({
          id: `angle-${idx + 1}`,
          label: `ANGLE ${idx + 2}`,
          url: gUrl,
        });
      }
    });

    if (items.length === 1 && mainImg) {
      items.push({
        id: "detail",
        label: "FABRIC DETAIL",
        url: mainImg,
        isZoom: true,
      });
    }

    return items;
  }, [product]);

  // Map colors to uploaded apparel photos
  const getColorImageUrl = (colorName, defaultImg) => {
    if (!colorName) return defaultImg || product?.image_url;
    const colTrimmed = colorName.trim();
    const colLower = colTrimmed.toLowerCase();

    // 1. Explicit color_images mapping saved in product catalog
    if (product?.color_images && typeof product.color_images === "object") {
      if (product.color_images[colTrimmed]) {
        return product.color_images[colTrimmed];
      }
      const matchedKey = Object.keys(product.color_images).find(
        (k) => k.trim().toLowerCase() === colLower,
      );
      if (matchedKey && product.color_images[matchedKey]) {
        return product.color_images[matchedKey];
      }
    }

    // 2. Check all uploaded images for filename/URL match with color name
    const allGalleryUrls = (productAngleGallery || [])
      .map((item) => item.url)
      .filter(Boolean);

    const urlMatch = allGalleryUrls.find((url) => {
      const u = url.toLowerCase();
      return u.includes(colLower);
    });
    if (urlMatch) return urlMatch;

    // 3. Positional / Index-based matching between product.colors and uploaded gallery
    if (
      Array.isArray(product?.colors) &&
      product.colors.length > 0 &&
      allGalleryUrls.length > 0
    ) {
      const colorIdx = product.colors.findIndex(
        (c) => typeof c === "string" && c.trim().toLowerCase() === colLower,
      );
      if (colorIdx >= 0 && colorIdx < allGalleryUrls.length) {
        return allGalleryUrls[colorIdx];
      }
    }

    // 4. Default to product cover image
    return defaultImg || product?.image_url;
  };

  // Helper to sync selected color when user switches images/angles
  const syncColorWithImage = (url, idx) => {
    if (!url) return;
    if (product?.color_images && typeof product.color_images === "object") {
      const matched = Object.keys(product.color_images).find(
        (c) => product.color_images[c] === url,
      );
      if (matched) {
        setSelectedColor(matched);
        return;
      }
    }
    if (
      Array.isArray(product?.colors) &&
      idx >= 0 &&
      idx < product.colors.length
    ) {
      setSelectedColor(product.colors[idx]);
    }
  };

  // Helper to get thumbnail badge label
  const getThumbnailLabel = (item, idx) => {
    if (!item) return "";
    if (product?.color_images && typeof product.color_images === "object") {
      const matched = Object.keys(product.color_images).find(
        (c) => product.color_images[c] === item.url,
      );
      if (matched) return matched;
    }
    if (
      Array.isArray(product?.colors) &&
      idx >= 0 &&
      idx < product.colors.length
    ) {
      return product.colors[idx];
    }
    return item.label || `ANGLE ${idx + 1}`;
  };

  // Initialize Product View State
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize("M");
      }

      const initialColor =
        product.colors && product.colors.length > 0 ? product.colors[0] : "";
      if (initialColor) {
        setSelectedColor(initialColor);
        const targetImg = getColorImageUrl(initialColor, product.image_url);
        setActiveImage(targetImg || product.image_url);
      } else {
        setActiveImage(product.image_url);
      }

      setQuantity(1);
      setIsZoomed(false);
      setShowRatingForm(false);
      setLiveRating(product.rating || null);
      setLiveReviewsCount(product.reviews_count || null);

      // Auto-fill reviewer name from logged-in user profile
      const activeUser =
        currentUser ||
        (() => {
          try {
            const saved = localStorage.getItem("alexandre_luxe_user");
            return saved ? JSON.parse(saved) : null;
          } catch {
            return null;
          }
        })();

      if (activeUser?.name) {
        setUserName(activeUser.name);
      }

      // Fetch actual backend reviews
      fetchProductReviews(product.id)
        .then((resData) => {
          if (resData && resData.success && Array.isArray(resData.data)) {
            setReviews(resData.data);
            if (resData.rating) setLiveRating(resData.rating);
            if (resData.reviews_count)
              setLiveReviewsCount(resData.reviews_count);
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch product reviews:", err);
        });

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [product, currentUser]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-serif font-black uppercase text-black mb-2">
          PRODUCT NOT FOUND
        </h2>
        <p className="text-sm text-neutral-500 mb-6">
          The requested luxury item is unavailable or has been removed.
        </p>
        <button
          onClick={onNavigateShop || onNavigateBack}
          className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-all shadow-md cursor-pointer"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  // Active angle index
  const activeIndex = productAngleGallery.findIndex(
    (item) => item.url === activeImage,
  );
  const currentAngleItem =
    productAngleGallery[activeIndex >= 0 ? activeIndex : 0];

  const handlePrevImage = () => {
    const prevIdx =
      (activeIndex - 1 + productAngleGallery.length) %
      productAngleGallery.length;
    const targetUrl = productAngleGallery[prevIdx]?.url;
    if (targetUrl) {
      setActiveImage(targetUrl);
      syncColorWithImage(targetUrl, prevIdx);
    }
  };

  const handleNextImage = () => {
    const nextIdx = (activeIndex + 1) % productAngleGallery.length;
    const targetUrl = productAngleGallery[nextIdx]?.url;
    if (targetUrl) {
      setActiveImage(targetUrl);
      syncColorWithImage(targetUrl, nextIdx);
    }
  };

  const handleScrollThumbnails = () => {
    if (thumbnailsContainerRef.current) {
      thumbnailsContainerRef.current.scrollBy({ top: 120, behavior: "smooth" });
    }
  };

  const handleColorSelect = (col) => {
    setSelectedColor(col);
    const targetImage = getColorImageUrl(col, product.image_url);
    if (targetImage) {
      setActiveImage(targetImage);
    }
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor);
  };

  // Submit Rating & Review handler
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      message.error("Please enter your name");
      return;
    }
    setIsSubmitting(true);

    try {
      const resData = await submitProductReview(product.id, {
        user_name: userName.trim(),
        rating: userRating,
        comment: userComment.trim(),
      });

      if (resData && resData.success) {
        message.success("Thank you! Your rating & review has been posted.");
        const newReview = resData.data || {
          id: Date.now(),
          user_name: userName.trim(),
          rating: userRating,
          comment: userComment.trim(),
          created_at: new Date().toISOString(),
        };
        setReviews((prev) => [newReview, ...prev]);
        if (resData.rating) setLiveRating(resData.rating);
        if (resData.reviews_count) setLiveReviewsCount(resData.reviews_count);
        setUserComment("");
      } else {
        message.error(resData.message || "Failed to submit review");
      }
    } catch (err) {
      console.warn("Backend error, using local fallback review:", err);
      const newReview = {
        id: Date.now(),
        user_name: userName.trim(),
        rating: userRating,
        comment: userComment.trim(),
        created_at: new Date().toISOString(),
      };
      setReviews((prev) => [newReview, ...prev]);
      message.success("Thank you! Your rating & review has been posted.");
      setUserComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pricing calculations
  const price = Number(product.price || 0);
  const originalPrice = product.original_price
    ? Number(product.original_price)
    : null;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const displayRating =
    liveRating ||
    product?.rating ||
    (4.7 + ((product?.id || 1) % 4) * 0.1).toFixed(1);

  const displayReviewsCount =
    liveReviewsCount ||
    product?.reviews_count ||
    (((product?.id || 1) * 23) % 180) + 24;

  // Related products
  const relatedProducts = (allProducts || [])
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category_id === product.category_id ||
          (p.category?.name && p.category?.name === product.category?.name)),
    )
    .slice(0, 4);

  const fallbackRelated =
    relatedProducts.length > 0
      ? relatedProducts
      : (allProducts || []).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="bg-[#fafafa] min-h-screen text-neutral-900 pb-20">
      {/* Top Notice Bar (Velora Style) */}
      <div className="bg-black text-white py-2 px-4 text-center text-[11px] font-mono tracking-wider flex items-center justify-between border-b border-neutral-800">
        <div className="hidden sm:block text-neutral-400 text-[10px]">
          ✦ HAUTE COUTURE PARIS ✦
        </div>
        <div className="flex-1 text-center font-bold">
          <CarOutlined className="mr-1.5 text-amber-400" />
          <span>Complimentary Express Shipping on all orders over $99</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          <span>USD $</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-6 sm:mb-8 pb-3 border-b border-neutral-200/80">
          <button
            onClick={onNavigateBack || onNavigateShop}
            className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-600 hover:text-black transition-colors cursor-pointer group"
          >
            <ArrowLeftOutlined className="text-xs transition-transform group-hover:-translate-x-1" />
            <span>Back to Catalogue</span>
          </button>

          <nav className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-neutral-500">
            <button
              onClick={onNavigateShop}
              className="hover:text-black cursor-pointer"
            >
              Catalogue
            </button>
            <span>/</span>
            <span className="text-neutral-400">
              {product.category?.name || "Apparel"}
            </span>
            <span>/</span>
            <span className="font-bold text-black truncate max-w-[180px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>

        {/* MAIN PRODUCT SHOWCASE (2-Column Grid: Left Gallery | Right Meta) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Multi-Angle Media Gallery Showcase (Velora Style) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-start">
            {/* Vertical Thumbnail Strip (Desktop) / Horizontal Strip (Mobile) */}
            <div className="w-full sm:w-20 md:w-24 shrink-0 flex flex-col gap-2">
              <div
                ref={thumbnailsContainerRef}
                className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[580px] scrollbar-none pb-1 sm:pb-0"
              >
                {productAngleGallery.map((item, idx) => {
                  const isActive =
                    activeImage === item.url || (idx === 0 && !activeImage);
                  const thumbLabel = getThumbnailLabel(item, idx);

                  return (
                    <button
                      key={item.id || idx}
                      onClick={() => {
                        setActiveImage(item.url);
                        syncColorWithImage(item.url, idx);
                      }}
                      className={`relative aspect-[3/4] w-16 sm:w-full rounded-xl overflow-hidden border-2 transition-all cursor-pointer group shrink-0 ${
                        isActive
                          ? "border-black ring-2 ring-black/20 shadow-md scale-[1.02]"
                          : "border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100"
                      }`}
                      title={`${thumbLabel} View`}
                    >
                      <img
                        src={item.url}
                        alt={thumbLabel}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                      <div
                        className={`absolute bottom-0 inset-x-0 py-0.5 text-[7px] sm:text-[8px] font-mono font-black uppercase text-center tracking-wider truncate px-1 transition-colors ${
                          isActive
                            ? "bg-black text-white"
                            : "bg-black/70 text-white group-hover:bg-black"
                        }`}
                      >
                        {thumbLabel}
                      </div>
                    </button>
                  );
                })}
              </div>

              {productAngleGallery.length > 4 && (
                <button
                  onClick={handleScrollThumbnails}
                  className="hidden sm:flex w-full py-1.5 items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black transition-colors cursor-pointer text-xs"
                  title="Scroll down"
                >
                  <DownOutlined />
                </button>
              )}
            </div>

            {/* Main Hero Display Viewport */}
            <div className="relative flex-1 w-full aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/90 shadow-lg group">
              <img
                src={activeImage || product.image_url}
                alt={product.name}
                className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
                  isZoomed
                    ? "scale-[1.8] origin-center cursor-zoom-out"
                    : "scale-100 cursor-zoom-in"
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Top-Left Active Angle & Color Tag Badge */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1.5">
                <span className="bg-black/90 backdrop-blur-md text-white text-[10px] font-mono font-extrabold uppercase px-3 py-1.5 rounded-lg tracking-widest shadow-md border border-white/20">
                  {getThumbnailLabel(currentAngleItem, activeIndex >= 0 ? activeIndex : 0) || "COVER PHOTO"}
                </span>
                {product.is_new && (
                  <span className="bg-amber-400 text-black text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-md w-max">
                    NEW ARRIVAL
                  </span>
                )}
              </div>

              {/* Navigation Arrows for Quick Image Angle Flipping */}
              {productAngleGallery.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer shadow-lg backdrop-blur-sm"
                    title="Previous Photo"
                  >
                    <LeftOutlined className="text-sm" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer shadow-lg backdrop-blur-sm"
                    title="Next Photo"
                  >
                    <RightOutlined className="text-sm" />
                  </button>
                </>
              )}

              {/* Bottom Right Zoom Toggle Pill */}
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute bottom-4 right-4 z-10 bg-black/75 hover:bg-black text-white px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-md shadow-md transition-all cursor-pointer"
                title={isZoomed ? "Zoom Out" : "Zoom In"}
              >
                <ZoomInOutlined />
                <span className="text-[10px] uppercase">
                  {isZoomed ? "Reset" : "Zoom"}
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT: Product Meta, Spec Options & Checkout Box (Velora Style) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category Tag & Top Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/80">
                  {product.category?.name || "LUXURY APPAREL"}
                </span>

                {product.stock !== undefined && product.stock !== null && (
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    ● {product.stock > 0 ? `${product.stock} In Stock` : "Pre-Order"}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-tight text-neutral-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Review Counter Bar */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarFilled
                      key={star}
                      style={{
                        color:
                          star <= Math.round(Number(displayRating))
                            ? "#fbbf24"
                            : "#e5e7eb",
                      }}
                      className="text-sm"
                    />
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-neutral-900">
                  {displayRating}
                </span>
                <span className="text-neutral-300">•</span>
                <button
                  onClick={() => {
                    setActiveTab("reviews");
                    if (reviewsSectionRef.current) {
                      reviewsSectionRef.current.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="text-xs font-mono font-bold text-neutral-500 hover:text-black underline cursor-pointer"
                >
                  ({reviews.length > 0 ? reviews.length : displayReviewsCount} reviews)
                </button>
              </div>

              {/* Price Row (With Discount Badge) */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-mono font-black text-black">
                  ${price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base sm:text-lg font-mono text-neutral-400 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-mono font-black uppercase bg-black text-amber-400 px-2.5 py-0.5 rounded shadow-sm">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Short Product Description */}
              <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                {product.description ||
                  "Crafted from premium heavyweight French Terry cotton with bespoke tailoring. Engineered for an effortless oversized drape and uncompromising luxury comfort."}
              </p>

              {/* Divider */}
              <div className="border-t border-neutral-200/80 pt-4 space-y-4">
                {/* 1. Color Selector (Velora Style) */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        Color: <span className="font-mono text-neutral-600">{selectedColor}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {product.colors.map((col) => {
                        const colKey = col.toLowerCase().trim();
                        const hexColor = colorMap[colKey] || "#171717";
                        const isSelected = selectedColor === col;

                        return (
                          <button
                            key={col}
                            onClick={() => handleColorSelect(col)}
                            title={col}
                            className={`w-8 h-8 rounded-full cursor-pointer relative flex items-center justify-center transition-all ${
                              isSelected
                                ? "ring-2 ring-black ring-offset-2 scale-110 shadow-sm"
                                : "hover:scale-105 opacity-80 hover:opacity-100"
                            } ${
                              hexColor === "#FFFFFF"
                                ? "border border-neutral-300"
                                : "border border-transparent"
                            }`}
                            style={{ backgroundColor: hexColor }}
                          >
                            {isSelected && (
                              <CheckOutlined
                                className={`text-xs ${
                                  hexColor === "#FFFFFF"
                                    ? "text-black"
                                    : "text-white"
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Size Selector (Velora Style) */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        Size: <span className="font-mono text-neutral-600">{selectedSize}</span>
                      </span>
                      <button
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-xs font-mono font-bold text-neutral-500 hover:text-black flex items-center gap-1 underline cursor-pointer"
                      >
                        <TableOutlined className="text-xs" />
                        <span>Size Guide</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sz) => {
                        const isSelected = selectedSize === sz;
                        return (
                          <button
                            key={sz}
                            onClick={() => setSelectedSize(sz)}
                            className={`min-w-12 h-10 px-3 rounded-lg text-xs font-mono font-extrabold uppercase transition-all cursor-pointer flex items-center justify-center ${
                              isSelected
                                ? "bg-black text-white border-2 border-black shadow-md scale-105"
                                : "bg-white text-neutral-800 border border-neutral-300 hover:border-black"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Quantity & Add to Cart Action Row */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch">
                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between border-2 border-neutral-300 rounded-xl px-3 py-2 bg-white w-full sm:w-32 shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-6 h-6 flex items-center justify-center font-bold text-base hover:text-amber-600 disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-extrabold text-sm text-black">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center font-bold text-base hover:text-amber-600 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Primary Add to Cart Button (Velora Style) */}
                  <button
                    onClick={handleAddToCartClick}
                    className="flex-1 bg-black hover:bg-neutral-800 text-white h-12 rounded-xl font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
                  >
                    <ShoppingOutlined className="text-base" />
                    <span>Add to Bag — ${(price * quantity).toFixed(2)}</span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isWishlisted
                        ? "border-rose-500 bg-rose-50 text-rose-600 shadow-sm"
                        : "border-neutral-300 hover:border-black bg-white text-neutral-700 hover:text-black"
                    }`}
                    title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    {isWishlisted ? (
                      <HeartFilled className="text-lg text-rose-600 animate-pulse" />
                    ) : (
                      <HeartOutlined className="text-lg" />
                    )}
                  </button>
                </div>
              </div>

              {/* 3 Value-Proposition Badges (Velora Row) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-200/80">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60">
                  <CarOutlined className="text-base text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-neutral-900 leading-tight">
                      Free Shipping
                    </div>
                    <div className="text-[10px] text-neutral-500 font-sans">
                      On orders over $99
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60">
                  <SyncOutlined className="text-base text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-neutral-900 leading-tight">
                      Easy Returns
                    </div>
                    <div className="text-[10px] text-neutral-500 font-sans">
                      30-day return policy
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60">
                  <LockOutlined className="text-base text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-neutral-900 leading-tight">
                      Secure Payment
                    </div>
                    <div className="text-[10px] text-neutral-500 font-sans">
                      100% secure checkout
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BELOW THE FOLD: TABS & PRODUCT SPECIFICATIONS (Velora Style) */}
        <div ref={reviewsSectionRef} className="mt-16 pt-10 border-t border-neutral-200">
          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-neutral-200 overflow-x-auto scrollbar-none pb-0.5">
            {[
              { id: "details", label: "Details" },
              { id: "materials", label: "Materials & Care" },
              { id: "size_fit", label: "Size & Fit" },
              { id: "shipping", label: "Shipping & Returns" },
              {
                id: "reviews",
                label: `Customer Reviews (${reviews.length > 0 ? reviews.length : displayReviewsCount})`,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-serif font-black uppercase tracking-wider cursor-pointer transition-all relative shrink-0 ${
                    isActive
                      ? "text-black border-b-2 border-black"
                      : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="py-8">
            {/* 1. Details Tab */}
            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-4">
                  <h3 className="text-lg font-serif font-black uppercase text-black">
                    Product Architecture & Craft
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Designed with an architectural minimalist silhouette, this piece is cut
                    from custom-milled heavyweight fabric with double-needle reinforced stitching.
                    Finished with artisanal tailoring and hand-stitched hem accents.
                  </p>

                  <ul className="space-y-2.5 pt-2 text-xs font-mono text-neutral-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Signature tailored luxury silhouette</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Ultra-soft custom heavyweight cotton weave</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Pre-shrunk treatment to maintain perfect drape</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Reinforced ribbed collar and cuffs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Unisex modern fit suitable for any occasion</span>
                    </li>
                  </ul>
                </div>

                <div className="md:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-md">
                  <img
                    src={productAngleGallery[1]?.url || product.image_url}
                    alt="Fabric Detail"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            )}

            {/* 2. Materials & Care Tab */}
            {activeTab === "materials" && (
              <div className="max-w-2xl space-y-4">
                <h3 className="text-lg font-serif font-black uppercase text-black">
                  Material Composition & Sustainable Care
                </h3>
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-neutral-200/60">
                    <span className="text-neutral-500 uppercase">Composition</span>
                    <span className="font-bold text-black">100% Organic Heavyweight Cotton (420 GSM)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200/60">
                    <span className="text-neutral-500 uppercase">Weave</span>
                    <span className="font-bold text-black">French Terry Loopback Weave</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200/60">
                    <span className="text-neutral-500 uppercase">Origin</span>
                    <span className="font-bold text-black">Artisanal Workshop — Paris / Milan</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-neutral-600 space-y-1.5 font-sans">
                  <div className="font-bold text-black uppercase font-mono">Care Instructions:</div>
                  <p>• Machine wash cold on gentle cycle (30°C / 85°F)</p>
                  <p>• Lay flat to dry in shade to preserve garment shape</p>
                  <p>• Do not tumble dry. Warm iron on reverse if desired</p>
                </div>
              </div>
            )}

            {/* 3. Size & Fit Tab */}
            {activeTab === "size_fit" && (
              <div className="max-w-2xl space-y-4">
                <h3 className="text-lg font-serif font-black uppercase text-black">
                  Fit Advice & Dimensions
                </h3>
                <p className="text-sm text-neutral-600">
                  Cut for a relaxed, modern drape. We recommend selecting your true size for the intended silhouette, or sizing down for a more structured, tailored fit.
                </p>

                <div className="overflow-x-auto rounded-xl border border-neutral-200">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-neutral-100 text-neutral-700 uppercase">
                      <tr>
                        <th className="p-3">Size</th>
                        <th className="p-3">Chest (in)</th>
                        <th className="p-3">Length (in)</th>
                        <th className="p-3">Shoulder (in)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      <tr>
                        <td className="p-3 font-bold">S</td>
                        <td className="p-3">40 - 42</td>
                        <td className="p-3">27.5</td>
                        <td className="p-3">19.5</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">M</td>
                        <td className="p-3">42 - 44</td>
                        <td className="p-3">28.5</td>
                        <td className="p-3">20.5</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">L</td>
                        <td className="p-3">44 - 46</td>
                        <td className="p-3">29.5</td>
                        <td className="p-3">21.5</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">XL</td>
                        <td className="p-3">46 - 48</td>
                        <td className="p-3">30.5</td>
                        <td className="p-3">22.5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Shipping & Returns Tab */}
            {activeTab === "shipping" && (
              <div className="max-w-2xl space-y-4 text-sm text-neutral-600">
                <h3 className="text-lg font-serif font-black uppercase text-black">
                  Worldwide Shipping & VIP Delivery
                </h3>
                <p>
                  All orders are dispatched from our European fulfillment centers within 24 hours of payment verification. Garments are hand-packed in bespoke luxury dust-bags.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="text-xs font-mono font-bold uppercase text-black mb-1">
                      Express Courier
                    </div>
                    <div className="text-xs text-neutral-500">
                      2 - 3 Business Days via DHL Express / FedEx Priority.
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="text-xs font-mono font-bold uppercase text-black mb-1">
                      30-Day Returns
                    </div>
                    <div className="text-xs text-neutral-500">
                      Complimentary prepaid returns and exchanges on unworn items.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Customer Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Rating Overview Card & Post Review Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-mono font-black text-black">
                      {displayRating}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarFilled
                            key={s}
                            style={{
                              color:
                                s <= Math.round(Number(displayRating))
                                  ? "#fbbf24"
                                  : "#e5e7eb",
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-mono text-neutral-600">
                        Based on {reviews.length > 0 ? reviews.length : displayReviewsCount} verified reviews
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowRatingForm(!showRatingForm)}
                    className="bg-black hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <EditOutlined />
                    <span>{showRatingForm ? "Cancel Review" : "Write a Review"}</span>
                  </button>
                </div>

                {/* Rating & Review Form (Collapsible) */}
                {showRatingForm && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-md space-y-4"
                  >
                    <h4 className="text-xs font-mono font-black uppercase tracking-wider text-black">
                      SUBMIT YOUR VERIFIED FEEDBACK
                    </h4>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                        Rating Score
                      </label>
                      <div>
                        <Rate
                          value={userRating}
                          onChange={(v) => setUserRating(v)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. Jean Dupont"
                        className="w-full text-xs font-sans px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-black"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                        Review Comments
                      </label>
                      <textarea
                        rows={3}
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Share your experience regarding fabric weight, fit, and craftsmanship..."
                        className="w-full text-xs font-sans p-3 rounded-lg border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-black hover:bg-neutral-800 text-white px-6 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all"
                    >
                      {isSubmitting ? "Submitting..." : "Post Review"}
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl bg-white border border-neutral-200 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-serif font-bold text-black">
                              {rev.user_name}
                            </span>
                            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              ✓ Verified Buyer
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <StarFilled
                              key={s}
                              style={{
                                color: s <= rev.rating ? "#fbbf24" : "#e5e7eb",
                              }}
                              className="text-xs"
                            />
                          ))}
                        </div>

                        <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs font-mono text-neutral-400">
                      No customer reviews yet. Be the first to review this luxury product!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* "YOU MAY ALSO LIKE" RELATED PRODUCTS (Velora Style) */}
        {fallbackRelated.length > 0 && (
          <div className="mt-16 pt-10 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-serif font-black uppercase text-black tracking-tight">
                You May Also Like
              </h3>
              <button
                onClick={onNavigateShop}
                className="text-xs font-mono font-bold uppercase text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All</span>
                <RightOutlined className="text-[10px]" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {fallbackRelated.map((relProd) => {
                const relPrice = Number(relProd.price || 0);
                return (
                  <div
                    key={relProd.id}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(relProd);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-black transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                      <img
                        src={relProd.image_url}
                        alt={relProd.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                      {relProd.is_new && (
                        <span className="absolute top-2 left-2 bg-black text-white text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                          NEW
                        </span>
                      )}
                    </div>

                    <div className="p-3">
                      <h4 className="text-xs font-serif font-bold text-black uppercase truncate mb-1 group-hover:text-amber-600 transition-colors">
                        {relProd.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-extrabold text-black">
                          ${relPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">
                          {relProd.category?.name || "View"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sizing Guide Modal */}
      <Modal
        open={sizeGuideOpen}
        onCancel={() => setSizeGuideOpen(false)}
        footer={null}
        centered
        width={540}
        title={
          <span className="font-serif font-black uppercase text-sm tracking-wider">
            📏 Luxury Size Guide & Fit Specifications
          </span>
        }
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-neutral-600">
            All measurements are provided in inches. For an oversized silhouette as designed, order your true size.
          </p>

          <table className="w-full text-xs font-mono text-left border border-neutral-200 rounded-lg overflow-hidden">
            <thead className="bg-neutral-100 text-neutral-700 uppercase">
              <tr>
                <th className="p-2.5">Size</th>
                <th className="p-2.5">Chest</th>
                <th className="p-2.5">Length</th>
                <th className="p-2.5">Sleeve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr>
                <td className="p-2.5 font-bold">S</td>
                <td className="p-2.5">40 - 42"</td>
                <td className="p-2.5">27.5"</td>
                <td className="p-2.5">24.0"</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">M</td>
                <td className="p-2.5">42 - 44"</td>
                <td className="p-2.5">28.5"</td>
                <td className="p-2.5">24.5"</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">L</td>
                <td className="p-2.5">44 - 46"</td>
                <td className="p-2.5">29.5"</td>
                <td className="p-2.5">25.0"</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">XL</td>
                <td className="p-2.5">46 - 48"</td>
                <td className="p-2.5">30.5"</td>
                <td className="p-2.5">25.5"</td>
              </tr>
            </tbody>
          </table>

          <div className="text-[11px] font-sans text-neutral-500 pt-1">
            Need personal assistance? Contact our 24/7 VIP Concierge for bespoke sizing recommendations.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
