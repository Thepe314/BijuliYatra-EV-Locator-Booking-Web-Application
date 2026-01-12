import React, { useState, useEffect, useCallback } from "react";
import { Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../Services/api";
import { useUserSession } from "../Context/UserSessionContext";
import { notify } from "../../Utils/notify";
import evChargerImg from "../Assets/stations/ev-charger.jpg";

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

  // OTP state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

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

      // CASE 1: Backend returns token directly (no OTP)
      if (data.token) {
        const role = (data.role || "").toString();
        const status = (data.status || "").toString();
        const normalizedRole = role.replace(/^ROLE_/, "").toLowerCase();
        const statusLower = status.toLowerCase();

        if (normalizedRole === "charger_operator" && statusLower !== "active") {
          let msg;

          if (statusLower.trim() === "pending") {
            msg = "Your request is still in process.";
            setApiError(msg);
            notify.info(msg);
          } else if (
            ["cancelled", "canceled", "rejected"].includes(statusLower.trim())
          ) {
            msg = "Your account failed to meet the requirements.";
            setApiError(msg);
            notify.error(msg);
          } else {
            msg = "Your account is not active yet.";
            setApiError(msg);
            notify.error(msg);
          }

          setIsSubmitting(false);
          return;
        }

        if (data.userId)
          localStorage.setItem("userId", data.userId.toString());
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
        return;
      }

      // CASE 2: OTP flow – backend responded with "OTP sent" and no token
      if (data.message && data.message.toLowerCase().includes("otp")) {
        setOtp("");
        setOtpEmail(formData.email);
        setShowOtpModal(true);
        notify.info(
          "An OTP has been sent to your email. Please enter it to continue."
        );
      } else {
        const msg = data.message || "Unexpected response from server.";
        setApiError(msg);
        notify.error(msg);
      }
    } catch (error) {
      console.error("Login failed (component):", error);

      if (error.response) {
        const status = error.response.status;
        const backendMessage = error.response.data?.message || "";

        if (status === 401) {
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
          const msg =
            "Login failed due to a server error. Please try again.";
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length === 0) {
      notify.error("Please enter the OTP sent to your email.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const data = await authService.verifyLoginOtp({
        email: otpEmail,
        otpCode: otp.trim(),
      });

      if (!data.token) {
        const msg = "Verification failed: missing token.";
        setApiError(msg);
        notify.error(msg);
        return;
      }

      const role = (data.role || "").toString();
      const status = (data.status || "").toString();
      const normalizedRole = role.replace(/^ROLE_/, "").toLowerCase();
      const statusLower = status.toLowerCase();

      if (normalizedRole === "charger_operator" && statusLower !== "active") {
        let msg;

        if (statusLower.trim() === "pending") {
          msg = "Your request is still in process.";
          setApiError(msg);
          notify.info(msg);
        } else if (
          ["cancelled", "canceled", "rejected"].includes(statusLower.trim())
        ) {
          msg = "Your account failed to meet the requirements.";
          setApiError(msg);
          notify.error(msg);
        } else {
          msg = "Your account is not active yet.";
          setApiError(msg);
          notify.error(msg);
        }
        return;
      }

      if (data.userId)
        localStorage.setItem("userId", data.userId.toString());
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

      notify.success("Login verified. Welcome back!");
      setShowOtpModal(false);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("OTP verification failed:", error);
      if (error.response) {
        const backendMessage = error.response.data?.message || "";
        const msg =
          backendMessage ||
          "OTP verification failed. Please check the code and try again.";
        setApiError(msg);
        notify.error(msg);
      } else {
        const msg =
          "Unable to connect to the server. Please check your connection and try again.";
        setApiError(msg);
        notify.error(msg);
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
        {/* Outer frame */}
        <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          <div className="grid md:grid-cols-2">
            {/* LEFT: brand / marketing panel */}
          {/* LEFT: brand / marketing panel with EV image */}
      <div className="relative flex flex-col justify-between overflow-hidden">
        {/* Background image */}
        <img
          src={evChargerImg}
          alt="EV charging point"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Light overlay so text is readable */}
        <div className="absolute inset-0 bg-white/65" />

        {/* Content on top */}
        <div className="relative z-10 px-10 py-10 flex flex-col justify-between h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-base font-semibold text-slate-900">
              BijuliYatra
            </span>
          </div>

          {/* Hero text */}
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-4 leading-snug">
              Power Your Journey
              <br className="hidden sm:block" />
              with Smart EV Charging
            </h1>
            <p className="text-sm text-slate-700 max-w-md mb-8">
              Connect to thousands of charging stations across India. Monitor
              your charging sessions, manage your stations, and drive the
              electric revolution.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 text-emerald-500 text-sm font-semibold">
              <div>
                <div className="text-lg">5,000+</div>
                <div className="text-[11px] uppercase tracking-wide text-slate-600">
                  Charging Stations
                </div>
              </div>
              <div>
                <div className="text-lg">50K+</div>
                <div className="text-[11px] uppercase tracking-wide text-slate-600">
                  Active Users
                </div>
              </div>
              <div>
                <div className="text-lg">24/7</div>
                <div className="text-[11px] uppercase tracking-wide text-slate-600">
                  Support
                </div>
              </div>
            </div>
          </div>

      {/* Footer copy */}
      <p className="mt-10 text-[11px] text-slate-500">
        © {new Date().getFullYear()} BijuliYatra. All rights reserved.
      </p>
    </div>
  </div>


          {/* RIGHT: login form panel */}
          <div className="bg-white px-10 py-10 flex flex-col justify-center border-l border-slate-200">
            <div className="w-full max-w-sm mx-auto">
              <h2 className="text-2xl font-semibold text-slate-900 mb-1">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mb-8">
                Sign in to access your account.
              </p>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Email or Phone
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] text-emerald-500 hover:text-emerald-600"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your password"
                      className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-9 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember */}
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-md py-2.5 text-sm font-semibold shadow-sm transition ${
                    isSubmitting
                      ? "bg-emerald-500/70 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  } text-white`}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>

                {apiError && (
                  <p className="text-red-500 text-[11px] text-center">
                    {apiError}
                  </p>
                )}

                {/* Divider + OTP button */}
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] text-slate-400">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    notify.info("Use your email + password to receive OTP.");
                  }}
                  className="w-full rounded-md bg-white border border-slate-300 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Continue with OTP
                </button>

                {/* Sign up links */}
                <div className="mt-6 text-center text-[11px] text-slate-500 space-y-2">
                  <p>Don&apos;t have an account?</p>
                  <p>
                    <Link
                      to="/signup/ev-owner"
                      className="text-emerald-500 hover:text-emerald-600 font-medium"
                    >
                      Sign up as EV Owner →
                    </Link>
                  </p>
                  <p>
                    <Link
                      to="/signup/operator"
                      className="text-emerald-500 hover:text-emerald-600 font-medium"
                    >
                      Sign up as Station Owner / Operator →
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal (kept light) */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <h2 className="text-xl font-semibold text-slate-900 mb-2 text-center">
              Verify your login
            </h2>
            <p className="text-sm text-slate-600 mb-4 text-center">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium">{otpEmail}</span>.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setOtp(value);
                  }}
                  className="tracking-[0.5em] text-center text-lg font-semibold px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none w-40"
                  placeholder="••••••"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Didn’t receive the code?</span>
                <button
                  type="button"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                  onClick={() => {
                    notify.info(
                      "Please wait a moment and check your inbox again."
                    );
                  }}
                >
                  Resend
                </button>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                  disabled={isVerifyingOtp}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className={`w-1/2 py-2 rounded-xl font-semibold text-white transition ${
                    isVerifyingOtp
                      ? "bg-emerald-400 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
