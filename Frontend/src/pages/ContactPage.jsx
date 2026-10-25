import React, { useState, useEffect } from "react";
import { Input, Button, Select, notification, Tooltip } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
  CopyOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CompassOutlined,
  SafetyCertificateOutlined,
  MessageOutlined,
  WhatsAppOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import HoverFaqAccordion from "../components/HoverFaqAccordion";

const ContactPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "sizing",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("concierge@alexandreluxe.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText("+33 1 42 68 55 00");
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      notification.warning({
        message: "REQUIRED FIELDS MISSING",
        description: "Please provide your name, email, and inquiry message.",
        placement: "bottomRight",
      });
      return;
    }

    setSubmitting(true);

    // Save inquiry to localStorage for record persistence
    try {
      const existing = JSON.parse(localStorage.getItem("legacy_contact_inquiries") || "[]");
      existing.unshift({
        ...formData,
        id: Date.now(),
        submitted_at: new Date().toISOString(),
      });
      localStorage.setItem("legacy_contact_inquiries", JSON.stringify(existing.slice(0, 50)));
    } catch (err) {
      console.warn("Could not save inquiry to local storage:", err);
    }

    setTimeout(() => {
      setSubmitting(false);
      setFormData({ name: "", email: "", phone: "", topic: "sizing", message: "" });
      notification.success({
        message: "INQUIRY DISPATCHED",
        description:
          "Thank you for reaching out to Alexandre Luxe. A dedicated Paris VIP Concierge will respond to your email within 24 hours.",
        placement: "bottomRight",
        duration: 4,
      });
    }, 800);
  };

  return (
    <div className="bg-neutral-50 text-neutral-900 min-h-screen pb-24">
      {/* 1. Sleek Minimalist Luxury Atelier Hero - Matching Parisian Atelier Banner */}
      <div className="bg-black text-white py-14 sm:py-20 px-4 text-center border-b border-neutral-800 relative">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest block">
            PARISIAN LUXURY ATELIER
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif uppercase tracking-tight text-white">
            CONTACT LEGACY
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto font-light leading-relaxed">
            Our VIP client advisors are at your service for bespoke sizing recommendations, private atelier appointments, and global courier dispatch support.
          </p>

          {/* Minimal Feature Badges */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] font-mono tracking-wider text-neutral-300">
            <span className="py-1.5 px-3.5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center gap-1.5">
              <span className="text-amber-400">✨</span> 24/7 VIP Concierge
            </span>
            <span className="py-1.5 px-3.5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center gap-1.5">
              <span className="text-amber-400">✈️</span> DHL Express Worldwide
            </span>
            <span className="py-1.5 px-3.5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center gap-1.5">
              <span className="text-amber-400">📍</span> Paris Flagship Atelier
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Consultation & Direct Channels Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Column: Direct Atelier Channels (5 Cols) */}
          <div className="lg:col-span-5 bg-neutral-950 text-white p-7 sm:p-10 rounded-3xl border border-neutral-800 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Top Gold Gradient Bar Accent */}
            <div className="h-1 w-20 bg-gradient-to-r from-amber-300 via-amber-500 to-transparent rounded-full mb-6" />

            <div>
              <span className="text-[10px] font-bold text-amber-500 font-mono uppercase tracking-[0.25em] block mb-1.5">
                DIRECT CLIENT ACCESS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif uppercase tracking-tight text-white mb-3">
                PARIS ATELIER
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light mb-8">
                Whether scheduling private studio fittings or inquiring about limited collection drops, our client liaison responds promptly within 24 hours.
              </p>

              {/* Direct Channels List */}
              <div className="space-y-6 text-xs sm:text-sm">
                {/* Email Advisor */}
                <div className="flex items-start gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 group-hover:border-amber-500/50 transition-colors">
                    <MailOutlined className="text-base text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider block">
                        VIP EMAIL CORRESPONDENCE
                      </span>
                      <Tooltip title={copiedEmail ? "Copied!" : "Copy Email"}>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
                        >
                          {copiedEmail ? (
                            <CheckCircleFilled className="text-emerald-400 text-xs" />
                          ) : (
                            <CopyOutlined className="text-xs" />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                    <a
                      href="mailto:concierge@alexandreluxe.com"
                      className="text-white hover:text-amber-400 font-medium font-sans text-xs sm:text-sm truncate block transition-colors"
                    >
                      concierge@alexandreluxe.com
                    </a>
                  </div>
                </div>

                {/* WhatsApp / Phone */}
                <div className="flex items-start gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 group-hover:border-amber-500/50 transition-colors">
                    <PhoneOutlined className="text-base text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider block">
                        TELEPHONE & WHATSAPP
                      </span>
                      <Tooltip title={copiedPhone ? "Copied!" : "Copy Phone"}>
                        <button
                          type="button"
                          onClick={handleCopyPhone}
                          className="text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
                        >
                          {copiedPhone ? (
                            <CheckCircleFilled className="text-emerald-400 text-xs" />
                          ) : (
                            <CopyOutlined className="text-xs" />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="tel:+33142685500"
                        className="text-white hover:text-amber-400 font-medium font-sans text-xs sm:text-sm transition-colors"
                      >
                        +33 1 42 68 55 00
                      </a>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                        Online
                      </span>
                    </div>
                  </div>
                </div>

                {/* Paris Flagship Studio */}
                <div className="flex items-start gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 group-hover:border-amber-500/50 transition-colors">
                    <EnvironmentOutlined className="text-base text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider block">
                      PARIS FLAGSHIP SUITE
                    </span>
                    <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed mb-1.5">
                      28 Rue du Faubourg Saint-Honoré, 75008 Paris, France
                    </p>
                    <a
                      href="https://maps.google.com/?q=28+Rue+du+Faubourg+Saint-Honoré+75008+Paris"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300 text-[11px] font-mono uppercase tracking-wider inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Open in Google Maps</span>
                      <ArrowRightOutlined className="text-[10px]" />
                    </a>
                  </div>
                </div>

                {/* Atelier Opening Hours */}
                <div className="flex items-start gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 group-hover:border-amber-500/50 transition-colors">
                    <ClockCircleOutlined className="text-base text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider block">
                      CONSULTATION HOURS
                    </span>
                    <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed">
                      Mon – Sat: 09:00 – 20:00 CET
                    </p>
                    <p className="text-neutral-400 text-[11px] font-light">
                      Sunday: Private Atelier Fittings by Appointment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Confidentiality Footer */}
            <div className="pt-6 border-t border-neutral-800/80 mt-8 flex items-center gap-2 text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
              <SafetyCertificateOutlined className="text-amber-400 text-sm" />
              <span>100% Client Discretion Guaranteed</span>
            </div>
          </div>

          {/* Right Column: Clean Luxury Consultation Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-7 sm:p-10 rounded-3xl border border-neutral-200/90 shadow-xl relative">
            <div className="mb-6">
              <span className="text-[10px] font-bold text-amber-600 font-mono uppercase tracking-[0.25em] block mb-1">
                ✦ BESPOKE INQUIRY
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif uppercase tracking-tight text-neutral-900 mb-1.5">
                SEND US A MESSAGE
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
                Fill out the consultation form below. Our VIP advisory staff will review your request and reply with a personalized curation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                    FULL NAME <span className="text-amber-500">*</span>
                  </label>
                  <Input
                    size="large"
                    placeholder="e.g. Alexandre Moreau"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl text-xs sm:text-sm border-neutral-300 hover:border-black focus:border-black h-11"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                    EMAIL ADDRESS <span className="text-amber-500">*</span>
                  </label>
                  <Input
                    size="large"
                    type="email"
                    placeholder="e.g. alexandre@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl text-xs sm:text-sm border-neutral-300 hover:border-black focus:border-black h-11"
                  />
                </div>
              </div>

              {/* Phone & Subject Topic Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                    PHONE / WHATSAPP <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    size="large"
                    placeholder="e.g. +33 6 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl text-xs sm:text-sm border-neutral-300 hover:border-black focus:border-black h-11"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                    INQUIRY TOPIC
                  </label>
                  <Select
                    size="large"
                    value={formData.topic}
                    onChange={(val) => setFormData({ ...formData, topic: val })}
                    className="w-full text-xs sm:text-sm h-11"
                    options={[
                      { value: "sizing", label: "Bespoke Sizing & Fit Advice" },
                      { value: "custom", label: "Custom Atelier Piece Inquiry" },
                      { value: "order", label: "Order Dispatch & Express Tracking" },
                      { value: "appointment", label: "Private Paris Showroom Fitting" },
                      { value: "press", label: "Press & Commercial Inquiries" },
                    ]}
                  />
                </div>
              </div>

              {/* Message Textarea */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  YOUR INQUIRY MESSAGE <span className="text-amber-500">*</span>
                </label>
                <Input.TextArea
                  rows={5}
                  placeholder="How may our Paris concierge advisors assist you today? Please include any preferred sizes or specific garment inquiries."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-xl text-xs sm:text-sm border-neutral-300 hover:border-black focus:border-black p-3"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<SendOutlined />}
                className="w-full !bg-neutral-950 hover:!bg-black text-white font-extrabold text-xs tracking-widest uppercase h-12 rounded-xl shadow-md border-none cursor-pointer transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>TRANSMIT VIP INQUIRY</span>
              </Button>

              <p className="text-[10px] text-neutral-400 text-center font-light pt-1">
                Your privacy is paramount. Inquiries are handled strictly by dedicated Alexandre Luxe personnel.
              </p>
            </form>
          </div>
        </div>

        {/* 3. Luxury Reassurance Pillars Banner */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="space-y-1 sm:border-r border-neutral-200 sm:pr-4">
              <span className="text-amber-500 text-lg block mb-1">⏱️</span>
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-900 block font-mono">
                24-Hour Response
              </span>
              <p className="text-[11px] text-neutral-500 font-light">
                Direct client correspondence from a personal advisor in Paris.
              </p>
            </div>

            <div className="space-y-1 lg:border-r border-neutral-200 lg:pr-4">
              <span className="text-amber-500 text-lg block mb-1">🧵</span>
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-900 block font-mono">
                Private Fittings
              </span>
              <p className="text-[11px] text-neutral-500 font-light">
                Complimentary private atelier suite bookings in Paris & Milan.
              </p>
            </div>

            <div className="space-y-1 sm:border-r border-neutral-200 sm:pr-4">
              <span className="text-amber-500 text-lg block mb-1">✈️</span>
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-900 block font-mono">
                DHL Express Transit
              </span>
              <p className="text-[11px] text-neutral-500 font-light">
                Fully insured global delivery with real-time GPS tracking.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-amber-500 text-lg block mb-1">🛡️</span>
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-900 block font-mono">
                100% Confidential
              </span>
              <p className="text-[11px] text-neutral-500 font-light">
                Strict client privacy and encrypted communication protocols.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Paris Flagship Atelier Visual Location Card */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-black text-white rounded-3xl p-8 sm:p-12 mb-16 border border-neutral-800 shadow-xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono uppercase tracking-widest font-bold">
                <CompassOutlined />
                <span>VISIT OUR PARIS SUITE</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold font-serif uppercase tracking-tight text-white">
                FLAGSHIP SALON & BESPOKE ATELIER
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed max-w-xl">
                Experience our curated fabrics, private tailoring fittings, and exclusive atelier collections in the heart of Paris's historic high-fashion district.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Metro: Madeleine / Concorde
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Valet Parking Available
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-end gap-3">
              <a
                href="https://maps.google.com/?q=28+Rue+du+Faubourg+Saint-Honoré+75008+Paris"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-neutral-100 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-98 cursor-pointer"
              >
                <CompassOutlined className="text-sm" />
                <span>OPEN IN GOOGLE MAPS</span>
              </a>

              <a
                href="tel:+33142685500"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                <PhoneOutlined className="text-sm text-amber-400" />
                <span>CALL CONCIERGE</span>
              </a>
            </div>
          </div>
        </div>

        {/* 5. Frequently Asked Questions Section */}
        <div className="max-w-4xl mx-auto pt-4">
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold text-amber-600 font-mono uppercase tracking-[0.25em] block mb-1">
              CURATED ASSISTANCE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif uppercase tracking-tight text-neutral-900">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>
          <HoverFaqAccordion />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
