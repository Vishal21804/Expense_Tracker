import React from "react";
import { Trash2 } from "lucide-react";
import { Consumer, Member } from "../types/expense";

interface ConsumerRowProps {
  consumer: Consumer;
  membersList: Member[];
  onMemberChange: (memberId: number) => void;
  onQuantityChange: (qty: number) => void;
  onDelete: () => void;
  formatCurrency: (amt: number) => string;
}

export const ConsumerRow: React.FC<ConsumerRowProps> = ({
  consumer,
  membersList,
  onMemberChange,
  onQuantityChange,
  onDelete,
  formatCurrency,
}) => {
  return (
    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      {/* Member Selection */}
      <div className="w-full sm:w-1/2 space-y-1">
        <label className="text-[10px] font-bold text-slate-400 block">Consumer Name</label>
        <select
          value={consumer.member_id}
          onChange={(e) => onMemberChange(Number(e.target.value))}
          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-bold text-white text-xs focus:outline-none focus:border-violet-500"
        >
          {membersList.map((m) => (
            <option key={m.id} value={m.id}>
              {m.member_name}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity Consumed */}
      <div className="w-full sm:w-1/4 space-y-1">
        <label className="text-[10px] font-bold text-slate-400 block">Qty Consumed</label>
        <input
          type="number"
          min="1"
          value={consumer.quantity_consumed || ""}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-bold text-white text-xs focus:outline-none focus:border-violet-500"
        />
      </div>

      {/* Amount & Delete */}
      <div className="w-full sm:w-1/4 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block">Amount</span>
          <span className="font-black text-emerald-400">{formatCurrency(consumer.amount)}</span>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors cursor-pointer"
          title="Delete Consumer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
