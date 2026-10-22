import { getAuthToken } from "./session";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (typeof window !== "undefined") {
    const token = getAuthToken();
    if (token && !headers.Authorization)
      headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || "Request failed");
      err.status = res.status;
      err.code = data.code;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    throw new Error(`Network error connecting to ${url}: ${err.message}`);
  }
}

// Businesses
export const getBusinesses = (params = {}, options = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/businesses${query ? `?${query}` : ""}`, options);
};

export const getProfile = () => request("/auth/profile");
export const updateProfile = (details) =>
  request("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(details),
  });
export const login = (credentials) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
export const register = (details) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(details),
  });
export const requestPasswordReset = (email) =>
  request("/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
export const resetPassword = (token, password) =>
  request("/auth/password/reset", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });

export const getBusinessBySlug = (slug) => {
  return request(`/businesses/${slug}`);
};

export const createBusiness = (businessData) => {
  return request("/businesses", {
    method: "POST",
    body: JSON.stringify(businessData),
  });
};

export const updateBusiness = (id, businessData) => {
  return request(`/businesses/${id}`, {
    method: "PUT",
    body: JSON.stringify(businessData),
  });
};

export async function uploadBusinessImage(businessId, file) {
  if (
    !file ||
    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)
  ) {
    throw new Error("Choose a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Images must be 5 MB or smaller.");
  }
  const signed = await request(`/media/business/${businessId}/sign-image`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", signed.data.apiKey);
  body.append("timestamp", String(signed.data.timestamp));
  body.append("folder", signed.data.folder);
  body.append("allowed_formats", signed.data.allowedFormats);
  body.append("signature", signed.data.signature);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.data.cloudName)}/image/upload`,
    { method: "POST", body },
  );
  const result = await response.json();
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || "Image upload failed.");
  }
  return result.secure_url;
}

// Services
export const getServicesByBusiness = (businessId) => {
  return request(`/services/business/${businessId}`);
};

export const getStaffByBusiness = (businessId) =>
  request(`/staff/business/${businessId}`);
export const createStaff = (businessId, staff) =>
  request(`/staff/business/${businessId}`, {
    method: "POST",
    body: JSON.stringify(staff),
  });
export const updateStaff = (id, staff) =>
  request(`/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(staff),
  });
export const deactivateStaff = (id) =>
  request(`/staff/${id}`, { method: "DELETE" });

export const createService = (businessId, serviceData) => {
  return request(`/services/business/${businessId}`, {
    method: "POST",
    body: JSON.stringify(serviceData),
  });
};

export const updateService = (id, serviceData) => {
  return request(`/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(serviceData),
  });
};

export const deleteService = (id) => {
  return request(`/services/${id}`, {
    method: "DELETE",
  });
};

// Schedule & Closures
export const getSchedule = (businessId) => {
  return request(`/schedules/business/${businessId}`);
};

export const updateWeeklySchedule = (businessId, weeklyHours) => {
  return request(`/schedules/business/${businessId}`, {
    method: "PUT",
    body: JSON.stringify({ weeklyHours }),
  });
};

export const addDateOverride = (businessId, overrideData) => {
  return request(`/schedules/business/${businessId}/overrides`, {
    method: "POST",
    body: JSON.stringify(overrideData),
  });
};

export const removeDateOverride = (businessId, overrideId) => {
  return request(`/schedules/business/${businessId}/overrides/${overrideId}`, {
    method: "DELETE",
  });
};

// Slots
export const getAvailableSlots = ({ businessId, serviceId, date }) => {
  return request(
    `/slots/available?businessId=${businessId}&serviceId=${serviceId}&date=${date}`,
  );
};

// Bookings
export const holdSlotAndOrder = (payload) => {
  return request("/bookings/hold", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const verifyPayment = (payload) => {
  return request("/bookings/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getBookingById = (id) => {
  return request(`/bookings/${id}`);
};

export const getBusinessBookings = (businessId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/bookings/business/${businessId}${query ? `?${query}` : ""}`);
};

export const getMyBookings = () => request("/bookings/mine");

export const cancelBooking = (id, reason) => {
  return request(`/bookings/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
};

export const completeBooking = (id) =>
  request(`/bookings/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({}),
  });

export const decideBooking = (id, decision) =>
  request(`/bookings/${id}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision }),
  });

export const getRazorpayConfig = () => {
  return request("/bookings/config/razorpay");
};

export const getAdminBusinesses = () => request("/admin/businesses");
export const setAdminBusinessStatus = (businessId, active, reason = "") =>
  request(`/admin/businesses/${businessId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active, reason }),
  });
export const getAdminAudit = () => request("/admin/audit");
