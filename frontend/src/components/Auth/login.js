import React, { useState, useEffect, useCallback } from "react";
import { Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../Services/api";
import { useUserSession } from "../Context/UserSessionContext";
import { notify } from "../../Utils/notify";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useUserSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [redirectMessage, setRedirectMessage] = useState(
    location.state?.message || ""
  );
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    } else {
      newErrors.email = "";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else {
      newErrors.password = "";
    }

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  useEffect(() => {
    if (redirectMessage) {
      notify.info(redirectMessage);
    }
  }, [redirectMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (apiError) {
      setApiError("");
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setTouched({ email: true, password: true });

  const isValid = validateForm();

  if (!isValid) {
    // Field-level client-side errors
    if (errors.email) {
      notify.error(errors.email || "Please enter a valid email address.");
    } else if (errors.password) {
      notify.error(errors.password || "Please enter a valid password.");
    } else {
      notify.error("Please fix the highlighted fields before continuing.");
    }
    return;
  }

  setIsSubmitting(true);
  setApiError("");

  try {
    const data = await authService.login({
      email: formData.email,
      password: formData.password,
    });

    console.log("Login successful (component):", data);

    if (!data.token) {
      const msg = "Login failed: missing token.";
      setApiError(msg);
      notify.error(msg);
      setIsSubmitting(false);
      return;
    }

    if (data.userId) localStorage.setItem("userId", data.userId.toString());
    if (data.role) localStorage.setItem("userRole", data.role);

    if (login) {
      login({
        token: data.token,
        userId: data.userId,
        role: data.role,
      });
    }

    let redirectPath;
    if (location.state?.from) {
      redirectPath = location.state.from;
    } else if (data.redirect) {
      redirectPath = data.redirect;
    } else {
      redirectPath = "/";
    }

    notify.success("Logged in successfully. Welcome back!");
    navigate(redirectPath, { replace: true });
  } catch (error) {
    console.error("Login failed (component):", error);
    console.log("error.response:", error?.response);

    if (error.response) {
      const status = error.response.status;
      const backendMessage = error.response.data?.message || "";

      if (status === 401) {
        // Unauthorized – distinguish common cases by backend message if available
        if (backendMessage.toLowerCase().includes("password")) {
          const msg = "Incorrect password. Please try again.";
          setApiError(msg);
          notify.error(msg);
        } else if (
          backendMessage.toLowerCase().includes("user") ||
          backendMessage.toLowerCase().includes("email")
        ) {
          const msg = "No account found with this email address.";
          setApiError(msg);
          notify.error(msg);
        } else if (backendMessage.toLowerCase().includes("locked")) {
          const msg =
            "Your account is locked. Please contact support for assistance.";
          setApiError(msg);
          notify.error(msg);
        } else {
          const msg = "Invalid email or password. Please try again.";
          setApiError(msg);
          notify.error(msg);
        }
      } else if (status === 429) {
        const msg =
          "Too many login attempts. Please wait a moment and try again.";
        setApiError(msg);
        notify.error(msg);
      } else if (status === 403) {
        const msg =
          "You do not have permission to access this application with this account.";
        setApiError(msg);
        notify.error(msg);
      } else if (backendMessage) {
        const msg = backendMessage;
        setApiError(msg);
        notify.error(msg);
      } else {
        const msg = "Login failed due to a server error. Please try again.";
        setApiError(msg);
        notify.error(msg);
      }
    } else {
      const msg =
        "Unable to connect to the server. Please check your connection and try again.";
      setApiError(msg);
      notify.error(msg);
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 p-4 rounded-2xl">
            <Zap className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Sign in to your BijuliYatra account
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
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
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
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
            <p className="text-red-500 text-sm text-center mt-2">
              {apiError}
            </p>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Social login buttons can go here */}
          </div>

          <p className="text-center text-sm text-slate-600 mt-6">
            Don’t have an account?{" "}
            <Link
              to="/signup/ev-owner"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
