import React from "react";
import { AnimatePresence } from "framer-motion";
import { Utensils, Plus, ShoppingBag } from "lucide-react";
import { Item, Member } from "../types/expense";
import { ItemCard } from "./ItemCard";

interface ItemBreakdownProps {
  items: Item[];
  membersList: Member[];
  computedTotalAmount: number;
  onAddItem: () => void;
  onDeleteItem: (idx: number) => void;
  onItemChange: (idx: number, field: keyof Item, value: any) => void;
  onConsumerMemberChange: (itemIdx: number, consumerIdx: number, memberId: number) => void;
  onConsumerQtyChange: (itemIdx: number, consumerIdx: number, qty: number) => void;
  onAddConsumer: (itemIdx: number) => void;
  onDeleteConsumer: (itemIdx: number, consumerIdx: number) => void;
  formatCurrency: (amt: number) => string;
}

export const ItemBreakdown: React.FC<ItemBreakdownProps> = ({
  items,
  membersList,
  computedTotalAmount,
  onAddItem,
  onDeleteItem,
  onItemChange,
  onConsumerMemberChange,
  onConsumerQtyChange,
  onAddConsumer,
  onDeleteConsumer,
  formatCurrency,
}) => {
  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-violet-400 flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            <span>Itemized Consumption Builder</span>
          </h3>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Build exact items, unit prices, quantities, and participant consumption
          </p>
        </div>

        <button
          type="button"
          onClick={onAddItem}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* COMPUTED TOTAL EXPENSE DISPLAY */}
      <div className="p-4 rounded-2xl bg-violet-950/40 border border-violet-800/60 flex items-center justify-between">
        <span className="text-xs font-bold text-violet-300">Computed Expense Total</span>
        <span className="text-xl font-black text-white">{formatCurrency(computedTotalAmount)}</span>
      </div>

      {/* EMPTY STATE */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">No items added yet</h4>
          <p className="text-xs text-slate-400 max-w-xs">Add your first item to build an itemized split for this expense.</p>
          <button
            type="button"
            onClick={onAddItem}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs shadow-md"
          >
            + Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {items.map((item, itemIdx) => (
              <ItemCard
                key={itemIdx}
                item={item}
                itemIdx={itemIdx}
                membersList={membersList}
                onItemChange={(field, val) => onItemChange(itemIdx, field, val)}
                onDeleteItem={() => onDeleteItem(itemIdx)}
                onConsumerMemberChange={(cIdx, mId) => onConsumerMemberChange(itemIdx, cIdx, mId)}
                onConsumerQtyChange={(cIdx, qty) => onConsumerQtyChange(itemIdx, cIdx, qty)}
                onAddConsumer={() => onAddConsumer(itemIdx)}
                onDeleteConsumer={(cIdx) => onDeleteConsumer(itemIdx, cIdx)}
                formatCurrency={formatCurrency}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
