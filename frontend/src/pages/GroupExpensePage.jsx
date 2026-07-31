import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  CheckCircle2,
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
  ChevronDown,
} from "lucide-react";
import {
  getExpensesByGroup,
  deleteExpense,
  updateGroupMembers,
  getExpenseDetails,
} from "../services/expensesApi";
import { getGroup, getMembers, updateGroup, deleteGroup } from "../services/groupsApi";
import { calculateNetSettlement } from "../utils/settlementCalculator";
import EditGroupModal, { getGroupColorTheme } from "../components/EditGroupModal";
import EditParticipantsModal from "../components/EditParticipantsModal";

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

const getPayerName = (paidByVal, membersList) => {
  if (!paidByVal && paidByVal !== 0) return "Unknown";
  if (typeof paidByVal === "object") {
    return paidByVal.member_name || paidByVal.name || "Member";
  }
  const matched = (membersList || []).find((m) => String(m.id) === String(paidByVal));
  if (matched) {
    return matched.member_name || matched.name || "Member";
  }
  if (isNaN(Number(paidByVal))) {
    return String(paidByVal);
  }
  return `Member #${paidByVal}`;
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

  // Drawer state & Expense Details API Integration
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedParticipantName, setExpandedParticipantName] = useState(null);
  const [expenseDetails, setExpenseDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    if (selectedExpense?.id && groupId) {
      const fetchDetails = async () => {
        setIsDetailsLoading(true);
        try {
          const details = await getExpenseDetails(groupId, selectedExpense.id);
          setExpenseDetails(details);
        } catch (err) {
          console.error("Error loading expense details:", err);
          setExpenseDetails(null);
        } finally {
          setIsDetailsLoading(false);
        }
      };
      fetchDetails();
    } else {
      setExpenseDetails(null);
    }
  }, [selectedExpense, groupId]);

  // Active Menu (Portal based)
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPortalState, setMenuPortalState] = useState(null); // { exp, rect }

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Edit Group & Participants Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const gData = await getGroup(groupId);
      let membersData = [];
      try {
        membersData = await getMembers(groupId);
      } catch (mErr) {
        console.error("Failed to load members:", mErr);
      }
      const combinedGroup = {
        ...gData,
        members: membersData && membersData.length > 0 ? membersData : gData?.members || [],
        membersCount: membersData && membersData.length > 0 ? membersData.length : (gData?.membersCount || 1),
      };
      setGroup(combinedGroup);
      const expData = await getExpensesByGroup(groupId);
      setExpenses(Array.isArray(expData) ? expData : []);
    } catch (err) {
      console.error("Failed to load group details:", err);
      showToast("Failed to load group details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGroup = async (updatedFields) => {
    try {
      const updated = await updateGroup(groupId, updatedFields);
      if (updated) {
        setGroup(updated);
        showToast("Group updated successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to update group:", err);
      showToast("Failed to update group", "error");
    }
  };

  const handleDeleteGroup = async (targetGroupId) => {
    try {
      await deleteGroup(targetGroupId || groupId);
      showToast("Group deleted successfully!", "success");
      navigate("/expenses");
    } catch (err) {
      console.error("Failed to delete group:", err);
      showToast("Failed to delete group", "error");
    }
  };

  const handleSaveParticipants = async (updatedMembers) => {
    try {
      const updated = await updateGroupMembers(groupId, updatedMembers);
      if (updated) {
        setGroup(updated);
        showToast("Participants updated successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to update participants:", err);
      showToast("Failed to update participants", "error");
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
        (exp.members || []).some((m) => (m.member_name || m.name || "").toLowerCase() === selectedMember.toLowerCase());

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

      return matchesSearch && matchesCat && matchesMember && matchesDate;
    });
  }, [expenses, searchQuery, selectedCategory, selectedMember, selectedDateRange]);

  // Group Stats Summary: Calculate "Others Owe Me" using Pairwise Net Settlement Engine
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

    const membersList = Array.isArray(group?.members) && group.members.length > 0 ? group.members : [];
    const { totalOthersOweMe } = calculateNetSettlement(list, membersList);

    return { total, thisMonth, othersOweMe: totalOthersOweMe };
  }, [expenses, group]);

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
      {(() => {
        const groupTheme = getGroupColorTheme(group?.color);
        return (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  {group?.icon || "👥"}
                </span>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                    <span>{group?.name || "Group Expenses"}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${groupTheme.badge}`}>
                      {group?.type || "General"}
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {group?.description || "Shared group expense log and real-time settlements."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                to={`/groups/${groupId}/members`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
              >
                <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>Group Members ({group?.members?.length || group?.membersCount || 4})</span>
              </Link>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
              >
                <Pencil className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>Edit Group</span>
              </button>
              <button
                onClick={() => navigate(`/groups/${groupId}/add-expense`)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>
        );
      })()}

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

        {/* Others Owe Me (Navigates to Settlement Details Page) */}
        <div
          onClick={() => navigate(`/groups/${groupId}/settlement`)}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-500/60 hover:shadow-md hover:scale-[1.02] transition-all group"
          title="Click to view Settlement Details"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Others Owe Me</span>
            <ChevronRight className="w-4 h-4 text-emerald-500 opacity-70 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(stats.othersOweMe)}
          </h3>
        </div>

        {/* Active Participants */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Participants</span>
            <button
              onClick={() => navigate(`/groups/${groupId}/members`)}
              className="px-2 py-1 rounded-xl bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/80 text-violet-600 dark:text-violet-400 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {(group?.members && group.members.length > 0) ? group.members.length : (group?.membersCount || 1)} Active
            </h3>
            <div
              onClick={() => navigate(`/groups/${groupId}/members`)}
              className="flex items-center -space-x-1.5 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              title="Manage Group Members"
            >
              {(group?.members || [{ member_name: "Me" }]).slice(0, 4).map((m, i) => (
                <div
                  key={m.id || m.member_name || m.name || i}
                  className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs"
                  title={m.member_name || m.name}
                >
                  {(m.member_name || m.name) ? (m.member_name || m.name).substring(0, 2).toUpperCase() : "M"}
                </div>
              ))}
              {(group?.members || []).length > 4 && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[9px] flex items-center justify-center border-2 border-white dark:border-slate-900">
                  +{(group?.members || []).length - 4}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        
        {/* Search & Add Expense Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/groups/${groupId}/add-expense`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/25 hover:shadow-violet-500/35 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Expense</span>
          </button>

          <div className="relative w-full flex-1">
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
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
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
              {(group?.members || []).map((m) => {
                const mName = m.member_name || m.name || "Member";
                return <option key={m.id || mName} value={mName}>{mName}</option>;
              })}
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
                    <th className="py-3.5 px-4">Date</th>
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
                        {getPayerName(exp.paidBy, group?.members)}
                      </td>

                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">
                        {formatCurrency(exp.amount)}
                      </td>

                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(exp.date)}
                      </td>

                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (menuPortalState?.exp?.id === exp.id) {
                              setMenuPortalState(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuPortalState({ exp, rect });
                            }
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
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
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Paid By</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{getPayerName(exp.paidBy, group?.members)}</span>
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

      {/* EXPENSE DETAILS FULL CENTER MODAL */}
      <AnimatePresence>
        {isDrawerOpen && selectedExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
            >
              {/* MODAL HEADER */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400">
                    <ReceiptText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Expense Details & Breakdown
                    </h2>
                    <p className="text-xs font-semibold text-slate-400">
                      Full view of who paid and who owes how much
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
                
                {/* HERO AMOUNT CARD */}
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <CategoryBadge category={selectedExpense.category} />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                    {selectedExpense.title}
                  </h3>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      {formatCurrency(selectedExpense.amount)}
                    </span>
                    <span className="text-xs font-bold text-violet-200 uppercase tracking-wider">
                      Total Expense
                    </span>
                  </div>
                </div>

                {/* DETAILS GRID (4 Stats) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paid By</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate">
                      {getPayerName(selectedExpense.paidBy, group?.members)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Account</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate">
                      {selectedExpense.paidFromAccount || "Cash"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Split Method</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate">
                      {selectedExpense.splitMethod || "Equal"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate">
                      {formatDate(selectedExpense.date)}
                    </span>
                  </div>
                </div>

                {/* DESCRIPTION (if any) */}
                {selectedExpense.description && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Notes & Description</span>
                    <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                      {selectedExpense.description}
                    </p>
                  </div>
                )}

                {/* BILL RECEIPT IMAGE (if any) */}
                {selectedExpense.billImageUrl && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Attached Receipt / Bill</span>
                    <img
                      src={selectedExpense.billImageUrl}
                      alt="Bill receipt"
                      className="w-full max-h-56 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                    />
                  </div>
                )}

                {/* PARTICIPANT SHARES & ITEM-WISE BREAKDOWN ("WHO OWES HOW MUCH") */}
                {(() => {
                  const totalAmount = Number(selectedExpense.amount || 0);
                  const splitMethod = selectedExpense.splitMethod || selectedExpense.split_method || "Equal";
                  const groupMembers = Array.isArray(group?.members) && group.members.length > 0 ? group.members : [];
                  const memberCount = Math.max(groupMembers.length, 1);
                  const payerName = getPayerName(selectedExpense.paidBy || selectedExpense.paid_by, groupMembers);

                  // Map member_id / member_name -> consumer total amount & items list from expenseDetails
                  const memberDetailsMap = {};
                  if (expenseDetails && Array.isArray(expenseDetails.items) && expenseDetails.items.length > 0) {
                    expenseDetails.items.forEach((item) => {
                      const unitPrice = Number(item.unit_price || item.price || 0);
                      const consumers = Array.isArray(item.consumers) ? item.consumers : [];

                      consumers.forEach((c) => {
                        if (!c) return;
                        const mIdKey = String(c.member_id || "").toLowerCase().trim();
                        const mNameKey = String(c.member_name || c.name || "").toLowerCase().trim();
                        const qty = Number(c.quantity_consumed ?? c.quantity ?? 0);
                        const amt = Number(c.amount ?? (qty * unitPrice));

                        const primaryKey = mIdKey || mNameKey;
                        if (!primaryKey) return;

                        if (!memberDetailsMap[primaryKey]) {
                          memberDetailsMap[primaryKey] = { totalAmount: 0, items: [] };
                        }
                        if (mNameKey && !memberDetailsMap[mNameKey]) {
                          memberDetailsMap[mNameKey] = memberDetailsMap[primaryKey];
                        }

                        memberDetailsMap[primaryKey].totalAmount += amt;
                        if (qty > 0 || amt > 0) {
                          memberDetailsMap[primaryKey].items.push({
                            name: item.item_name || item.name || "Item",
                            quantity: qty,
                            unit_price: unitPrice,
                            amount: amt,
                          });
                        }
                      });
                    });
                  }

                  const participants = groupMembers.map((gm) => {
                    const mName = gm.member_name || gm.name || "Member";
                    const mId = String(gm.id);
                    const isPayer = mName.toLowerCase() === payerName.toLowerCase() || String(gm.id) === String(selectedExpense.paidBy || selectedExpense.paid_by);

                    let shareAmt = 0;
                    let items = [];

                    if (splitMethod === "Item-wise") {
                      const details = memberDetailsMap[mId.toLowerCase()] || memberDetailsMap[mName.toLowerCase().trim()];
                      if (details) {
                        shareAmt = details.totalAmount;
                        items = details.items;
                      } else {
                        shareAmt = 0;
                        items = [];
                      }
                    } else if (splitMethod === "Percentage") {
                      const matched = (selectedExpense.members || []).find((m) => (m.member_name || m.name || "").toLowerCase() === mName.toLowerCase());
                      const pct = Number(matched?.percentage || 0);
                      shareAmt = (totalAmount * pct) / 100;
                    } else if (splitMethod === "Custom") {
                      const matched = (selectedExpense.members || []).find((m) => (m.member_name || m.name || "").toLowerCase() === mName.toLowerCase());
                      shareAmt = Number(matched?.shareAmount ?? matched?.amount ?? 0);
                    } else {
                      // Equal Split: ONLY when split_method == "Equal"
                      shareAmt = totalAmount / memberCount;
                    }

                    const pct = totalAmount > 0 ? (shareAmt / totalAmount) * 100 : 0;

                    return {
                      id: gm.id,
                      name: mName,
                      shareAmount: Math.round(shareAmt * 100) / 100,
                      percentage: pct,
                      items,
                      isPayer,
                    };
                  });

                  return (
                    <div className="space-y-4 pt-2">
                      {/* SECTION TITLE & BADGE */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-violet-500" />
                          <span>Who Owes How Much</span>
                        </h4>
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-200/60">
                          {splitMethod} Split
                        </span>
                      </div>

                      {/* SPLIT METHOD SUMMARY HEADER */}
                      <div className="p-3.5 rounded-2xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/60 flex items-center justify-between text-xs font-medium">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            {splitMethod === "Equal"
                              ? `Equal Share = ${formatCurrency(totalAmount / memberCount)} each`
                              : splitMethod === "Percentage"
                              ? "Percentage Breakdown per Participant"
                              : splitMethod === "Item-wise"
                              ? "Itemized Consumption per Participant"
                              : "Custom Amount Assigned per Participant"}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            {splitMethod === "Equal"
                              ? `Total ${formatCurrency(totalAmount)} divided equally among ${memberCount} participants`
                              : splitMethod === "Percentage"
                              ? "Calculated based on assigned percentage distribution"
                              : splitMethod === "Item-wise"
                              ? "Shows exact consumer amounts & items from API"
                              : "Exact custom shares assigned per member"}
                          </span>
                        </div>
                      </div>

                      {/* EXPANDABLE ACCORDION PARTICIPANT CARDS */}
                      <div className="space-y-3">
                        {participants.map((part) => {
                          const isPayer = part.isPayer;
                          const isExpanded = expandedParticipantName === part.name;

                          return (
                            <div
                              key={part.name}
                              className={`rounded-2xl border transition-all overflow-hidden ${
                                isPayer
                                  ? "bg-emerald-950/20 dark:bg-emerald-950/30 border-emerald-500/40"
                                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80"
                              }`}
                            >
                              {/* DEFAULT / COLLAPSED HEADER (CLICKABLE ACCORDION HEADER) */}
                              <button
                                type="button"
                                onClick={() => setExpandedParticipantName(isExpanded ? null : part.name)}
                                className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Chevron Icon (▶ / ▼) */}
                                  <div className="p-1 rounded-lg text-slate-400 dark:text-slate-400">
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-violet-500 stroke-[2.5]" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2.5]" />
                                    )}
                                  </div>

                                  {/* Member Avatar Initials */}
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-xs ${
                                    isPayer
                                      ? "bg-gradient-to-tr from-emerald-600 to-teal-500"
                                      : "bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500"
                                  }`}>
                                    {part.name.substring(0, 2).toUpperCase()}
                                  </div>

                                  <div className="min-w-0">
                                    <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                      <span>{part.name}</span>
                                      {isPayer && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-black uppercase">
                                          (Paid)
                                        </span>
                                      )}
                                    </h5>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white block">
                                    {formatCurrency(part.shareAmount)}
                                  </span>
                                </div>
                              </button>

                              {/* EXPANDED DETAILS BODY */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-slate-200/60 dark:border-slate-700/60 p-4 space-y-3 bg-white/50 dark:bg-slate-900/60"
                                  >
                                    {/* CONSUMED ITEMS LIST FROM API */}
                                    <div className="space-y-2">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        Items Consumed
                                      </span>

                                      {isDetailsLoading ? (
                                        <div className="text-xs font-semibold text-slate-400 py-1 animate-pulse">
                                          Loading items consumed...
                                        </div>
                                      ) : part.items && part.items.length > 0 ? (
                                        <div className="space-y-2">
                                          {part.items.map((item, iIdx) => (
                                            <div key={iIdx} className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs">
                                              <div className="flex items-center justify-between font-extrabold text-slate-900 dark:text-white">
                                                <span>{item.name}</span>
                                                <span className="text-violet-600 dark:text-violet-400">{formatCurrency(item.amount)}</span>
                                              </div>
                                              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                <span>Quantity: {item.quantity}</span>
                                                {item.unit_price > 0 && (
                                                  <>
                                                    <span>•</span>
                                                    <span>Unit Price: {formatCurrency(item.unit_price)}</span>
                                                  </>
                                                )}
                                                <span>•</span>
                                                <span>Amount: {formatCurrency(item.amount)}</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-xs font-medium text-slate-400 italic py-1">
                                          No items consumed
                                        </div>
                                      )}
                                    </div>

                                    {/* SUBTOTAL & CONSUMPTION SUMMARY */}
                                    <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                                      {isPayer ? (
                                        <>
                                          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                                            <span>Total Consumed</span>
                                            <span className="font-black text-slate-900 dark:text-white">{formatCurrency(part.shareAmount)}</span>
                                          </div>
                                          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                                            <span>Paid Total</span>
                                            <span className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAmount)}</span>
                                          </div>

                                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                                              Others Owe {part.name}:
                                            </span>
                                            {participants
                                              .filter((other) => !other.isPayer && other.shareAmount > 0)
                                              .map((other) => (
                                                <div key={other.name} className="flex items-center justify-between font-black text-emerald-600 dark:text-emerald-400 text-xs">
                                                  <span>• {other.name} →</span>
                                                  <span>{formatCurrency(other.shareAmount)}</span>
                                                </div>
                                              ))}
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                                            <span>Total Consumed</span>
                                            <span className="font-black text-slate-900 dark:text-white">{formatCurrency(part.shareAmount)}</span>
                                          </div>
                                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between font-black text-amber-600 dark:text-amber-400 text-xs">
                                            <span>{part.name} owes {payerName}</span>
                                            <span>{formatCurrency(part.shareAmount)}</span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })()}

              </div>

              {/* FOOTER */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    navigate(`/groups/${groupId}/expenses/${selectedExpense.id}/edit`);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/20 transition-all cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit Expense</span>
                </button>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
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

      {/* EDIT GROUP MODAL */}
      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        group={group}
        onSave={handleSaveGroup}
        onDelete={handleDeleteGroup}
      />

      {/* EDIT PARTICIPANTS MODAL */}
      <EditParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        group={group}
        onSave={handleSaveParticipants}
      />

      {/* PORTAL DROPDOWN MENU (UNCLIPPED) */}
      {menuPortalState && createPortal(
        <div
          className="fixed inset-0 z-50 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            setMenuPortalState(null);
          }}
        >
          <div
            style={{
              position: "fixed",
              top: menuPortalState.rect.bottom + 140 > window.innerHeight
                ? `${menuPortalState.rect.top - 124}px`
                : `${menuPortalState.rect.bottom + 4}px`,
              left: `${Math.max(12, Math.min(menuPortalState.rect.right - 144, window.innerWidth - 160))}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-36 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1.5 space-y-0.5 text-left z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <button
              onClick={() => {
                setSelectedExpense(menuPortalState.exp);
                setIsDrawerOpen(true);
                setMenuPortalState(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
            <button
              onClick={() => {
                navigate(`/groups/${groupId}/expenses/${menuPortalState.exp.id}/edit`);
                setMenuPortalState(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/60 rounded-xl transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                setExpenseToDelete(menuPortalState.exp);
                setIsDeleteDialogOpen(true);
                setMenuPortalState(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* FLOATING ACTION BUTTON (FAB) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(`/groups/${groupId}/add-expense`)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 text-white font-extrabold text-xs sm:text-sm shadow-2xl shadow-violet-500/50 hover:shadow-violet-500/60 border border-violet-400/30 transition-all cursor-pointer"
        title="Add Expense to Group"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
        <span>Add Expense</span>
      </motion.button>

    </div>
  );
};

export default GroupExpensePage;
