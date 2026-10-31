/**
 * Site Content Service for Alexandre Luxe / Legacy Store
 * Manages editable homepage media: 3D Community Carousel, Hero Marquee, FAQs, and Testimonials
 */

export const DEFAULT_HERO_MARQUEE = [
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
];

export const DEFAULT_COMMUNITY_GALLERY = [
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
];

export const DEFAULT_FAQS = [
  {
    id: "1",
    question: "WHAT ARE YOUR WORLDWIDE SHIPPING TIMES?",
    answer:
      "Express international shipping via DHL Express takes 2-4 business days. Complimentary worldwide shipping applies to all orders over $200 with full transit insurance.",
    badges: ["DHL EXPRESS", "2-4 DAYS", "FREE OVER $200"],
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "2",
    question: "HOW DO RETURNS & EXCHANGES WORK?",
    answer:
      "We offer a 30-day complimentary return window. Garments must be unworn with original tags attached in original luxury packaging with prepaid return labels included.",
    badges: ["30-DAY RETURNS", "COMPLIMENTARY", "EASY EXCHANGE"],
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "3",
    question: "WHERE ARE LEGACY PRODUCTS MANUFACTURED?",
    answer:
      "Our tailored shirts are designed in Paris, heavyweight tees produced in Milan from 280 GSM combed cotton, and calfskin footwear Goodyear welted in Porto, Portugal.",
    badges: ["PARIS ATELIER", "MILAN COTTON", "PORTO FOOTWEAR"],
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "4",
    question: "HOW DO I TRACK MY BESPOKE SHIPMENT?",
    answer:
      "Once dispatched from our atelier, a live DHL Express tracking code is sent via SMS & email. VIP client advisors are available 24/7 for custom order updates.",
    badges: ["24/7 CONCIERGE", "SMS ALERTS", "LIVE TRACKING"],
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
  },
];

export const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    rating: 5,
    comment:
      "Their team delivered a stunning website that perfectly reflects our vision. Communication was seamless, deadlines were met, and the final result speaks for itself.",
    stats: [
      { value: "+42%", label: "Lead Generation" },
      { value: "+63%", label: "User Engagement" },
    ],
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    name: "Daniel Carter",
    role: "CEO, BrightWave Studio",
  },
  {
    id: 2,
    rating: 5,
    comment:
      "Working with this agency completely transformed our brand identity. The creative thinking, attention to detail, and strategic approach exceeded all expectations.",
    stats: [
      { value: "+34%", label: "Brand Engagement" },
      { value: "+57%", label: "Website Conversions" },
    ],
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    name: "Sarah Mitchell",
    role: "Marketing Director",
  },
  {
    id: 3,
    rating: 5,
    comment:
      "Lyniq helps companies create stunning and strategically sound experiences that engage luxury audiences. Our experts work closely with you to ensure every detail is perfection.",
    stats: [
      { value: "+28%", label: "Customer Retention" },
      { value: "+61%", label: "Conversion Rate" },
    ],
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    name: "Andy Styles",
    role: "Founder, Tech Startup",
  },
];

export const DEFAULT_TESTIMONIAL_SUMMARY = {
  score: "4.9",
  scale: "5",
  highlightText: "56+ successful",
  description: "Helping companies grow through 56+ successful creative projects.",
  badgeText: "G2 ratings (120+ reviews)",
};

const STORAGE_KEY = "legacy_site_content_v1";

/**
 * Get current site content (from localStorage or defaults)
 */
export const getSiteContent = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        heroMarqueeImages:
          Array.isArray(parsed.heroMarqueeImages) && parsed.heroMarqueeImages.length > 0
            ? parsed.heroMarqueeImages
            : DEFAULT_HERO_MARQUEE,
        communityGalleryImages:
          Array.isArray(parsed.communityGalleryImages) && parsed.communityGalleryImages.length > 0
            ? parsed.communityGalleryImages
            : DEFAULT_COMMUNITY_GALLERY,
        faqs:
          Array.isArray(parsed.faqs) && parsed.faqs.length > 0
            ? parsed.faqs
            : DEFAULT_FAQS,
        testimonials:
          Array.isArray(parsed.testimonials) && parsed.testimonials.length > 0
            ? parsed.testimonials
            : DEFAULT_TESTIMONIALS,
        testimonialSummary: parsed.testimonialSummary || DEFAULT_TESTIMONIAL_SUMMARY,
      };
    }
  } catch (err) {
    console.warn("Failed to load site content from localStorage:", err);
  }

  return {
    heroMarqueeImages: DEFAULT_HERO_MARQUEE,
    communityGalleryImages: DEFAULT_COMMUNITY_GALLERY,
    faqs: DEFAULT_FAQS,
    testimonials: DEFAULT_TESTIMONIALS,
    testimonialSummary: DEFAULT_TESTIMONIAL_SUMMARY,
  };
};

/**
 * Save updated site content and dispatch live event
 */
export const saveSiteContent = (content) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    window.dispatchEvent(new Event("legacy_site_content_updated"));
    return true;
  } catch (err) {
    console.error("Failed to save site content:", err);
    return false;
  }
};

/**
 * Reset all site content to original defaults
 */
export const resetSiteContent = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("legacy_site_content_updated"));
    return true;
  } catch (err) {
    console.error("Failed to reset site content:", err);
    return false;
  }
};

