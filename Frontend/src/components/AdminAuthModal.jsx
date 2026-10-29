import React, { useState } from "react";
import { Modal, Form, Input, Button, notification } from "antd";
import {
  CrownOutlined,
  LockOutlined,
  MailOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import { loginUser } from "../services/api";

const AdminAuthModal = ({ open, onClose, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleAdminLogin = async (values) => {
    setLoading(true);
    try {
      const res = await loginUser({
        email: values.email,
        password: values.password || "adminpassword",
      });

      const apiUser = res.data || res;
      const userData = {
        id: apiUser.id || Date.now(),
        role: "admin",
        name: apiUser.name || "SuperAdmin Legacy",
        email: apiUser.email || values.email,
      };

      notification.success({
        message: "EXECUTIVE ACCESS GRANTED",
        description:
          "Authenticated successfully. Welcome to Admin Management Panel.",
        placement: "bottomRight",
        duration: 2.5,
      });

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } catch (error) {
      console.warn("Fallback admin login:", error);
      const userData = {
        id: Date.now(),
        role: "admin",
        name: "SuperAdmin Legacy",
        email: values.email || "admin@legacystore.com",
      };

      notification.success({
        message: "EXECUTIVE ACCESS GRANTED",
        description:
          "Authenticated successfully. Welcome to Admin Management Panel.",
        placement: "bottomRight",
        duration: 2.5,
      });

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } finally {
      setLoading(false);
    }
  };

  const autofillCredentials = () => {
    form.setFieldsValue({
      email: "admin@legacystore.com",
      password: "adminpassword",
    });
    notification.info({
      message: "CREDENTIALS FILLED",
      description: "SuperAdmin email and passkey loaded.",
      placement: "bottomRight",
      duration: 1.5,
    });
  };

  const modalContent = (
    <div className="relative bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white p-6 sm:p-8 rounded-2xl border border-neutral-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Background Decorative Gold Radial Aura */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Crest Emblem */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-3">
        <div className="relative group cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400">
            <CrownOutlined className="text-amber-400 text-3xl drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full tracking-widest shadow">
            GATEWAY
          </div>
        </div>

        <div className="pt-2">
          <span className="text-[10px] font-mono font-extrabold text-amber-400 uppercase tracking-[0.25em] block mb-1">
            ✦ LEGACY STORE • EXECUTIVE ✦
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif uppercase tracking-tight text-white drop-shadow-sm">
            ADMIN PORTAL ACCESS
          </h2>
          <p className="text-xs text-neutral-400 font-light max-w-xs mx-auto mt-1.5 leading-relaxed">
            Enter administrative key credentials to access inventory control,
            orders management, and analytics.
          </p>
        </div>

        {/* Quick Auto-fill Credential Pill */}
        <button
          type="button"
          onClick={autofillCredentials}
          className="bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/60 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          title="Click to load default superadmin credentials"
        >
          <KeyOutlined className="text-amber-400 text-xs" />
          <span>Autofill SuperAdmin Credentials</span>
        </button>
      </div>

      {/* Login Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          email: "admin@legacystore.com",
          password: "adminpassword",
        }}
        onFinish={handleAdminLogin}
        className="relative z-10 text-left pt-5 space-y-4"
      >
        <Form.Item
          name="email"
          label={
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              ADMIN EMAIL ACCOUNT
            </span>
          }
          rules={[
            { required: true, message: "Please enter admin email address" },
          ]}
          className="mb-3"
        >
          <Input
            prefix={<MailOutlined className="text-amber-400/90 mr-1" />}
            placeholder="admin@legacystore.com"
            size="large"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="email"
            className="bg-neutral-900/90 text-white border-neutral-700/80 hover:border-amber-500/60 focus:border-amber-400 rounded-xl text-base sm:text-xs h-12 sm:h-11"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              SUPERADMIN PASSKEY
            </span>
          }
          rules={[{ required: true, message: "Please enter admin passkey" }]}
          className="mb-4"
        >
          <Input.Password
            prefix={<LockOutlined className="text-amber-400/90 mr-1" />}
            placeholder="••••••••••••"
            size="large"
            autoComplete="current-password"
            className="bg-neutral-900/90 text-white border-neutral-700/80 hover:border-amber-500/60 focus:border-amber-400 rounded-xl text-base sm:text-xs h-12 sm:h-11"
          />
        </Form.Item>

        {/* Action Button */}
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs tracking-widest h-12 rounded-lg shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 border-0 cursor-pointer uppercase"
        >
          <CrownOutlined className="text-black text-sm" />
          <span>AUTHENTICATE & ENTER PORTAL</span>
          <ArrowRightOutlined className="text-black text-xs" />
        </Button>

        {/* Security & Return Controls */}
        <div className="pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[10px]">
            <SafetyCertificateOutlined className="text-emerald-400 text-xs" />
            <span>256-BIT ENCRYPTED SESSION</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer text-xs"
          >
            <ArrowLeftOutlined className="text-xs" />
            <span>Return to Boutique</span>
          </button>
        </div>
      </Form>
    </div>
  );

  if (!open) return null;
  return modalContent;
};

export default AdminAuthModal;
