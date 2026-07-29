import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Pencil, Trash2, Check, UserPlus, Users, Upload, Camera, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { addMember, removeMember } from "../services/groupsApi";

export const AVATAR_PRESETS = [
  "👨‍💻", "👩", "🧔", "👦", "👧", "🧑‍🍳", "🐱", "🦊", "🐶", "🚀", "👑", "⚡", "🍕", "🎯", "🎨", "🕶️", "🎧", "🌟"
];

// Helper to compute initials
export const getInitials = (name) => {
  if (!name) return "PA";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.trim().substring(0, 2).toUpperCase();
};

export default function EditParticipantsModal({ isOpen, onClose, group, onSave }) {
  const [membersList, setMembersList] = useState([]);
  const [newName, setNewName] = useState("");
  const [newAvatarEmoji, setNewAvatarEmoji] = useState("👨‍💻");
  const [newAvatarUrl, setNewAvatarUrl] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingNameText, setEditingNameText] = useState("");
  const [activeAvatarPickerId, setActiveAvatarPickerId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const [uploadTargetId, setUploadTargetId] = useState(null);

  useEffect(() => {
    if (group && Array.isArray(group.members)) {
      setMembersList(
        group.members.map((m) => ({
          id: m.id || `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: m.name || "Participant",
          avatar: m.avatar || getInitials(m.name),
          avatarEmoji: m.avatarEmoji || (AVATAR_PRESETS.includes(m.avatar) ? m.avatar : null),
          avatarUrl: m.avatarUrl || null,
          email: m.email || `${(m.name || "user").toLowerCase().replace(/\s+/g, ".")}@vaultflow.io`,
        }))
      );
    }
  }, [group, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e, targetId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      if (targetId === "new") {
        setNewAvatarUrl(dataUrl);
      } else {
        setMembersList(
          membersList.map((m) => (m.id === targetId ? { ...m, avatarUrl: dataUrl, avatarEmoji: null } : m))
        );
      }
      setActiveAvatarPickerId(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerImageUpload = (targetId) => {
    setUploadTargetId(targetId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const [errorMessage, setErrorMessage] = useState("");

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setErrorMessage("");
    const trimmed = newName.trim();
    const email = trimmed.includes("@")
      ? trimmed
      : `${trimmed.toLowerCase().replace(/\s+/g, ".")}@vaultflow.io`;

    if (group?.id) {
      try {
        await addMember(group.id, email);
      } catch (err) {
        console.error("POST /members error:", err);
        setErrorMessage(err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to add member");
        return;
      }
    }

    const newMember = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: trimmed.includes("@") ? trimmed.split("@")[0] : trimmed,
      avatar: getInitials(trimmed),
      avatarEmoji: newAvatarUrl ? null : newAvatarEmoji,
      avatarUrl: newAvatarUrl || null,
      email: email,
    };

    setMembersList([...membersList, newMember]);
    setNewName("");
    setNewAvatarUrl(null);
    setNewAvatarEmoji("👨‍💻");
  };

  const handleStartEditName = (member) => {
    setEditingId(member.id);
    setEditingNameText(member.name);
  };

  const handleSaveName = (id) => {
    if (!editingNameText.trim()) return;
    setMembersList(
      membersList.map((m) => {
        if (m.id === id) {
          const trimmed = editingNameText.trim();
          return {
            ...m,
            name: trimmed,
            avatar: getInitials(trimmed),
          };
        }
        return m;
      })
    );
    setEditingId(null);
  };

  const handleSelectAvatarEmoji = (memberId, emoji) => {
    setMembersList(
      membersList.map((m) => {
        if (m.id === memberId) {
          return { ...m, avatarEmoji: emoji, avatarUrl: null };
        }
        return m;
      })
    );
    setActiveAvatarPickerId(null);
  };

  const handleRemoveParticipant = async (id) => {
    if (membersList.length <= 1) {
      alert("A group must have at least 1 participant.");
      return;
    }

    if (!window.confirm("Are you sure you want to remove this member from the group?")) {
      return;
    }

    if (group?.id) {
      try {
        await removeMember(group.id, id);
      } catch (err) {
        console.error("DELETE /members error:", err);
        setErrorMessage(err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to remove member");
        return;
      }
    }

    setMembersList(membersList.filter((m) => m.id !== id));
  };

  const handleSubmit = async () => {
    if (membersList.length === 0) return;
    setIsSubmitting(true);
    await onSave(membersList);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e, uploadTargetId)}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
        >
          {/* HEADER */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/25 border border-violet-400/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Edit Participants
                </h2>
                <p className="text-xs font-semibold text-slate-400">
                  Manage members & custom profile pictures for {group?.name || "Group"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center justify-between">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage("")} className="p-1 hover:bg-rose-100 rounded-lg">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {/* ADD NEW PARTICIPANT ROW */}
            <form onSubmit={handleAddParticipant} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-violet-500" />
                <span>Add New Participant</span>
              </span>

              <div className="flex items-center gap-2">
                {/* NEW AVATAR SELECTOR / UPLOADER */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveAvatarPickerId(activeAvatarPickerId === "new" ? null : "new")}
                    className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg shadow-xs hover:border-violet-500 cursor-pointer shrink-0 overflow-hidden"
                    title="Choose Avatar Profile Picture"
                  >
                    {newAvatarUrl ? (
                      <img src={newAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      newAvatarEmoji
                    )}
                  </button>

                  {activeAvatarPickerId === "new" && (
                    <div className="absolute left-0 top-13 z-30 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl w-60 space-y-2">
                      <button
                        type="button"
                        onClick={() => triggerImageUpload("new")}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 text-violet-600 dark:text-violet-300 font-bold text-xs border border-violet-200 dark:border-violet-800/60 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Or Pick Icon</div>
                      <div className="grid grid-cols-6 gap-1">
                        {AVATAR_PRESETS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setNewAvatarEmoji(emoji);
                              setNewAvatarUrl(null);
                              setActiveAvatarPickerId(null);
                            }}
                            className="h-8 rounded-lg hover:bg-violet-100 dark:hover:bg-slate-700 text-base flex items-center justify-center"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter participant full name..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-violet-500 transition-all"
                />

                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 disabled:opacity-50 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add</span>
                </button>
              </div>
            </form>

            {/* PARTICIPANTS LIST */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
                Current Participants ({membersList.length})
              </span>

              {membersList.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 flex items-center justify-between gap-3 shadow-xs hover:border-violet-300 dark:hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* AVATAR BADGE / PHOTO / PICKER */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveAvatarPickerId(activeAvatarPickerId === m.id ? null : m.id)}
                        className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-xs cursor-pointer hover:scale-105 transition-transform overflow-hidden relative group"
                        title="Click to change photo or icon"
                      >
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                        ) : m.avatarEmoji ? (
                          <span className="text-lg">{m.avatarEmoji}</span>
                        ) : (
                          <span>{m.avatar}</span>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity">
                          <Camera className="w-3.5 h-3.5" />
                        </div>
                      </button>

                      {/* AVATAR POPPER */}
                      {activeAvatarPickerId === m.id && (
                        <div className="absolute left-0 top-13 z-30 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl w-60 space-y-2">
                          <button
                            type="button"
                            onClick={() => triggerImageUpload(m.id)}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 text-violet-600 dark:text-violet-300 font-bold text-xs border border-violet-200 dark:border-violet-800/60 transition-all cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Custom Photo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMembersList(
                                membersList.map((item) => (item.id === m.id ? { ...item, avatarUrl: null, avatarEmoji: null } : item))
                              );
                              setActiveAvatarPickerId(null);
                            }}
                            className="w-full text-[11px] font-bold text-slate-600 dark:text-slate-300 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-center block"
                          >
                            Use Text Initials ({m.avatar})
                          </button>

                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center pt-1 border-t border-slate-100 dark:border-slate-700">Or Pick Icon</div>
                          <div className="grid grid-cols-6 gap-1">
                            {AVATAR_PRESETS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleSelectAvatarEmoji(m.id, emoji)}
                                className="h-8 rounded-lg hover:bg-violet-100 dark:hover:bg-slate-700 text-base flex items-center justify-center"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NAME INLINE EDIT OR DISPLAY */}
                    {editingId === m.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          autoFocus
                          value={editingNameText}
                          onChange={(e) => setEditingNameText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveName(m.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border border-violet-500 rounded-xl focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveName(m.id)}
                          className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {m.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEditName(m)}
                            className="p-1 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Edit Name"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 truncate block">
                          {m.email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* REMOVE BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(m.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                    title="Remove Participant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || membersList.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Participants</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
