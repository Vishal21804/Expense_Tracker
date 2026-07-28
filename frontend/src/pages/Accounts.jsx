import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Landmark,
  CreditCard,
  QrCode,
  Banknote,
  Wallet,
  Smartphone,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  Star,
  X,
  AlertTriangle,
  Moon,
  Sun,
  ArrowUpRight,
  ShieldCheck,
  WalletCards,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  setDefaultAccount,
} from "../services/accountsApi";

// Account Type Categories
const ACCOUNT_TYPES = [
  "All",
  "Cash",
  "UPI",
  "Bank",
  "Debit Card",
  "Credit Card",
  "Wallet",
];

// Helper to render dynamic icon based on account type / name
const getAccountIcon = (type = "", name = "") => {
  const lowerName = (name || "").toLowerCase();
  const lowerType = (type || "").toLowerCase();

  if (lowerName.includes("phonepe") || lowerName.includes("gpay") || lowerName.includes("paytm") || lowerType === "upi") {
    return <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
  }
  if (lowerType === "credit card" || lowerType === "debit card" || lowerName.includes("card")) {
    return <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
  }
  if (lowerType === "bank" || lowerName.includes("bank") || lowerName.includes("sbi") || lowerName.includes("hdfc") || lowerName.includes("icici")) {
    return <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
  }
  if (lowerType === "cash" || lowerName.includes("cash")) {
    return <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  }
  return <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
};

// Helper for dynamic background color per icon container
const getAccountIconBg = (type = "", name = "") => {
  const lowerName = (name || "").toLowerCase();
  const lowerType = (type || "").toLowerCase();

  if (lowerName.includes("phonepe") || lowerName.includes("gpay") || lowerName.includes("paytm") || lowerType === "upi") {
    return "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/50";
  }
  if (lowerType === "credit card" || lowerType === "debit card" || lowerName.includes("card")) {
    return "bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/50";
  }
  if (lowerType === "bank" || lowerName.includes("bank")) {
    return "bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/50";
  }
  if (lowerType === "cash") {
    return "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50";
  }
  return "bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50";
};

// Currency formatter
const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num);
};

