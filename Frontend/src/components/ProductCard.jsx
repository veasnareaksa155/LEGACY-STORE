import React from "react";
import {
  EyeOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  StarFilled,
} from "@ant-design/icons";

const ProductCard = ({
  product,
  onQuickView,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}) => {
  const discountPercent = product.original_price
    ? Math.round(
        ((product.original_price - product.price) / product.original_price) *
          100,
      )
    : 0;

  const rating =
    product.rating || (4.7 + ((product.id || 1) % 4) * 0.1).toFixed(1);
  const reviewsCount =
    product.reviews_count || (((product.id || 1) * 23) % 180) + 3;

  const availableSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : ["S", "M", "L", "XL"];

  return (
    <div className="group relative bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 flex flex-col h-full transform hover:-translate-y-1">
      {/* Image Container */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
          }}
        />

        {/* Subtle Backdrop Blur & Soft Dark Tint Overlay on Hover */}
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[5]" />

        {/* Vertical Status Badges (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.is_new && (
            <span className="bg-black text-white text-[10px] sm:text-[11px] font-black uppercase px-2.5 py-1 rounded-sm tracking-wider shadow-md">
              NEW
            </span>
          )}
          {product.is_featured && (
            <span className="bg-black text-white text-[10px] sm:text-[11px] font-black uppercase px-2.5 py-1 rounded-sm tracking-wider shadow-md">
              HOT
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#ef4444] text-white text-[10px] sm:text-[11px] font-black uppercase px-2.5 py-1 rounded-sm tracking-wider shadow-md">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Centered View Details Button Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="pointer-events-auto bg-white/95 hover:bg-black hover:text-white text-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300 border border-neutral-200 backdrop-blur-md cursor-pointer"
            title="View Product Page"
          >
            <EyeOutlined className="text-sm" />
            <span>VIEW DETAILS</span>
          </button>
        </div>

        {/* Top Right Floating Wishlist Icon */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 hover:bg-white text-black transition-all duration-200 cursor-pointer border border-neutral-100"
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {isWishlisted ? (
              <HeartFilled
                style={{ color: "#ff4d4f" }}
                className="text-xs sm:text-sm"
              />
            ) : (
              <HeartOutlined className="text-xs sm:text-sm" />
            )}
          </button>
        </div>
      </div>

      {/* Product Details Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between bg-white text-black">
        <div>
          {/* Category & Star Rating */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
              {product.category?.name || "T-SHIRT"}
            </span>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 font-mono text-xs">
              <StarFilled
                style={{ color: "#fbbf24" }}
                className="text-[11px] sm:text-xs text-amber-400"
              />
              <span className="font-bold text-neutral-800">{rating}</span>
              <span className="text-neutral-400 font-normal">
                ({reviewsCount})
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onQuickView(product)}
            className="text-xs sm:text-sm font-bold font-serif text-black hover:text-amber-600 cursor-pointer line-clamp-1 mb-2.5 uppercase tracking-wide transition-colors"
          >
            {product.name}
          </h3>

          {/* Sizes Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {availableSizes.map((sz) => (
              <span
                key={sz}
                className="text-[10px] font-mono font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded border border-neutral-200/80 transition-colors"
              >
                {sz}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Add Button */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 mt-auto">
          <div className="flex items-baseline space-x-1.5 sm:space-x-2">
            <span className="text-base sm:text-lg font-black text-black font-sans">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.original_price && (
              <span className="text-xs text-neutral-400 line-through font-sans">
                ${Number(product.original_price).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="bg-black hover:bg-amber-400 hover:text-black text-white text-xs font-black uppercase tracking-wider px-2.5 py-2 sm:px-3.5 sm:py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            title="Add to Cart"
          >
            <ShoppingCartOutlined className="text-sm" />
            <span className="hidden sm:inline">+ ADD</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
