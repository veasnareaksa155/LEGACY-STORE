import React from "react";
import { Row, Col, Select, Empty, Skeleton } from "antd";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  products,
  loading,
  sortBy,
  onSortChange,
  onQuickView,
  onAddToCart,
  onBuyNow,
  activeCategory,
  wishlistItems = [],
  onToggleWishlist,
}) => {
  const getCategoryTitle = () => {
    switch (activeCategory) {
      case "shirt":
        return "TAILORED SHIRTS COLLECTION";
      case "t-shirt":
        return "LUXURY T-SHIRTS COLLECTION";
      case "shoes":
        return "FOOTWEAR & SHOES COLLECTION";
      default:
        return "EXPLORE ALL COLLECTIONS";
    }
  };

  const wishlistIds = new Set(wishlistItems.map((item) => item.id));

  return (
    <section
      id="products-section"
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-reveal"
    >
      {/* Section Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">
            LEGACY CATALOGUE
          </span>
          <h2 className="text-xl sm:text-3xl font-bold font-serif text-black uppercase tracking-tight">
            {getCategoryTitle()}
          </h2>
        </div>

        {/* Sort Select Dropdown */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 whitespace-nowrap">
            Sort By:
          </span>
          <Select
            value={sortBy}
            onChange={onSortChange}
            options={[
              { value: "latest", label: "Latest Arrivals" },
              { value: "price_asc", label: "Price: Low to High" },
              { value: "price_desc", label: "Price: High to Low" },
            ]}
            className="w-40 sm:w-48 text-xs font-medium"
          />
        </div>
      </div>

      {/* Grid Content with 2-Column mobile layout (xs={12}) */}
      {loading ? (
        <Row
          gutter={[
            { xs: 12, sm: 16, md: 24 },
            { xs: 16, sm: 20, md: 32 },
          ]}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Col key={n} xs={12} sm={12} md={8} lg={6}>
              <div className="p-3 border border-neutral-200 rounded-lg">
                <Skeleton.Image
                  active
                  className="!w-full !h-48 sm:!h-64 mb-3"
                />
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            </Col>
          ))}
        </Row>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
          <Empty
            description={
              <span className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                No products found matching your current filter or search
                criteria.
              </span>
            }
          />
        </div>
      ) : (
        <Row
          className="scroll-reveal-stagger"
          gutter={[
            { xs: 12, sm: 16, md: 24 },
            { xs: 16, sm: 20, md: 32 },
          ]}
        >
          {products.map((product) => (
            <Col key={product.id} xs={12} sm={12} md={8} lg={6}>
              <ProductCard
                product={product}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                isWishlisted={wishlistIds.has(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            </Col>
          ))}
        </Row>
      )}
    </section>
  );
};

export default ProductGrid;
