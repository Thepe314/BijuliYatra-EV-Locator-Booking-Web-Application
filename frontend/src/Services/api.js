// Enhanced API Services - api.js or services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add token to headers
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await authService.refresh();

        if (newAccessToken) {
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return api(originalRequest);
        } else {
          authService.logout();
          window.location.href = "/login";
        }
      } catch (refreshError) {
        authService.logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const data = response.data;

    if (data.token) {
      localStorage.setItem("authToken", data.token);

      try {
        const parts = data.token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.userId) {
            localStorage.setItem("userId", payload.userId.toString());
          }
          if (payload.role) {
            localStorage.setItem("userRole", payload.role);
          }
        }
      } catch (e) {
        console.error("Failed to decode JWT payload:", e);
        // do not throw – let login continue
      }
    }

    return data;
  },

  signupEvOwner: async (userData) => {
    const response = await api.post("/auth/signup/ev-owner", userData);
    return response.data;
  },

  signupOperator: async (userData) => {
    const response = await api.post("/auth/signup/operator", userData);
    return response.data;
  },

  logout: async () => {
    
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");

    try {
     
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    
    }
  },

  refresh: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
      const response = await api.post("/auth/refresh", { refreshToken });
      if (response.data.accessToken) {
        localStorage.setItem("authToken", response.data.accessToken);
        return response.data.accessToken;
      }
    } catch (error) {
      console.error("Refresh token error:", error);
    }
    return null;
  },

  requestPasswordReset: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (email, otpCode, password) => {
    const response = await api.post("/auth/reset-password", { email, otpCode, password });
    return response.data;
  },

  isAuthenticated: () => !!localStorage.getItem("authToken"),
};

// User Management Services
export const userService = {
  listUsers: async (filters = {}) => {
    try {
      const response = await api.get("/admin/users", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  getUsersByRole: async (roleType) => {
    try {
      const response = await api.get(`/admin/users/role/${roleType}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw error;
    }
  },

  countUsersByRole: async (roleType) => {
    try {
      const response = await api.get(`/admin/users/count/role/${roleType}`);
      return response.data;
    } catch (error) {
      console.error("Error counting users:", error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post("/admin/users/new", userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
  try {
    const response = await api.put(`/admin/edit/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
},

 deleteUser: async (userId) => {
  try {
    const response = await api.delete(`/admin/delete/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
},

  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error changing user status:", error);
      throw error;
    }
  },

  getOperators: async () => {
  const response = await api.get("/admin/role/CHARGER_OPERATOR");
  return response.data;
  
},
};

export const stationService = {
  // Operator endpoints
  listStationOperator: async (filters = {}) => {
    try {
      const response = await api.get("/operator/stations", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching operator stations:", error);
      throw error;
    }
  },

   // Owner endpoints
  listStationsForOwner: async (filters = {}) => {
    try {
      const response = await api.get("/evowner/stations", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching operator stations:", error);
      throw error;
    }
  },

  // Admin endpoints
  listStationAdmin: async (filters = {}) => {
    try {
      const response = await api.get("/admin/stations", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching admin stations:", error);
      throw error;
    }
  },

  

  createStation: async (stationData) => {
    try {
      const response = await api.post("/operator/stations", stationData);
      return response.data;
    } catch (error) {
      console.error("Error creating station:", error);
      throw error;
    }
  },

   createStationAdmin: async (stationData) => {
    try {
      const response = await api.post("/admin/stations", stationData);
      return response.data;
    } catch (error) {
      console.error("Error creating station:", error);
      throw error;
    }
  },

  updateStation: async (stationId, stationData) => {
    try {
      const response = await api.put(`/operator/stations/${stationId}`, stationData);
      return response.data;
    } catch (error) {
      console.error("Error updating station:", error);
      throw error;
    }
  },
  getStationById: async (id) => {
  const res = await api.get(`/admin/stations/${id}`);
  return res.data;
},

 getStationByIdO: async (id) => {
  const res = await api.get(`/operator/stations/${id}`);
  return res.data;
},

  updateStationAdmin: async (id, data) => {
    const res = await api.put(`/admin/stations/edit/${id}`, data);
    return res.data;
  },

  // Delete for operators - only their own stations
  deleteStation: async (stationId) => {
    try {
      const response = await api.delete(`/operator/stations/${stationId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting station:", error);
      throw error;
    }
  },

  // Delete for admin - any station
  deleteStationAdmin: async (stationId) => {
    try {
      const response = await api.delete(`/admin/stations/${stationId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting station (admin):", error);
      throw error;
    }
  },

  getStationStats: async (stationId) => {
    try {
      const response = await api.get(`/operator/stations/${stationId}/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching station stats:", error);
      throw error;
    }
  },

listStationsForOwner: async (filters = {}) => {
  try {
    const response = await api.get("/evowner/station", { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching EV owner stations:", error);
    throw error;
  }
},

};




// Booking Management Services
export const bookingService = {
  listBookings: async (filters = {}) => {
    try {
      const response = await api.get("/bookings", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  },

  //Admin
  listBookingsAdmin: async (filters = {}) => {
  try {
    const response = await api.get("/admin/bookings", { 
      params: {
        page: filters.page || 0,
        size: filters.limit || 10,
        sort: filters.sort || 'createdAt,desc'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    throw error;
  }
},

getActiveBookingsCount: async (stationIds) => {
  try {
    const response = await api.post("/admin/bookings/active-counts", stationIds);
    return response.data; // Returns: { "1": 1, "2": 0, "3": 2 }
  } catch (error) {
    console.error("Error fetching active bookings count:", error);
    return {};
  }
},

  getRecentBookings: async (limit = 5, timeRange = 'week') => {
    try {
      const response = await api.get("/bookings/recent", { params: { limit, timeRange } });
      return response.data;
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      throw error;
    }
  },

  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching booking:", error);
      throw error;
    }
  },

  createBooking: async (bookingData) => {
    try {
      const response = await api.post("/bookings", bookingData);
      return response.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },

  updateBooking: async (bookingId, bookingData) => {
    try {
      const response = await api.put(`/bookings/${bookingId}`, bookingData);
      return response.data;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const response = await api.delete(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      throw error;
    }
  },
  getStationBookings: async (stationId, date) => {
  const response = await api.get(`/stations/${stationId}/bookings`, {
    params: { date }
  });
  return response;
},
};

// Dashboard/Analytics Services
export const analyticsService = {
  getDashboardStats: async (timeRange = 'week') => {
    try {
      const response = await api.get("/admin/dashboard/stats", { params: { timeRange } });
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  getRevenueData: async (timeRange = 'week') => {
    try {
      const response = await api.get("/admin/analytics/revenue", { params: { timeRange } });
      return response.data;
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      throw error;
    }
  },

  getEnergyData: async (timeRange = 'week') => {
    try {
      const response = await api.get("/admin/analytics/energy", { params: { timeRange } });
      return response.data;
    } catch (error) {
      console.error("Error fetching energy data:", error);
      throw error;
    }
  },

  getUserGrowth: async (timeRange = 'week') => {
    try {
      const response = await api.get("/admin/analytics/user-growth", { params: { timeRange } });
      return response.data;
    } catch (error) {
      console.error("Error fetching user growth data:", error);
      throw error;
    }
  },
};
// services/vehicleService.js
export const vehicleService = {
  getMyVehicles: () => api.get('/evowner/vehicles')
};

// services/favoriteService.js
export const favoriteService = {
  getMyFavorites: () => api.get('/evowner/favorites')
};

export { api };