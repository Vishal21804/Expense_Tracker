import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  User,
  Receipt,
  PieChart,
  DollarSign,
  Clock,
  CheckCircle2,
  X,
  AlertTriangle,
  Sparkles,
  Check,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import {
  getGroup,
  getMembers,
  addMember,
  updateMember,
  removeMember,
  updateGroup,
  deleteGroup,
} from "../services/groupsApi";
import EditGroupModal, {
  getGroupColorTheme,
  COLOR_OPTIONS,
} from "../components/EditGroupModal";

// Preset Avatar Accent Colors Palette
const AVATAR_COLORS = [
  { id: "violet", bg: "bg-gradient-to-tr from-violet-600 to-purple-600", text: "text-white" },
  { id: "emerald", bg: "bg-gradient-to-tr from-emerald-500 to-teal-600", text: "text-white" },
  { id: "amber", bg: "bg-gradient-to-tr from-amber-500 to-orange-600", text: "text-white" },
  { id: "rose", bg: "bg-gradient-to-tr from-rose-500 to-pink-600", text: "text-white" },
  { id: "sky", bg: "bg-gradient-to-tr from-sky-500 to-blue-600", text: "text-white" },
  { id: "purple", bg: "bg-gradient-to-tr from-purple-600 to-fuchsia-600", text: "text-white" },
];

// Generate avatar initials from member_name (e.g. Vishal -> V, Hari -> H, Alex Morgan -> AM)
const getInitials = (name = "") => {
  if (!name || typeof name !== "string") return "M";
  const trimmed = name.trim();
  if (!trimmed) return "M";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.substring(0, 1).toUpperCase();
};

