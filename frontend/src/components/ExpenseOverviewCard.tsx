import React from "react";
import { FileText, Utensils, ShoppingBag, Home, Receipt, Plane, Film, Stethoscope, Tag, GraduationCap, Layers } from "lucide-react";
import { Member, Account } from "../types/expense";

interface ExpenseOverviewCardProps {
  title: string;
  amount: string;
  category: string;
  description: string;
  date: string;
  paidBy: number | "";
  paidFromAccount: number | "";
  splitMethod: string;
  membersList: Member[];
  accountsList: Account[];
  errors: { [key: string]: string };
  setTitle: (val: string) => void;
  setAmount: (val: string) => void;
  setCategory: (val: string) => void;
  setDescription: (val: string) => void;
  setDate: (val: string) => void;
  setPaidBy: (val: number) => void;
  setPaidFromAccount: (val: number) => void;
  setSplitMethod: (val: string) => void;
}

const CATEGORIES = [
  { name: "Food", icon: Utensils },
  { name: "Groceries", icon: ShoppingBag },
  { name: "Rent", icon: Home },
  { name: "Bills", icon: Receipt },
  { name: "Travel", icon: Plane },
  { name: "Entertainment", icon: Film },
  { name: "Medical", icon: Stethoscope },
  { name: "Shopping", icon: Tag },
  { name: "Education", icon: GraduationCap },
  { name: "Others", icon: Layers },
];

export const ExpenseOverviewCard: React.FC<ExpenseOverviewCardProps> = ({
  title,
  amount,
  category,
  description,
  date,
  paidBy,
  paidFromAccount,
  splitMethod,
  membersList,
  accountsList,
  errors,
  setTitle,
  setAmount,
  setCategory,
  setDescription,
  setDate,
  setPaidBy,
  setPaidFromAccount,
  setSplitMethod,
}) => {
  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-violet-400 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        <span>Expense Overview</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Expense Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dinner & Drinks"
            className={`w-full px-4 py-3 rounded-2xl bg-slate-950 border ${
              errors.title ? "border-rose-500" : "border-slate-800"
            } text-sm font-bold text-white focus:outline-none focus:border-violet-500 transition-all`}
          />
          {errors.title && <span className="text-[11px] font-bold text-rose-400">{errors.title}</span>}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-violet-500 transition-all"
          >
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Paid By Member */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Paid By *</label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(Number(e.target.value))}
            className={`w-full px-4 py-3 rounded-2xl bg-slate-950 border ${
              errors.paidBy ? "border-rose-500" : "border-slate-800"
            } text-sm font-bold text-white focus:outline-none focus:border-violet-500 transition-all`}
          >
            {membersList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.member_name} (ID: {m.id})
              </option>
            ))}
          </select>
          {errors.paidBy && <span className="text-[11px] font-bold text-rose-400">{errors.paidBy}</span>}
        </div>

        {/* Payment Account */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Payment Account</label>
          <select
            value={paidFromAccount}
            onChange={(e) => setPaidFromAccount(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-violet-500 transition-all"
          >
            {accountsList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Expense Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-violet-500 transition-all"
          />
        </div>

        {/* Split Method */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Split Method</label>
          <select
            value={splitMethod}
            onChange={(e) => setSplitMethod(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-violet-500 transition-all"
          >
            <option value="Item-wise">Item-wise Split</option>
            <option value="Equal">Equal Split</option>
            <option value="Percentage">Percentage Split</option>
            <option value="Custom">Custom Split</option>
          </select>
        </div>
      </div>

      {/* Total Amount (For Non Item-wise Split) */}
      {splitMethod !== "Item-wise" && (
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-300 block">Total Amount (₹) *</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`w-full px-4 py-3 rounded-2xl bg-slate-950 border ${
              errors.amount ? "border-rose-500" : "border-slate-800"
            } text-lg font-black text-white focus:outline-none focus:border-violet-500 transition-all`}
          />
        </div>
      )}

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-300 block">Description / Notes</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details about this expense..."
          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-medium text-white focus:outline-none focus:border-violet-500 transition-all"
        />
      </div>
    </div>
  );
};
