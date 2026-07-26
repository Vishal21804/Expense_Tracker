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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validateEmail = (val) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await api.post("/login", {
        email: email.trim(),
        password: password,
      });

      console.log("Login Response:", response.data);

      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.token;

      if (!token) {
        throw new Error("Token not received from server");
      }

      localStorage.removeItem("token");
      localStorage.setItem("token", token);

console.log("New Token Saved:", token);

      console.log("Saved Token:", token);
      console.log("Stored Token:", localStorage.getItem("token"));

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email.trim());
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login request failed:", err);

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Invalid email or password.";

      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-purple-50/40 to-slate-100 overflow-hidden font-sans text-slate-800 selection:bg-violet-500 selection:text-white">
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

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[430px] bg-white rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white mb-3">
            <LuWallet size={24} />
          </div>

          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 flex gap-2">
            <LuCircleAlert />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Email</label>
            <div className="relative">
              <LuMail className="absolute left-3 top-3" />
              <input
                type="email"
                className="w-full border rounded-lg pl-10 p-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-500 text-sm">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label>Password</label>
            <div className="relative">
              <LuLock className="absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded-lg pl-10 pr-10 p-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? <LuEyeOff /> : <LuEye />}
              </button>
            </div>

            {fieldErrors.password && (
              <p className="text-red-500 text-sm">{fieldErrors.password}</p>
            )}
          </div>

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet-600 text-white p-3 rounded-lg"
          >
            {isLoading ? (
              <>
                <LuLoader className="inline animate-spin mr-2" />
                Signing In...
              </>
            ) : (
              <>
                Sign In <LuArrowRight className="inline ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-violet-600">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
