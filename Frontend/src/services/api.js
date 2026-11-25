import axios from "axios";

// Helper to normalize API URLs (ensures /api suffix without duplicate slashes)
const normalizeApiUrl = (url) => {
  if (!url) return "";
  let trimmed = String(url).trim().replace(/\/+$/, "");
  if (!trimmed.endsWith("/api")) {
    trimmed += "/api";
  }
  return trimmed;
};

// ============================================================================
// DUAL-BACKEND FAILOVER ARCHITECTURE (ACTIVE-PASSIVE REDUNDANCY)
// Service 1 (New Active Web Service): https://legacy-store-z3u6.onrender.com/api
// Service 2 (Original Web Service / Fallback): https://legacy-store.onrender.com/api
// ============================================================================
const SERVICE_PRIMARY = "https://legacy-store-z3u6.onrender.com/api";
const SERVICE_SECONDARY = "https://legacy-store.onrender.com/api";

const CANDIDATE_SERVICES = [];

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const envFallbackUrl = import.meta.env.VITE_API_BASE_URL_FALLBACK;

// If explicitly provided via ENV (e.g., custom domain or localhost in dev mode)
if (envBaseUrl) {
  const norm = normalizeApiUrl(envBaseUrl);
  if (!norm.includes("localhost") || isLocalhost) {
    if (!CANDIDATE_SERVICES.includes(norm)) CANDIDATE_SERVICES.push(norm);
  }
}

// Always ensure both Render services are registered in priority order
if (!CANDIDATE_SERVICES.includes(SERVICE_PRIMARY)) {
  CANDIDATE_SERVICES.push(SERVICE_PRIMARY);
}
if (!CANDIDATE_SERVICES.includes(SERVICE_SECONDARY)) {
  CANDIDATE_SERVICES.push(SERVICE_SECONDARY);
}
if (envFallbackUrl) {
  const normFallback = normalizeApiUrl(envFallbackUrl);
  if (!CANDIDATE_SERVICES.includes(normFallback)) {
    CANDIDATE_SERVICES.push(normFallback);
  }
}

// Pointer to the currently active working backend
let activeServiceIndex = 0;

// Restore last confirmed working backend from localStorage if available
try {
  const savedUrl = localStorage.getItem("lx_active_backend_url");
  if (savedUrl) {
    const idx = CANDIDATE_SERVICES.indexOf(savedUrl);
    if (idx !== -1) {
      activeServiceIndex = idx;
    }
  }
} catch (e) {}

export const getActiveApiUrl = () => {
  return CANDIDATE_SERVICES[activeServiceIndex] || SERVICE_PRIMARY;
};

export const getAllBackendUrls = () => [...CANDIDATE_SERVICES];

export const rotateToNextBackend = (failedUrl = null) => {
  if (CANDIDATE_SERVICES.length <= 1) return getActiveApiUrl();

  activeServiceIndex = (activeServiceIndex + 1) % CANDIDATE_SERVICES.length;
  const newActive = CANDIDATE_SERVICES[activeServiceIndex];
  try {
    localStorage.setItem("lx_active_backend_url", newActive);
  } catch (e) {}

  if (api) {
    api.defaults.baseURL = newActive;
  }
  console.info(
    `[Dual-Backend Failover] Switched active web service from ${failedUrl || "unreachable"} to: ${newActive}`,
  );
  return newActive;
};

export const markBackendSuccess = (url) => {
  if (!url) return;
  const normalized = normalizeApiUrl(url);
  const idx = CANDIDATE_SERVICES.indexOf(normalized);
  if (idx !== -1 && idx !== activeServiceIndex) {
    activeServiceIndex = idx;
    try {
      localStorage.setItem("lx_active_backend_url", normalized);
    } catch (e) {}
    if (api) {
      api.defaults.baseURL = normalized;
    }
  }
};

