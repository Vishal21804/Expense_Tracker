import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuMenu } from "react-icons/lu";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isExpenseSection =
    location.pathname.startsWith("/expenses") ||
    location.pathname.startsWith("/groups") ||
    location.pathname.includes("add-expense") ||
    location.pathname.includes("/add");

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans flex flex-col antialiased selection:bg-violet-500 selection:text-white relative">
      
      {/* Sidebar Component */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Layout Container */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Top Navbar - Hidden on all Expenses & Groups pages */}
        {!isExpenseSection && (
          <Navbar
            isCollapsed={isSidebarCollapsed}
            onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          />
        )}

        {/* Mobile menu trigger when Navbar is hidden on Expense pages */}
        {isExpenseSection && (
          <div className="lg:hidden p-3 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <LuMenu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-400">Expense Tracker</span>
          </div>
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 w-full mx-auto overflow-y-auto ${
            isExpenseSection
              ? "px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9 lg:pt-11 pb-10 max-w-7xl"
              : "px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-8 max-w-7xl"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer (hidden on expense pages to keep layout clean) */}
        {!isExpenseSection && (
          <footer className="py-4 px-6 border-t border-slate-800 bg-[#0F172A] text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>VaultFlow System Operational</span>
            </div>
            <p>© {new Date().getFullYear()} VaultFlow Expense Tracker. All rights reserved.</p>
          </footer>
        )}
      </div>

    </div>
  );
};

export default Layout;
