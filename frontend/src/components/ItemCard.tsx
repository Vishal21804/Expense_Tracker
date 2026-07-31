import React from "react";
import { motion } from "framer-motion";
import { Trash2, Users, UserPlus } from "lucide-react";
import { Item, Member } from "../types/expense";
import { ConsumerRow } from "./ConsumerRow";

interface ItemCardProps {
  item: Item;
  itemIdx: number;
  membersList: Member[];
  onItemChange: (field: keyof Item, value: any) => void;
  onDeleteItem: () => void;
  onConsumerMemberChange: (consumerIdx: number, memberId: number) => void;
  onConsumerQtyChange: (consumerIdx: number, qty: number) => void;
  onAddConsumer: () => void;
  onDeleteConsumer: (consumerIdx: number) => void;
  formatCurrency: (amt: number) => string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  itemIdx,
  membersList,
  onItemChange,
  onDeleteItem,
  onConsumerMemberChange,
  onConsumerQtyChange,
  onAddConsumer,
  onDeleteConsumer,
  formatCurrency,
}) => {
  const totalConsumedQty = item.consumers.reduce((sum, c) => sum + (c.quantity_consumed || 0), 0);
  const qtyMismatch = totalConsumedQty !== item.quantity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 relative shadow-lg"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-violet-400 uppercase tracking-wider">
            Item #{itemIdx + 1}
          </span>
          {qtyMismatch && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">
              Consumed Qty ({totalConsumedQty}) ≠ Item Qty ({item.quantity})
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onDeleteItem}
          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors cursor-pointer"
          title="Delete Item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* INPUT FIELDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 space-y-1">
          <label className="text-[11px] font-bold text-slate-400 block">Item Name *</label>
          <input
            type="text"
            value={item.item_name}
            onChange={(e) => onItemChange("item_name", e.target.value)}
            placeholder="e.g. Chicken Biryani"
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 block">Unit Price (₹) *</label>
          <input
            type="number"
            step="0.01"
            value={item.unit_price || ""}
            onChange={(e) => onItemChange("unit_price", Number(e.target.value))}
            placeholder="0.00"
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 block">Total Qty *</label>
          <input
            type="number"
            min="1"
            value={item.quantity || ""}
            onChange={(e) => onItemChange("quantity", Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* TOTAL PRICE READ ONLY */}
      <div className="flex justify-end text-xs font-bold text-slate-400 gap-2">
        <span>Item Total:</span>
        <span className="font-black text-white">{formatCurrency(item.total_price)}</span>
      </div>

      {/* CONSUMERS SECTION */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Consumers Breakdown</span>
          </span>

          <button
            type="button"
            onClick={onAddConsumer}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Consumer</span>
          </button>
        </div>

        <div className="space-y-2">
          {item.consumers.map((consumer, cIdx) => (
            <ConsumerRow
              key={cIdx}
              consumer={consumer}
              membersList={membersList}
              onMemberChange={(mId) => onConsumerMemberChange(cIdx, mId)}
              onQuantityChange={(qty) => onConsumerQtyChange(cIdx, qty)}
              onDelete={() => onDeleteConsumer(cIdx)}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
