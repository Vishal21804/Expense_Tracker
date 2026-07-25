import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuLayoutDashboard,
  LuReceipt,
  LuWallet,
  LuChartPie,
  LuSettings,
  LuLogOut,
  LuChevronLeft,
  LuChevronRight,
  LuX,
  LuZap,
} from "react-icons/lu";

// Navigation Items Configuration
const NAV_ITEMS = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LuLayoutDashboard,
    badge: null,
  },
  {
    name: "Expenses",
    path: "/expenses",
    icon: LuReceipt,
    badge: "12 New",
    badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
  },
  {
    name: "Budget",
    path: "/budget",
    icon: LuWallet,
    badge: null,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: LuChartPie,
    badge: "Pro",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    name: "Settings",
    path: "/settings",
    icon: LuSettings,
    badge: null,
  },
];

const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onLogout,
}) => {
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    } else {
      alert("Logged out successfully!");
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 shadow-sm select-none relative overflow-hidden">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-slate-100">
        <NavLink
          to="/"
          className="flex items-center gap-3.5 group focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-violet-700 to-purple-600 text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
            <LuWallet className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
          </div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-violet-950 bg-clip-text text-transparent">
                    VaultFlow
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-violet-100 text-violet-700 border border-violet-200/60">
                    Pro
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
                  Expense Tracker
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        >
          {isCollapsed ? (
            <LuChevronRight className="w-4 h-4" />
          ) : (
            <LuChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close menu"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
        >
          <LuX className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2">
          {!isCollapsed ? (
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Menu
            </span>
          ) : (
            <div className="w-full h-px bg-slate-100 my-1" />
          )}
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === "/dashboard" && location.pathname === "/");

          return (
            <div
              key={item.path}
              className="relative"
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <NavLink
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive: linkActive }) => {
                  const active = linkActive || (item.path === "/dashboard" && location.pathname === "/");
                  return `group relative flex items-center h-11 px-3.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none ${
                    active
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`;
                }}
              >
                <div className="flex items-center justify-center min-w-[24px]">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? "text-white scale-110" : "group-hover:scale-110 text-slate-500 group-hover:text-violet-600"
                    }`}
                  />
                </div>

                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between flex-1 ml-3 overflow-hidden whitespace-nowrap"
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? "bg-white/20 text-white border-white/30"
                            : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Active Indicator Bar when collapsed */}
                {isActive && isCollapsed && (
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-white" />
                )}
              </NavLink>

              {/* Tooltip on Desktop when Collapsed */}
              {isCollapsed && hoveredPath === item.path && (
                <motion.div
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  className="hidden lg:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap items-center gap-2 pointer-events-none"
                >
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-violet-500 text-white">
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pro Banner Card (Visible when expanded on Desktop) */}
      {!isCollapsed && (
        <div className="p-3 mx-3 my-2 rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-slate-50 border border-violet-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-violet-600 text-white">
              <LuZap className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              Monthly Budget
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            You've spent <strong className="text-slate-800 font-semibold">$3,420</strong> of $5,000 budget.
          </p>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full"
              style={{ width: "68%" }}
            />
          </div>
          <span className="text-[10px] font-bold text-violet-700 bg-violet-100/80 px-2 py-0.5 rounded-md inline-block">
            68% Limit Reached
          </span>
        </div>
      )}

      {/* Footer Section / Logout */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <div className="relative">
          <button
            onClick={handleLogoutClick}
            className={`w-full flex items-center h-11 px-3.5 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/80 transition-all duration-200 focus:outline-none ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            <LuLogOut className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* User Mini Profile when expanded */}
        {!isCollapsed && (
          <div className="pt-2 mt-1 border-t border-slate-100 flex items-center gap-3 px-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-purple-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-violet-100 shadow-sm">
                AM
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 truncate">
                Alex Morgan
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                alex.morgan@vaultflow.io
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <LuLogOut className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to log out of your VaultFlow account?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw]"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
