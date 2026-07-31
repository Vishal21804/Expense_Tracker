import React from "react";
import { Receipt, Users, ShoppingBag } from "lucide-react";
import { Item } from "../types/expense";

interface ExpenseSummaryProps {
  items: Item[];
  totalAmount: number;
  formatCurrency: (amt: number) => string;
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  items,
  totalAmount,
  formatCurrency,
}) => {
  const uniqueConsumers = new Set<number>();
  items.forEach((item) => {
    item.consumers.forEach((c) => uniqueConsumers.add(c.member_id));
  });

  return (
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-violet-400 flex items-center gap-2">
        <Receipt className="w-4 h-4" />
        <span>Expense Summary</span>
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {/* Total Items */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Items</span>
          <div className="flex items-center justify-center gap-1 text-base font-black text-white">
            <ShoppingBag className="w-4 h-4 text-violet-400" />
            <span>{items.length}</span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grand Total</span>
          <span className="text-base font-black text-emerald-400 block">{formatCurrency(totalAmount)}</span>
        </div>

        {/* Consumers */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consumers</span>
          <div className="flex items-center justify-center gap-1 text-base font-black text-white">
            <Users className="w-4 h-4 text-sky-400" />
            <span>{uniqueConsumers.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
