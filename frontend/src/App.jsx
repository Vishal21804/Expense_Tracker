import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Expenses from "./pages/Expenses";
import GroupExpensePage from "./pages/GroupExpensePage";
import GroupMembersPage from "./pages/GroupMembersPage";
import AddExpensePage from "./pages/AddExpensePage";
import Budget from "./pages/Budget";
import Analytics from "./pages/Analytics";

import ProtectedRoute from "./components/auth/ProtectedRoute";

// Minimal Route Shell Indicators (Placeholders until full feature pages are requested)
const RoutePlaceholder = ({ title, description, icon }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-[#111827] text-white rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
    <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-violet-500/20">
      {icon || "⚡"}
    </div>
    <h2 className="text-2xl font-bold text-white tracking-tight">
      {title} Page Shell
    </h2>
    <p className="mt-2 text-sm text-slate-400 max-w-md">
      {description ||
        "The application layout shell is fully configured and ready for page content integration."}
    </p>
    <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950 text-violet-300 text-xs font-semibold border border-violet-800">
      <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
      <span>React Router v7 Connected</span>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes (Outside Main Layout) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Application Layout Route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="groups/:groupId" element={<GroupExpensePage />} />
          <Route path="groups/:groupId/members" element={<GroupMembersPage />} />
          <Route path="groups/:groupId/add-expense" element={<AddExpensePage />} />
          <Route path="expenses/add" element={<AddExpensePage />} />
          <Route path="budget" element={<Budget />} />
          <Route path="analytics" element={<Analytics />} />
          <Route
            path="settings"
            element={
              <RoutePlaceholder
                title="Settings"
                icon="⚙️"
                description="Settings route shell successfully rendered inside Layout."
              />
            }
          />
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
