import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Palette, Trash2, AlertTriangle } from "lucide-react";

export const COLOR_OPTIONS = [
  { id: "violet", name: "Violet Indigo", bg: "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600", shadow: "shadow-violet-500/25", border: "border-violet-500/40", text: "text-violet-600 dark:text-violet-400" },
  { id: "emerald", name: "Emerald Teal", bg: "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600", shadow: "shadow-emerald-500/25", border: "border-emerald-500/40", text: "text-emerald-600 dark:text-emerald-400" },
  { id: "amber", name: "Amber Sun", bg: "bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-500", shadow: "shadow-amber-500/25", border: "border-amber-500/40", text: "text-amber-600 dark:text-amber-400" },
  { id: "rose", name: "Rose Passion", bg: "bg-gradient-to-br from-rose-600 via-pink-600 to-red-500", shadow: "shadow-rose-500/25", border: "border-rose-500/40", text: "text-rose-600 dark:text-rose-400" },
  { id: "sky", name: "Ocean Sky", bg: "bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600", shadow: "shadow-sky-500/25", border: "border-sky-500/40", text: "text-sky-600 dark:text-sky-400" },
  { id: "purple", name: "Royal Purple", bg: "bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600", shadow: "shadow-purple-500/25", border: "border-purple-500/40", text: "text-purple-600 dark:text-purple-400" },
  { id: "dark", name: "Midnight Obsidian", bg: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900", shadow: "shadow-slate-500/25", border: "border-slate-500/40", text: "text-slate-700 dark:text-slate-300" },
];

export const ICON_PRESETS = [
  "🏠", "🏖", "💼", "🍕", "✈️", "🛒", "🎮", "🚗", "🏋️", "⚡", "🍿", "🎓", "🐶", "⚽", "🍔", "☕", "🎉", "💡"
];

export const getGroupColorTheme = (colorId) => {
  return COLOR_OPTIONS.find((c) => c.id === colorId) || COLOR_OPTIONS[0];
};

export default function EditGroupModal({ isOpen, onClose, group, onSave, onDelete }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🏠");
  const [color, setColor] = useState("violet");
  const [customIcon, setCustomIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
      setIcon(group.icon || "🏠");
      setColor(group.color || "violet");
    }
  }, [group, isOpen]);

  if (!isOpen) return null;

  const activeTheme = getGroupColorTheme(color);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const finalIcon = customIcon.trim() ? customIcon.trim() : icon;
    
    await onSave({
      name: name.trim(),
      description: description.trim(),
      icon: finalIcon,
      color,
    });
    
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
        >
          {/* MODAL HEADER */}
          <div className="relative p-6 pb-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl ${activeTheme.bg} ${activeTheme.shadow} text-white flex items-center justify-center text-xl shadow-lg border border-white/20`}>
                {customIcon.trim() ? customIcon.trim() : icon}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Edit Group Details
                </h2>
                <p className="text-xs font-semibold text-slate-400">
                  Customize name, icon, theme, and description
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
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                placeholder="e.g. Bachelor Room, Goa Trip"
                className="w-full px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span>Choose Group Icon</span>
                </label>
              </div>

              <div className="grid grid-cols-6 gap-2 mb-3">
                {ICON_PRESETS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setIcon(item);
                      setCustomIcon("");
                    }}
                    className={`h-11 rounded-2xl text-xl flex items-center justify-center transition-all cursor-pointer border ${
                      icon === item && !customIcon.trim()
                        ? "bg-violet-100 dark:bg-violet-950/80 border-violet-500 scale-105 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* CUSTOM EMOJI INPUT */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={customIcon}
                  onChange={(e) => setCustomIcon(e.target.value)}
                  placeholder="Or type custom emoji..."
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            {/* ACCENT COLOR PALETTE */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-violet-500" />
                <span>Color Theme</span>
              </label>

              <div className="grid grid-cols-7 gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    title={c.name}
                    className={`h-10 rounded-2xl ${c.bg} flex items-center justify-center text-white transition-all cursor-pointer shadow-sm relative ${
                      color === c.id ? "scale-110 ring-2 ring-offset-2 ring-slate-900 dark:ring-white z-10" : "hover:scale-105 opacity-85 hover:opacity-100"
                    }`}
                  >
                    {color === c.id && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm border border-rose-200/80 dark:border-rose-800/60 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Group</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>

      {/* DELETE GROUP CONFIRMATION OVERLAY */}
      {isDeleteConfirmOpen && (
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
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Group?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <strong>"{group?.name}"</strong>? All expenses in this group will be deleted.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsDeleteConfirmOpen(false);
                  onClose();
                  if (onDelete) await onDelete(group?.id);
                }}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-500/25 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
