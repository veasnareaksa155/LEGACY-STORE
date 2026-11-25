import React, { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  Input,
  Progress,
  Empty,
  Checkbox,
  notification,
} from "antd";
import {
  DeleteOutlined,
  ShoppingOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  TagOutlined,
  StarFilled,
} from "@ant-design/icons";
import { getDeliverySettings } from "../services/deliverySettings";

const CartDrawer = ({
  open,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onBulkRemoveItems,
  onProceedToCheckout,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromoObj, setAppliedPromoObj] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);

  // Reset selected keys when drawer opens or cartItems change
  useEffect(() => {
    setSelectedKeys([]);
  }, [open, cartItems.length]);

  const getItemKey = (item) => `${item.id}-${item.size}-${item.color}`;

  const allKeys = cartItems.map(getItemKey);
  const isAllSelected =
    allKeys.length > 0 && selectedKeys.length === allKeys.length;
  const isIndeterminate =
    selectedKeys.length > 0 && selectedKeys.length < allKeys.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedKeys(allKeys);
    } else {
      setSelectedKeys([]);
    }
  };

  const handleItemSelect = (key, checked) => {
    if (checked) {
      setSelectedKeys((prev) => [...prev, key]);
    } else {
      setSelectedKeys((prev) => prev.filter((k) => k !== key));
    }
  };

  const handleBulkDelete = () => {
    if (selectedKeys.length === 0) return;
    if (onBulkRemoveItems) {
      onBulkRemoveItems(selectedKeys);
    } else {
      selectedKeys.forEach((key) => {
        const item = cartItems.find((i) => getItemKey(i) === key);
        if (item) onRemoveItem(item.id, item.size, item.color);
      });
    }
    setSelectedKeys([]);
  };

  const deliverySettings = getDeliverySettings();
  const freeShippingThreshold = Number(
    deliverySettings.freeShippingThreshold || 50,
  );
  const standardFee = Number(deliverySettings.standardDeliveryFee ?? 2);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );
  const totalItemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100),
  );

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === "LUXE10") {
      const disc = subtotal * 0.1;
      setDiscountAmount(disc);
      const promoObj = { code, discountPercent: 10, discountAmount: disc };
      setAppliedPromoObj(promoObj);
      notification.success({
        message: "Promo Code Applied!",
        description: `Code "LUXE10" applied successfully! Saved $${disc.toFixed(2)} (10% OFF).`,
        placement: "bottomRight",
      });
    } else if (code === "WELCOME20") {
      const disc = subtotal * 0.2;
      setDiscountAmount(disc);
      const promoObj = { code, discountPercent: 20, discountAmount: disc };
      setAppliedPromoObj(promoObj);
      notification.success({
        message: "Promo Code Applied!",
        description: `Code "WELCOME20" applied successfully! Saved $${disc.toFixed(2)} (20% OFF).`,
        placement: "bottomRight",
      });
    } else if (code === "VIP15") {
      const disc = subtotal * 0.15;
      setDiscountAmount(disc);
      const promoObj = { code, discountPercent: 15, discountAmount: disc };
      setAppliedPromoObj(promoObj);
      notification.success({
        message: "Promo Code Applied!",
        description: `Code "VIP15" applied successfully! Saved $${disc.toFixed(2)} (15% OFF).`,
        placement: "bottomRight",
      });
    } else if (code === "FREESHIP") {
      setDiscountAmount(0);
      const promoObj = {
        code,
        discountPercent: 0,
        discountAmount: 0,
        isFreeShip: true,
      };
      setAppliedPromoObj(promoObj);
      notification.success({
        message: "Promo Code Applied!",
        description: `Code "FREESHIP" applied! Free Delivery unlocked.`,
        placement: "bottomRight",
      });
    } else {
      setDiscountAmount(0);
      setAppliedPromoObj(null);
      notification.error({
        message: "Invalid Promo Code",
        description:
          "Code not recognized. Valid promo codes: LUXE10, WELCOME20, VIP15, FREESHIP.",
        placement: "bottomRight",
      });
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <Drawer
      title={
        <div className="flex items-center space-x-2">
          <ShoppingOutlined style={{ fontSize: "18px", color: "#000" }} />
          <span className="font-serif font-bold text-sm sm:text-base uppercase tracking-wider text-black">
            YOUR SHOPPING BAG
          </span>
          <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
            {totalItemCount}
          </span>
        </div>
      }
      extra={
        <button
          onClick={onClose}
          className="text-black hover:text-red-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
          title="Close"
        >
          <CloseOutlined style={{ fontSize: "16px", color: "#000" }} />
        </button>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={440}
      closeIcon={false}
      className="cart-drawer-custom"
    >
      <div className="flex flex-col h-full justify-between -mt-1">
        {/* Top Free Shipping Progress Card */}
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/90 mb-3 shadow-2xs">
          <div className="text-[11px] font-bold text-neutral-800 mb-1.5 flex justify-between items-center font-mono">
            <span className="truncate pr-1">
              {subtotal >= freeShippingThreshold ? (
                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                  <CheckCircleOutlined /> FREE EXPRESS SHIPPING UNLOCKED
                </span>
              ) : (
                `Add $${(freeShippingThreshold - subtotal).toFixed(2)} more for Free Shipping`
              )}
            </span>
            <span className="text-black font-black">{progressPercent}%</span>
          </div>
          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeColor="#000000"
            size="small"
            className="m-0"
          />
        </div>

        {/* Multi-select Header Toolbar */}
        {cartItems.length > 0 && (
          <div className="flex items-center justify-between bg-neutral-100/80 px-3 py-1.5 rounded-lg mb-2 border border-neutral-200/70">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={handleSelectAll}
              className="text-[11px] font-bold text-neutral-700 uppercase"
            >
              Select All ({cartItems.length})
            </Checkbox>

            {selectedKeys.length > 0 && (
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
                className="text-[10px] font-bold uppercase rounded-md h-6 px-2.5"
              >
                REMOVE ({selectedKeys.length})
              </Button>
            )}
          </div>
        )}

        {/* Cart Items Scroll List */}
        <div className="flex-1 overflow-y-auto pr-1 divide-y divide-neutral-100 space-y-1">
          {cartItems.length === 0 ? (
            <div className="py-20 text-center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                    Your luxury bag is currently empty
                  </span>
                }
              />
              <Button
                type="primary"
                onClick={onClose}
                className="mt-4 bg-black text-white hover:!bg-neutral-800 hover:!text-white font-bold text-xs uppercase tracking-widest h-10 px-6 rounded-lg border-none shadow-sm transition-all duration-200 cursor-pointer"
              >
                DISCOVER COLLECTION
              </Button>
            </div>
          ) : (
            cartItems.map((item) => {
              const key = getItemKey(item);
              const isChecked = selectedKeys.includes(key);

              return (
                <div
                  key={key}
                  className="py-3 flex gap-3.5 items-stretch group border-b border-neutral-100/80 last:border-none"
                >
                  {/* Selection Checkbox (Vertically Centered in Equal Height Row) */}
                  <div className="flex items-center justify-center self-center shrink-0 my-auto">
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => handleItemSelect(key, e.target.checked)}
                      className="flex items-center justify-center m-0 p-0 [&_.ant-checkbox]:top-0"
                    />
                  </div>

                  {/* Product Thumbnail Container (Height Equals Details Column Height) */}
                  <div className="w-20 rounded-xl bg-neutral-100 border border-neutral-200/80 overflow-hidden shrink-0 self-stretch flex items-center justify-center shadow-2xs">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Details (Defines Equal Row Height) */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      {/* Title & Delete Icon Row */}
                      <div className="flex justify-between items-center gap-1 mb-1">
                        <h4 className="text-xs font-serif font-bold text-neutral-900 uppercase line-clamp-1 tracking-wide m-0 leading-none">
                          {item.name}
                        </h4>
                        <button
                          onClick={() =>
                            onRemoveItem(item.id, item.size, item.color)
                          }
                          className="text-neutral-400 hover:text-red-600 transition-colors p-0.5 cursor-pointer flex items-center justify-center"
                          title="Remove item"
                        >
                          <DeleteOutlined className="text-xs" />
                        </button>
                      </div>

                      {/* Rating & Size/Color Badges */}
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono flex-wrap">
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/60">
                          <StarFilled
                            style={{ color: "#fbbf24" }}
                            className="text-[10px]"
                          />
                          <span>
                            {item.rating ||
                              (4.7 + ((item.id || 1) % 4) * 0.1).toFixed(1)}
                          </span>
                        </div>
                        {item.size && (
                          <span className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                            Color: {item.color}
                          </span>
                        )}
                      </div>

                      {/* Unit Price */}
                      <div className="text-xs font-extrabold text-black font-mono mt-1">
                        ${Number(item.price).toFixed(2)}
                      </div>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-100">
                      <div className="inline-flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(
                              item.id,
                              item.size,
                              item.color,
                              item.quantity - 1,
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-200 hover:text-black transition-colors leading-none cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold font-mono text-black flex items-center justify-center leading-none select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(
                              item.id,
                              item.size,
                              item.color,
                              item.quantity + 1,
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-200 hover:text-black transition-colors leading-none cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-black text-black font-mono self-center">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Compact Checkout Button */}
        {cartItems.length > 0 && (
          <div className="pt-3 border-t border-neutral-200/90 mt-2 bg-white space-y-2.5">
            {/* Promo Code Input Box */}
            <div className="flex gap-2 items-center w-full">
              <Input
                prefix={<TagOutlined className="text-neutral-400 text-xs" />}
                placeholder="Promo Code (Try LUXE10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="text-xs uppercase !h-9 rounded-lg flex-1 border-neutral-300 focus:border-black flex items-center my-0"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="bg-black hover:bg-neutral-800 text-white text-xs font-extrabold tracking-wider uppercase h-9 px-5 rounded-lg border-none flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-2xs my-0 leading-none"
              >
                APPLY
              </button>
            </div>

            {/* Applied Promo Banner */}
            {appliedPromoObj && (
              <div className="flex justify-between items-center text-[10px] text-emerald-800 font-mono font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <span className="flex items-center gap-1">
                  <CheckCircleOutlined className="text-emerald-600 text-xs" />
                  <span>
                    APPLIED: {appliedPromoObj.code} (
                    {appliedPromoObj.isFreeShip
                      ? "FREE SHIPPING"
                      : `${appliedPromoObj.discountPercent}% OFF`}
                    )
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPromoCode("");
                    setDiscountAmount(0);
                    setAppliedPromoObj(null);
                  }}
                  className="text-neutral-500 hover:text-red-600 font-bold uppercase underline cursor-pointer ml-1"
                >
                  REMOVE
                </button>
              </div>
            )}

            {/* Price Calculations Summary */}
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/70 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-bold text-black">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>
                    Discount ({appliedPromoObj?.discountPercent}% OFF):
                  </span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Estimated Shipping:</span>
                <span className="font-bold text-black">
                  {appliedPromoObj?.isFreeShip ||
                  subtotal >= freeShippingThreshold ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `$${standardFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-black pt-1.5 border-t border-neutral-200">
                <span>TOTAL:</span>
                <span className="text-base text-black">
                  $
                  {(
                    finalTotal +
                    (appliedPromoObj?.isFreeShip ||
                    subtotal >= freeShippingThreshold
                      ? 0
                      : standardFee)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Compact & Elegant Proceed to Checkout Button */}
            <div className="flex justify-end pt-0.5">
              <Button
                type="primary"
                onClick={() => onProceedToCheckout(appliedPromoObj)}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                className="w-full bg-black hover:!bg-neutral-800 text-white font-extrabold text-xs tracking-widest uppercase h-9 rounded-lg shadow-md border-none transition-all cursor-pointer"
              >
                PROCEED TO CHECKOUT
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default CartDrawer;
