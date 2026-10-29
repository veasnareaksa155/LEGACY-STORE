import React, { useState } from "react";
import { Modal, Form, Input, Button, Checkbox, notification } from "antd";
import {
  LockOutlined,
  MailOutlined,
  ArrowRightOutlined,
  UserAddOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { createUser, loginUser } from "../services/api";

const AuthModal = ({ open, onClose, onLoginSuccess }) => {
  // Mode State: 'login' | 'register'
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  // Form submit handler for Login
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await loginUser({
        email: values.email,
        password: values.password || "password123",
      });

      const apiUser = res.data || res;
      const sessionRole =
        apiUser.role ||
        (values.email?.toLowerCase().includes("admin") ? "admin" : "user");

      const userData = {
        id: apiUser.id || Date.now(),
        role: sessionRole,
        name:
          apiUser.name ||
          (values.email
            ? values.email.split("@")[0].toUpperCase()
            : "VIP CLIENT"),
        email: apiUser.email || values.email,
        tier: apiUser.tier || "BLACK DIAMOND VIP",
        memberSince: apiUser.created_at
          ? new Date(apiUser.created_at).getFullYear().toString()
          : "2026",
        phone: apiUser.phone || "",
        address: apiUser.address || "",
        avatar: apiUser.avatar || apiUser.avatar_url || null,
        avatar_url: apiUser.avatar_url || apiUser.avatar || null,
      };

      notification.success({
        message:
          sessionRole === "admin"
            ? "ADMIN ACCESS GRANTED"
            : "VIP CLIENT LOGGED IN",
        description:
          sessionRole === "admin"
            ? "Welcome to LEGACY Admin Management Panel."
            : `Welcome back to your VIP account, ${userData.name}!`,
        placement: "bottomRight",
        duration: 2.5,
      });

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      onClose();
    } catch (error) {
      console.error("Login failed:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Account not found or invalid credentials. Please register a new account first before logging in.";

      notification.error({
        message: "LOGIN FAILED",
        description: errorMsg,
        placement: "bottomRight",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  // Form submit handler for Register
  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password || "password123",
        role: "user",
        tier: "BLACK DIAMOND VIP",
        phone: values.phone || "",
        address: values.address || "",
      };
      const res = await createUser(payload);
      const apiUser = res.data || res;

      const userData = {
        id: apiUser?.id || Date.now(),
        role: apiUser?.role || "user",
        name: apiUser?.name || values.name,
        email: apiUser?.email || values.email,
        tier: apiUser?.tier || "BLACK DIAMOND VIP",
        memberSince: apiUser?.created_at
          ? new Date(apiUser.created_at).getFullYear().toString()
          : "2026",
        phone: apiUser?.phone || "",
        address: apiUser?.address || "",
        avatar: apiUser?.avatar || apiUser?.avatar_url || null,
        avatar_url: apiUser?.avatar_url || apiUser?.avatar || null,
      };

      notification.success({
        message: "ACCOUNT CREATED SUCCESSFULLY",
        description: `Welcome to LEGACY VIP Membership, ${userData.name}! Your unique profile is now active.`,
        placement: "bottomRight",
        duration: 3,
      });

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      onClose();
    } catch (error) {
      console.error("Registration failed:", error);
      const errorMsg =
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.errors?.password?.[0] ||
        error.response?.data?.errors?.name?.[0] ||
        error.response?.data?.message ||
        "Could not create VIP account. Please try a different email or check inputs.";

      notification.error({
        message: "REGISTRATION FAILED",
        description: errorMsg,
        placement: "bottomRight",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      centered
      destroyOnClose
      className="luxury-auth-modal"
      bodyStyle={{ padding: 0, borderRadius: "1.25rem", overflow: "hidden" }}
    >
      <div className="relative w-full min-h-[460px] md:h-[580px] bg-white rounded-2xl overflow-hidden shadow-2xl select-none">
        {/* ================= PANEL 1: LOGIN FORM ================= */}
        <div
          className={`w-full md:w-1/2 md:absolute md:top-0 md:left-0 h-full p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 ease-in-out ${
            mode === "login"
              ? "block opacity-100 md:translate-x-0 z-10 pointer-events-auto"
              : "hidden md:flex opacity-0 md:-translate-x-12 z-0 pointer-events-none"
          }`}
        >
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <img
                src="/images/LOGO.png"
                alt="LEGACY"
                className="h-7 w-auto object-contain"
              />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                LEGACY STORE
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-black mb-1">
              SIGN IN TO ACCOUNT
            </h2>
            <p className="text-xs text-neutral-500 font-light mb-5">
              Access your personal purchases, order tracking, and saved
              wishlist.
            </p>

            {/* Client Login Form */}
            <Form
              layout="vertical"
              initialValues={{
                email: "client@legacystore.com",
                password: "password123",
              }}
              onFinish={(vals) => handleLogin(vals, "user")}
            >
              <Form.Item
                name="email"
                label={
                  <span className="text-[11px] font-bold uppercase">
                    Client Email
                  </span>
                }
                rules={[{ required: true, message: "Please enter email" }]}
                className="!mb-3"
              >
                <Input
                  prefix={<MailOutlined className="text-neutral-400" />}
                  placeholder="client@legacystore.com"
                  className="text-xs py-2 rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span className="text-[11px] font-bold uppercase">
                    Password
                  </span>
                }
                rules={[{ required: true, message: "Please enter password" }]}
                className="!mb-4"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-neutral-400" />}
                  placeholder="••••••••"
                  className="text-xs py-2 rounded-md"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-widest h-11 rounded-md shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>ENTER CLIENT PORTAL</span>
                <ArrowRightOutlined />
              </Button>
            </Form>
          </div>

          {/* Mobile Switch Link */}
          <div className="md:hidden mt-4 pt-3 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-500">
              New to LEGACY?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-black font-extrabold underline cursor-pointer ml-1"
              >
                Create VIP Account
              </button>
            </p>
          </div>
        </div>

        {/* ================= PANEL 2: REGISTER FORM ================= */}
        <div
          className={`w-full md:w-1/2 md:absolute md:top-0 md:right-0 h-full p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 ease-in-out ${
            mode === "register"
              ? "block opacity-100 md:translate-x-0 z-10 pointer-events-auto"
              : "hidden md:flex opacity-0 md:translate-x-12 z-0 pointer-events-none"
          }`}
        >
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <img
                src="/images/LOGO.png"
                alt="LEGACY"
                className="h-7 w-auto object-contain"
              />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                LEGACY VIP
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-black mb-1">
              CREATE VIP ACCOUNT
            </h2>
            <p className="text-xs text-neutral-500 font-light mb-4">
              Register for exclusive order tracking, saved wishlists, and drops.
            </p>

            <Form
              layout="vertical"
              initialValues={{
                agree: true,
              }}
              onFinish={handleRegister}
            >
              <Form.Item
                name="name"
                label={
                  <span className="text-[11px] font-bold uppercase">
                    Full Name
                  </span>
                }
                rules={[
                  { required: true, message: "Please enter your full name" },
                ]}
                className="!mb-2.5"
              >
                <Input
                  prefix={<IdcardOutlined className="text-neutral-400" />}
                  placeholder="e.g. Jean Dupont"
                  className="text-xs py-2 rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={
                  <span className="text-[11px] font-bold uppercase">
                    Email Address
                  </span>
                }
                rules={[{ required: true, message: "Please enter your email" }]}
                className="!mb-2.5"
              >
                <Input
                  prefix={<MailOutlined className="text-neutral-400" />}
                  placeholder="name@domain.com"
                  className="text-xs py-2 rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span className="text-[11px] font-bold uppercase">
                    Create Password
                  </span>
                }
                rules={[
                  { required: true, message: "Please create a password" },
                ]}
                className="!mb-2.5"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-neutral-400" />}
                  placeholder="••••••••"
                  className="text-xs py-2 rounded-md"
                />
              </Form.Item>

              <Form.Item name="agree" valuePropName="checked" className="!mb-3">
                <Checkbox className="text-[10px] text-neutral-500 leading-tight">
                  I agree to receive VIP invitations & express shipping
                  benefits.
                </Checkbox>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-widest h-11 rounded-md shadow-md flex items-center justify-center gap-2 mt-1 cursor-pointer"
              >
                <UserAddOutlined />
                <span>JOIN VIP MEMBERSHIP</span>
              </Button>
            </Form>
          </div>

          {/* Mobile Switch Link */}
          <div className="md:hidden mt-4 pt-3 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-500">
              Already a VIP Member?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-black font-extrabold underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* ================= DESKTOP PARALLAX DOUBLE SLIDER OVERLAY CONTAINER ================= */}
        <div
          className={`hidden md:block absolute top-0 left-0 w-1/2 h-full overflow-hidden z-30 transition-transform duration-700 ease-in-out rounded-2xl shadow-2xl border-x border-neutral-800 ${
            mode === "login" ? "translate-x-full" : "translate-x-0"
          }`}
        >
          {/* Internal Track (200% Width for Parallax Sliding Motion) */}
          <div
            className={`w-[200%] h-full bg-gradient-to-br from-neutral-950 via-black to-neutral-900 text-white flex transition-transform duration-700 ease-in-out ${
              mode === "login" ? "translate-x-0" : "-translate-x-1/2"
            }`}
          >
            {/* Banner Side 1: Visible when Mode is LOGIN */}
            <div
              onClick={() => setMode("register")}
              className="w-1/2 h-full p-8 sm:p-10 flex flex-col justify-between items-center text-center cursor-pointer group"
            >
              <div className="flex flex-col items-center pt-4">
                <div className="w-12 h-12 rounded-full border border-neutral-700 bg-neutral-900 text-amber-400 flex items-center justify-center font-serif font-black text-xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
                  LG
                </div>
                <span className="text-[10px] font-bold font-mono tracking-widest text-amber-400 uppercase">
                  EXPRESS LUXURY ACCESS
                </span>
              </div>

              <div className="space-y-4 my-auto px-2">
                <h3 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
                  NEW TO LEGACY?
                </h3>
                <p className="text-xs text-neutral-300 font-light leading-relaxed max-w-xs mx-auto">
                  Create an exclusive account to track luxury shipments, save
                  your favorite outfits, and receive private VIP drop alerts.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMode("register");
                  }}
                  className="bg-white text-black hover:bg-neutral-200 border-none font-extrabold text-xs uppercase tracking-widest h-11 px-8 rounded-full shadow-2xl transition-all transform hover:scale-105 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>CREATE AN ACCOUNT</span>
                  <ArrowRightOutlined />
                </button>
              </div>

              <div className="pb-2">
                <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                  ✨ Worldwide Express Delivery
                </p>
              </div>
            </div>

            {/* Banner Side 2: Visible when Mode is REGISTER */}
            <div
              onClick={() => setMode("login")}
              className="w-1/2 h-full p-8 sm:p-10 flex flex-col justify-between items-center text-center cursor-pointer group"
            >
              <div className="flex flex-col items-center pt-4">
                <div className="w-12 h-12 rounded-full border border-neutral-700 bg-neutral-900 text-amber-400 flex items-center justify-center font-serif font-black text-xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
                  LG
                </div>
                <span className="text-[10px] font-bold font-mono tracking-widest text-amber-400 uppercase">
                  HAUTE COUTURE • PARIS
                </span>
              </div>

              <div className="space-y-4 my-auto px-2">
                <h3 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
                  ALREADY A VIP MEMBER?
                </h3>
                <p className="text-xs text-neutral-300 font-light leading-relaxed max-w-xs mx-auto">
                  Sign in with your credentials to access your personal
                  purchases, saved wishlist, or platform admin dashboard.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMode("login");
                  }}
                  className="bg-white text-black hover:bg-neutral-200 border-none font-extrabold text-xs uppercase tracking-widest h-11 px-8 rounded-full shadow-2xl transition-all transform hover:scale-105 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>&larr; SIGN IN TO ACCOUNT</span>
                </button>
              </div>

              <div className="pb-2">
                <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                  ✨ 24/7 VIP Concierge Services
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