// Axios instance initialized with the active backend
const api = axios.create({
  baseURL: getActiveApiUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Ensure current active backend is always bound
api.interceptors.request.use((config) => {
  if (!config.baseURL || CANDIDATE_SERVICES.includes(config.baseURL)) {
    config.baseURL = getActiveApiUrl();
  }
  return config;
});

// Response Interceptor: Seamlessly failover to secondary backend on 502/503/timeout/network error
api.interceptors.response.use(
  (response) => {
    markBackendSuccess(api.defaults.baseURL);
    return response;
  },
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    config._retryCount = config._retryCount || 0;
    if (config._retryCount >= CANDIDATE_SERVICES.length - 1) {
      return Promise.reject(error);
    }

    const isNetworkError = !error.response;
    const isServerError =
      error.response &&
      (error.response.status >= 500 ||
        error.response.status === 503 ||
        error.response.status === 502);

    if (isNetworkError || isServerError) {
      config._retryCount += 1;
      const nextUrl = rotateToNextBackend(config.baseURL);
      console.warn(
        `[Axios Failover] Request to ${config.baseURL || ""}${config.url} failed. Retrying on secondary web service: ${nextUrl}...`,
      );
      config.baseURL = nextUrl;
      return api(config);
    }

    return Promise.reject(error);
  },
);

// Resilient native fetch helper with Automatic Dual-Backend Failover
export const requestFetch = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const totalServices = CANDIDATE_SERVICES.length;
  let lastError = null;

  for (let attempt = 0; attempt < totalServices; attempt++) {
    const baseUrl = getActiveApiUrl();
    const fullUrl = `${baseUrl}${cleanEndpoint}`;
    const timeoutMs = options.timeout || 14000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(fullUrl, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });
      clearTimeout(timeoutId);

      // Render returns 502/503 when suspended or in cold sleep
      if (!response.ok) {
        if (
          response.status >= 500 ||
          response.status === 503 ||
          response.status === 502
        ) {
          throw new Error(
            `Server returned HTTP ${response.status} from ${baseUrl}`,
          );
        }
        // Client errors (400, 401, 404, 422) mean the server is healthy
        markBackendSuccess(baseUrl);
        return await response.json();
      }

      markBackendSuccess(baseUrl);
      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      console.warn(
        `[Failover] Backend ${baseUrl} unreachable (${err.message}). Trying backup service...`,
      );
      rotateToNextBackend(baseUrl);
    }
  }

  throw (
    lastError ||
    new Error("All backend web services are currently unreachable.")
  );
};

