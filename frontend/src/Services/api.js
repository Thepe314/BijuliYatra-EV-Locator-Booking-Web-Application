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
    const token = localStorage.getItem('authToken'); // or jwtToken
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
    const data = response.data;

    if (data.token) {
      // Save JWT
      localStorage.setItem('authToken', data.token);

      // Decode payload
      const payload = JSON.parse(atob(data.token.split('.')[1]));

      if (payload.userId) localStorage.setItem("userId", payload.userId.toString());
      if (payload.role) localStorage.setItem("userRole", payload.role);
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



  
  requestPasswordReset: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },



logout: async () => {
  localStorage.removeItem("'authToken'");
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
      localStorage.setItem("authToken", response.data.accessToken);
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

  isAuthenticated: () => !!localStorage.getItem("'authToken'"),
};

//User Management
 export const userService = {
  // Get all users
  listUsers: async () => {
  try {
    const token = localStorage.getItem("'authToken'");
    const response = await api.get("/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
},

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get users by role
  getUsersByRole: async (roleType) => {
    try {
      const response = await api.get(`/admin/users/role/${roleType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  },

  // Count users by role
  countUsersByRole: async (roleType) => {
    try {
      const response = await api.get(`/admin/users/count/role/${roleType}`);
      return response.data;
    } catch (error) {
      console.error('Error counting users:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users/new', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/edit/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
 deleteUser: async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No auth token found');
      throw new Error('You must be logged in to delete users');
    }

    const response = await api.delete(`/admin/delete/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
},


  // changeUserStatus: async (id, status) => {

  //   try {
  //     const token = localStorage.getItem('jwtToken');
  //     const response = await api.patch(`/admin/users/status/${id}`, { status }, {
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
};

  export const stationService = {
    // Get all stations
  listStation: async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get("/operators/stations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stations:", error);
    throw error;
  }
},

  // Get station by ID
  //if cant get change userId to stationId
  getStationById: async (userId) => {
    try {
      const response = await api.get(`/operators/stations/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching station:', error);
      throw error;
    }
  },

  

  // Create new station
createStation: async (stationData) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.post('/operator/stations', stationData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating station:', error);
    throw error;
  }
},

  // Update station
  updateStation: async (userId, userData) => {
    try {
      const response = await api.put(`/operator/station/edit/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating station:', error);
      throw error;
    }
  },

  // Delete station
  deleteStation: async (userId) => {
    try {
      const response = await api.delete(`/operator/station/delete/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting station:', error);
      throw error;
    }
  },

  
};



export {api,authService};