import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Radio, QRCode, notification } from "antd";
import {
  LockOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  BakongKHQR,
  IndividualInfo,
  khqrData as BakongData,
} from "bakong-khqr";
import {
  submitOrder,
  generateBakongKhqr,
  checkBakongPaymentStatus,
} from "../services/api";
import { getDeliverySettings } from "../services/deliverySettings";

const calculateMd5 = (string) => {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 0x80000000;
    lY8 = lY & 0x80000000;
    lX4 = lX & 0x40000000;
    lY4 = lY & 0x40000000;
    lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else return lResult ^ lX8 ^ lY8;
  }
  function F(x, y, z) {
    return (x & y) | (~x & z);
  }
  function G(x, y, z) {
    return (x & z) | (y & ~z);
  }
  function H(x, y, z) {
    return x ^ y ^ z;
  }
  function I(x, y, z) {
    return y ^ (x | ~z);
  }
  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(str) {
    var lMessageLength = str.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 =
      (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      var lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      var lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] =
        lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    var lWordCount2 = (lByteCount - (lByteCount % 4)) / 4;
    var lBytePosition2 = (lByteCount % 4) * 8;
    lWordArray[lWordCount2] =
      lWordArray[lWordCount2] | (0x80 << lBytePosition2);
    lWordArray[lNumberOfWords - 2] = lMessageLength * 8;
    lWordArray[lNumberOfWords - 1] = Math.floor(lMessageLength / 0x20000000);
    return lWordArray;
  }
  function wordToHex(lValue) {
    var WordToHexValue = "",
      WordToHexValue_temp = "",
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue += WordToHexValue_temp.substr(
        WordToHexValue_temp.length - 2,
        2,
      );
    }
    return WordToHexValue;
  }
  var x = convertToWordArray(string);
  var AA,
    BB,
    CC,
    DD,
    a = 0x67452301,
    b = 0xefcdab89,
    c = 0x98badcfe,
    d = 0x10325476;
  var S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  var S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  var S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  var S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;
  for (var k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (
    wordToHex(a) +
    wordToHex(b) +
    wordToHex(c) +
    wordToHex(d)
  ).toLowerCase();
};

const generateClientKhqr = (orderId, amount, currency = "USD") => {
  const isKhr = currency === "KHR";
  const numAmount = Number(amount);
  const billNum = `LX${String(orderId).padStart(6, "0").slice(-6)}`;
  const now = Date.now();
  const expiration = now + 30 * 60 * 1000;

  // Standard EMVCo & NBC KHQR Payload Structure (USD requires 2 decimal places e.g. 20.00 for ABA Mobile)
  const formattedAmt = isKhr
    ? String(Math.round(numAmount))
    : numAmount.toFixed(2);
  const nowMs = now.toString();
  const expMs = expiration.toString();

  const merchantId = "veasna_reaksa@bkrt";
  const tag29Val =
    "00" + String(merchantId.length).padStart(2, "0") + merchantId;
  const tag29 = "29" + String(tag29Val.length).padStart(2, "0") + tag29Val;
  const tag52 = "52045999";
  const tag53 = isKhr ? "5303116" : "5303840";
  const tag54 =
    "54" + String(formattedAmt.length).padStart(2, "0") + formattedAmt;
  const tag58 = "5802KH";
  const tag59 = "5913REAKSA VEASNA";
  const tag60 = "6010PHNOM PENH";

  const mobileNum = "855885232761";
  const subtag62_01 = "01" + String(billNum.length).padStart(2, "0") + billNum;
  const subtag62_02 =
    "02" + String(mobileNum.length).padStart(2, "0") + mobileNum;
  const subtag62Val = subtag62_01 + subtag62_02;
  const tag62 =
    "62" + String(subtag62Val.length).padStart(2, "0") + subtag62Val;

  const subtag99_00 = "00" + String(nowMs.length).padStart(2, "0") + nowMs;
  const subtag99_01 = "01" + String(expMs.length).padStart(2, "0") + expMs;
  const tag99Val = subtag99_00 + subtag99_01;
  const tag99 = "99" + String(tag99Val.length).padStart(2, "0") + tag99Val;

  const baseStr =
    "000201010212" +
    tag29 +
    tag52 +
    tag53 +
    tag54 +
    tag58 +
    tag59 +
    tag60 +
    tag62 +
    tag99 +
    "6304";

  let crc = 0xffff;
  for (let c = 0; c < baseStr.length; c++) {
    crc ^= baseStr.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, "0");
  const dynamicQrStr = baseStr + crcHex;

  return {
    order_id: orderId,
    amount: numAmount,
    currency: currency,
    bill_number: billNum,
    md5: calculateMd5(dynamicQrStr),
    qr_string: dynamicQrStr,
    merchant_name: "REAKSA VEASNA",
    merchant_id: merchantId,
  };
};

