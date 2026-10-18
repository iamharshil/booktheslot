const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

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
export const getBusinesses = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/businesses${query ? `?${query}` : ""}`);
};

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

// Services
export const getServicesByBusiness = (businessId) => {
  return request(`/services/business/${businessId}`);
};

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

export const cancelBooking = (id, reason) => {
  return request(`/bookings/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
};

export const getRazorpayConfig = () => {
  return request("/bookings/config/razorpay");
};
