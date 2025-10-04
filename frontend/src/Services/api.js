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
}