import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isAddExpensePage =
    location.pathname.includes("add-expense") || location.pathname.includes("/add");

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
        {/* Top Navbar - Hidden on Add Expense Page */}
        {!isAddExpensePage && (
          <Navbar
            isCollapsed={isSidebarCollapsed}
            onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 w-full mx-auto overflow-y-auto ${
            isAddExpensePage
              ? "p-3 sm:p-4 lg:p-5 max-w-7xl"
              : "p-4 sm:p-6 lg:p-8 max-w-7xl"
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

        {/* Footer (hidden on add-expense page to keep sticky action bar clean) */}
        {!location.pathname.includes("add-expense") && !location.pathname.includes("/add") && (
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
