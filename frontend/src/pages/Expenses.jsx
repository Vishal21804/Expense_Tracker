import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  ReceiptText,
  Search,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Plane,
  Briefcase,
  Pencil,
  FolderPlus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getGroups, updateGroup, createGroup, deleteGroup } from "../services/groupsApi";
import EditGroupModal, { getGroupColorTheme } from "../components/EditGroupModal";
import CreateGroupModal from "../components/CreateGroupModal";

// Currency Formatter
const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(isNaN(num) ? 0 : num);
};

const ExpensesHome = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingGroup, setEditingGroup] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const data = await getGroups();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load groups:", err);
      showToast("Failed to load groups from server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGroup = async (updatedFields) => {
    if (!editingGroup) return;
    try {
      const updated = await updateGroup(editingGroup.id, updatedFields);
      if (updated) {
        setGroups((prev) => prev.map((g) => (g.id === editingGroup.id ? updated : g)));
        showToast("Group updated successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to update group:", err);
      showToast(err.response?.data?.message || err.message || "Failed to update group", "error");
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const newGroup = await createGroup(groupData);
      if (newGroup) {
        setGroups((prev) => [newGroup, ...prev]);
        showToast("Group created successfully!", "success");
        return newGroup;
      }
    } catch (err) {
      console.error("Failed to create group:", err);
      showToast(err.response?.data?.message || err.message || "Failed to create group", "error");
      throw err;
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      showToast("Group deleted successfully!", "success");
    } catch (err) {
      console.error("Failed to delete group:", err);
      showToast("Failed to delete group", "error");
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    (g.name || "").toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Expenses
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 border border-violet-200/60">
              {groups.length} Groups
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage personal and shared participant expense groups. Select a group to view expenses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all focus:outline-none cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR & CONTROLS */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative flex items-center w-full max-w-md">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups by name..."
            className="w-full py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-violet-500 focus:outline-none transition-all placeholder-slate-400"
          />
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Real-time split sync active</span>
        </div>
      </div>

      {/* GROUPS CARDS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="w-20 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="w-3/4 h-6 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-1/2 h-4 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <div className="h-8 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-8 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
            const groupTheme = getGroupColorTheme(group.color);
            return (
              <motion.div
                key={group.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="group cursor-pointer p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-violet-500/5 hover:border-violet-300 dark:hover:border-violet-800 transition-all flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Row: Emoji Icon + Action Buttons */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-13 h-13 rounded-2xl ${groupTheme.bg} ${groupTheme.shadow} text-white text-2xl flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-200 shrink-0`}>
                      {group.icon || "🏠"}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGroup(group);
                        }}
                        title="Edit Group"
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-950/80 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        <span>
                          {Array.isArray(group.members) && group.members.length > 0
                            ? group.members.length
                            : Number(group.membersCount || 1)}{" "}
                          {Number(
                            Array.isArray(group.members) && group.members.length > 0
                              ? group.members.length
                              : group.membersCount || 1
                          ) === 1
                            ? "Participant"
                            : "Participants"}
                        </span>
                      </span>
                    </div>
                  </div>

                {/* Category & Created Date Badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40">
                    {group.category || group.type || "General"}
                  </span>
                  {group.createdAt && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      Created {new Date(group.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {group.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-medium">
                  {group.description || "Shared group expense management and settlement tracking."}
                </p>

                {/* Member Avatar Stack Preview & Active Participants */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 min-w-0">
                  <div className="flex items-center -space-x-2 shrink-0">
                    {(Array.isArray(group.members) && group.members.length > 0
                      ? group.members
                      : Array.from({ length: Math.min(Number(group.membersCount || 1), 4) }, (_, i) => ({
                          id: `p-${i}`,
                          name: i === 0 ? "Me (You)" : `Member ${i + 1}`,
                          avatar: i === 0 ? "ME" : `M${i + 1}`,
                        }))
                    ).slice(0, 4).map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs overflow-hidden"
                        title={m.name}
                      >
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                        ) : m.avatarEmoji ? (
                          <span className="text-xs">{m.avatarEmoji}</span>
                        ) : (
                          m.avatar || m.name?.substring(0, 2).toUpperCase() || "ME"
                        )}
                      </div>
                    ))}
                    {(Array.isArray(group.members) && group.members.length > 4) && (
                      <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 truncate text-right">
                    Active Participants
                  </span>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Expenses
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                      {formatCurrency(group.totalExpenses)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      Pending
                    </span>
                    <span className="text-sm font-black text-amber-700 dark:text-amber-400 mt-0.5 block">
                      {formatCurrency(group.pendingSettlement)}
                    </span>
                  </div>
                </div>

                {/* Footer Action Arrow */}
                <div className="flex items-center justify-between pt-1 text-xs font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform">
                  <span>{group.expensesCount || 0} Expenses Recorded</span>
                  <div className="flex items-center gap-1">
                    <span>View Group</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </motion.div>
          );
        })}
        </div>
      )}

      {/* EDIT GROUP MODAL */}
      <EditGroupModal
        isOpen={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        group={editingGroup}
        onSave={handleSaveGroup}
        onDelete={handleDeleteGroup}
      />

      {/* CREATE GROUP MODAL */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateGroup}
      />

      {/* TOAST NOTIFICATION BANNER */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-extrabold text-white ${
              toast.type === "success"
                ? "bg-emerald-600 border-emerald-500 shadow-emerald-600/20"
                : "bg-rose-600 border-rose-500 shadow-rose-600/20"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpensesHome;