// Generate deterministic avatar color from member_name
const getAvatarColorObj = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export default function GroupMembersPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  // Core State
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [timeline, setTimeline] = useState([
    { id: "t1", user: "Group", action: "created", time: "Recently", icon: "🏠" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Menu State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const [isDeleteGroupConfirmOpen, setIsDeleteGroupConfirmOpen] = useState(false);

  // Add Member Form State
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Member Form State & Loading
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editMemberError, setEditMemberError] = useState("");
  const [isSavingMember, setIsSavingMember] = useState(false);

  // Delete Member Loading State
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Helper to format backend errors
  const parseError = (err) => {
    if (!err.response) return "Unable to connect to server.";
    const status = err.response.status;
    if (status === 404) return "Member not found";
    if (status === 400 || status === 409) {
      return err.response?.data?.detail || err.response?.data?.message || "Member already exists";
    }
    return err.response?.data?.detail || err.response?.data?.message || "An unexpected error occurred.";
  };

  // Fetch Group and Members Data from API
  const fetchGroupData = async () => {
    setIsLoading(true);
    try {
      if (groupId) {
        const groupData = await getGroup(groupId);
        setGroup(groupData);

        const fetchedMembers = await getMembers(groupId);
        setMembers(Array.isArray(fetchedMembers) ? fetchedMembers : []);
      }
    } catch (err) {
      console.error("Error fetching group members:", err);
      showToast(parseError(err), "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  // Filter members by member_name, member_email, phone
  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return members;
    return members.filter(
      (m) =>
        (m.member_name || m.name || "").toLowerCase().includes(q) ||
        (m.member_email || m.email || "").toLowerCase().includes(q) ||
        (m.phone || "").toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  // Add Member Handler
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    const nameVal = addName.trim();
    if (!nameVal) {
      setNameError("Member Name is required");
      return;
    }

    // Check duplicate member name (case-insensitive)
    const isDuplicate = members.some(
      (m) => (m.member_name || m.name || "").toLowerCase() === nameVal.toLowerCase()
    );
    if (isDuplicate) {
      setNameError("Member already exists");
      return;
    }

    setNameError("");
    setIsSubmitting(true);

    try {
      if (groupId) {
        await addMember(groupId, {
          member_name: nameVal,
          member_email: addEmail.trim(),
          phone: addPhone.trim(),
        });
        await fetchGroupData();
      } else {
        const newMember = {
          id: `m-${Date.now()}`,
          member_name: nameVal,
          member_email: addEmail.trim(),
          phone: addPhone.trim(),
        };
        setMembers((prev) => [...prev, newMember]);
      }

      setTimeline((prev) => [
        {
          id: `t-${Date.now()}`,
          user: "You",
          action: `added ${nameVal}`,
          time: "Just now",
          icon: "➕",
        },
        ...prev,
      ]);

      showToast("Member added successfully.", "success");
      setIsAddModalOpen(false);

      setAddName("");
      setAddEmail("");
      setAddPhone("");
    } catch (err) {
      console.error("Error adding member:", err);
      setNameError(parseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Member Modal
  const handleOpenEditMember = (member) => {
    setEditingMember(member);
    setEditName(member.member_name || member.name || "");
    setEditEmail(member.member_email || member.email || "");
    setEditPhone(member.phone || "");
    setEditMemberError("");
    setIsEditMemberModalOpen(true);
  };

  // Save Edit Member
  const handleEditMemberSubmit = async (e) => {
    e.preventDefault();
    const nameVal = editName.trim();
    const emailVal = editEmail.trim();
    const phoneVal = editPhone.trim();

    if (!nameVal) {
      setEditMemberError("Member Name is required");
      return;
    }

    if (!editingMember) return;

    // Check duplicate name within current group (excluding editing member)
    const isDuplicate = members.some(
      (m) =>
        String(m.id) !== String(editingMember.id) &&
        (m.member_name || m.name || "").toLowerCase() === nameVal.toLowerCase()
    );
    if (isDuplicate) {
      setEditMemberError("Member already exists");
      return;
    }

    setEditMemberError("");
    setIsSavingMember(true);

    try {
      if (groupId) {
        await updateMember(groupId, editingMember.id, {
          member_name: nameVal,
          member_email: emailVal,
          phone: phoneVal,
        });
      }

      // Optimistically update local state after successful response
      setMembers((prev) =>
        prev.map((m) =>
          String(m.id) === String(editingMember.id)
            ? {
                ...m,
                member_name: nameVal,
                member_email: emailVal,
                phone: phoneVal,
              }
            : m
        )
      );

      showToast("Member updated successfully.", "success");
      setIsEditMemberModalOpen(false);
      setEditingMember(null);
    } catch (err) {
      console.error("Failed to update member:", err);
      setEditMemberError(parseError(err));
    } finally {
      setIsSavingMember(false);
    }
  };

  // Delete Member Handler
  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete) return;
    const mName = memberToDelete.member_name || memberToDelete.name || "Member";
    setIsDeletingMember(true);

    try {
      if (groupId) {
        await removeMember(groupId, memberToDelete.id);
      }

      // Optimistically update local state & Total Members count
      setMembers((prev) => prev.filter((m) => String(m.id) !== String(memberToDelete.id)));

      setTimeline((prev) => [
        {
          id: `t-${Date.now()}`,
          user: "You",
          action: `removed ${mName}`,
          time: "Just now",
          icon: "🗑️",
        },
        ...prev,
      ]);

      showToast("Member removed successfully.", "success");
      setMemberToDelete(null);
    } catch (err) {
      console.error("Failed to delete member:", err);
      showToast(parseError(err), "error");
    } finally {
      setIsDeletingMember(false);
    }
  };

  // Delete Group Handler
  const handleDeleteGroupAction = async () => {
    try {
      if (groupId) {
        await deleteGroup(groupId);
      }
      showToast("Group deleted successfully", "success");
      navigate("/expenses");
    } catch (err) {
      console.error("Failed to delete group:", err);
      showToast("Failed to delete group", "error");
    }
  };

  // Save Edit Group Details
  const handleSaveGroupDetails = async (updatedFields) => {
    if (!group) return;
    try {
      const updated = await updateGroup(group.id, updatedFields);
      if (updated) {
        setGroup(updated);
        showToast("Group updated successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to update group:", err);
      showToast("Failed to update group", "error");
    }
  };

  const groupTheme = getGroupColorTheme(group?.color || group?.theme_color);

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 ${
              toast.type === "error"
                ? "border-rose-500/40 text-slate-900 dark:text-white"
                : "border-emerald-500/40 text-slate-900 dark:text-white"
            }`}
          >
            <div className={`p-1.5 rounded-xl text-white ${toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"}`}>
              {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <span className="text-xs font-extrabold">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: "", type: "success" })}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className={`w-13 h-13 rounded-2xl ${groupTheme.bg} ${groupTheme.shadow} text-white text-2xl flex items-center justify-center shadow-lg border border-white/20 shrink-0`}>
              {group?.icon || "🏠"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {group?.name || "Group"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60">
                  {members.length} {members.length === 1 ? "Member" : "Members"}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {group?.description || "Shared group expense management and settlement tracking."}
              </p>
            </div>
          </div>
        </div>

        {/* THREE-DOT MENU */}
        <div className="relative self-end sm:self-center">
          <button
            onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Group Actions"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {isGroupMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-30 py-2"
              >
                <button
                  onClick={() => {
                    setIsGroupMenuOpen(false);
                    setIsEditGroupOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>Edit Group</span>
                </button>
                <button
                  onClick={() => {
                    setIsGroupMenuOpen(false);
                    setIsDeleteGroupConfirmOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Group</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MAIN LAYOUT (2-COLUMN GRID: LEFT 65% / RIGHT 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL (65% / 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 space-y-6">
            
            {/* MEMBERS HEADER & SEARCH */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Members</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    {filteredMembers.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Manage group roommates, permissions, and profile contacts
                </p>
              </div>

              {/* SEARCH BOX */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* MEMBER LIST / EMPTY STATE */}
            {isLoading ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">
                Loading members...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-12 px-6 flex flex-col items-center justify-center text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center text-2xl shadow-inner border border-violet-100 dark:border-violet-900/40">
                  👥
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    No members yet
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    {searchQuery
                      ? `No member matches "${searchQuery}". Try clearing your search filter.`
                      : "Invite roommates to start sharing expenses."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsAddModalOpen(true);
                  }}
                  className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-violet-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add First Member</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member, idx) => {
                  const mName = member.member_name || member.name || "Member";
                  const mEmail = member.member_email || member.email || "";
                  const mPhone = member.phone || "";
                  const avatarColorObj = getAvatarColorObj(mName);

                  return (
                    <motion.div
                      key={member.id || idx}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-800/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* CIRCULAR AVATAR WITH INITIALS */}
                        <div className={`w-12 h-12 rounded-2xl ${avatarColorObj.bg} ${avatarColorObj.text} font-black text-sm flex items-center justify-center shadow-md shrink-0 border border-white/20`}>
                          {getInitials(mName)}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                              {mName}
                            </h4>

                            {/* ADMIN BADGE FOR CREATOR */}
                            {idx === 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                                <ShieldCheck className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{mEmail ? mEmail : "No email"}</span>
                            </span>
                            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{mPhone ? mPhone : "No phone"}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                        {member.created_at && (
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(member.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </span>
                        )}

                        {/* HOVER ACTION BUTTONS: EDIT & DELETE */}
                        <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditMember(member)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-950/80 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                            title="Edit Member"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setMemberToDelete(member)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/80 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                            title="Remove Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* LARGE ADD MEMBER BUTTON AT BOTTOM */}
            <div className="pt-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 text-white font-black text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>Add Member</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (35% / 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* GROUP SUMMARY CARD */}
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 space-y-5">
            <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-between">
              <span>Group Summary</span>
              <span className={`w-8 h-8 rounded-xl ${groupTheme.bg} text-white flex items-center justify-center text-sm shadow-md`}>
                {group?.icon || "🏠"}
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Members</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {members.length}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</span>
                <p className="text-sm font-black text-violet-600 dark:text-violet-400 mt-1 truncate">
                  {group?.category || group?.type || "Home"}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Created Date</span>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                  {group?.createdAt ? new Date(group.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently"}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Theme Color</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-4 h-4 rounded-full ${groupTheme.bg}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{groupTheme.id}</span>
                </div>
              </div>
            </div>

            {/* UPCOMING FEATURES (DISABLED PLACEHOLDERS) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Upcoming Features
              </span>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Receipt className="w-4 h-4 text-violet-500" />
                    <span>Shared Expenses</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-200 dark:bg-slate-700 text-slate-500 uppercase">
                    Soon
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span>Settlements</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-200 dark:bg-slate-700 text-slate-500 uppercase">
                    Soon
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <PieChart className="w-4 h-4 text-sky-500" />
                    <span>Analytics</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-200 dark:bg-slate-700 text-slate-500 uppercase">
                    Soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVITY TIMELINE */}
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>Activity Timeline</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Recent</span>
            </div>

            <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {timeline.map((item) => (
                <div key={item.id} className="relative flex items-start justify-between gap-2">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-violet-600 border-2 border-white dark:border-slate-900 ring-2 ring-violet-500/20" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      <span className="text-violet-600 dark:text-violet-400">{item.user}</span> {item.action}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ADD MEMBER MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
            >
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white flex items-center justify-center text-xl shadow-lg shadow-violet-500/25 border border-white/20">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Add New Member
                    </h3>
                    <p className="text-xs font-semibold text-slate-400">
                      Invite a roommate to join {group?.name || "Group"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddMemberSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Member Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vishal, Hari, Balaji..."
                    value={addName}
                    onChange={(e) => {
                      setAddName(e.target.value);
                      if (e.target.value.trim()) setNameError("");
                    }}
                    className={`w-full px-4 py-3 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border ${
                      nameError ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                    } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all`}
                  />
                  {nameError && (
                    <span className="text-[11px] font-bold text-rose-500 mt-1 block">
                      {nameError}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. member@gmail.com"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MEMBER MODAL */}
      <AnimatePresence>
        {isEditMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
            >
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white flex items-center justify-center text-lg shadow-md">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Member</h3>
                    <p className="text-xs text-slate-400 font-semibold">Modify member details</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditMemberModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditMemberSubmit} className="p-6 space-y-4">
                {editMemberError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{editMemberError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Member Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (editMemberError) setEditMemberError("");
                    }}
                    className="w-full px-4 py-3 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditMemberModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingMember}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-violet-500/25 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingMember ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MEMBER CONFIRMATION DIALOG */}
      <AnimatePresence>
        {memberToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Delete Member
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to remove this member from the group?
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMemberToDelete(null)}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingMember}
                  onClick={handleConfirmDeleteMember}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-lg shadow-rose-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {isDeletingMember ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE GROUP CONFIRMATION OVERLAY */}
      <AnimatePresence>
        {isDeleteGroupConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Delete Group?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to delete <strong>"{group?.name || "Group"}"</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteGroupConfirmOpen(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-2xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteGroupAction}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-lg shadow-rose-500/25 cursor-pointer"
                >
                  Delete Group
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT GROUP MODAL */}
      <EditGroupModal
        isOpen={isEditGroupOpen}
        onClose={() => setIsEditGroupOpen(false)}
        group={group}
        onSave={handleSaveGroupDetails}
        onDelete={handleDeleteGroupAction}
      />
    </div>
  );
}
