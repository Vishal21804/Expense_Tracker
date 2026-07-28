import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  CheckCheck,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  X,
  AlertTriangle,
  ReceiptText,
  Utensils,
  ShoppingBag,
  Home,
  Receipt,
  Plane,
  Film,
  Stethoscope,
  Tag,
  GraduationCap,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  getGroupById,
  getExpensesByGroup,
  deleteExpense,
} from "../services/expensesApi";

// Category configurations
const CATEGORIES = [
  { name: "Food", icon: Utensils, bg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/60" },
  { name: "Groceries", icon: ShoppingBag, bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60" },
  { name: "Rent", icon: Home, bg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200/60" },
  { name: "Bills", icon: Receipt, bg: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/60" },
  { name: "Travel", icon: Plane, bg: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200/60" },
  { name: "Entertainment", icon: Film, bg: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200/60" },
  { name: "Medical", icon: Stethoscope, bg: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border-red-200/60" },
  { name: "Shopping", icon: Tag, bg: "bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400 border-pink-200/60" },
  { name: "Education", icon: GraduationCap, bg: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/60" },
  { name: "Others", icon: Layers, bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200/60" },
];

const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const CategoryBadge = ({ category }) => {
  const cat = CATEGORIES.find((c) => c.name.toLowerCase() === (category || "").toLowerCase()) || CATEGORIES[9];
  const Icon = cat.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${cat.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{cat.name}</span>
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const st = (status || "").toLowerCase();
  if (st === "paid") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Paid</span>
      </span>
    );
  }
  if (st === "settled") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60">
        <CheckCheck className="w-3.5 h-3.5" />
        <span>Settled</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/60">
      <Clock className="w-3.5 h-3.5" />
      <span>Pending</span>
    </span>
  );
};

const GroupExpensePage = () => {
  const { groupId = "bachelor-room" } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMember, setSelectedMember] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Drawer state
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Active Menu
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const gData = await getGroupById(groupId);
      setGroup(gData);
      const expData = await getExpensesByGroup(groupId);
      setExpenses(Array.isArray(expData) ? expData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [groupId]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    const list = Array.isArray(expenses) ? expenses : [];
    return list.filter((exp) => {
      if (!exp) return false;

      const q = (searchQuery || "").toLowerCase().trim();
      const matchesSearch =
        !q ||
        (exp.title || "").toLowerCase().includes(q) ||
        (exp.description || "").toLowerCase().includes(q) ||
        (exp.paidBy || "").toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "All" ||
        (exp.category || "").toLowerCase() === selectedCategory.toLowerCase();

      const matchesMember =
        selectedMember === "All" ||
        (exp.paidBy || "").toLowerCase() === selectedMember.toLowerCase() ||
        (exp.members || []).some((m) => (m.name || "").toLowerCase() === selectedMember.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" ||
        (exp.status || "").toLowerCase() === selectedStatus.toLowerCase();

      let matchesDate = true;
      if (selectedDateRange !== "All" && exp.date) {
        const expDate = new Date(exp.date);
        const today = new Date();
        if (selectedDateRange === "Today") {
          matchesDate = expDate.toDateString() === today.toDateString();
        } else if (selectedDateRange === "This Week") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(today.getDate() - 7);
          matchesDate = expDate >= sevenDaysAgo;
        } else if (selectedDateRange === "This Month") {
          matchesDate =
            expDate.getMonth() === today.getMonth() &&
            expDate.getFullYear() === today.getFullYear();
        }
      }

      return matchesSearch && matchesCat && matchesMember && matchesStatus && matchesDate;
    });
  }, [expenses, searchQuery, selectedCategory, selectedMember, selectedStatus, selectedDateRange]);

  // Group Stats Summary
  const stats = useMemo(() => {
    const list = Array.isArray(expenses) ? expenses : [];
    const now = new Date();

    const total = list.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const thisMonth = list.reduce((sum, e) => {
      const d = new Date(e.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        return sum + Number(e.amount || 0);
      }
      return sum;
    }, 0);
    const pending = list.reduce((sum, e) => {
      if ((e.status || "").toLowerCase() === "pending") {
        return sum + Number(e.amount || 0);
      }
      return sum;
    }, 0);

    return { total, thisMonth, pending };
  }, [expenses]);

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete.id);
      showToast("Expense Deleted Successfully", "success");
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    }
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-emerald-500/40"
          >
            <div className="p-2 rounded-xl bg-emerald-500 text-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{toast.message}</span>
            <button onClick={() => setToast({ show: false, message: "", type: "success" })} className="text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BREADCRUMB / BACK LINK */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/expenses" className="flex items-center gap-1 hover:text-violet-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Expenses</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-extrabold">{group?.name || "Group"}</span>
      </div>

      {/* GROUP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white text-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 border border-violet-400/30">
            {group?.icon || "🏠"}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {group?.name || "Bachelor Room"}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {group?.description || "Shared group expense management and settlement tracking."}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/groups/${groupId}/add-expense`)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* GROUP SUMMARY CARDS (4 Stats) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Expenses</span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(stats.total)}
          </h3>
        </div>

        {/* This Month */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">This Month</span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(stats.thisMonth)}
          </h3>
        </div>

        {/* Pending Settlement */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Pending Settlement</span>
          <h3 className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(stats.pending)}
          </h3>
        </div>

        {/* Active Participants */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Participants</span>
            <div className="p-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {group?.membersCount || group?.members?.length || 4} Active
            </h3>
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {(group?.members || [{ name: "Alex Morgan" }, { name: "Hari" }, { name: "Balaji" }, { name: "Sedhu" }]).slice(0, 4).map((m, i) => (
                <div
                  key={m.name || i}
                  className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs"
                  title={m.name}
                >
                  {m.name.substring(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses of this group..."
            className="w-full py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-violet-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          
          {/* Category */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-400 shrink-0">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Member */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-400 shrink-0">Member:</span>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Members</option>
              {(group?.members || [{ name: "Alex Morgan" }, { name: "Hari" }, { name: "Balaji" }, { name: "Sedhu" }]).map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-400 shrink-0">Date:</span>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-400 shrink-0">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Settled">Settled</option>
            </select>
          </div>

        </div>
      </div>

      {/* GROUP EXPENSES TABLE & CARDS */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse h-16" />
          ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <ReceiptText className="w-10 h-10 text-slate-400 mb-2 stroke-[1.5]" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Group Expenses Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">No expenses match your search or filters for this group.</p>
          <button
            onClick={() => navigate(`/groups/${groupId}/add-expense`)}
            className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs shadow-md"
          >
            + Add Expense
          </button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="py-3.5 px-5">Expense</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Paid By</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Split</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs font-medium">
                  {filteredExpenses.map((exp) => (
                    <tr
                      key={exp.id}
                      onClick={() => {
                        setSelectedExpense(exp);
                        setIsDrawerOpen(true);
                      }}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                          {exp.title}
                        </div>
                        {exp.description && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                            {exp.description}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <CategoryBadge category={exp.category} />
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {exp.paidBy}
                      </td>

                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">
                        {formatCurrency(exp.amount)}
                      </td>

                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        {exp.splitMethod}
                      </td>

                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(exp.date)}
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={exp.status} />
                      </td>

                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === exp.id ? null : exp.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === exp.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 p-1 space-y-0.5 text-left">
                                <button
                                  onClick={() => {
                                    setSelectedExpense(exp);
                                    setIsDrawerOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 rounded-xl"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Details</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setExpenseToDelete(exp);
                                    setIsDeleteDialogOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 rounded-xl"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="md:hidden space-y-3">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                onClick={() => {
                  setSelectedExpense(exp);
                  setIsDrawerOpen(true);
                }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CategoryBadge category={exp.category} />
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                      {exp.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-base text-slate-900 dark:text-white block">
                      {formatCurrency(exp.amount)}
                    </span>
                    <StatusBadge status={exp.status} />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Paid By</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{exp.paidBy}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Date</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(exp.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* DETAILS DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && selectedExpense && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200/80 dark:border-slate-800 flex flex-col"
              >
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Expense Details</h2>
                  <button onClick={() => setIsDrawerOpen(false)} className="p-1 rounded-xl text-slate-400 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-violet-100 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <CategoryBadge category={selectedExpense.category} />
                      <StatusBadge status={selectedExpense.status} />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white pt-1">{selectedExpense.title}</h3>
                    <div className="text-2xl font-black text-violet-600 dark:text-violet-400">{formatCurrency(selectedExpense.amount)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Paid By</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedExpense.paidBy}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Paid From</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedExpense.paidFromAccount}</span>
                    </div>
                  </div>

                  {/* Participant Shares Breakdown */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Participant Shares Breakdown</span>
                    <div className="space-y-2">
                      {(selectedExpense.members || [{ name: "Alex Morgan", shareAmount: selectedExpense.amount / 4, status: "Paid" }, { name: "Hari", shareAmount: selectedExpense.amount / 4, status: "Pending" }, { name: "Balaji", shareAmount: selectedExpense.amount / 4, status: "Paid" }, { name: "Sedhu", shareAmount: selectedExpense.amount / 4, status: "Pending" }]).map((m) => (
                        <div key={m.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                          <div className="text-right">
                            <span className="font-black text-slate-900 dark:text-white block">{formatCurrency(m.shareAmount)}</span>
                            <span className={`text-[10px] font-bold ${m.status === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>{m.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE DIALOG */}
      <AnimatePresence>
        {isDeleteDialogOpen && expenseToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Expense?</h3>
                <p className="text-xs text-slate-500 mt-1">Are you sure you want to delete <strong>"{expenseToDelete.title}"</strong>?</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl">Cancel</button>
                <button onClick={handleConfirmDelete} className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 rounded-xl shadow-lg shadow-red-500/25">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GroupExpensePage;
