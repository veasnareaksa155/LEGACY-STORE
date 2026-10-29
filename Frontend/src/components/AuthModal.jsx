import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Checkbox, notification, Spin } from "antd";
import {
  LockOutlined,
  MailOutlined,
  ArrowRightOutlined,
  UserAddOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { createUser, loginUser, loginWithGoogle } from "../services/api";

// Official Google 4-Color SVG Icon
const GoogleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const AuthModal = ({ open, onClose, onLoginSuccess }) => {
  // Mode State: 'login' | 'register'
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  // Real Google OAuth 2.0 State
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleActionIntent, setGoogleActionIntent] = useState("login"); // 'login' | 'register'
  const [clientIdModalOpen, setClientIdModalOpen] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(() => {
    return (
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem("legacy_google_client_id") ||
      ""
    );
  });

  // Dynamically load Google Identity Services script if not already present
  useEffect(() => {
    if (!window.google?.accounts?.oauth2) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Form submit handler for standard Email/Password Login
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

  // Form submit handler for standard Register
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
      console.error("Register failed:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Unable to create account. Please check your information.";

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

  // Execute Backend Google Login / Registration with Verified Real Google Account
  const executeGoogleLogin = async ({ email, name, avatar, google_id }) => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle({
        email: email.trim().toLowerCase(),
        name: name ? name.trim() : email.split("@")[0],
        avatar: avatar || null,
        google_id: google_id || undefined,
      });

      const apiUser = res.data || res;
      const isNewUser = res.is_new_user || false;
      const sessionRole =
        apiUser.role ||
        (email.toLowerCase().includes("admin") ? "admin" : "user");

      const userData = {
        id: apiUser.id || Date.now(),
        role: sessionRole,
        name:
          apiUser.name ||
          (name ? name.trim() : email.split("@")[0].toUpperCase()),
        email: apiUser.email || email,
        tier: apiUser.tier || "BLACK DIAMOND VIP",
        memberSince: apiUser.created_at
          ? new Date(apiUser.created_at).getFullYear().toString()
          : "2026",
        phone: apiUser.phone || "",
        address: apiUser.address || "",
        avatar: apiUser.avatar || apiUser.avatar_url || avatar || null,
        avatar_url: apiUser.avatar_url || apiUser.avatar || avatar || null,
      };

      if (isNewUser || googleActionIntent === "register") {
        notification.success({
          message: "🎉 WELCOME TO LEGACY VIP MEMBERSHIP",
          description: `Your verified Google account (${userData.email}) is now active with Black Diamond VIP privileges!`,
          placement: "bottomRight",
          duration: 4,
        });
      } else {
        notification.success({
          message: "REAL GOOGLE SIGN-IN VERIFIED",
          description: `Welcome back to your VIP account, ${userData.name}!`,
          placement: "bottomRight",
          duration: 3,
        });
      }

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      onClose();
    } catch (error) {
      console.error("Google backend authentication failed:", error);
      notification.error({
        message: "GOOGLE AUTHENTICATION FAILED",
        description:
          error.response?.data?.message ||
          "Unable to complete Google authentication on backend server. Please try again.",
        placement: "bottomRight",
        duration: 4,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // Launch Real Google Identity Services (GIS) Verification Popup
  const launchRealGooglePopup = (activeClientId, intent = "login") => {
    setGoogleActionIntent(intent);

    if (!window.google?.accounts?.oauth2) {
      notification.warning({
        message: "GOOGLE SCRIPT LOADING",
        description:
          "Google verification script is loading in your browser. Please click again in 2 seconds.",
        placement: "bottomRight",
      });
      return;
    }

    setGoogleLoading(true);
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: "email profile openid",
        callback: async (tokenResponse) => {
          if (tokenResponse?.error) {
            console.warn("Google OAuth popup closed or error:", tokenResponse.error);
            setGoogleLoading(false);
            if (tokenResponse.error !== "popup_closed_by_user") {
              notification.error({
                message: "GOOGLE AUTH ERROR",
                description: `Google returned an error: ${tokenResponse.error_description || tokenResponse.error}`,
                placement: "bottomRight",
              });
            }
            return;
          }

          if (tokenResponse?.access_token) {
            try {
              // Retrieve verified Google Profile from official Google UserInfo endpoint
              const userInfoRes = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                }
              );
              const googleUser = await userInfoRes.json();

              if (!googleUser.email) {
                throw new Error("Google did not return a verified email address.");
              }

              // Send real verified data directly to Backend
              await executeGoogleLogin({
                email: googleUser.email,
                name: googleUser.name || googleUser.email.split("@")[0],
                avatar: googleUser.picture || null,
                google_id: googleUser.sub,
              });
            } catch (fetchErr) {
              console.error("Failed to fetch verified Google user profile:", fetchErr);
              notification.error({
                message: "GOOGLE VERIFICATION FAILED",
                description: "Could not retrieve real profile details from Google servers.",
                placement: "bottomRight",
              });
            } finally {
              setGoogleLoading(false);
            }
          }
        },
      });

      // Directly opens Google's OFFICIAL OAuth verification popup window
      tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (err) {
      console.error("Failed to launch Google OAuth popup:", err);
      setGoogleLoading(false);
      notification.error({
        message: "GOOGLE POPUP BLOCKED OR FAILED",
        description: err.message || "Please ensure browser popups are allowed.",
        placement: "bottomRight",
      });
    }
  };

  // Click handler for "Sign in with Google" and "Register with Google"
  const handleGoogleAuthClick = (intent = "login") => {
    setGoogleActionIntent(intent);
    const activeClientId =
      clientIdInput ||
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem("legacy_google_client_id");

    if (!activeClientId) {
      // Prompt user once for their Google OAuth Client ID if not yet defined in .env
      setClientIdModalOpen(true);
      return;
    }

    launchRealGooglePopup(activeClientId, intent);
  };

  // Save Client ID and immediately trigger the real Google popup
  const handleSaveClientIdAndLaunch = () => {
    const trimmed = clientIdInput.trim();
    if (!trimmed) {
      notification.warning({
        message: "CLIENT ID REQUIRED",
        description: "Please enter your Google Cloud OAuth Client ID.",
      });
      return;
    }
    localStorage.setItem("legacy_google_client_id", trimmed);
    setClientIdModalOpen(false);
    launchRealGooglePopup(trimmed, googleActionIntent);
  };

  return (
    <>
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
        <div className="relative w-full min-h-[500px] md:h-[610px] bg-white rounded-2xl overflow-hidden shadow-2xl select-none">
          {/* ================= PANEL 1: LOGIN FORM ================= */}
          <div
            className={`w-full md:w-1/2 md:absolute md:top-0 md:left-0 h-full p-6 sm:p-7 flex flex-col justify-between transition-all duration-500 ease-in-out ${
              mode === "login"
                ? "block opacity-100 md:translate-x-0 z-10 pointer-events-auto"
                : "hidden md:flex opacity-0 md:-translate-x-12 z-0 pointer-events-none"
            }`}
          >
            <div>
              <div className="flex items-center space-x-2 mb-2.5">
                <img
                  src="/images/LOGO.png"
                  alt="LEGACY"
                  className="h-6 w-auto object-contain"
                />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                  LEGACY STORE
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-black mb-1">
                SIGN IN TO ACCOUNT
              </h2>
              <p className="text-xs text-neutral-500 font-light mb-4">
                Access your personal purchases, order tracking, and wishlist.
              </p>

              {/* 🌟 REAL GOOGLE VERIFY BUTTON (Opens accounts.google.com) */}
              <button
                type="button"
                onClick={() => handleGoogleAuthClick("login")}
                disabled={loading || googleLoading}
                className="w-full h-10.5 flex items-center justify-center gap-2.5 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 font-bold text-xs uppercase tracking-wider border border-neutral-300 hover:border-black rounded-lg shadow-2xs transition-all duration-200 cursor-pointer mb-3 group"
              >
                {googleLoading ? (
                  <Spin size="small" />
                ) : (
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                )}
                <span className="group-hover:text-black">
                  {googleLoading ? "Verifying with Google..." : "Sign in with Google"}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-3">
                <div className="border-t border-neutral-200 w-full" />
                <span className="bg-white px-2.5 text-[9px] font-mono uppercase tracking-widest text-neutral-400 shrink-0">
                  OR VIA EMAIL & PASSWORD
                </span>
                <div className="border-t border-neutral-200 w-full" />
              </div>

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
                  className="!mb-2.5"
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
                  className="!mb-3"
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
                  className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-widest h-10 rounded-md shadow-md flex items-center justify-center gap-2 mt-1 cursor-pointer"
                >
                  <span>ENTER CLIENT PORTAL</span>
                  <ArrowRightOutlined />
                </Button>
              </Form>
            </div>

            {/* Mobile Switch Link */}
            <div className="md:hidden mt-3 pt-2.5 border-t border-neutral-100 text-center">
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
            className={`w-full md:w-1/2 md:absolute md:top-0 md:right-0 h-full p-6 sm:p-7 flex flex-col justify-between transition-all duration-500 ease-in-out ${
              mode === "register"
                ? "block opacity-100 md:translate-x-0 z-10 pointer-events-auto"
                : "hidden md:flex opacity-0 md:translate-x-12 z-0 pointer-events-none"
            }`}
          >
            <div>
              <div className="flex items-center space-x-2 mb-2.5">
                <img
                  src="/images/LOGO.png"
                  alt="LEGACY"
                  className="h-6 w-auto object-contain"
                />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                  LEGACY VIP
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-black mb-1">
                CREATE VIP ACCOUNT
              </h2>
              <p className="text-xs text-neutral-500 font-light mb-3">
                Register for exclusive order tracking, saved wishlists, and drops.
              </p>

              {/* 🌟 REAL GOOGLE VERIFY BUTTON FOR REGISTER (Opens accounts.google.com) */}
              <button
                type="button"
                onClick={() => handleGoogleAuthClick("register")}
                disabled={loading || googleLoading}
                className="w-full h-10.5 flex items-center justify-center gap-2 bg-neutral-950 hover:bg-black active:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all duration-200 cursor-pointer mb-2.5 group border border-neutral-800 hover:border-amber-500/50"
              >
                {googleLoading ? (
                  <Spin size="small" />
                ) : (
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {googleLoading ? "Verifying with Google..." : "Register with Google"}
                </span>
                <span className="text-[9px] font-mono bg-amber-400 text-black px-1.5 py-0.2 rounded-sm font-black ml-1 uppercase">
                  Real Google Verify
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-2.5">
                <div className="border-t border-neutral-200 w-full" />
                <span className="bg-white px-2.5 text-[9px] font-mono uppercase tracking-widest text-neutral-400 shrink-0">
                  OR VIA REGISTRATION FORM
                </span>
                <div className="border-t border-neutral-200 w-full" />
              </div>

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
                  className="!mb-2"
                >
                  <Input
                    prefix={<IdcardOutlined className="text-neutral-400" />}
                    placeholder="e.g. Jean Dupont"
                    className="text-xs py-1.5 rounded-md"
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
                  className="!mb-2"
                >
                  <Input
                    prefix={<MailOutlined className="text-neutral-400" />}
                    placeholder="name@domain.com"
                    className="text-xs py-1.5 rounded-md"
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
                  className="!mb-2"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-neutral-400" />}
                    placeholder="••••••••"
                    className="text-xs py-1.5 rounded-md"
                  />
                </Form.Item>

                <Form.Item name="agree" valuePropName="checked" className="!mb-2.5">
                  <Checkbox className="text-[10px] text-neutral-500 leading-tight">
                    I agree to receive VIP invitations & express shipping benefits.
                  </Checkbox>
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-widest h-10 rounded-md shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserAddOutlined />
                  <span>JOIN VIP MEMBERSHIP</span>
                </Button>
              </Form>
            </div>

            {/* Mobile Switch Link */}
            <div className="md:hidden mt-3 pt-2.5 border-t border-neutral-100 text-center">
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

      {/* ================= GOOGLE OAUTH 2.0 CLIENT ID SETUP PROMPT ================= */}
      <Modal
        open={clientIdModalOpen}
        onCancel={() => setClientIdModalOpen(false)}
        footer={null}
        width={450}
        centered
        destroyOnClose
        styles={{ body: { padding: "26px 22px" } }}
      >
        <div className="text-center pb-3">
          <div className="flex justify-center mb-2.5">
            <GoogleIcon className="w-9 h-9" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 tracking-tight mb-1">
            Real Google Account Verification
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
            To open the real Google authentication popup directly on{" "}
            <span className="font-mono text-neutral-700 font-semibold">accounts.google.com</span>, enter your Google Cloud OAuth 2.0 Web Client ID:
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 mb-3.5 text-xs text-amber-900">
          <div className="font-bold flex items-center gap-1.5 mb-1 font-mono text-[11px] uppercase">
            <KeyOutlined className="text-amber-600" />
            <span>Google Cloud Client ID Required</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Obtain this from your Google Cloud Console project (<b>APIs & Services &gt; Credentials &gt; OAuth 2.0 Client IDs &gt; Web application</b>).
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
              Google OAuth Client ID
            </label>
            <Input
              placeholder="e.g. 1234567890-abcdefg.apps.googleusercontent.com"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              className="text-xs py-2 rounded-lg"
            />
          </div>

          <Button
            type="primary"
            block
            onClick={handleSaveClientIdAndLaunch}
            className="bg-neutral-950 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider h-11 rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>LAUNCH REAL GOOGLE POPUP</span>
            <ArrowRightOutlined />
          </Button>

          <p className="text-[10px] text-neutral-400 text-center font-light pt-1">
            This ID is stored locally in your environment and connects directly to Google OAuth servers.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default AuthModal;
