import React from "react";
import { Save, Loader2 } from "lucide-react";

interface StickyFooterProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({ isSubmitting, onCancel }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg shadow-violet-500/25 transition-all ${
            isSubmitting
              ? "bg-slate-700 opacity-60 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 hover:shadow-violet-500/40 cursor-pointer"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Update Expense</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
