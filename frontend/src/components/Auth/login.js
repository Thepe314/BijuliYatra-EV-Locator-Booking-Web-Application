import React, { useState,useEffect,useCallback } from 'react';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link,useNavigate,useLocation } from 'react-router-dom'; 
import { authService } from '../../Services/api';
import { useUserSession } from '../Context/UserSessionContext';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

 const { login } = useUserSession();
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [redirectMessage, setRedirectMessage] = useState(location.state?.message || "")
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState("")

  // Define validateForm as a useCallback to avoid dependency issues
  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
      isValid = false
    } else {
      newErrors.email = ""
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      isValid = false
    } else {
      newErrors.password = ""
    }

    setErrors(newErrors)
    return isValid
  }, [formData])

  // Validate form on input change
  useEffect(() => {
    validateForm()
  }, [validateForm])

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (apiError) {
      setApiError("")
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched({
      ...touched,
      [name]: true,
    })
  }

  const handleLogin = async (e) => {
  e.preventDefault();
  setTouched({ email: true, password: true });

  if (!validateForm()) return;

  setIsSubmitting(true);
  setApiError("");

  try {
    const data = await authService.login({
      email: formData.email,
      password: formData.password,
    });

    console.log("Login successful:", data);
    console.log("Saved JWT token:", data.token);

    if (data.token && data.redirect) {
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      const userData = {
        email: payload.sub,
        role: payload.role,
      };

      // ✅ Store token and user role
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("userRole", payload.role);

      // ✅ NEW: Save userId if present in token
      if (payload.userId !== undefined) {
        localStorage.setItem("userId", payload.userId.toString());
        console.log("Saved userId:", payload.userId);
      } else {
        console.warn("userId not found in token");
      }

      login(userData, data.token);

      // Check if we have a redirect path from location state
      const redirectPath = location.state?.from;
      
      // ✅ Navigate to the redirect path or default based on role
      const path = redirectPath || data.redirect || (
        payload.role === "admin"
          ? "/admin/dashboard"
          : payload.role === "chargingOperator"
          ? "/operator/dashboard"
          : "/home"
      );
      navigate(path, { replace: true });
    } else {
      setApiError("Login failed: missing token or redirect.");
    }
  } catch (error) {
    console.error("Login failed:", error);
    if (error.response) {
      if (error.response.status === 401) {
        setApiError("Invalid email or password. Please try again.");
      } else if (error.response.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Login failed. Please try again.");
      }
    } else {
      setApiError("Unable to connect to the server. Please try again later.");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSignupClick = (e) => {
    e.preventDefault()
    navigate("/signup")
  }

  const handlePartnerSignupClick = (e) => {
    e.preventDefault()
    navigate("/partner-signup")
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    navigate("/forgot-password")
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
    </div>

    <div className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 relative z-10">
      <div className="flex justify-center mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 p-4 rounded-2xl">
          <Zap className="w-12 h-12 text-white" strokeWidth={2} />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">Welcome Back</h1>
      <p className="text-center text-slate-600 mb-8">Sign in to your BijuliYatra account</p>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          {touched.email && errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" />
            <span className="ml-2 text-sm text-slate-600">Remember me</span>
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-xl font-semibold transition-all transform shadow-lg ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-500 to-cyan-600 text-white hover:from-emerald-600 hover:to-cyan-700 hover:scale-[1.02] hover:shadow-xl"
          }`}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        {apiError && (
          <p className="text-red-500 text-sm text-center mt-2">{apiError}</p>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Google and Facebook buttons unchanged */}
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  </div>
);
}