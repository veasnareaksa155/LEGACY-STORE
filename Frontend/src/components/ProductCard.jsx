import React, { useState } from "react";
import {
  EyeOutlined,
  ShoppingOutlined,
  HeartOutlined,
  HeartFilled,
  StarFilled,
  ThunderboltOutlined,
  CheckOutlined,
} from "@ant-design/icons";

const ProductCard = ({
  product,
  onQuickView,
  onAddToCart,
  onBuyNow,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  if (!product) return null;

  const priceNum = Number(product.price || 0);
  const origPriceNum = product.original_price ? Number(product.original_price) : 0;
  const discountPercent =
    origPriceNum > priceNum
      ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100)
      : 0;

  const rating =
    product.rating || (4.8 + ((Number(product.id) || 1) % 3) * 0.1).toFixed(1);
  const reviewsCount =
    product.reviews_count || (((Number(product.id) || 1) * 23) % 120) + 12;

  // Safe parse sizes
  const availableSizes = (() => {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }
    if (typeof product.sizes === "string" && product.sizes.trim()) {
      try {
        const parsed = JSON.parse(product.sizes);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return product.sizes.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return ["S", "M", "L", "XL"];
  })();

  const categoryName =
    product.category?.name ||
    product.category_name ||
    (typeof product.category === "string" ? product.category : "ATELIER PIECE");

  const [isAdded, setIsAdded] = useState(false);

  const handleCardClick = () => {
    if (onQuickView) onQuickView(product);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (onToggleWishlist) onToggleWishlist(product);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const handleBuyNowClick = (e) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(product);
    } else if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-black transition-all duration-300 flex flex-col h-full cursor-pointer transform hover:-translate-y-1"
    >
      {/* 1. High-Fashion Photography Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
          }}
        />

        {/* Soft Dark Overlay on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-5" />

        {/* Top-Left Status Pills */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.is_new && (
            <span className="inline-flex items-center gap-1 bg-black text-white text-[9px] sm:text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm border border-neutral-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>NEW</span>
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && !product.is_new && (
            <span className="bg-amber-400 text-black text-[9px] sm:text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm">
              HOT
            </span>
          )}
        </div>

        {/* Top-Right Floating Wishlist Heart */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-neutral-900 border border-neutral-200/80 cursor-pointer"
          >
            {isWishlisted ? (
              <HeartFilled className="text-rose-500 text-sm" />
            ) : (
              <HeartOutlined className="text-neutral-700 hover:text-rose-500 text-sm transition-colors" />
            )}
          </button>
        </div>

        {/* Center Hover Action (Desktop View Details Pill) */}
        <div className="absolute inset-0 hidden sm:flex items-center justify-center z-15 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <span className="bg-white/95 text-neutral-950 px-4 py-2 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl border border-neutral-200 backdrop-blur-md transform scale-95 group-hover:scale-100 transition-transform">
            <EyeOutlined className="text-xs" />
            <span>QUICK VIEW</span>
          </span>
        </div>
      </div>

      {/* 2. Clear Pro Details Container */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between bg-white text-neutral-900 space-y-2.5">
        <div>
          {/* Category Tag & Rating Row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest truncate block">
              {categoryName}
            </span>

            <div className="flex items-center gap-1 font-mono text-[11px] shrink-0">
              <StarFilled className="text-amber-400 text-[10px]" />
              <span className="font-bold text-neutral-800">{rating}</span>
              <span className="text-neutral-400 font-normal">({reviewsCount})</span>
            </div>
          </div>

          {/* Product Name (2 clean lines max, highly readable) */}
          <h3 className="text-xs sm:text-sm font-serif font-bold text-neutral-950 group-hover:text-amber-600 transition-colors line-clamp-2 uppercase tracking-wide leading-snug m-0">
            {product.name}
          </h3>

          {/* Available Sizes Strip */}
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {availableSizes.slice(0, 4).map((sz) => (
              <span
                key={sz}
                className="text-[9px] font-mono font-semibold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200/70"
              >
                {sz}
              </span>
            ))}
            {availableSizes.length > 4 && (
              <span className="text-[9px] font-mono text-neutral-400 font-bold">
                +{availableSizes.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* 3. Bottom Value & Action Deck */}
        <div className="mt-auto pt-3 border-t border-neutral-100/90 flex flex-col gap-2">
          {/* Price & Value Status Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-sm sm:text-base font-black text-neutral-950 font-mono tracking-tight">
                ${priceNum.toFixed(2)}
              </span>
              {origPriceNum > priceNum && (
                <span className="text-[11px] font-mono text-neutral-400 line-through">
                  ${origPriceNum.toFixed(2)}
                </span>
              )}
            </div>

            {discountPercent > 0 ? (
              <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                SAVE {discountPercent}%
              </span>
            ) : (
              <span className="text-[9px] font-mono text-neutral-400 font-semibold uppercase tracking-wider">
                IN STOCK
              </span>
            )}
          </div>

          {/* 4. Harmonized Luxury Action Pair */}
          <div className="grid grid-cols-2 gap-2">
            {/* + BAG Action */}
            <button
              type="button"
              onClick={handleAddToCartClick}
              title="Add to Shopping Bag"
              className={`group/bag h-9 sm:h-9.5 rounded-xl border flex items-center justify-center gap-1.5 px-2 transition-all duration-200 cursor-pointer shadow-2xs active:scale-[0.98] ${
                isAdded
                  ? "bg-neutral-950 border-neutral-950 text-emerald-400"
                  : "bg-white hover:bg-neutral-950 text-neutral-900 hover:text-white border-neutral-300 hover:border-neutral-950"
              }`}
            >
              {isAdded ? (
                <>
                  <CheckOutlined className="text-xs shrink-0 text-emerald-400 animate-scale-in" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider truncate text-emerald-400 animate-scale-in">
                    ADDED
                  </span>
                </>
              ) : (
                <>
                  <ShoppingOutlined className="text-xs group-hover/bag:scale-110 transition-transform duration-200 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider truncate">
                    + BAG
                  </span>
                </>
              )}
            </button>

            {/* BUY NOW Action */}
            <button
              type="button"
              onClick={handleBuyNowClick}
              title="Buy Now - Instant VIP Checkout"
              className="group/buy h-9 sm:h-9.5 rounded-xl bg-neutral-950 hover:bg-black text-white hover:text-amber-300 border border-neutral-950 flex items-center justify-center gap-1.5 px-2 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md active:scale-[0.98]"
            >
              <ThunderboltOutlined className="text-xs text-amber-400 group-hover/buy:scale-110 transition-transform duration-200 shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider truncate text-white group-hover/buy:text-amber-300">
                BUY NOW
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
