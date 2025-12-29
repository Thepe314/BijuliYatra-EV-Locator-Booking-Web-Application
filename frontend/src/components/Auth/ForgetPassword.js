import React, { useState } from "react";
import { Zap, Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../Services/api";
import { notify } from "../../Utils/notify";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // 'email', 'sent', 'reset', 'success'
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // === STEP 1: request reset code ===
  const handleEmailSubmit = async () => {
    setError("");

    if (!email) {
      const msg = "Please enter your email address";
      setError(msg);
      notify.error(msg);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = "Please enter a valid email address";
      setError(msg);
      notify.error(msg);
      return;
    }

    setLoading(true);
    try {
      const data = await authService.requestPasswordReset(email);
      console.log("forgot-password response:", data);
      notify.info("A reset code has been sent to your email.");
      setStep("sent");
    } catch (err) {
      console.error("forgot-password error:", err);
      const backendMessage = err.response?.data?.message;
      const msg =
        backendMessage ||
        "Unable to send reset code. Please check your email and try again.";
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Single-character typing in each box
  const handleCodeChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    const newCode = [...code];

    if (cleaned.length === 0) {
      newCode[index] = "";
      setCode(newCode);
      return;
    }

    newCode[index] = cleaned.charAt(0);
    setCode(newCode);

    if (index < 5) {
      const el = document.getElementById(`code-${index + 1}`);
      if (el) el.focus();
    }
  };

  // === STEP 2: verify OTP ===
  const handleCodeSubmit = async () => {
    setError("");

    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      const msg = "Please enter the complete verification code";
      setError(msg);
      notify.error(msg);
      return;
    }

    setLoading(true);
    try {
      const data = await authService.verifyForgotOtp({
        email,
        otpCode: verificationCode,
      });
      console.log("verify-forgot-otp response:", data);
      notify.success("Code verified. You can now reset your password.");
      setStep("reset");
    } catch (err) {
      console.error("verify-forgot-otp error:", err);
      const backendMessage = err.response?.data?.message;
      const msg =
        backendMessage ||
        "OTP verification failed. Please check the code and try again.";
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // === STEP 3: reset password ===
  const handlePasswordReset = async () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      const msg = "Please fill in all fields";
      setError(msg);
      notify.error(msg);
      return;
    }

    if (newPassword.length < 8) {
      const msg = "Password must be at least 8 characters long";
      setError(msg);
      notify.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = "Passwords do not match";
      setError(msg);
      notify.error(msg);
      return;
    }

    setLoading(true);
    try {
      const data = await authService.resetPassword(email, newPassword);
      console.log("reset-password response:", data);
      notify.success(
        "Password reset successful. You can now log in with your new password."
      );
      setStep("success");
    } catch (err) {
      console.error("reset-password error:", err);
      const backendMessage = err.response?.data?.message;
      const msg =
        backendMessage || "Failed to reset password. Please try again.";
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // === RENDER STEPS ===
  const renderEmailStep = () => (
    <div className="w-full max-w-md">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Forgot Password?
          </h2>
          <p className="text-slate-600">
            No worries. Enter your email and BijuliYatra will send you a reset
            code.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleEmailSubmit()}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleEmailSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition-all transform shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-cyan-600 text-white hover:from-emerald-600 hover:to-cyan-700 hover:scale-[1.02] hover:shadow-xl"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );

  const renderSentStep = () => (
    <div className="w-full max-w-md">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Check your inbox
          </h2>
          <p className="text-slate-600">
            A 6-digit verification code was sent to{" "}
            <span className="font-medium text-slate-900">{email}</span>.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
              Enter Verification Code
            </label>

            {/* Paste handler on wrapper */}
            <div
              className="flex gap-2 justify-center"
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData
                  .getData("text")
                  .replace(/\D/g, "");
                if (!pasted) return;

                const chars = pasted.split("");
                const newCode = [...code];

                for (let i = 0; i < 6; i++) {
                  newCode[i] = chars[i] || "";
                }
                setCode(newCode);

                const lastIndex = Math.min(chars.length - 1, 5);
                const el = document.getElementById(
                  `code-${Math.max(lastIndex, 0)}`
                );
                if (el) el.focus();
              }}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCodeSubmit()}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleCodeSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition-all transform shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-cyan-600 text-white hover:from-emerald-600 hover:to-cyan-700 hover:scale-[1.02] hover:shadow-xl"
            }`}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Didn’t receive the code?{" "}
              <button
                onClick={handleEmailSubmit}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Resend
              </button>
            </p>
          </div>

          <button
            onClick={() => setStep("email")}
            className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Use different email
          </button>
        </div>
      </div>
    </div>
  );

  const renderResetStep = () => (
    <div className="w-full max-w-md">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Reset password
          </h2>
          <p className="text-slate-600">
            Choose a strong password for your BijuliYatra account.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
            <p className="text-xs text-slate-500 mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handlePasswordReset()}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handlePasswordReset}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition-all transform shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-cyan-600 text-white hover:from-emerald-600 hover:to-cyan-700 hover:scale-[1.02] hover:shadow-xl"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="w-full max-w-md">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-3xl mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Password reset!
          </h2>
          <p className="text-slate-600 mb-8">
            Your password has been updated. You can now log in with your new
            credentials.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center space-x-2">
          <Zap className="w-8 h-8 text-emerald-500" />
          <span className="text-xl font-bold text-white">BijuliYatra</span>
        </div>
      </div>

      {step === "email" && renderEmailStep()}
      {step === "sent" && renderSentStep()}
      {step === "reset" && renderResetStep()}
      {step === "success" && renderSuccessStep()}
    </div>
  );
};