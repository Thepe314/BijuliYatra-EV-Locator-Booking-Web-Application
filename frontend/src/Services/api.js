import axios from 'axios';
// Axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

// Add request interceptor to add token to headers
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken'); // or jwtToken
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await authService.refresh();

        if (newAccessToken) {
          // Update Authorization header and retry original request
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return api(originalRequest);
        } else {
          // Refresh failed, logout user
          authService.logout();
          window.location.href = "/login"; // 🔁 Redirect to login
        }
      } catch (refreshError) {
        // Refresh request itself failed
        authService.logout();
        window.location.href = "/login"; // 🔁 Redirect to login
      }
    }

    return Promise.reject(error);
  }
);


// Auth API services
const authService = {
 login: async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.data.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    localStorage.setItem("jwtToken", response.data.token);
    localStorage.setItem('userId', response.data.id);
  }
  return response.data;
},

  signup: async (userData) => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  
  requestPasswordReset: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },



logout: async () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  try {
      await fetch("http://localhost:8080/logout", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
      });
      console.log("Logged out successfully");
  } catch (error) {
      console.error("Error during logout:", error);
  }

  window.location.href = "/login";
},

 refresh: async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await api.post("/auth/refresh", { refreshToken });
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      return response.data.accessToken;
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    authService.logout();
  }
  return null;
},


requestPasswordReset: async (email) => {
    const response = await api.post("/auth/request-password-reset", { email });
    return response.data;
  },

  // FIXED: Now includes email parameter
  resetPassword: async (email, otpCode, password) => {
    const response = await api.post("/auth/reset-password", { 
      email, 
      otpCode, 
      password 
    });
    return response.data;
  },

  isAuthenticated: () => !!localStorage.getItem("jwtToken"),
};

export {api,authService};