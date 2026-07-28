import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSearch,
  LuBell,
  LuMenu,
  LuPlus,
  LuCircleCheck,
  LuCircleAlert,
  LuUser,
  LuSlidersHorizontal,
  LuLogOut,
  LuChevronDown,
  LuX,
  LuSparkles,
  LuSun,
  LuMoon,
} from "react-icons/lu";

// Sample Notifications Data for demonstration
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Budget Alert",
    description: "Dining out budget reached 85% limit.",
    time: "10m ago",
    read: false,
    type: "warning",
  },
  {
    id: 2,
    title: "Payment Received",
    description: "Received $1,250.00 from Tech Corp refund.",
    time: "1h ago",
    read: false,
    type: "success",
  },
  {
    id: 3,
    title: "Subscription Due",
    description: "Netflix $15.99 will renew tomorrow.",
    time: "5h ago",
    read: true,
    type: "info",
  },
];

const Navbar = ({ onMobileMenuToggle, isCollapsed, userName = "Alex" }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark"
    );
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Time-based welcome greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${userName} 👋`;
    if (hour < 18) return `Good afternoon, ${userName} 👋`;
    return `Good evening, ${userName} 👋`;
  };

  // Map route pathname to Page Title
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
      case "/dashboard":
        return "Dashboard Overview";
      case "/expenses":
        return "Expense Management";
      case "/budget":
        return "Budget & Goals";
      case "/analytics":
        return "Financial Analytics";
      case "/settings":
        return "Account Settings";
      default:
        return "Expense Tracker";
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-nav bg-[#0F172A]/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-800 transition-all duration-300">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Mobile Hamburger & Page Context / Welcome Greeting */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
            aria-label="Open sidebar menu"
          >
            <LuMenu className="w-6 h-6" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
              {getPageTitle()}
            </h1>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              {getGreeting()}
            </p>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div
            className={`relative flex items-center w-full transition-all duration-200 rounded-2xl ${
              isSearchFocused
                ? "bg-[#1F2937] ring-2 ring-violet-500/40 shadow-lg shadow-violet-500/10"
                : "bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60"
            }`}
          >
            <div className="pl-4 text-slate-400">
              <LuSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search transactions, bills, categories..."
              className="w-full py-2.5 pl-3 pr-10 text-xs sm:text-sm text-white placeholder-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-slate-400 hover:text-white"
              >
                <LuX className="w-4 h-4" />
              </button>
            ) : (
              <div className="absolute right-3 hidden sm:flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-700 rounded-md shadow-xs pointer-events-none">
                <span>⌘K</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action + Notifications + Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Quick Action Button */}
          <button className="hidden sm:flex items-center gap-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <LuPlus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          {/* Search Icon button for Mobile */}
          <button className="md:hidden flex items-center justify-center p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
            <LuSearch className="w-5 h-5" />
          </button>

          {/* Global Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Toggle Theme"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <LuSun className="w-5 h-5 text-amber-400" />
            ) : (
              <LuMoon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <LuBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-600"></span>
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-violet-100 text-violet-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700 focus:outline-none"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-50 ${
                            !notif.read ? "bg-violet-50/30" : ""
                          }`}
                        >
                          <div className="mt-0.5 p-2 rounded-xl bg-violet-100 text-violet-600">
                            {notif.type === "warning" ? (
                              <LuCircleAlert className="w-4 h-4 text-amber-600" />
                            ) : notif.type === "success" ? (
                              <LuCircleCheck className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <LuSparkles className="w-4 h-4 text-violet-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {notif.time}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                              {notif.description}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No notifications right now
                      </div>
                    )}
                  </div>

                  <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
                    <button className="text-xs font-semibold text-slate-600 hover:text-violet-600 transition-colors">
                      View all activity
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100/80 transition-colors focus:outline-none group"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center text-white text-xs font-extrabold shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
                  AM
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 group-hover:text-violet-600 transition-colors leading-tight">
                  Alex Morgan
                </span>
                <span className="text-[11px] font-medium text-slate-400 leading-tight">
                  Member
                </span>
              </div>

              <LuChevronDown className="w-4 h-4 text-slate-400 hidden sm:block group-hover:text-slate-600 transition-colors" />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden p-1.5"
                >
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">Alex Morgan</p>
                    <p className="text-[11px] text-slate-400">alex.morgan@vaultflow.io</p>
                  </div>

                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                    <LuUser className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                    <LuSlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <span>Preferences</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <LuLogOut className="w-4 h-4 text-red-500" />
                    <span>Sign out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
