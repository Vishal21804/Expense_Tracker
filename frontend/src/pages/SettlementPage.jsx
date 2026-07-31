import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ReceiptText,
  CreditCard,
  Check,
  AlertCircle,
  X,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { getGroup, getMembers } from "../services/groupsApi";
import { getExpensesByGroup } from "../services/expensesApi";
import { calculateNetSettlement } from "../utils/settlementCalculator";

// Currency Formatter
const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num);
};

// Helper for Initials
const getInitials = (name) => {
  if (!name) return "M";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().substring(0, 2).toUpperCase();
};

const SettlementPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const gData = await getGroup(groupId);
      setGroup(gData);

      let membersData = [];
      try {
        membersData = await getMembers(groupId);
      } catch (mErr) {
        console.error("Failed to load members:", mErr);
      }
      const validMembers = Array.isArray(membersData) && membersData.length > 0
        ? membersData
        : (gData?.members || []);
      setMembers(validMembers);

      const expData = await getExpensesByGroup(groupId);
      setExpenses(Array.isArray(expData) ? expData : []);
    } catch (err) {
      console.error("Failed to load settlement data:", err);
      showToast("Failed to load settlement details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [groupId]);

  // PAIRWISE NET SETTLEMENT CALCULATIONS ENGINE (Splitwise Style)
  const settlementSummary = useMemo(() => {
    const validMembers = Array.isArray(members) && members.length > 0 ? members : (group?.members || []);
    return calculateNetSettlement(expenses, validMembers);
  }, [expenses, members, group]);

  const { othersOweList, iOweList, totalOthersOweMe, totalIOweOthers, netDifference } = settlementSummary;

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* TOAST ALERT */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-violet-500/40 text-xs font-bold"
          >
            <div className="p-2 rounded-xl bg-violet-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>{toast.message}</span>
            <button onClick={() => setToast({ show: false, message: "", type: "info" })} className="text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BREADCRUMB & BACK LINK */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/expenses" className="hover:text-violet-600 transition-colors">Expenses</Link>
        <span>/</span>
        <Link to={`/groups/${groupId}`} className="hover:text-violet-600 transition-colors">
          {group?.name || "Group"}
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-extrabold">Settlement Details</span>
      </div>

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            title="Back to Group Page"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Settlement Details
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 border border-violet-200/60">
                Splitwise Style
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Live balances and individual member breakdown for {group?.name || "this group"}.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/groups/${groupId}/add-expense`)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all cursor-pointer shrink-0"
        >
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* TOP SUMMARY CARDS GRID (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Others Owe Me */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
              Others Owe Me
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
              To Receive
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(totalOthersOweMe)}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Sum of shares owed by other members for expenses you paid.
          </p>
        </div>

        {/* Card 2: I Owe Others */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
              I Owe Others
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
              To Pay
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {formatCurrency(totalIOweOthers)}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Sum of your unpaid shares for expenses paid by other members.
          </p>
        </div>

        {/* Card 3: Net Balance Status */}
        {netDifference > 0 && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 text-white shadow-xl shadow-emerald-500/20 border border-emerald-400/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 block">Net Balance Status</span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                You should receive {formatCurrency(netDifference)}
              </h3>
              <p className="text-[11px] text-emerald-100/90 mt-1">
                Net positive balance across all group settlements.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-xl flex items-center justify-center shrink-0">
              📈
            </div>
          </div>
        )}

        {netDifference < 0 && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-700 to-pink-600 text-white shadow-xl shadow-rose-500/20 border border-rose-400/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-200 block">Net Balance Status</span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                You need to pay {formatCurrency(Math.abs(netDifference))}
              </h3>
              <p className="text-[11px] text-rose-100/90 mt-1">
                Net negative balance across all group settlements.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-xl flex items-center justify-center shrink-0">
              📉
            </div>
          </div>
        )}

        {netDifference === 0 && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-violet-500/20 border border-violet-400/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-violet-200 block">Net Balance Status</span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                All Settled Up 🎉
              </h3>
              <p className="text-[11px] text-violet-100/90 mt-1">
                All group member balances are completely settled.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-xl flex items-center justify-center shrink-0">
              ✨
            </div>
          </div>
        )}

      </div>

      {/* TWO SETTLEMENT TABLES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* SECTION 1: OTHERS OWE ME */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  1. Others Owe Me
                </h3>
                <p className="text-[11px] text-slate-400">
                  Members who owe you money for expenses you paid
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60">
              Total: {formatCurrency(totalOthersOweMe)}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : othersOweList.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto stroke-[1.5]" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No member owes you money right now
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Expenses you pay in this group will automatically show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {othersOweList.map((item) => (
                <div
                  key={item.id || item.name}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {getInitials(item.name)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-400 truncate">
                        Reason: {item.count} shared expense{item.count > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-black text-base text-emerald-600 dark:text-emerald-400 block">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block">Owes You</span>
                    </div>

                    <button
                      onClick={() => showToast(`Settle Up feature with ${item.name} coming soon!`, "info")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      Settle Up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: I OWE OTHERS */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center font-bold">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  2. I Owe Others
                </h3>
                <p className="text-[11px] text-slate-400">
                  Members whom you owe money for expenses they paid
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200/60">
              Total: {formatCurrency(totalIOweOthers)}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : iOweList.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-violet-500 mx-auto stroke-[1.5]" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                You don't owe money to anyone in this group! 🎉
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                All shares for expenses paid by other members are settled up.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {iOweList.map((item) => (
                <div
                  key={item.id || item.name}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:border-rose-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {getInitials(item.name)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-400 truncate">
                        Reason: {item.count} shared expense{item.count > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-black text-base text-rose-600 dark:text-rose-400 block">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block">You Owe</span>
                    </div>

                    <button
                      onClick={() => showToast(`Pay Now feature to ${item.name} coming soon!`, "info")}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all cursor-pointer"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default SettlementPage;
