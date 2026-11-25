import React, { useState, useEffect, useMemo } from "react";
import { Drawer, Button, Select, Empty, Skeleton } from "antd";
import {
  FilterOutlined,
  SlidersOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import CategoryBar from "../components/CategoryBar";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";

const ShopPage = ({
  categories = [],
  products = [],
  loading = false,
  activeCategory = "all",
  onSelectCategory,
  searchQuery = "",
  onSearchChange,
  sortBy = "latest",
  onSortChange,
  onQuickView,
  onAddToCart,
  onBuyNow,
  wishlistItems = [],
  onToggleWishlist,
}) => {
  // Compute max catalog price dynamically
  const maxCatalogPrice = useMemo(() => {
    if (!products || products.length === 0) return 300;
    const prices = products.map((p) => Number(p.price) || 0);
    return Math.max(Math.ceil(Math.max(...prices) / 50) * 50, 300);
  }, [products]);

  // Filter States
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [selectedStatus, setSelectedStatus] = useState([]); // "new", "sale", "featured"
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]); // "black", "white", etc.
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Sync price range upper bound when products load
  useEffect(() => {
    if (maxCatalogPrice > 300 && priceRange[1] === 300) {
      setPriceRange([0, maxCatalogPrice]);
    }
  }, [maxCatalogPrice]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleToggleStatus = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handleToggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const handleToggleColor = (colorKey) => {
    setSelectedColors((prev) =>
      prev.includes(colorKey)
        ? prev.filter((c) => c !== colorKey)
        : [...prev, colorKey],
    );
  };

  const handleResetFilters = () => {
    if (onSelectCategory) onSelectCategory("all");
    if (onSearchChange) onSearchChange("");
    setPriceRange([0, maxCatalogPrice]);
    setSelectedStatus([]);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  // Helper: test if product matches color filters
  const productMatchesColor = (product, selectedKeys) => {
    if (!selectedKeys || selectedKeys.length === 0) return true;

    const tokens = [];
    if (Array.isArray(product.colors)) {
      tokens.push(...product.colors.map((c) => String(c).toLowerCase()));
    } else if (typeof product.colors === "string" && product.colors.trim()) {
      try {
        const parsed = JSON.parse(product.colors);
        if (Array.isArray(parsed)) {
          tokens.push(...parsed.map((c) => String(c).toLowerCase()));
        } else {
          tokens.push(String(product.colors).toLowerCase());
        }
      } catch {
        tokens.push(...product.colors.toLowerCase().split(/[,\s/]+/));
      }
    }

    if (product.color) {
      tokens.push(String(product.color).toLowerCase());
    }

    if (product.color_images && typeof product.color_images === "object") {
      tokens.push(...Object.keys(product.color_images).map((k) => k.toLowerCase()));
    }

    if (product.name) tokens.push(product.name.toLowerCase());
    if (product.description) tokens.push(product.description.toLowerCase());

    const combined = tokens.join(" ");

    const aliasMap = {
      black: ["black", "noir", "dark", "charcoal", "000000"],
      white: ["white", "blanc", "cream", "ivory", "light", "ffffff"],
      amber: ["amber", "gold", "yellow", "caramel", "tan", "mustard", "f59e0b"],
      navy: ["navy", "blue", "marine", "cobalt", "indigo", "1e293b", "1e3a8a"],
      burgundy: ["burgundy", "red", "bordeaux", "maroon", "crimson", "wine", "781d2e"],
      charcoal: ["charcoal", "gray", "grey", "anthracite", "slate", "4b5563"],
      beige: ["beige", "tan", "khaki", "camel", "nude", "sand", "d2b48c"],
    };

    return selectedKeys.some((k) => {
      const aliases = aliasMap[k] || [k];
      return aliases.some((al) => combined.includes(al));
    });
  };

  // Helper: test if product matches size filters
  const productMatchesSize = (product, sizes) => {
    if (!sizes || sizes.length === 0) return true;

    let prodSizes = [];
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      prodSizes = product.sizes.map((s) => String(s).toUpperCase().trim());
    } else if (typeof product.sizes === "string" && product.sizes.trim()) {
      try {
        const parsed = JSON.parse(product.sizes);
        if (Array.isArray(parsed)) {
          prodSizes = parsed.map((s) => String(s).toUpperCase().trim());
        }
      } catch {
        prodSizes = product.sizes.split(",").map((s) => s.trim().toUpperCase());
      }
    }

    if (prodSizes.length === 0) {
      prodSizes = ["S", "M", "L", "XL"];
    }

    return sizes.some((sz) => prodSizes.includes(sz.toUpperCase().trim()));
  };

  // Filter products dynamically based on all criteria
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Category Filter
      if (activeCategory && activeCategory !== "all") {
        const catSlug = (product.category?.slug || product.category_slug || "").toLowerCase();
        const catName = (product.category?.name || product.category_name || "").toLowerCase();
        const catId = String(product.category_id || product.category?.id || "");
        const active = activeCategory.toLowerCase();

        const match =
          catSlug === active ||
          catName === active ||
          catId === active ||
          catSlug.includes(active);
        if (!match) return false;
      }

      // 2. Search Query Filter
      if (searchQuery && searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = product.name?.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        const catMatch = product.category?.name?.toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !catMatch) return false;
      }

      // 3. Price Range Filter
      const price = Number(product.price || 0);
      if (price < priceRange[0] || price > priceRange[1]) return false;

      // 4. Special Drops / Status Filter
      if (selectedStatus.length > 0) {
        const isNew = Boolean(product.is_new);
        const isSale = Boolean(
          (product.original_price && Number(product.original_price) > Number(product.price)) ||
          product.on_sale,
        );
        const isFeatured = Boolean(product.is_featured);

        const matchesStatus = selectedStatus.some((st) => {
          if (st === "new") return isNew;
          if (st === "sale") return isSale;
          if (st === "featured") return isFeatured;
          return false;
        });
        if (!matchesStatus) return false;
      }

      // 5. Sizes Filter
      if (!productMatchesSize(product, selectedSizes)) {
        return false;
      }

      // 6. Colors Filter (Fully Working!)
      if (!productMatchesColor(product, selectedColors)) {
        return false;
      }

      return true;
    });
  }, [
    products,
    activeCategory,
    searchQuery,
    priceRange,
    selectedStatus,
    selectedSizes,
    selectedColors,
  ]);

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "price_asc") {
        return Number(a.price || 0) - Number(b.price || 0);
      }
      if (sortBy === "price_desc") {
        return Number(b.price || 0) - Number(a.price || 0);
      }
      if (sortBy === "rating_desc") {
        return Number(b.rating || 4.7) - Number(a.rating || 4.7);
      }
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      // default: latest arrivals (by id desc)
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }, [filteredProducts, sortBy]);

  const getCategoryTitle = () => {
    if (!activeCategory || activeCategory === "all") {
      return "EXPLORE ALL COLLECTIONS";
    }
    const foundCat = categories.find(
      (c) =>
        (c.slug && c.slug.toLowerCase() === activeCategory.toLowerCase()) ||
        String(c.id) === activeCategory,
    );
    if (foundCat && foundCat.name) {
      return `${foundCat.name.toUpperCase()} COLLECTION`;
    }
    return `${activeCategory.toUpperCase()} COLLECTION`;
  };

  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map((item) => item.id)),
    [wishlistItems],
  );

  return (
    <div className="bg-neutral-50 text-neutral-900 pb-24 min-h-screen">
      {/* 1. Page Header (Editorial Atelier Banner) */}
      <div className="bg-neutral-950 text-white py-12 sm:py-16 px-4 text-center relative overflow-hidden border-b border-neutral-800">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="text-[10px] sm:text-xs font-bold text-amber-400 font-mono uppercase tracking-widest block mb-1.5">
            PARISIAN HAUTE COUTURE ATELIER
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif uppercase tracking-tight text-white mb-3">
            SHOP ALL COLLECTIONS
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">
            Curated catalogue of fine tailored garments, luxury heavyweight cotton tees, and handmade calfskin accessories.
          </p>
        </div>
      </div>

      {/* 2. Top Search & Category Navigation Bar */}
      <div className="pt-6 relative z-30">
        <CategoryBar
          categories={categories}
          products={products}
          wishlistItems={wishlistItems}
          onQuickView={onQuickView}
          activeCategory={activeCategory}
          onSelectCategory={onSelectCategory}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          totalCount={sortedProducts.length}
        />
      </div>

      {/* 3. Main Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Controls Row: Section Title & Sort Select */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200">
          <div>
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-1">
              CURRENT SHOWCASE
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-neutral-950 uppercase tracking-tight m-0">
              {getCategoryTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md cursor-pointer"
            >
              <SlidersOutlined className="text-amber-400" />
              <span>FILTERS ({sortedProducts.length})</span>
            </button>

            {/* Sort Select Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 whitespace-nowrap hidden sm:inline-block">
                Sort:
              </span>
              <Select
                value={sortBy}
                onChange={onSortChange}
                options={[
                  { value: "latest", label: "Latest Arrivals" },
                  { value: "price_asc", label: "Price: Low to High" },
                  { value: "price_desc", label: "Price: High to Low" },
                  { value: "rating_desc", label: "Top Customer Rated" },
                  { value: "name_asc", label: "Alphabetical (A - Z)" },
                ]}
                className="w-44 sm:w-52 text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* 4. 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Filter Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <FilterSidebar
              categories={categories}
              products={products}
              activeCategory={activeCategory}
              onSelectCategory={onSelectCategory}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              maxCatalogPrice={maxCatalogPrice}
              selectedStatus={selectedStatus}
              onToggleStatus={handleToggleStatus}
              selectedSizes={selectedSizes}
              onToggleSize={handleToggleSize}
              selectedColors={selectedColors}
              onToggleColor={handleToggleColor}
              onResetFilters={handleResetFilters}
              totalCount={sortedProducts.length}
            />
          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="p-3 border border-neutral-200 rounded-2xl bg-white shadow-xs"
                  >
                    <Skeleton.Image
                      active
                      className="!w-full !h-52 sm:!h-64 mb-3 rounded-xl"
                    />
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-neutral-300 p-8 shadow-xs">
                <Empty
                  description={
                    <div className="space-y-4 max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 text-2xl">
                        <ShoppingOutlined />
                      </div>
                      <h4 className="text-base font-bold font-serif uppercase tracking-tight text-neutral-900 m-0">
                        No Pieces Found Matching Filters
                      </h4>
                      <p className="text-xs text-neutral-500 font-light leading-relaxed">
                        Try loosening your price boundaries, clearing selected sizes or colors, or browse all collections.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-2 bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-mono font-bold px-6 py-2.5 rounded-full tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                      >
                        <ReloadOutlined className="text-amber-400" />
                        <span>RESET ALL FILTERS</span>
                      </button>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={onQuickView}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    isWishlisted={wishlistIds.has(product.id)}
                    onToggleWishlist={onToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Mobile Filter Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2 font-serif font-black uppercase tracking-wider text-neutral-900">
            <FilterOutlined className="text-amber-500" />
            <span>FILTER CATALOGUE</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        width={320}
        styles={{ body: { padding: "16px", backgroundColor: "#fafafa" } }}
      >
        <FilterSidebar
          categories={categories}
          products={products}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            onSelectCategory(cat);
          }}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          maxCatalogPrice={maxCatalogPrice}
          selectedStatus={selectedStatus}
          onToggleStatus={handleToggleStatus}
          selectedSizes={selectedSizes}
          onToggleSize={handleToggleSize}
          selectedColors={selectedColors}
          onToggleColor={handleToggleColor}
          onResetFilters={handleResetFilters}
          totalCount={sortedProducts.length}
        />
        <div className="pt-4 sticky bottom-0 bg-neutral-50 pb-2">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="w-full py-3 bg-neutral-950 hover:bg-black text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircleOutlined className="text-amber-400" />
            <span>APPLY FILTERS ({sortedProducts.length})</span>
          </button>
        </div>
      </Drawer>
    </div>
  );
};

export default React.memo(ShopPage);
