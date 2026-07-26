import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LuWallet,
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuLoader,
  LuCircleAlert,
  LuArrowRight,
} from "react-icons/lu";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation State
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Email regex validation helper
  const validateEmail = (val) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val);
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // POST to /login endpoint using Axios service instance
      const response = await api.post("/login", {
        email: email.trim(),
        password: password,
      });
      console.log(response.data);
      localStorage.setItem("token", token);
      console.log("Saved token:", token);

      // Extract JWT token from response
      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.token;

      if (!token) {
        throw new Error("Token not received from server");
    }

localStorage.setItem("token", token);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email.trim());
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Navigate to dashboard upon successful login
      navigate("/dashboard");
    } catch (err) {
      console.error("Login request failed:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password. Please check your credentials and try again.";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-purple-50/40 to-slate-100 overflow-hidden font-sans text-slate-800 selection:bg-violet-500 selection:text-white">
      
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

      {/* Main Centered Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-[430px] bg-white/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-2xl shadow-violet-500/10 border border-slate-100/80 z-10"
      >
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="relative flex items-center justify-center w-12 h-12 mb-4 rounded-2xl bg-gradient-to-tr from-violet-600 via-violet-700 to-purple-600 text-white shadow-lg shadow-violet-500/30">
            <LuWallet className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium max-w-xs">
            Sign in to continue managing your expenses
          </p>
        </div>

        {/* API Error Notification Banner */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 flex items-start gap-2.5 text-xs font-medium shadow-xs"
          >
            <LuCircleAlert className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <span className="flex-1">{apiError}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          
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
                disabled={isLoading}
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
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors focus:outline-none"
              >
                Forgot Password?
              </Link>
            </div>
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
                disabled={isLoading}
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
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] font-medium text-red-500 flex items-center gap-1">
                <span>•</span> {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 cursor-pointer accent-violet-600"
              />
              <span className="text-xs font-medium text-slate-600">
                Remember me on this device
              </span>
            </label>
          </div>

          {/* Primary Submit Button */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all duration-200 ${
                isLoading
                  ? "bg-violet-400 cursor-not-allowed opacity-80"
                  : "bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 hover:from-violet-700 hover:to-purple-700 active:shadow-none"
              }`}
            >
              {isLoading ? (
                <>
                  <LuLoader className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <LuArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </form>

        {/* Secondary Navigation Option */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs font-medium text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-violet-600 hover:text-violet-700 transition-colors inline-flex items-center gap-0.5 focus:outline-none"
            >
              Create Account
            </Link>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