export const fetchCategories = async () => {
  try {
    const data = await requestFetch("/categories");
    if (data && data.data) {
      try {
        localStorage.setItem("lx_cached_categories", JSON.stringify(data.data));
      } catch (e) {}
      return data.data;
    }
  } catch (error) {
    console.warn("Fetch categories via fetch failed, trying fallback:", error);
    try {
      const response = await api.get("/categories");
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch (e) {}
    try {
      const cached = localStorage.getItem("lx_cached_categories");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
  }
  return [];
};

export const createCategory = async (categoryData) => {
  try {
    return await requestFetch("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  } catch (error) {
    const response = await api.post("/categories", categoryData);
    return response.data;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    return await requestFetch(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  } catch (error) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  }
};

export const deleteCategory = async (id) => {
  try {
    return await requestFetch(`/categories/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export const fetchProducts = async (params = {}) => {
  try {
    let queryString = "";
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      queryString = `?${searchParams.toString()}`;
    }
    const data = await requestFetch(`/products${queryString}`);
    if (data && data.data) {
      try {
        if (!params || Object.keys(params).length === 0) {
          localStorage.setItem("lx_cached_products", JSON.stringify(data.data));
        }
      } catch (e) {}
      return data.data;
    }
  } catch (error) {
    console.warn("Fetch products via fetch failed, trying fallback:", error);
    try {
      const response = await api.get("/products", { params });
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch (e) {}
    try {
      const cached = localStorage.getItem("lx_cached_products");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
  }
  return [];
};

export const fetchProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching product #${id}:`, error);
    throw error;
  }
};

export const clearProductCache = () => {
  try {
    localStorage.removeItem("lx_cached_products");
  } catch (e) {}
};

export const clearCategoryCache = () => {
  try {
    localStorage.removeItem("lx_cached_categories");
  } catch (e) {}
};

export const createProduct = async (productData) => {
  try {
    const result = await requestFetch("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
    clearProductCache();
    return result;
  } catch (error) {
    console.warn("createProduct fetch failed, falling back to axios:", error);
    const response = await api.post("/products", productData);
    clearProductCache();
    return response.data;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const result = await requestFetch(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
    clearProductCache();
    return result;
  } catch (error) {
    console.warn(
      `updateProduct #${id} fetch failed, falling back to axios:`,
      error,
    );
    const response = await api.put(`/products/${id}`, productData);
    clearProductCache();
    return response.data;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    clearProductCache();
    return response.data;
  } catch (error) {
    console.error(`Error deleting product #${id}:`, error);
    throw error;
  }
};

export const submitOrder = async (orderData) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error) {
    console.error("Error submitting order:", error);
    throw error;
  }
};

export const fetchOrders = async (userEmail = null) => {
  try {
    const url = userEmail
      ? `/orders?email=${encodeURIComponent(userEmail)}`
      : "/orders";
    const data = await requestFetch(url);
    if (data && data.data) {
      if (userEmail) {
        try {
          localStorage.setItem(
            `lx_cached_orders_${userEmail}`,
            JSON.stringify(data.data),
          );
        } catch (e) {}
      }
      return data.data;
    }
  } catch (error) {
    console.warn("fetchOrders via fetch failed, trying axios fallback:", error);
    try {
      const url = userEmail
        ? `/orders?email=${encodeURIComponent(userEmail)}`
        : "/orders";
      const response = await api.get(url);
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch (e) {}
    if (userEmail) {
      try {
        const cached = localStorage.getItem(`lx_cached_orders_${userEmail}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
  }
  return [];
};

export const updateOrderStatus = async (id, status, extraData = {}) => {
  try {
    const payload =
      typeof status === "object" ? status : { status, ...extraData };
    const response = await api.patch(`/orders/${id}/status`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating order #${id} status:`, error);
    throw error;
  }
};

export const updateDeliveryLocation = async (orderId, locationData) => {
  try {
    return await requestFetch(`/orders/${orderId}/delivery-location`, {
      method: "POST",
      body: JSON.stringify(locationData),
    });
  } catch (error) {
    const response = await api.post(
      `/orders/${orderId}/delivery-location`,
      locationData,
    );
    return response.data;
  }
};

export const fetchProductReviews = async (productId) => {
  try {
    return await requestFetch(`/products/${productId}/reviews`);
  } catch (error) {
    try {
      const response = await api.get(`/products/${productId}/reviews`);
      return response.data;
    } catch (e) {
      console.warn("fetchProductReviews failed:", e);
      return { success: false, data: [] };
    }
  }
};

export const submitProductReview = async (productId, reviewData) => {
  try {
    return await requestFetch(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  } catch (error) {
    const response = await api.post(
      `/products/${productId}/reviews`,
      reviewData,
    );
    return response.data;
  }
};

export const getDeliveryStatus = async (orderId) => {
  try {
    const data = await requestFetch(`/orders/${orderId}/delivery`);
    if (data && data.data) return data.data;
  } catch (error) {
    try {
      const response = await api.get(`/orders/${orderId}/delivery`);
      if (response.data && response.data.data) return response.data.data;
    } catch (e) {}
  }
  return null;
};

export const deleteOrder = async (id) => {
  try {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order #${id}:`, error);
    throw error;
  }
};

// User Management API Functions
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const loginWithGoogle = async (googleUserData) => {
  try {
    const response = await api.post("/auth/google", googleUserData);
    return response.data;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const fetchUsers = async () => {
  try {
    const data = await requestFetch("/users");
    if (data && data.data) {
      return data.data;
    }
  } catch (error) {
    console.warn("fetchUsers via fetch failed, trying axios fallback:", error);
    try {
      const response = await api.get("/users");
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch (e) {}
  }
  return [];
};

export const createUser = async (userData) => {
  try {
    const response = await api.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user #${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user #${id}:`, error);
    throw error;
  }
};

// Bakong KHQR Payment API Functions
export const generateBakongKhqr = async (orderId, amount, currency = "USD") => {
  try {
    const response = await api.post("/bakong/generate-khqr", {
      order_id: orderId,
      amount,
      currency,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating Bakong KHQR:", error);
    throw error;
  }
};

export const checkBakongPaymentStatus = async (
  md5,
  orderId = null,
  manual = false,
  altMd5 = null,
  elapsed = 0,
) => {
  try {
    const payload = {
      md5,
      alt_md5: altMd5,
      order_id: orderId,
      manual: Boolean(manual),
      elapsed: Number(elapsed) || 0,
    };
    try {
      return await requestFetch("/bakong/check-status", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (e) {
      const response = await api.post("/bakong/check-status", payload);
      return response.data;
    }
  } catch (error) {
    console.warn(
      "Error checking Bakong payment status:",
      error?.message || error,
    );
    return { paid: false, status: "pending", message: "Polling..." };
  }
};

export default api;
