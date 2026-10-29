import React, { useState, useRef, useEffect } from "react";
import { Input } from "antd";
import {
  SearchOutlined,
  StarFilled,
  HeartFilled,
  FireOutlined,
  AppstoreOutlined,
  RightOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";

const CategoryBar = ({
  categories = [],
  products = [],
  wishlistItems = [],
  onQuickView,
  activeCategory = "all",
  onSelectCategory,
  searchQuery = "",
  onSearchChange,
  totalCount = 0,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [categorySearch, setCategorySearch] = useState(searchQuery || "");
  const searchContainerRef = useRef(null);

  // Sync categorySearch if searchQuery is cleared externally
  useEffect(() => {
    if (!searchQuery) {
      setCategorySearch("");
    }
  }, [searchQuery]);

  const handleCategorySearchChange = (e) => {
    const val = e.target.value;
    setCategorySearch(val);
    onSearchChange(val);
    setIsFocused(true);
  };

  const options = [
    { label: "ALL PRODUCTS", value: "all" },
    { label: "SHIRTS", value: "shirt" },
    { label: "T-SHIRTS", value: "t-shirt" },
    { label: "SHOES", value: "shoes" },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter matching products for live autocomplete results
  const matchingProducts = products.filter((prod) => {
    if (!searchQuery || !searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = prod.name?.toLowerCase().includes(q);
    const descMatch = prod.description?.toLowerCase().includes(q);
    const catMatch = prod.category?.name?.toLowerCase().includes(q);
    return nameMatch || descMatch || catMatch;
  });

  // Featured discovery products when search is empty/focused
  const discoveryProducts = products.slice(0, 3);

  return (
    <div className="bg-neutral-50 border-y border-neutral-200 py-6 px-4 relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills / Segmented Buttons */}
        <div className="flex items-center space-x-2.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {options.map((option) => {
            const isActive = activeCategory === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onSelectCategory(option.value);
                  setIsFocused(false);
                }}
                className={`px-5 py-2.5 text-xs sm:text-sm font-extrabold tracking-wider uppercase rounded-full transition-all duration-300 whitespace-nowrap shadow-sm cursor-pointer ${
                  isActive
                    ? "bg-black text-white shadow-md scale-105"
                    : "bg-white text-neutral-800 hover:bg-neutral-200 border border-neutral-300"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Right Search Input with Interactive Product Discovery Dropdown */}
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto justify-end">
          {onSearchChange && (
            <div
              ref={searchContainerRef}
              className="relative w-full sm:w-72 z-50"
            >
              <Input
                placeholder="Search products in shop..."
                prefix={<SearchOutlined className="text-neutral-400 mr-1" />}
                value={categorySearch}
                onFocus={() => setIsFocused(true)}
                onChange={handleCategorySearchChange}
                allowClear
                className="rounded-full border-neutral-300 hover:border-black focus:border-black text-sm sm:text-xs py-2 sm:py-1.5 px-4 h-11 sm:h-9 shadow-xs"
              />

              {/* SEARCH AUTOCOMPLETE & PRODUCT DISCOVER DROPDOWN PANEL */}
              {isFocused && (
                <div className="absolute top-full right-0 mt-2 w-full sm:w-96 max-w-[calc(100vw-32px)] bg-white/98 backdrop-blur-md rounded-2xl border border-neutral-200 shadow-2xl z-[9999] overflow-hidden text-neutral-900 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                  {/* Category Type Quick Filters Header */}
                  <div className="bg-neutral-100/90 p-3 border-b border-neutral-200 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                      <AppstoreOutlined className="text-amber-500" />
                      PRODUCT TYPES & DISCOVERY
                    </span>
                    <button
                      onClick={() => setIsFocused(false)}
                      className="text-neutral-400 hover:text-black transition-colors p-0.5 cursor-pointer"
                    >
                      <CloseCircleFilled className="text-xs" />
                    </button>
                  </div>

                  {/* Quick Category Pills inside Search */}
                  <div className="p-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    <button
                      onClick={() => {
                        onSelectCategory("all");
                        setIsFocused(false);
                      }}
                      className="px-2.5 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase shrink-0 cursor-pointer"
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => {
                        onSelectCategory("shirt");
                        setIsFocused(false);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold rounded-full uppercase border border-neutral-200 shrink-0 cursor-pointer"
                    >
                      👔 SHIRTS
                    </button>
                    <button
                      onClick={() => {
                        onSelectCategory("t-shirt");
                        setIsFocused(false);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold rounded-full uppercase border border-neutral-200 shrink-0 cursor-pointer"
                    >
                      👕 T-SHIRTS
                    </button>
                    <button
                      onClick={() => {
                        onSelectCategory("shoes");
                        setIsFocused(false);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold rounded-full uppercase border border-neutral-200 shrink-0 cursor-pointer"
                    >
                      👟 SHOES
                    </button>
                  </div>

                  {/* CASE 1: SEARCHING QUERY HAS RESULTS */}
                  {searchQuery && searchQuery.trim() !== "" ? (
                    <div className="max-h-72 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                      <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                        MATCHING PRODUCTS ({matchingProducts.length})
                      </div>
                      {matchingProducts.length > 0 ? (
                        matchingProducts.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              if (onQuickView) onQuickView(prod);
                              setIsFocused(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer group"
                          >
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              className="w-12 h-12 object-cover rounded-lg bg-neutral-100 border border-neutral-200 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-neutral-900 font-serif truncate group-hover:text-black">
                                {prod.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                                  {prod.category?.name || "ALEXANDRE LUXE"}
                                </span>
                                <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                                  <StarFilled style={{ color: "#fbbf24" }} />
                                  <span>
                                    {prod.rating ||
                                      (
                                        4.7 +
                                        ((prod.id || 1) % 4) * 0.1
                                      ).toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-extrabold font-sans text-black pr-1">
                              ${Number(prod.price).toFixed(2)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-neutral-400 text-xs">
                          No matching products found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  ) : (
                    /* CASE 2: EMPTY SEARCH - PRODUCT DISCOVER & SAVED ITEMS */
                    <div className="p-3 space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                      {/* Products You Liked / Saved in Wishlist */}
                      {wishlistItems && wishlistItems.length > 0 && (
                        <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-red-500 font-mono">
                              <HeartFilled /> PRODUCTS YOU SAVED & LIKED
                            </span>
                            <span className="text-[9px] font-mono text-neutral-400">
                              ({wishlistItems.length} Saved)
                            </span>
                          </div>
                          <div className="space-y-1">
                            {wishlistItems.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                onClick={() => {
                                  if (onQuickView) onQuickView(item);
                                  setIsFocused(false);
                                }}
                                className="flex items-center gap-2.5 p-1.5 rounded-lg bg-red-50/50 hover:bg-red-50 border border-red-100 transition-colors cursor-pointer group"
                              >
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-9 h-9 object-cover rounded bg-neutral-100 border border-neutral-200"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-neutral-900 truncate">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-neutral-500 font-mono">
                                    ${Number(item.price).toFixed(2)}
                                  </div>
                                </div>
                                <RightOutlined className="text-[10px] text-neutral-400 group-hover:text-black transition-colors" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trending / Featured Product Discovery */}
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                          <FireOutlined className="text-amber-500" />
                          TRENDING PRODUCT DISCOVERIES
                        </div>
                        <div className="space-y-1">
                          {discoveryProducts.map((prod) => (
                            <div
                              key={prod.id}
                              onClick={() => {
                                if (onQuickView) onQuickView(prod);
                                setIsFocused(false);
                              }}
                              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer group"
                            >
                              <img
                                src={prod.image_url}
                                alt={prod.name}
                                className="w-10 h-10 object-cover rounded-lg bg-neutral-100 border border-neutral-200"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-neutral-900 font-serif truncate">
                                  {prod.name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                                  <span>
                                    {prod.category?.name || "ALEXANDRE LUXE"}
                                  </span>
                                  <span>•</span>
                                  <span className="font-bold text-amber-500 flex items-center gap-0.5">
                                    <StarFilled style={{ color: "#fbbf24" }} />
                                    {prod.rating || "4.8"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-bold font-sans text-black">
                                ${Number(prod.price).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="text-xs sm:text-sm font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
            <span>RESULTS:</span>
            <span className="bg-black text-white px-3 py-1 rounded-full font-extrabold text-xs sm:text-sm">
              {totalCount} ITEMS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
