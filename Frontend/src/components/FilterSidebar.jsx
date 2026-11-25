import React, { useMemo } from "react";
import {
  FilterOutlined,
  ReloadOutlined,
  CheckOutlined,
  TagOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  CloseOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { Slider } from "antd";

const FilterSidebar = ({
  categories = [],
  products = [],
  activeCategory = "all",
  onSelectCategory,
  priceRange = [0, 300],
  onPriceChange,
  maxCatalogPrice = 300,
  selectedStatus = [], // "new", "sale", "featured"
  onToggleStatus,
  selectedSizes = [], // "S", "M", "L", "XL", "XXL"
  onToggleSize,
  selectedColors = [], // color keys: "black", "white", etc.
  onToggleColor,
  onResetFilters,
  totalCount = 0,
}) => {
  // 1. Dynamic category options with live counts
  const categoryOptions = useMemo(() => {
    const list = [{ label: "All Collections", value: "all", count: products.length }];

    if (categories && categories.length > 0) {
      categories.forEach((cat) => {
        const slug = (cat.slug || cat.name || "").toLowerCase();
        const count = products.filter((p) => {
          const pSlug = (p.category?.slug || p.category_slug || "").toLowerCase();
          const pName = (p.category?.name || p.category_name || "").toLowerCase();
          const pId = String(p.category_id || p.category?.id || "");
          return pSlug === slug || pName === slug || pId === String(cat.id);
        }).length;

        list.push({
          label: cat.name || cat.slug || "Category",
          value: cat.slug || String(cat.id),
          count,
        });
      });
    } else {
      const seen = new Set();
      products.forEach((p) => {
        const slug = p.category?.slug || p.category_slug || (typeof p.category === "string" ? p.category : null);
        const name = p.category?.name || p.category_name || slug;
        if (slug && !seen.has(slug)) {
          seen.add(slug);
          const count = products.filter((item) => (item.category?.slug || item.category_slug) === slug).length;
          list.push({
            label: name,
            value: slug,
            count,
          });
        }
      });
    }

    return list;
  }, [categories, products]);

  const sizeOptions = ["S", "M", "L", "XL", "XXL"];

  const colorOptions = [
    { name: "Obsidian Black", hex: "#000000", key: "black" },
    { name: "Pure White", hex: "#FFFFFF", key: "white" },
    { name: "Parisian Amber", hex: "#F59E0B", key: "amber" },
    { name: "Midnight Navy", hex: "#1E293B", key: "navy" },
    { name: "Deep Burgundy", hex: "#781D2E", key: "burgundy" },
    { name: "Slate Charcoal", hex: "#4B5563", key: "charcoal" },
    { name: "Atelier Camel", hex: "#D2B48C", key: "beige" },
  ];

  // 4 balanced price presets that fit in a clean 2x2 or 4-pill layout
  const pricePresets = [
    { label: "All Prices", range: [0, maxCatalogPrice] },
    { label: "< $50", range: [0, 50] },
    { label: "$50 – $100", range: [50, 100] },
    { label: "$100+", range: [100, maxCatalogPrice] },
  ];

  const hasActiveFilters =
    activeCategory !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < maxCatalogPrice ||
    selectedStatus.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0;

  const activeFiltersCount =
    (activeCategory !== "all" ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxCatalogPrice ? 1 : 0) +
    selectedStatus.length +
    selectedSizes.length +
    selectedColors.length;

  return (
    <aside className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow text-neutral-900 space-y-6">
      
      {/* 1. Header & Active Filter Strip */}
      <div className="pb-4 border-b border-neutral-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200/60">
              <FilterOutlined className="text-amber-500 text-xs" />
            </div>
            <h3 className="font-serif font-black uppercase text-sm tracking-wider text-neutral-950 m-0">
              Filters
            </h3>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-neutral-950 text-amber-400 text-[10px] font-mono font-bold flex items-center justify-center shadow-2xs">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-950 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-neutral-100"
              title="Reset all active filters"
            >
              <ReloadOutlined className="text-[10px]" />
              <span>Reset All</span>
            </button>
          )}
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {activeCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase bg-neutral-950 text-white shadow-2xs">
                <span>{activeCategory}</span>
                <CloseOutlined
                  onClick={() => onSelectCategory("all")}
                  className="cursor-pointer hover:text-amber-400 text-[8px]"
                />
              </span>
            )}

            {(priceRange[0] > 0 || priceRange[1] < maxCatalogPrice) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase bg-neutral-100 text-neutral-800 border border-neutral-200 shadow-2xs">
                <span>${priceRange[0]} – ${priceRange[1]}</span>
                <CloseOutlined
                  onClick={() => onPriceChange([0, maxCatalogPrice])}
                  className="cursor-pointer hover:text-rose-600 text-[8px]"
                />
              </span>
            )}

            {selectedStatus.map((st) => (
              <span
                key={st}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs"
              >
                <span>{st === "new" ? "New" : st === "sale" ? "Sale" : "Hot"}</span>
                <CloseOutlined
                  onClick={() => onToggleStatus(st)}
                  className="cursor-pointer hover:text-rose-600 text-[8px]"
                />
              </span>
            ))}

            {selectedSizes.map((sz) => (
              <span
                key={sz}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase bg-neutral-100 text-neutral-800 border border-neutral-200 shadow-2xs"
              >
                <span>Size: {sz}</span>
                <CloseOutlined
                  onClick={() => onToggleSize(sz)}
                  className="cursor-pointer hover:text-rose-600 text-[8px]"
                />
              </span>
            ))}

            {selectedColors.map((colKey) => {
              const matchedCol = colorOptions.find((c) => c.key === colKey);
              return (
                <span
                  key={colKey}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase bg-neutral-100 text-neutral-800 border border-neutral-200 shadow-2xs"
                >
                  <span
                    className="w-2 h-2 rounded-full border border-neutral-300 inline-block"
                    style={{ backgroundColor: matchedCol ? matchedCol.hex : "#000" }}
                  />
                  <span>{matchedCol ? matchedCol.name.split(" ")[1] || colKey : colKey}</span>
                  <CloseOutlined
                    onClick={() => onToggleColor(colKey)}
                    className="cursor-pointer hover:text-rose-600 text-[8px]"
                  />
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Collection Category Filter (Clean Luxury Nav List) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
            COLLECTION
          </span>
          <span className="text-[10px] font-mono text-neutral-400">
            {categoryOptions.length} categories
          </span>
        </div>

        <div className="space-y-1">
          {categoryOptions.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onSelectCategory(cat.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-neutral-950 text-white font-bold shadow-xs"
                    : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/70 font-medium"
                }`}
              >
                <span className="truncate pr-2">{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 transition-colors ${
                    isActive
                      ? "bg-white/20 text-white font-bold"
                      : "text-neutral-400 bg-neutral-100"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Price Range Slider & Presets */}
      <div className="pt-4 border-t border-neutral-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
            PRICE RANGE
          </span>
          <span className="text-xs font-mono font-bold text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/60">
            ${priceRange[0]} – ${priceRange[1]}
          </span>
        </div>

        {/* 4 Balanced Price Preset Pills (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-1.5">
          {pricePresets.map((preset) => {
            const isPresetActive =
              priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1];
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onPriceChange(preset.range)}
                className={`py-1.5 px-2 text-[10px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer text-center ${
                  isPresetActive
                    ? "bg-neutral-950 text-amber-400 shadow-2xs"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200/60"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Fine Luxury Slider */}
        <div className="px-1 pt-1">
          <Slider
            range
            min={0}
            max={maxCatalogPrice}
            step={5}
            value={priceRange}
            onChange={onPriceChange}
            styles={{
              track: { background: "#171717", height: "3px" },
              rail: { height: "3px", backgroundColor: "#e5e5e5" },
              handle: { borderColor: "#171717", backgroundColor: "#F59E0B", width: "12px", height: "12px" },
            }}
          />
          <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-0.5">
            <span>$0</span>
            <span>${Math.round(maxCatalogPrice / 2)}</span>
            <span>${maxCatalogPrice}+</span>
          </div>
        </div>
      </div>

      {/* 4. Special Drops & Status Filter */}
      <div className="pt-4 border-t border-neutral-100 space-y-2.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block">
          CURATION & OFFERS
        </span>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onToggleStatus("new")}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              selectedStatus.includes("new")
                ? "bg-neutral-950 text-white shadow-xs font-black"
                : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200/60"
            }`}
          >
            <ThunderboltOutlined className="text-amber-400 text-xs" />
            <span>NEW</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus("sale")}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              selectedStatus.includes("sale")
                ? "bg-rose-600 text-white shadow-xs font-black"
                : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200/60"
            }`}
          >
            <TagOutlined className="text-rose-400 text-xs" />
            <span>SALE</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus("featured")}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              selectedStatus.includes("featured")
                ? "bg-amber-400 text-black shadow-xs font-black"
                : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200/60"
            }`}
          >
            <FireOutlined className="text-amber-500 text-xs" />
            <span>HOT</span>
          </button>
        </div>
      </div>

      {/* 5. Size Selection (5 Balanced Tiles) */}
      <div className="pt-4 border-t border-neutral-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
            SIZE
          </span>
          {selectedSizes.length > 0 && (
            <button
              type="button"
              onClick={() => selectedSizes.forEach((sz) => onToggleSize(sz))}
              className="text-[10px] font-mono text-neutral-400 hover:text-black cursor-pointer uppercase"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {sizeOptions.map((sz) => {
            const isSelected = selectedSizes.includes(sz);
            return (
              <button
                key={sz}
                type="button"
                onClick={() => onToggleSize(sz)}
                className={`h-9 flex items-center justify-center rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  isSelected
                    ? "bg-neutral-950 text-amber-400 shadow-xs scale-102 font-black"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200/60"
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Color Palette (All 7 Swatches in 1 Single Line) */}
      <div className="pt-4 border-t border-neutral-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
            COLOR PALETTE
          </span>
          {selectedColors.length > 0 && (
            <button
              type="button"
              onClick={() => selectedColors.forEach((c) => onToggleColor(c))}
              className="text-[10px] font-mono text-neutral-400 hover:text-black cursor-pointer uppercase"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-0.5">
          {colorOptions.map((col) => {
            const isSelected = selectedColors.includes(col.key);
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => onToggleColor(col.key)}
                title={col.name}
                className={`w-6.5 h-6.5 rounded-full transition-all cursor-pointer relative flex items-center justify-center shrink-0 border ${
                  col.hex === "#FFFFFF"
                    ? "border-neutral-300 shadow-2xs"
                    : "border-transparent"
                } ${
                  isSelected
                    ? "scale-115 ring-2 ring-neutral-950 ring-offset-2 shadow-sm"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: col.hex }}
              >
                {isSelected && (
                  <CheckOutlined
                    className={`text-[9px] ${
                      col.hex === "#FFFFFF" ? "text-neutral-950" : "text-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Results Counter (Refined Luxury Footer) */}
      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
          CATALOGUE MATCH
        </span>
        <span className="text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-neutral-950 text-white shadow-2xs">
          {totalCount} {totalCount === 1 ? "PIECE" : "PIECES"}
        </span>
      </div>
    </aside>
  );
};

export default React.memo(FilterSidebar);
