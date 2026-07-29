import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check, Sparkles, Palette, Users, Trash2, FolderPlus } from "lucide-react";
import { COLOR_OPTIONS, ICON_PRESETS, getGroupColorTheme } from "./EditGroupModal";
import { getInitials } from "./EditParticipantsModal";

const GROUP_TYPES = [
  { name: "Home", icon: "🏠" },
  { name: "Travel", icon: "🏖" },
  { name: "Work", icon: "💼" },
  { name: "Event", icon: "🎉" },
  { name: "Food", icon: "🍕" },
  { name: "General", icon: "⚡" },
];

export default function CreateGroupModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Home");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🏠");
  const [customIcon, setCustomIcon] = useState("");
  const [color, setColor] = useState("violet");

  // Initial participants - default to ONLY user "Me (You)"
  const [participants, setParticipants] = useState([
    { id: "me", name: "Me (You)", avatar: "ME", email: "me@vaultflow.io" },
  ]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setType("Home");
      setIcon("🏠");
      setColor("violet");
      setDescription("");
      setCustomIcon("");
      setParticipants([
        { id: "me", name: "Me (You)", avatar: "ME", email: "me@vaultflow.io" },
      ]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeTheme = getGroupColorTheme(color);

  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;
    const trimmed = newParticipantName.trim();
    const newMember = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: trimmed,
      avatar: getInitials(trimmed),
      email: `${trimmed.toLowerCase().replace(/\s+/g, ".")}@vaultflow.io`,
    };
    setParticipants([...participants, newMember]);
    setNewParticipantName("");
  };

  const handleRemoveParticipant = (id) => {
    if (participants.length <= 1) {
      alert("A group must have at least 1 participant.");
      return;
    }
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const finalIcon = customIcon.trim() ? customIcon.trim() : icon;

    const newGroup = await onCreate({
      name: name.trim(),
      type,
      category: type,
      description: description.trim(),
      icon: finalIcon,
      color,
      theme_color: color,
      members: participants,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md overflow-y-auto">
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
              <div className={`w-12 h-12 rounded-2xl ${activeTheme.bg} ${activeTheme.shadow} text-white flex items-center justify-center text-xl shadow-lg border border-white/20`}>
                <FolderPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Create New Group
                </h2>
                <p className="text-xs font-semibold text-slate-400">
                  Set up a shared expense group & add participants
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

          {/* FORM BODY */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* GROUP NAME */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Group Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bachelor Room, Goa Trip, Apartment 4B"
                className="w-full px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            {/* GROUP TYPE */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Group Category / Type
              </label>
              <div className="flex flex-wrap gap-2">
                {GROUP_TYPES.map((gt) => (
                  <button
                    key={gt.name}
                    type="button"
                    onClick={() => {
                      setType(gt.name);
                      setIcon(gt.icon);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      type === gt.name
                        ? "bg-violet-100 dark:bg-violet-950/80 border-violet-500 text-violet-700 dark:text-violet-300 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <span>{gt.icon}</span>
                    <span>{gt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* GROUP DESCRIPTION */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of group expenses and notes..."
                className="w-full px-4 py-2.5 rounded-2xl text-sm font-medium text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
              />
            </div>

            {/* ICON SELECTOR */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                <span>Group Icon</span>
              </label>

              <div className="grid grid-cols-6 gap-2 mb-2.5">
                {ICON_PRESETS.slice(0, 12).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setIcon(item);
                      setCustomIcon("");
                    }}
                    className={`h-10 rounded-2xl text-lg flex items-center justify-center transition-all cursor-pointer border ${
                      icon === item && !customIcon.trim()
                        ? "bg-violet-100 dark:bg-violet-950/80 border-violet-500 scale-105 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <input
                type="text"
                maxLength={4}
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                placeholder="Or type custom emoji icon..."
                className="w-full px-3.5 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>

            {/* ACCENT COLOR PALETTE */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-violet-500" />
                <span>Color Theme Gradient</span>
              </label>

              <div className="grid grid-cols-7 gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    title={c.name}
                    className={`h-9 rounded-2xl ${c.bg} flex items-center justify-center text-white transition-all cursor-pointer shadow-sm relative ${
                      color === c.id ? "scale-110 ring-2 ring-offset-2 ring-slate-900 dark:ring-white z-10" : "hover:scale-105 opacity-85 hover:opacity-100"
                    }`}
                  >
                    {color === c.id && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* INITIAL PARTICIPANTS SECTION */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-violet-500" />
                  <span>Initial Participants ({participants.length})</span>
                </label>
              </div>

              {/* ADD PARTICIPANT INPUT ROW */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  placeholder="Add member name (e.g. Balaji)..."
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-violet-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  disabled={!newParticipantName.trim()}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs shadow-sm hover:bg-violet-700 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add</span>
                </button>
              </div>

              {/* PARTICIPANTS CHIPS */}
              <div className="flex flex-wrap gap-2 pt-1">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white text-[9px] font-black flex items-center justify-center">
                      {p.avatar}
                    </div>
                    <span>{p.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(p.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || participants.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Creating Group...</span>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4" />
                    <span>Create Group</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
