import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuWallet,
  LuUser,
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuLoader,
  LuCircleAlert,
  LuCircleCheck,
  LuArrowRight,
  LuCheck,
} from "react-icons/lu";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Validation State
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Email regex helper
  const validateEmail = (val) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val);
  };

  // Password strength calculation helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "", width: "w-0" };

    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-500", width: "w-1/4" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-500", width: "w-2/4" };
      case 3:
        return { score: 3, label: "Good", color: "bg-blue-500", text: "text-blue-500", width: "w-3/4" };
      case 4:
        return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500", width: "w-full" };
      default:
        return { score: 0, label: "Very Weak", color: "bg-slate-300", text: "text-slate-400", width: "w-1/12" };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!validateEmail(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // POST to /register endpoint using Axios service instance
      await api.post("/register", {
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      setSuccessMessage("Account created successfully! Redirecting to login...");

      // Redirect to login page after short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration request failed:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. An account with this email may already exist.";
      setApiError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 py-8 bg-gradient-to-br from-slate-50 via-purple-50/40 to-slate-100 overflow-hidden font-sans text-slate-800 selection:bg-violet-500 selection:text-white">
      
      {/* Decorative Animated Floating Background Orbs */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          x: [0, 15, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-600/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          y: [0, 25, 0],
          x: [0, -15, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-700/20 blur-3xl pointer-events-none"
      />

      {/* Main Centered Registration Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-[450px] bg-white/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-2xl shadow-violet-500/10 border border-slate-100/80 z-10 my-4"
      >
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative flex items-center justify-center w-12 h-12 mb-4 rounded-2xl bg-gradient-to-tr from-violet-600 via-violet-700 to-purple-600 text-white shadow-lg shadow-violet-500/30">
            <LuWallet className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium max-w-xs">
            Create your account to start tracking your expenses.
          </p>
        </div>

        {/* API Error Notification Banner */}
        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 flex items-start gap-2.5 text-xs font-medium shadow-xs"
            >
              <LuCircleAlert className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <span className="flex-1">{apiError}</span>
            </motion.div>
          )}

          {/* Success Notification Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-start gap-2.5 text-xs font-medium shadow-xs"
            >
              <LuCircleCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span className="flex-1">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          
          {/* Full Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Full Name
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <LuUser className="w-4 h-4" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: null }));
                  }
                }}
                placeholder="Alex Morgan"
                disabled={isLoading || successMessage}
                className={`w-full py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-800 bg-slate-50/80 rounded-xl border transition-all duration-200 placeholder-slate-400 focus:bg-white focus:outline-none ${
                  fieldErrors.name
                    ? "border-red-400 focus:ring-2 focus:ring-red-400/30"
                    : "border-slate-200 hover:border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] font-medium text-red-500 flex items-center gap-1">
                <span>•</span> {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <LuMail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: null }));
                  }
                }}
                placeholder="name@company.com"
                disabled={isLoading || successMessage}
                className={`w-full py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-800 bg-slate-50/80 rounded-xl border transition-all duration-200 placeholder-slate-400 focus:bg-white focus:outline-none ${
                  fieldErrors.email
                    ? "border-red-400 focus:ring-2 focus:ring-red-400/30"
                    : "border-slate-200 hover:border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] font-medium text-red-500 flex items-center gap-1">
                <span>•</span> {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <LuLock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: null }));
                  }
                }}
                placeholder="••••••••"
                disabled={isLoading || successMessage}
                className={`w-full py-3 pl-10 pr-11 text-xs sm:text-sm text-slate-800 bg-slate-50/80 rounded-xl border transition-all duration-200 placeholder-slate-400 focus:bg-white focus:outline-none ${
                  fieldErrors.password
                    ? "border-red-400 focus:ring-2 focus:ring-red-400/30"
                    : "border-slate-200 hover:border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              >
                {showPassword ? (
                  <LuEyeOff className="w-4 h-4" />
                ) : (
                  <LuEye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Password strength:</span>
                  <span className={`font-bold ${passwordStrength.text}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full ${passwordStrength.width}`}
                  />
                </div>
              </div>
            )}

            {fieldErrors.password && (
              <p className="mt-1 text-[11px] font-medium text-red-500 flex items-center gap-1">
                <span>•</span> {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <LuLock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }
                }}
                placeholder="••••••••"
                disabled={isLoading || successMessage}
                className={`w-full py-3 pl-10 pr-11 text-xs sm:text-sm text-slate-800 bg-slate-50/80 rounded-xl border transition-all duration-200 placeholder-slate-400 focus:bg-white focus:outline-none ${
                  fieldErrors.confirmPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-400/30"
                    : confirmPassword && confirmPassword === password
                    ? "border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    : "border-slate-200 hover:border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              >
                {showConfirmPassword ? (
                  <LuEyeOff className="w-4 h-4" />
                ) : (
                  <LuEye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Matching Live Check */}
            {confirmPassword && (
              <div className="mt-1 flex items-center gap-1 text-[11px]">
                {confirmPassword === password ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <LuCheck className="w-3.5 h-3.5" /> Passwords match
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">
                    Passwords do not match yet
                  </span>
                )}
              </div>
            )}

            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-[11px] font-medium text-red-500 flex items-center gap-1">
                <span>•</span> {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Primary Submit Button */}
          <div className="pt-3">
            <motion.button
              type="submit"
              disabled={isLoading || successMessage}
              whileHover={{ scale: isLoading || successMessage ? 1 : 1.01 }}
              whileTap={{ scale: isLoading || successMessage ? 1 : 0.98 }}
              className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all duration-200 ${
                isLoading || successMessage
                  ? "bg-violet-400 cursor-not-allowed opacity-80"
                  : "bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 hover:from-violet-700 hover:to-purple-700 active:shadow-none"
              }`}
            >
              {isLoading ? (
                <>
                  <LuLoader className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : successMessage ? (
                <>
                  <LuCircleCheck className="w-4 h-4" />
                  <span>Account Created!</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <LuArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </form>

        {/* Secondary Navigation Option */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs font-medium text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-violet-600 hover:text-violet-700 transition-colors inline-flex items-center gap-0.5 focus:outline-none"
            >
              Sign In
            </Link>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;
