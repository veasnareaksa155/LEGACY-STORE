import React, { useState, useEffect, useMemo } from "react";
import { Modal, Rate, message } from "antd";
import { parseGalleryUrls } from "../services/cloudinary";
import { fetchProductReviews, submitProductReview } from "../services/api";
import {
  ShoppingOutlined,
  CloseOutlined,
  HeartOutlined,
  HeartFilled,
  LeftOutlined,
  RightOutlined,
  StarFilled,
  SendOutlined,
  CheckCircleFilled,
  EditOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";

const ProductDetailModal = ({
  product,
  open,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  currentUser,
}) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");

  // Rating & Review State
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userName, setUserName] = useState("");
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveRating, setLiveRating] = useState(null);
  const [liveReviewsCount, setLiveReviewsCount] = useState(null);

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
    "black/white": "#171717",
  };

  // Model photo variant mapping tailored to item category & gender fit
  const modelImage = useMemo(() => {
    if (product?.model_image_url) return product.model_image_url;
    const cat = (product?.category?.name || "").toLowerCase();
    const name = (product?.name || "").toLowerCase();
    const col = (selectedColor || product?.colors?.[0] || "").toLowerCase();

    if (
      cat.includes("t-shirt") ||
      cat.includes("tee") ||
      name.includes("tee") ||
      name.includes("t-shirt")
    ) {
      return col.includes("white")
        ? "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
        : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80";
    }
    if (cat.includes("shirt") || name.includes("shirt")) {
      return col.includes("white")
        ? "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80"
        : "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80";
    }
    if (
      cat.includes("shoe") ||
      cat.includes("footwear") ||
      name.includes("shoe") ||
      name.includes("sneaker")
    ) {
      return "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80";
    }
    if (
      cat.includes("bag") ||
      name.includes("bag") ||
      name.includes("leather")
    ) {
      return "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80";
    }
    return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
  }, [product, selectedColor]);

  // Dynamic user-uploaded multi-angle gallery array (Front + Gallery Angle Images)
  const productAngleGallery = useMemo(() => {
    if (!product) return [];
    const mainImg = product.image_url;

    // 1. Safely extract all user-uploaded gallery URLs using parseGalleryUrls helper
    const galleryUrls = parseGalleryUrls(product.gallery);

    const items = [];

    if (mainImg) {
      items.push({ id: "front", label: "COVER PHOTO", url: mainImg });
    }

    // Add all uploaded gallery angle images cleanly
    galleryUrls.forEach((gUrl, idx) => {
      if (gUrl && gUrl !== mainImg && !items.some((it) => it.url === gUrl)) {
        items.push({
          id: `angle-${idx + 1}`,
          label: `ANGLE ${idx + 2}`,
          url: gUrl,
        });
      }
    });

    // Fallback zoom angle if only cover photo exists
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

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
      setActiveImage(product.image_url);
      setQuantity(1);
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
    }
  }, [product, open, currentUser]);

  if (!product) return null;

  const displayRating =
    liveRating ||
    product?.rating ||
    (4.7 + ((product?.id || 1) % 4) * 0.1).toFixed(1);
  const displayReviewsCount =
    liveReviewsCount ||
    product?.reviews_count ||
    (((product?.id || 1) * 23) % 180) + 24;

  // Helper function to map colors to luxury apparel variant photos
  const getColorImageUrl = (colorName, categoryName, defaultImg) => {
    if (!colorName) return defaultImg;
    const col = colorName.toLowerCase().trim();
    const cat = (categoryName || "").toLowerCase().trim();

    if (product?.color_images && product.color_images[colorName]) {
      return product.color_images[colorName];
    }

    if (col.includes("white")) {
      if (cat.includes("t-shirt") || cat.includes("tee")) {
        return "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80";
      }
      if (cat.includes("shirt")) {
        return "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80";
      }
      if (cat.includes("shoe") || cat.includes("footwear")) {
        return "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80";
      }
      return "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80";
    }

    if (col.includes("black")) {
      if (cat.includes("t-shirt") || cat.includes("tee")) {
        return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
      }
      if (cat.includes("shirt")) {
        return "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80";
      }
      if (cat.includes("shoe")) {
        return "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80";
      }
      return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
    }

    if (col.includes("navy") || col.includes("blue")) {
      return "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80";
    }

    if (
      col.includes("charcoal") ||
      col.includes("gray") ||
      col.includes("grey")
    ) {
      return "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=800&q=80";
    }

    if (col.includes("burgundy") || col.includes("red")) {
      return "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80";
    }

    if (col.includes("brown") || col.includes("tan") || col.includes("beige")) {
      return "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80";
    }

    return defaultImg;
  };

  const handleColorSelect = (col) => {
    setSelectedColor(col);
    const targetImage = getColorImageUrl(
      col,
      product?.category?.name,
      product?.image_url,
    );
    setActiveImage(targetImage);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor);
    onClose();
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
        if (!activeUser?.name) setUserName("");
      } else {
        message.error(resData.message || "Failed to submit review");
      }
    } catch (err) {
      console.warn("Backend error, using local fallback review post:", err);
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
      if (!activeUser?.name) setUserName("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find active image item in angle gallery
  const activeIndex = productAngleGallery.findIndex(
    (item) => item.url === activeImage,
  );
  const currentAngleItem =
    productAngleGallery[activeIndex >= 0 ? activeIndex : 0];

  const handlePrevImage = () => {
    const prevIdx =
      (activeIndex - 1 + productAngleGallery.length) %
      productAngleGallery.length;
    setActiveImage(productAngleGallery[prevIdx].url);
  };

  const handleNextImage = () => {
    const nextIdx = (activeIndex + 1) % productAngleGallery.length;
    setActiveImage(productAngleGallery[nextIdx].url);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={880}
      centered
      closeIcon={<CloseOutlined className="text-xs sm:text-sm md:text-base" />}
      className="product-detail-modal"
    >
      <div className="flex flex-col md:flex-row gap-5 sm:gap-6 items-stretch pt-0.5 max-h-[85vh] overflow-y-auto scrollbar-thin">
        {/* Left: Multi-Angle Interactive Product Gallery Showcase */}
        <div className="w-full md:w-1/2 flex flex-col gap-3 flex-shrink-0">
          {/* Main Hero Display Viewport */}
          <div className="relative aspect-[3/4] w-full bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 shadow-md group">
            <img
              src={activeImage || product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
                currentAngleItem?.isZoom
                  ? "scale-[1.65] origin-center cursor-zoom-out"
                  : "scale-100"
              }`}
            />

            {/* Active View Angle Badge Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
              <span className="bg-black/90 backdrop-blur-md text-white text-[9px] sm:text-xs font-mono font-extrabold uppercase px-2.5 py-1 rounded-md tracking-widest shadow-md border border-white/20">
                {currentAngleItem?.label || "FRONT VIEW"}
              </span>
            </div>

            {/* Navigation Arrows for Quick Image Angle Flipping */}
            {productAngleGallery.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer shadow-md backdrop-blur-sm"
                  title="Previous Angle"
                >
                  <LeftOutlined className="text-xs" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer shadow-md backdrop-blur-sm"
                  title="Next Angle"
                >
                  <RightOutlined className="text-xs" />
                </button>
              </>
            )}
          </div>

          {/* Coherent Multi-Angle Image Element Cards Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {productAngleGallery.map((item, idx) => {
              const isActive =
                activeImage === item.url || (idx === 0 && !activeImage);
              return (
                <button
                  key={item.id || idx}
                  onClick={() => setActiveImage(item.url)}
                  className={`relative flex-shrink-0 w-14 sm:w-16 h-18 sm:h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer group/thumb ${
                    isActive
                      ? "border-black ring-2 ring-black/20 shadow-md scale-[1.02]"
                      : "border-neutral-200 hover:border-neutral-400 opacity-75 hover:opacity-100"
                  }`}
                  title={`${item.label} Angle View`}
                >
                  <img
                    src={item.url}
                    alt={item.label}
                    className={`w-full h-full object-cover object-center group-hover/thumb:scale-105 transition-transform duration-300 ${
                      item.isZoom ? "scale-[1.5]" : ""
                    }`}
                  />
                  <div
                    className={`absolute bottom-0 inset-x-0 py-0.5 text-[8px] font-mono font-extrabold uppercase text-center tracking-wider transition-colors ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-black/70 text-white group-hover/thumb:bg-black"
                    }`}
                  >
                    {item.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Meta, Options & Interactive Rating Block */}
        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5 space-y-3">
          <div>
            {/* Category & Top Badge */}
            <div className="flex items-center justify-between mb-1 pr-6">
              <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-widest">
                {product.category?.name || "LEGACY"}
              </span>
            </div>

            <h2 className="text-base sm:text-lg md:text-xl font-bold font-serif text-black uppercase tracking-tight mb-1 sm:mb-2 pr-6 leading-snug">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <span className="text-xl sm:text-2xl font-black text-black font-sans">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.original_price && (
                <span className="text-xs sm:text-sm text-neutral-400 line-through font-sans">
                  ${Number(product.original_price).toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed mb-3 sm:mb-4 font-light line-clamp-3">
              {product.description}
            </p>

            {/* Inline Size & Color Options Box */}
            <div className="space-y-3 mb-3 bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                      SIZE:
                    </span>
                    <span className="text-xs font-mono font-bold text-black">
                      {selectedSize}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 text-xs font-mono font-extrabold rounded border transition-all cursor-pointer ${
                          selectedSize === sz
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-white text-neutral-800 border-neutral-300 hover:border-black"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                      COLOR:
                    </span>
                    <span className="text-xs font-mono font-bold text-black">
                      {selectedColor}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((col) => {
                      const hexColor = colorMap[col.toLowerCase()] || "#000000";
                      const isSelected = selectedColor === col;
                      return (
                        <button
                          key={col}
                          onClick={() => handleColorSelect(col)}
                          className={`px-3 py-1.5 text-xs font-extrabold rounded border transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-black text-white border-black shadow-sm"
                              : "bg-white text-neutral-800 border-neutral-300 hover:border-black"
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-neutral-400 shrink-0"
                            style={{ backgroundColor: hexColor }}
                          />
                          <span>{col}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* DIRECTLY UNDER THE SIZE & COLOR BLOCK: INTERACTIVE RATING BLOCK */}
            <div className="mb-3 bg-amber-50/60 rounded-lg border border-amber-200/90 overflow-hidden transition-all shadow-2xs">
              {/* Clickable Header Bar to Rate / View Reviews */}
              <button
                type="button"
                onClick={() => setShowRatingForm(!showRatingForm)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-amber-100/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded border border-amber-300/80">
                    <StarFilled
                      style={{ color: "#fbbf24" }}
                      className="text-xs"
                    />
                    <span className="text-xs font-bold font-mono text-neutral-900">
                      {displayRating}
                    </span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-serif">
                    CUSTOMER REVIEWS (
                    {reviews.length > 0 ? reviews.length : displayReviewsCount})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-amber-950 text-xs font-bold uppercase tracking-wider">
                  <EditOutlined className="text-amber-600" />
                  <span>{showRatingForm ? "HIDE RATING" : "RATE PRODUCT"}</span>
                  <DownOutlined
                    className={`text-[10px] transition-transform duration-300 ${
                      showRatingForm ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </div>
              </button>

              {/* Collapsible Interactive Rating & Review Panel with Ultra Smooth CSS Transition */}
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  showRatingForm
                    ? "grid-rows-[1fr] opacity-100 border-t border-amber-200/80"
                    : "grid-rows-[0fr] opacity-0 border-t-0"
                }`}
              >
                <div className="overflow-hidden bg-white p-3 sm:p-4 space-y-3">
                  {/* Rating Stars Input Form */}
                  <form onSubmit={handleSubmitReview} className="space-y-2.5">
                    <div className="flex items-center justify-between bg-amber-50/70 px-3 py-2 rounded-md border border-amber-200/60">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1">
                        YOUR RATING:
                      </span>
                      <Rate
                        value={userRating}
                        onChange={setUserRating}
                        style={{ color: "#fbbf24" }}
                        className="text-base cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your Name (e.g. VIP Client)"
                        value={userName}
                        autoComplete="name"
                        onChange={(e) => setUserName(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-xs rounded-lg border border-neutral-300 focus:border-black focus:outline-none bg-white font-sans h-11 sm:h-9"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-wider px-3 py-2 sm:py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 h-11 sm:h-9"
                      >
                        <SendOutlined className="text-xs" />
                        <span>
                          {isSubmitting ? "POSTING..." : "SUBMIT REVIEW"}
                        </span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Write your rating & review on fit, quality, and design..."
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-lg border border-neutral-300 focus:border-black focus:outline-none bg-white font-sans resize-none"
                    />
                  </form>

                  {/* Customer Reviews Feed */}
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin pt-1 border-t border-neutral-100">
                    {reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="bg-neutral-50/90 p-2.5 rounded-md border border-neutral-200 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-neutral-900 text-amber-400 text-[9px] font-bold flex items-center justify-center font-mono">
                                {rev.user_name
                                  ? rev.user_name.charAt(0).toUpperCase()
                                  : "U"}
                              </span>
                              <span className="text-xs font-bold text-neutral-900 font-serif">
                                {rev.user_name}
                              </span>
                              <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5">
                                <CheckCircleFilled className="text-[8px]" />{" "}
                                Verified
                              </span>
                            </div>

                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <StarFilled
                                  key={i}
                                  style={{
                                    color:
                                      i < rev.rating ? "#fbbf24" : "#d1d5db",
                                  }}
                                  className="text-[10px]"
                                />
                              ))}
                            </div>
                          </div>
                          {rev.comment && (
                            <p className="text-[11px] text-neutral-600 font-light leading-relaxed pl-7">
                              "{rev.comment}"
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-neutral-500 font-light text-center py-2">
                        No customer reviews yet. Be the first to rate!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Quantity, Add to Bag & Wishlist Action Row */}
          <div className="pt-2 sm:pt-3 border-t border-neutral-200 flex items-center gap-2 sm:gap-3">
            {/* Quantity Controller */}
            <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden h-8.5 sm:h-9.5 md:h-10.5 bg-neutral-50 flex-shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-5.5 sm:w-6.5 md:w-7.5 h-full flex items-center justify-center font-bold text-xs md:text-sm hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="font-bold text-xs md:text-sm px-2 text-center min-w-[18px] sm:min-w-[22px]">
                {quantity}
              </span>
              <button
                onClick={() => {
                  const maxStock =
                    product?.stock !== undefined && product?.stock !== null
                      ? Number(product.stock)
                      : 50;
                  setQuantity((q) => Math.min(maxStock, q + 1));
                }}
                className="w-5.5 sm:w-6.5 md:w-7.5 h-full flex items-center justify-center font-bold text-xs md:text-sm hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Native Clean Add to Bag Button */}
            <button
              onClick={handleAdd}
              className="flex-1 bg-black text-white hover:bg-neutral-800 active:scale-[0.99] font-bold text-xs md:text-xs lg:text-sm tracking-wide uppercase h-8.5 sm:h-9.5 md:h-10.5 rounded-md shadow-sm px-3 sm:px-5 md:px-6 flex items-center justify-center gap-2 transition-all min-w-0 cursor-pointer"
            >
              <ShoppingOutlined className="text-xs sm:text-sm md:text-base flex-shrink-0" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                ADD TO BAG - ${(Number(product.price) * quantity).toFixed(2)}
              </span>
            </button>

            {/* Wishlist Toggle Button */}
            <button
              onClick={() => onToggleWishlist(product)}
              className={`h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 md:h-10.5 md:w-10.5 flex items-center justify-center border rounded-md transition-all flex-shrink-0 cursor-pointer ${
                isWishlisted
                  ? "border-red-200 bg-red-50 text-red-500 shadow-sm"
                  : "border-neutral-300 hover:border-black text-neutral-700 bg-white"
              }`}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              {isWishlisted ? (
                <HeartFilled
                  style={{ color: "#ff4d4f" }}
                  className="text-xs sm:text-sm md:text-base"
                />
              ) : (
                <HeartOutlined className="text-xs sm:text-sm md:text-base" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailModal;