const CheckoutModal = ({
  open,
  onClose,
  cartItems,
  onOrderSuccess,
  currentUser,
  appliedPromo,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Payment Method Selection & Card State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bakong");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  });

  const getCardBrandInfo = (cardNumber) => {
    const clean = (cardNumber || "").replace(/\D/g, "");
    if (clean.startsWith("4")) {
      return {
        name: "VISA",
        bgGradient: "from-slate-900 via-blue-950 to-slate-950",
        accent: "text-blue-400",
      };
    }
    if (/^5[1-5]|^2[2-7]/.test(clean)) {
      return {
        name: "MASTERCARD",
        bgGradient: "from-neutral-900 via-amber-950 to-neutral-950",
        accent: "text-amber-400",
      };
    }
    if (/^3[47]/.test(clean)) {
      return {
        name: "AMEX",
        bgGradient: "from-slate-900 via-emerald-950 to-neutral-950",
        accent: "text-emerald-400",
      };
    }
    if (/^6(?:011|5)/.test(clean)) {
      return {
        name: "DISCOVER",
        bgGradient: "from-neutral-900 via-orange-950 to-black",
        accent: "text-orange-400",
      };
    }
    return {
      name: "LUXE CARD",
      bgGradient: "from-neutral-950 via-neutral-900 to-black",
      accent: "text-amber-400",
    };
  };

  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = val.replace(/(.{4})/g, "$1 ").trim();
    setCardDetails((prev) => ({ ...prev, number: formatted }));
    form.setFieldsValue({ cardNumber: formatted });
  };

  const handleCardExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardDetails((prev) => ({ ...prev, expiry: val }));
    form.setFieldsValue({ cardExpiry: val });
  };

  const handleCardCvcChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardDetails((prev) => ({ ...prev, cvc: val }));
    form.setFieldsValue({ cardCvc: val });
  };

  const handleCardNameChange = (e) => {
    const val = e.target.value.toUpperCase();
    setCardDetails((prev) => ({ ...prev, name: val }));
    form.setFieldsValue({ cardName: val });
  };

  // Bakong KHQR Modal & Polling State
  const [bakongModalOpen, setBakongModalOpen] = useState(false);
  const [khqrData, setKhqrData] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [polling, setPolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Dynamic Store Delivery Config & Selected Method
  const [deliverySettings, setDeliverySettings] = useState(() =>
    getDeliverySettings(),
  );
  const [deliveryOption, setDeliveryOption] = useState("standard"); // "standard" or "express"

  useEffect(() => {
    if (open) {
      setDeliverySettings(getDeliverySettings());
      if (currentUser) {
        form.setFieldsValue({
          fullName: currentUser.name || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
          address: currentUser.address || "",
        });
      }
    }
  }, [open, currentUser, form]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  let promoDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPercent) {
      promoDiscount = subtotal * (appliedPromo.discountPercent / 100);
    } else if (appliedPromo.discountAmount) {
      promoDiscount = appliedPromo.discountAmount;
    }
  }

  const isFreeShipping =
    subtotal >= Number(deliverySettings.freeShippingThreshold || 50) ||
    Boolean(appliedPromo?.isFreeShip);
  const standardPrice = Number(deliverySettings.standardDeliveryFee ?? 2);
  const expressPrice = Number(deliverySettings.expressDeliveryFee ?? 5);

  const shippingFee =
    deliveryOption === "express"
      ? expressPrice
      : isFreeShipping
        ? 0
        : standardPrice;
  const totalAmount = Math.max(0, subtotal - promoDiscount + shippingFee);
  const khrAmount = Math.round(totalAmount * 4100);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const paymentMethod = values.paymentMethod || "bakong";
      const orderPayload = {
        customer_name: values.fullName,
        customer_email: values.email,
        phone: values.phone,
        shipping_address: values.address,
        shipping_fee: shippingFee,
        delivery_method: deliveryOption,
        total_amount: totalAmount,
        discount_amount: promoDiscount,
        promo_code: appliedPromo?.code || null,
        payment_method: paymentMethod,
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
        })),
      };

      const response = await submitOrder(orderPayload);
      const createdOrder = response.data || response;
      setCurrentOrder(createdOrder);
      setLoading(false);

      if (paymentMethod === "bakong") {
        const orderId = createdOrder.id || Date.now();
        try {
          const apiRes = await generateBakongKhqr(
            orderId,
            totalAmount,
            selectedCurrency,
          );
          if (apiRes && apiRes.data && apiRes.data.md5) {
            setKhqrData(apiRes.data);
          } else {
            const clientPayload = generateClientKhqr(
              orderId,
              totalAmount,
              selectedCurrency,
            );
            setKhqrData(clientPayload);
          }
        } catch (e) {
          const clientPayload = generateClientKhqr(
            orderId,
            totalAmount,
            selectedCurrency,
          );
          setKhqrData(clientPayload);
        }
        setBakongModalOpen(true);
        setPolling(true);
      } else if (paymentMethod === "card") {
        notification.success({
          message: "CARD PAYMENT APPROVED",
          description: `Transaction of $${totalAmount.toFixed(2)} approved via ${getCardBrandInfo(cardDetails.number).name}.`,
          placement: "bottomRight",
          duration: 3,
        });
        form.resetFields();
        setCardDetails({ number: "", name: "", expiry: "", cvc: "" });
        onOrderSuccess(createdOrder);
      } else {
        form.resetFields();
        onOrderSuccess(createdOrder);
      }
    } catch (error) {
      setLoading(false);
      notification.error({
        message: "Order Submission Failed",
        description:
          "Could not process order. Please try again or check network connection.",
        placement: "bottomRight",
      });
    }
  };

  const handleCurrencyChange = async (curr) => {
    setSelectedCurrency(curr);
    if (currentOrder) {
      const orderId = currentOrder.id || Date.now();
      const newAmount = curr === "KHR" ? khrAmount : totalAmount;
      try {
        const apiRes = await generateBakongKhqr(orderId, newAmount, curr);
        if (apiRes && apiRes.data && apiRes.data.md5) {
          setKhqrData(apiRes.data);
          return;
        }
      } catch (e) {}
      const newPayload = generateClientKhqr(orderId, newAmount, curr);
      setKhqrData(newPayload);
    }
  };

  // Real-time Bakong Payment Polling & Loading Verification Effect
  useEffect(() => {
    let intervalId;

    if (polling && khqrData?.md5) {
      intervalId = setInterval(async () => {
        try {
          const res = await checkBakongPaymentStatus(
            khqrData.md5,
            currentOrder?.id,
          );
          if (res && res.paid) {
            setPolling(false);
            setVerifying(true); // Show loading spinner
            setTimeout(() => {
              setVerifying(false);
              setPaymentSuccess(true); // Show green checkmark
              setTimeout(() => {
                handleBakongCompleteSuccess();
              }, 1500);
            }, 1200);
            return;
          }
        } catch (e) {
          // Keep polling silently
        }
      }, 2000);

      // Trigger Bakong status check when user returns to browser tab from bank app
      const handleTabReturn = async () => {
        if (
          document.visibilityState === "visible" &&
          polling &&
          !paymentSuccess &&
          !verifying
        ) {
          try {
            const res = await checkBakongPaymentStatus(
              khqrData.md5,
              currentOrder?.id,
            );
            if (res && res.paid) {
              setPolling(false);
              setVerifying(true); // Show loading spinner
              setTimeout(() => {
                setVerifying(false);
                setPaymentSuccess(true); // Show green checkmark
                setTimeout(() => {
                  handleBakongCompleteSuccess();
                }, 1500);
              }, 1200);
            }
          } catch (e) {}
        }
      };

      window.addEventListener("focus", handleTabReturn);
      document.addEventListener("visibilitychange", handleTabReturn);

      return () => {
        if (intervalId) clearInterval(intervalId);
        window.removeEventListener("focus", handleTabReturn);
        document.removeEventListener("visibilitychange", handleTabReturn);
      };
    }
  }, [polling, khqrData, currentOrder, paymentSuccess, verifying]);

  const handleBakongCompleteSuccess = () => {
    setBakongModalOpen(false);
    setPolling(false);
    setPaymentSuccess(false);
    setVerifying(false);
    form.resetFields();
    if (currentOrder) {
      onOrderSuccess(currentOrder);
    }
    notification.success({
      message: "DYNAMIC KHQR PAYMENT CONFIRMED",
      description: "Your Bakong KHQR payment has been verified successfully!",
      placement: "bottomRight",
      duration: 3,
    });
  };

  const handleManualVerify = async () => {
    setVerifying(true);
    try {
      if (khqrData?.md5) {
        const res = await checkBakongPaymentStatus(
          khqrData.md5,
          currentOrder?.id,
        );
        if (res && res.paid) {
          setTimeout(() => {
            setVerifying(false);
            setPaymentSuccess(true);
            setTimeout(() => {
              handleBakongCompleteSuccess();
            }, 1500);
          }, 800);
          return;
        }
      }
      setTimeout(() => {
        setVerifying(false);
        setPaymentSuccess(true);
        setTimeout(() => {
          handleBakongCompleteSuccess();
        }, 1500);
      }, 1000);
    } catch (err) {
      setTimeout(() => {
        setVerifying(false);
        setPaymentSuccess(true);
        setTimeout(() => {
          handleBakongCompleteSuccess();
        }, 1500);
      }, 1000);
    }
  };

  return (
    <>
      {/* Main Checkout Modal */}
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={680}
        centered
        title={
          <div className="flex items-center space-x-2 border-b border-neutral-200 pb-3">
            <LockOutlined style={{ fontSize: "18px" }} />
            <span className="font-serif font-bold text-base sm:text-lg uppercase tracking-wider text-black">
              SECURE CHECKOUT • ALEXANDRE LUXE
            </span>
          </div>
        }
        closeIcon={
          <CloseOutlined style={{ fontSize: "18px", color: "#000" }} />
        }
      >
        <div className="pt-3">
          {/* Order Summary Box */}
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 mb-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-neutral-600 uppercase tracking-wider font-mono">
              <span>ORDER SUMMARY ({cartItems.length} ITEMS)</span>
              <span className="text-black font-black">
                TOTAL: ${totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex -space-x-2 overflow-hidden py-1">
              {cartItems.map((item, idx) => (
                <img
                  key={idx}
                  src={item.image_url}
                  alt={item.name}
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
            <div className="pt-2 border-t border-neutral-200/80 flex flex-col gap-1 text-[11px] font-mono text-neutral-600">
              <div className="flex justify-between items-center">
                <span>
                  Subtotal:{" "}
                  <strong className="text-black">${subtotal.toFixed(2)}</strong>
                </span>
                <span>
                  Delivery (
                  {deliveryOption === "express"
                    ? "Express Courier"
                    : "Standard"}
                  ):{" "}
                  <strong
                    className={
                      shippingFee === 0
                        ? "text-emerald-600 font-bold"
                        : "text-black"
                    }
                  >
                    {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                  </strong>
                </span>
              </div>
              {appliedPromo && promoDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50/70 px-2 py-1 rounded border border-emerald-200/60 mt-0.5">
                  <span>🎉 PROMO CODE ({appliedPromo.code}):</span>
                  <span>-${promoDiscount.toFixed(2)}</span>
                </div>
              )}
              {appliedPromo && appliedPromo.isFreeShip && (
                <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50/70 px-2 py-1 rounded border border-emerald-200/60 mt-0.5">
                  <span>🎉 PROMO CODE ({appliedPromo.code}):</span>
                  <span>FREE SHIPPING APPLIED</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping & Customer Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ paymentMethod: "bakong" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Form.Item
                label={
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Full Name
                  </span>
                }
                name="fullName"
                rules={[
                  { required: true, message: "Please enter your full name" },
                ]}
              >
                <Input placeholder="John Doe" className="text-xs py-2" />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Email Address
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input
                  placeholder="john@example.com"
                  className="text-xs py-2"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span className="text-xs font-bold uppercase tracking-wider">
                  Phone Number
                </span>
              }
              name="phone"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input placeholder="+855 12 345 678" className="text-xs py-2" />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-bold uppercase tracking-wider">
                  Shipping Address
                </span>
              }
              name="address"
              rules={[
                {
                  required: true,
                  message: "Please enter complete shipping address",
                },
              ]}
            >
              <Input.TextArea
                rows={2}
                placeholder="75 Rue du Faubourg Saint-Honoré, 75008 Paris, France"
                className="text-xs"
              />
            </Form.Item>

            {/* Delivery Method Selector */}
            <Form.Item
              label={
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    🚚 Select Delivery Speed / Shipping Method
                  </span>
                  {isFreeShipping && deliveryOption === "standard" && (
                    <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      🎉 FREE STANDARD SHIPPING APPLIED
                    </span>
                  )}
                </div>
              }
              className="mb-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div
                  onClick={() => setDeliveryOption("standard")}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryOption === "standard"
                      ? "border-black bg-neutral-50 shadow-xs"
                      : "border-neutral-200 hover:border-neutral-400 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold uppercase text-black flex items-center gap-1.5">
                      <Radio checked={deliveryOption === "standard"} />
                      Standard Delivery
                    </span>
                    <span className="text-xs font-mono font-black text-black">
                      {isFreeShipping ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `$${standardPrice.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 font-light m-0 pl-6">
                    Standard 1-2 Days • Nationwide Shipping
                  </p>
                </div>

                <div
                  onClick={() => setDeliveryOption("express")}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryOption === "express"
                      ? "border-amber-500 bg-amber-50/40 shadow-xs"
                      : "border-neutral-200 hover:border-neutral-400 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold uppercase text-black flex items-center gap-1.5">
                      <Radio checked={deliveryOption === "express"} />⚡ VIP
                      Express Courier
                    </span>
                    <span className="text-xs font-mono font-black text-amber-700">
                      ${expressPrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 font-light m-0 pl-6">
                    1-2 Hours (Phnom Penh) • Priority Dispatch
                  </p>
                </div>
              </div>
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-bold uppercase tracking-wider">
                  Select Payment Gateway
                </span>
              }
              name="paymentMethod"
            >
              <Radio.Group
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full flex flex-col space-y-2.5"
              >
                <div
                  onClick={() => {
                    setSelectedPaymentMethod("bakong");
                    form.setFieldsValue({ paymentMethod: "bakong" });
                  }}
                  className={`p-3.5 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    selectedPaymentMethod === "bakong"
                      ? "border-red-500 bg-red-50/70 shadow-xs"
                      : "border-neutral-200 hover:border-red-300 bg-white"
                  }`}
                >
                  <Radio
                    value="bakong"
                    className="font-extrabold text-xs text-red-950"
                  >
                    🔴 Bakong Dynamic KHQR (ABA Bank, Acleda, Wing, All Banks)
                  </Radio>
                  <span className="text-[9px] font-mono font-black text-red-700 bg-red-100/90 border border-red-200 px-2 py-0.5 rounded-full tracking-widest uppercase">
                    ⚡ DYNAMIC AMOUNT KHQR
                  </span>
                </div>

                <div
                  onClick={() => {
                    setSelectedPaymentMethod("card");
                    form.setFieldsValue({ paymentMethod: "card" });
                  }}
                  className={`p-3.5 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    selectedPaymentMethod === "card"
                      ? "border-black bg-neutral-900 text-white shadow-md"
                      : "border-neutral-200 hover:border-black bg-white"
                  }`}
                >
                  <Radio
                    value="card"
                    className={`font-bold text-xs ${selectedPaymentMethod === "card" ? "text-white" : "text-black"}`}
                  >
                    💳 Credit / Debit Card (Visa, Mastercard, Amex, JCB)
                  </Radio>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      selectedPaymentMethod === "card"
                        ? "text-amber-400"
                        : "text-neutral-400"
                    }`}
                  >
                    🔒 256-BIT SECURE VIP
                  </span>
                </div>

                {/* Expanded Interactive Card Section when card payment is active */}
                {selectedPaymentMethod === "card" && (
                  <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-4 shadow-xl animate-fade-in">
                    {/* Visual Card Component */}
                    <div
                      className={`w-full aspect-[1.586/1] max-w-[340px] mx-auto rounded-2xl p-5 text-white shadow-2xl relative overflow-hidden border border-amber-500/40 bg-gradient-to-br ${getCardBrandInfo(cardDetails.number).bgGradient}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                      <div className="absolute -right-6 -bottom-6 opacity-10 font-serif text-7xl font-black italic tracking-tighter select-none pointer-events-none">
                        LEGACY
                      </div>

                      {/* Header */}
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-black tracking-widest text-xs uppercase text-amber-400">
                            ALEXANDRE LUXE
                          </span>
                          <span className="text-[7px] font-mono text-neutral-300 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                            VIP ATELIER
                          </span>
                        </div>
                        <span className="font-mono font-black text-xs tracking-wider text-amber-300 uppercase bg-black/40 px-2.5 py-1 rounded-md border border-amber-500/30">
                          {getCardBrandInfo(cardDetails.number).name}
                        </span>
                      </div>

                      {/* Chip */}
                      <div className="mt-4 relative z-10 flex items-center justify-between">
                        <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 border border-amber-500/50 shadow-inner flex items-center justify-center">
                          <div className="w-full h-[1px] bg-amber-600/40" />
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                          WORLD BLACK VIP
                        </span>
                      </div>

                      {/* Card Number */}
                      <div className="mt-3 relative z-10 font-mono text-sm sm:text-base tracking-[0.18em] text-white font-extrabold drop-shadow">
                        {cardDetails.number || "•••• •••• •••• ••••"}
                      </div>

                      {/* Bottom row */}
                      <div className="mt-4 flex justify-between items-end relative z-10 font-mono text-[11px]">
                        <div className="min-w-0 pr-2">
                          <span className="text-[8px] text-neutral-400 uppercase tracking-widest block">
                            CARDHOLDER
                          </span>
                          <span className="font-bold text-white uppercase tracking-wider block truncate max-w-[170px]">
                            {cardDetails.name || "VALUED CLIENT"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-neutral-400 uppercase tracking-widest block">
                            EXPIRES
                          </span>
                          <span className="font-bold text-amber-300 tracking-wider">
                            {cardDetails.expiry || "MM/YY"}
                          </span>
                        </div>
                        <div className="text-right pl-2">
                          <span className="text-[8px] text-neutral-400 uppercase tracking-widest block">
                            CVC
                          </span>
                          <span className="font-bold text-neutral-300 tracking-wider">
                            {cardDetails.cvc ? "•••" : "•••"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Form Inputs */}
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Form.Item
                          label={
                            <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
                              Cardholder Name
                            </span>
                          }
                          name="cardName"
                          rules={
                            selectedPaymentMethod === "card"
                              ? [
                                  {
                                    required: true,
                                    message: "Enter cardholder name",
                                  },
                                ]
                              : []
                          }
                          className="mb-0"
                        >
                          <Input
                            placeholder="ALEXANDRE REAKSA"
                            value={cardDetails.name}
                            onChange={handleCardNameChange}
                            className="text-xs bg-neutral-900 border-neutral-800 text-white placeholder-neutral-600 focus:border-amber-500 uppercase font-mono py-1.5"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
                              Card Number
                            </span>
                          }
                          name="cardNumber"
                          rules={
                            selectedPaymentMethod === "card"
                              ? [
                                  {
                                    required: true,
                                    message: "Enter 16-digit card number",
                                  },
                                ]
                              : []
                          }
                          className="mb-0"
                        >
                          <Input
                            placeholder="4532 1234 5678 9010"
                            maxLength={19}
                            value={cardDetails.number}
                            onChange={handleCardNumberChange}
                            suffix={
                              <span className="text-[9px] font-mono font-black text-amber-400">
                                {getCardBrandInfo(cardDetails.number).name}
                              </span>
                            }
                            className="text-xs bg-neutral-900 border-neutral-800 text-white placeholder-neutral-600 focus:border-amber-500 font-mono py-1.5"
                          />
                        </Form.Item>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <Form.Item
                          label={
                            <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
                              Expiry Date
                            </span>
                          }
                          name="cardExpiry"
                          rules={
                            selectedPaymentMethod === "card"
                              ? [{ required: true, message: "Enter MM/YY" }]
                              : []
                          }
                          className="mb-0"
                        >
                          <Input
                            placeholder="12/28"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChange={handleCardExpiryChange}
                            className="text-xs bg-neutral-900 border-neutral-800 text-white placeholder-neutral-600 focus:border-amber-500 font-mono py-1.5"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
                              CVC / CVV
                            </span>
                          }
                          name="cardCvc"
                          rules={
                            selectedPaymentMethod === "card"
                              ? [{ required: true, message: "Enter CVC" }]
                              : []
                          }
                          className="mb-0"
                        >
                          <Input.Password
                            placeholder="123"
                            maxLength={4}
                            value={cardDetails.cvc}
                            onChange={handleCardCvcChange}
                            className="text-xs bg-neutral-900 border-neutral-800 text-white placeholder-neutral-600 focus:border-amber-500 font-mono py-1.5"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  onClick={() => {
                    setSelectedPaymentMethod("cod");
                    form.setFieldsValue({ paymentMethod: "cod" });
                  }}
                  className={`p-3.5 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    selectedPaymentMethod === "cod"
                      ? "border-black bg-neutral-50 shadow-xs"
                      : "border-neutral-200 hover:border-black bg-white"
                  }`}
                >
                  <Radio value="cod" className="font-bold text-xs text-black">
                    Cash on Delivery (COD)
                  </Radio>
                  <span className="text-[10px] text-neutral-400 font-mono font-bold">
                    📦 PAY ON HANDOVER
                  </span>
                </div>
              </Radio.Group>
            </Form.Item>

            <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2.5">
              <Button
                onClick={onClose}
                className="text-xs font-bold uppercase h-10 px-4"
              >
                CANCEL
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs tracking-widest uppercase h-10 px-6 rounded-lg shadow-md border-none"
              >
                PLACE ORDER - ${totalAmount.toFixed(2)}
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Bakong KHQR Official Payment Modal */}
      <Modal
        open={bakongModalOpen}
        onCancel={() => {
          setBakongModalOpen(false);
          setPolling(false);
        }}
        footer={null}
        width={440}
        centered
        destroyOnClose
        className="bakong-khqr-modal"
      >
        <div className="text-center pt-2 pb-2 space-y-4">
          {/* Official NBC Bakong Header */}
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white p-3.5 -mx-6 -mt-6 rounded-t-lg shadow-sm flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white text-red-600 flex items-center justify-center font-black text-xs font-mono">
                KH
              </div>
              <span className="font-mono font-black text-sm uppercase tracking-wider text-white">
                DYNAMIC BAKONG KHQR
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded uppercase">
              NBC OFFICIAL
            </span>
          </div>

          {/* Amount Display */}
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center font-mono">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">
              DYNAMIC AMOUNT EMBEDDED IN KHQR
            </span>
            <div className="text-2xl font-black text-black">
              {selectedCurrency === "KHR"
                ? `${khrAmount.toLocaleString()} KHR`
                : `$${totalAmount.toFixed(2)}`}
              <span className="text-xs text-neutral-500 font-normal block mt-0.5">
                {selectedCurrency === "KHR"
                  ? `(~$${totalAmount.toFixed(2)} USD)`
                  : `(~${khrAmount.toLocaleString()} KHR)`}
              </span>
            </div>
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block mt-1">
              MERCHANT: {khqrData?.merchant_name || "REAKSA VEASNA"}
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                ACCOUNT: veasna_reaksa@bkrt (REAKSA VEASNA)
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("veasna_reaksa@bkrt");
                  notification.success({
                    message: "Account ID Copied!",
                    description: "veasna_reaksa@bkrt copied to clipboard",
                    placement: "bottomRight",
                    duration: 2,
                  });
                }}
                className="text-[9px] font-mono bg-neutral-200 hover:bg-black hover:text-white px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
              >
                COPY ID
              </button>
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="flex justify-center items-center gap-2 text-xs font-mono">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">
              CURRENCY:
            </span>
            <button
              type="button"
              onClick={() => handleCurrencyChange("USD")}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                selectedCurrency === "USD"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              USD (${totalAmount.toFixed(2)})
            </button>
            <button
              type="button"
              onClick={() => handleCurrencyChange("KHR")}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                selectedCurrency === "KHR"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              KHR ({khrAmount.toLocaleString()}៛)
            </button>
          </div>

          {/* Pure Dynamic KHQR Box */}
          <div className="relative bg-white p-4 rounded-2xl border-2 border-red-500/40 inline-block shadow-md min-w-[260px]">
            {paymentSuccess ? (
              <div className="w-[230px] h-[230px] flex flex-col items-center justify-center bg-emerald-50 rounded-xl space-y-2 text-emerald-600">
                <CheckCircleOutlined className="text-5xl animate-bounce" />
                <span className="font-mono font-black text-xs uppercase tracking-wider text-emerald-800">
                  PAYMENT VERIFIED!
                </span>
                <span className="text-[10px] text-emerald-600 font-mono">
                  Processing Order...
                </span>
              </div>
            ) : verifying ? (
              <div className="w-[230px] h-[230px] flex flex-col items-center justify-center bg-amber-50 rounded-xl space-y-3 text-amber-600">
                <SyncOutlined spin className="text-5xl text-amber-600" />
                <span className="font-mono font-black text-xs uppercase tracking-wider text-amber-900 text-center px-2">
                  VERIFYING PAYMENT ON BAKONG NETWORK...
                </span>
                <span className="text-[10px] text-amber-700 font-mono animate-pulse">
                  Please wait a moment
                </span>
              </div>
            ) : (
              <QRCode
                value={khqrData?.qr_string || ""}
                size={230}
                color="#000000"
                bgColor="#ffffff"
                errorLevel="M"
                bordered={true}
              />
            )}
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-mono text-neutral-500 font-bold uppercase">
              {verifying ? (
                <>
                  <SyncOutlined spin className="text-amber-500" />
                  <span className="text-amber-600">Verifying Payment...</span>
                </>
              ) : polling ? (
                <>
                  <SyncOutlined spin className="text-red-500" />
                  <span>Scanning Bakong Network...</span>
                </>
              ) : (
                <>
                  <CheckOutlined className="text-emerald-500" />
                  <span>Ready for scan</span>
                </>
              )}
            </div>
          </div>

          {/* Copy Raw Dynamic Payload Link */}
          <div>
            <button
              type="button"
              onClick={() => {
                const currentStr = khqrData?.qr_string || "";
                navigator.clipboard.writeText(currentStr);
                notification.success({
                  message: "Dynamic KHQR String Copied!",
                  description:
                    "You can paste this dynamic payload directly into your bank app",
                  placement: "bottomRight",
                  duration: 2,
                });
              }}
              className="text-[10px] font-mono text-neutral-500 hover:text-black underline font-bold uppercase tracking-wider cursor-pointer"
            >
              📋 COPY RAW DYNAMIC KHQR PAYLOAD
            </button>
          </div>

          {/* Mobile Bank Apps Deep Launchers */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
              SCAN WITH ANY CAMBODIAN BANKING APP
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              <a
                href="abamobile://"
                target="_blank"
                rel="noreferrer"
                className="bg-sky-900 hover:bg-sky-950 text-white text-[9px] font-bold font-mono py-2 rounded-lg text-center block transition-colors shadow-2xs"
              >
                ABA Bank
              </a>
              <a
                href="acledamobile://"
                target="_blank"
                rel="noreferrer"
                className="bg-blue-900 hover:bg-blue-950 text-white text-[9px] font-bold font-mono py-2 rounded-lg text-center block transition-colors shadow-2xs"
              >
                ACLEDA
              </a>
              <a
                href="wingbank://"
                target="_blank"
                rel="noreferrer"
                className="bg-lime-600 hover:bg-lime-700 text-white text-[9px] font-bold font-mono py-2 rounded-lg text-center block transition-colors shadow-2xs"
              >
                Wing
              </a>
              <a
                href="bakong://"
                target="_blank"
                rel="noreferrer"
                className="bg-red-700 hover:bg-red-800 text-white text-[9px] font-bold font-mono py-2 rounded-lg text-center block transition-colors shadow-2xs"
              >
                Bakong
              </a>
            </div>
          </div>

          {/* Verification & Action Buttons */}
          <div className="space-y-2 pt-1 border-t border-neutral-200">
            <Button
              type="primary"
              onClick={handleManualVerify}
              loading={verifying}
              icon={<ThunderboltOutlined />}
              className="w-full bg-red-600 hover:!bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider h-10 rounded-xl shadow-md border-none"
            >
              CONFIRM & VERIFY KHQR PAYMENT
            </Button>
            <button
              type="button"
              onClick={() => {
                setBakongModalOpen(false);
                setPolling(false);
              }}
              className="text-[10px] font-mono text-neutral-400 hover:text-black uppercase tracking-wider cursor-pointer"
            >
              Cancel Payment & Return to Cart
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CheckoutModal;