// Date Formatter
const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const Accounts = () => {
  // Theme state (Dark/Light mode support)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Core Accounts State
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  // Active Action Menu State (for card drop downs)
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Form Field State
  const [formData, setFormData] = useState({
    name: "",
    type: "Bank",
    openingBalance: "0",
    currentBalance: "0",
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Accounts on Mount
  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast("Something went wrong while loading accounts", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Toast Helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // Filtered & Searched Accounts
  const filteredAccounts = useMemo(() => {
    const list = Array.isArray(accounts) ? accounts : [];
    return list.filter((acc) => {
      if (!acc) return false;
      const accName = acc.name || "";
      const accType = acc.type || "";
      const matchesSearch = accName
        .toLowerCase()
        .includes((searchQuery || "").toLowerCase().trim());
      const matchesType =
        selectedType === "All" ||
        accType.toLowerCase() === (selectedType || "").toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [accounts, searchQuery, selectedType]);

  // Overall Net Balance Summary Stats
  const totalBalance = useMemo(() => {
    const list = Array.isArray(accounts) ? accounts : [];
    return list.reduce((acc, curr) => acc + Number(curr?.currentBalance || 0), 0);
  }, [accounts]);

  // Reset Form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "Bank",
      openingBalance: "0",
      currentBalance: "0",
      isDefault: false,
    });
    setFormErrors({});
  };

  // Handle Add Open
  const handleOpenAddModal = () => {
    resetForm();
    // If no accounts exist yet, auto check default
    if (accounts.length === 0) {
      setFormData((prev) => ({ ...prev, isDefault: true }));
    }
    setIsAddModalOpen(true);
  };

  // Handle Edit Open
  const handleOpenEditModal = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      openingBalance: String(account.openingBalance),
      currentBalance: String(account.currentBalance),
      isDefault: account.isDefault,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
    setActiveMenuId(null);
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Account name is required";
    }
    if (isNaN(Number(formData.openingBalance))) {
      errors.openingBalance = "Invalid opening balance";
    }
    if (isNaN(Number(formData.currentBalance))) {
      errors.currentBalance = "Invalid current balance";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add Account
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createAccount({
        name: formData.name.trim(),
        type: formData.type,
        openingBalance: Number(formData.openingBalance),
        currentBalance: Number(formData.currentBalance),
        isDefault: formData.isDefault,
      });

      showToast("Account Created Successfully", "success");
      setIsAddModalOpen(false);
      resetForm();
      await loadAccounts();
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Account
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !editingAccount) return;

    setIsSubmitting(true);
    try {
      await updateAccount(editingAccount.id, {
        name: formData.name.trim(),
        type: formData.type,
        openingBalance: Number(formData.openingBalance),
        currentBalance: Number(formData.currentBalance),
        isDefault: formData.isDefault,
      });

      showToast("Account Updated Successfully", "success");
      setIsEditModalOpen(false);
      setEditingAccount(null);
      resetForm();
      await loadAccounts();
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Set Default
  const handleSetDefault = async (account) => {
    if (account.isDefault) return;
    try {
      await setDefaultAccount(account.id);
      showToast("Default Account Set Successfully", "success");
      setActiveMenuId(null);
      await loadAccounts();
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    }
  };

  // Handle Open Delete Dialog
  const handleOpenDelete = (account) => {
    setAccountToDelete(account);
    setIsDeleteDialogOpen(true);
    setActiveMenuId(null);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteAccount(accountToDelete.id);
      showToast("Account Deleted Successfully", "success");
      setIsDeleteDialogOpen(false);
      setAccountToDelete(null);
      await loadAccounts();
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "dark bg-[#0F172A] text-slate-100" : "bg-[#F8FAFC] text-slate-800"
      }`}
    >
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl bg-white/95 dark:bg-slate-900/95"
            style={{
              borderColor: toast.type === "error" ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)",
            }}
          >
            <div
              className={`p-2 rounded-xl text-white ${
                toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
              }`}
            >
              {toast.type === "error" ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {toast.message}
            </span>
            <button
              onClick={() => setToast({ show: false, message: "", type: "success" })}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Accounts
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                {accounts.length} Total
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Manage all your payment accounts and balances.
            </p>
          </div>

          {/* Action Buttons & Theme Switch */}
          <div className="flex items-center gap-3">
            {/* Dark/Light Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle Theme"
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all focus:outline-none"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Primary Add Account Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 focus:outline-none"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Account</span>
            </motion.button>
          </div>
        </div>

        {/* STATS OVERVIEW BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Balance Across Accounts
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatCurrency(totalBalance)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <WalletCards className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Default Account
              </span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 truncate max-w-[180px]">
                {accounts.find((a) => a.isDefault)?.name || "Not set"}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Methods
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {new Set(accounts.map((a) => a.type)).size} Categories
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <QrCode className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* CONTROLS BAR: SEARCH & FILTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          
          {/* SEARCH BAR */}
          <div className="relative flex items-center w-full sm:w-80">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search account by name..."
              className="w-full py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* FILTER DROPDOWN */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden md:inline">
              Filter:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none w-full sm:w-auto">
              {ACCOUNT_TYPES.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all focus:outline-none ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* LOADING SKELETON STATE */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="w-16 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="w-3/4 h-5 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="w-1/2 h-3 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="w-2/3 h-6 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="w-1/3 h-3 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAccounts.length === 0 ? (
          
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm relative overflow-hidden"
          >
            <div className="w-20 h-20 mb-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <WalletCards className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              No Accounts Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {searchQuery || selectedType !== "All"
                ? "No payment accounts match your current search and filter criteria."
                : "You haven't added any money or bank accounts yet. Add your first account to manage balances."}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-6 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all"
            >
              + Create First Account
            </button>
          </motion.div>
        ) : (

          /* ACCOUNTS GRID (Desktop: 4, Tablet: 2, Mobile: 1) */
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence>
              {filteredAccounts.map((account) => {
                const IconBg = getAccountIconBg(account.type, account.name);
                const IconComponent = getAccountIcon(account.type, account.name);

                return (
                  <motion.div
                    key={account.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 ${
                      account.isDefault
                        ? "border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-500/20"
                        : "border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900"
                    }`}
                  >
                    {/* CARD HEADER: Icon + Type + Default Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div
                        className={`p-3 rounded-2xl border ${IconBg} shadow-xs group-hover:scale-105 transition-transform duration-200`}
                      >
                        {IconComponent}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* DEFAULT BADGE (Green) */}
                        {account.isDefault && (
                          <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Default</span>
                          </span>
                        )}

                        {/* Account Type Chip */}
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                          {account.type}
                        </span>

                        {/* Card More Action Dropdown Toggle */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuId(
                                activeMenuId === account.id ? null : account.id
                              )
                            }
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Action Menu Popover */}
                          {activeMenuId === account.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden p-1 space-y-0.5">
                                {!account.isDefault && (
                                  <button
                                    onClick={() => handleSetDefault(account)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors"
                                  >
                                    <Star className="w-3.5 h-3.5" />
                                    <span>Set as Default</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => handleOpenEditModal(account)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Edit Account</span>
                                </button>

                                <button
                                  onClick={() => handleOpenDelete(account)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Account</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CARD BODY: Name & Balances */}
                    <div className="space-y-1 my-3">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                        {account.name}
                      </h3>
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Current Balance
                        </span>
                        <div className="text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(account.currentBalance)}
                        </div>
                      </div>
                    </div>

                    {/* CARD FOOTER: Opening Balance & Created Date */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Opening Balance</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(account.openingBalance)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Added</span>
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          {formatDate(account.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* QUICK ACTION BUTTONS FOOTER */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(account)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDelete(account)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ADD / EDIT ACCOUNT MODAL */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {isEditModalOpen ? "Edit Account" : "Add New Account"}
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MODAL FORM */}
              <form
                onSubmit={isEditModalOpen ? handleEditSubmit : handleCreateSubmit}
                className="space-y-4"
              >
                {/* Account Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. HDFC Salary, PhonePe, Cash"
                    className="w-full py-2.5 px-3.5 text-xs sm:text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Account Type Dropdown */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Account Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full py-2.5 px-3.5 text-xs sm:text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-none"
                  >
                    {ACCOUNT_TYPES.filter((t) => t !== "All").map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Opening Balance */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Opening Balance (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.openingBalance}
                    onChange={(e) =>
                      setFormData({ ...formData, openingBalance: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full py-2.5 px-3.5 text-xs sm:text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                  {formErrors.openingBalance && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">
                      {formErrors.openingBalance}
                    </p>
                  )}
                </div>

                {/* Current Balance */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Current Balance (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.currentBalance}
                    onChange={(e) =>
                      setFormData({ ...formData, currentBalance: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full py-2.5 px-3.5 text-xs sm:text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                  {formErrors.currentBalance && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">
                      {formErrors.currentBalance}
                    </p>
                  )}
                </div>

                {/* Default Account Toggle */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Default Account
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Use as default for primary transactions
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        setFormData({ ...formData, isDefault: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                    }}
                    className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Save Account</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {isDeleteDialogOpen && accountToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Delete Account?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This action cannot be undone. Are you sure you want to delete{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    "{accountToDelete.name}"
                  </strong>
                  ?
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-500/25 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accounts;
