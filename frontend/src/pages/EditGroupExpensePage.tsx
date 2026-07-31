import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Utensils,
  ShoppingBag,
  Home,
  Receipt,
  Plane,
  Film,
  Stethoscope,
  Tag,
  GraduationCap,
  Layers,
  Upload,
  CheckCircle2,
  Check,
  Building2,
  QrCode,
  Banknote,
  ChevronDown,
  Trash2,
  FileText,
  Smartphone,
  CreditCard,
  Sparkles,
  Users,
  User,
  Clock,
  Plus,
  Minus,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { getExpenseDetails, updateExpense } from "../services/expensesApi";
import { getMembers } from "../services/groupsApi";
import { getAccounts } from "../services/accountsApi";

// Category configurations with icons
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

const DEFAULT_MEMBERS = [
  { id: "m1", member_name: "Alex Morgan", avatar: "AM", icon: User },
  { id: "m2", member_name: "Hari", avatar: "HA", icon: User },
  { id: "m3", member_name: "Balaji", avatar: "BA", icon: User },
  { id: "m4", member_name: "Sedhu", avatar: "SE", icon: User },
];

const ACCOUNTS = [
  { name: "PhonePe", icon: QrCode },
  { name: "Google Pay", icon: Smartphone },
  { name: "Cash", icon: Banknote },
  { name: "HDFC Salary Bank", icon: Building2 },
  { name: "ICICI Credit Card", icon: CreditCard },
];

// Currency Formatter
const formatCurrency = (amount: any) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num);
};

// MODERN CUSTOM DROPDOWN COMPONENT
const CustomSelect: React.FC<any> = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const safeOptions = Array.isArray(options) ? options : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = value
    ? safeOptions.find(
        (opt: any) => (opt?.member_name || opt?.name || opt) === value,
      )
    : null;
  const Icon = selectedOption?.icon;
  const displayName = selectedOption
    ? selectedOption.member_name || selectedOption.name || selectedOption
    : placeholder;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2.5 px-3.5 text-xs text-white bg-[#1F2937] hover:bg-[#263344] rounded-xl border border-slate-700 focus:border-violet-500 focus:outline-none flex items-center justify-between transition-all font-bold shadow-xs cursor-pointer"
      >
        <div className="flex items-center gap-2.5 truncate">
          {Icon ? (
            <Icon className="w-4 h-4 text-violet-400 shrink-0" />
          ) : (
            <Layers className="w-4 h-4 text-slate-500 shrink-0" />
          )}
          <span
            className={`truncate ${!selectedOption ? "text-slate-400 font-semibold" : "text-white"}`}
          >
            {displayName}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-violet-400" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto bg-[#1F2937] border border-slate-700 rounded-2xl shadow-2xl p-1.5 space-y-0.5"
          >
            {safeOptions.map((opt: any, idx: number) => {
              const val = opt?.member_name || opt?.name || opt;
              const OptIcon = opt?.icon || User;
              const isSelected = val === value;

              return (
                <button
                  key={val || idx}
                  type="button"
                  onClick={() => {
                    onChange(val);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-violet-600/30 text-violet-300 font-bold border border-violet-500/40"
                      : "text-slate-200 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {OptIcon && (
                      <OptIcon className="w-4 h-4 text-violet-400 shrink-0" />
                    )}
                    <span className="truncate">{val}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// INTERACTIVE ROUND CLOCK PICKER COMPONENT
const InteractiveClockPicker: React.FC<any> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"hours" | "minutes">("hours");
  const pickerRef = useRef<HTMLDivElement>(null);

  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hours: 12, minutes: 0, period: "PM" };
    const [hStr, mStr] = timeStr.split(":");
    let h = parseInt(hStr, 10);
    if (isNaN(h)) h = 12;
    const m = parseInt(mStr, 10) || 0;
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return { hours: h, minutes: m, period };
  };

  const { hours, minutes, period } = parseTime(value);

  const format24Time = (h: number, m: number, p: string) => {
    let h24 = h;
    if (p === "PM" && h < 12) h24 += 12;
    if (p === "AM" && h === 12) h24 = 0;
    const hFormatted = String(h24).padStart(2, "0");
    const mFormatted = String(m).padStart(2, "0");
    return `${hFormatted}:${mFormatted}`;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHourSelect = (h: number) => {
    const new24 = format24Time(h, minutes, period);
    onChange(new24);
    setMode("minutes");
  };

  const handleMinuteSelect = (m: number) => {
    const new24 = format24Time(hours, m, period);
    onChange(new24);
  };

  const togglePeriod = (p: string) => {
    const new24 = format24Time(hours, minutes, p);
    onChange(new24);
  };

  const currentAngle = mode === "hours" ? (hours % 12) * 30 : minutes * 6;

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div className="w-full py-1 px-3 text-xs text-white bg-[#1F2937] rounded-xl border border-slate-700 focus-within:border-violet-500 flex items-center justify-between transition-all font-bold shadow-xs">
        <input
          type="time"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-white font-bold focus:outline-none cursor-pointer py-1 text-xs"
        />

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Open Round Clock Picker"
          className="p-1 text-violet-400 hover:text-violet-300 hover:bg-slate-700/60 rounded-lg transition-all shrink-0 cursor-pointer"
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
            <div
              className="absolute inset-0"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-[310px] bg-[#111827] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-baseline gap-1 font-black text-2xl text-white">
                  <button
                    type="button"
                    onClick={() => setMode("hours")}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      mode === "hours"
                        ? "bg-violet-600/30 text-violet-400 border border-violet-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {String(hours).padStart(2, "0")}
                  </button>
                  <span className="text-slate-500">:</span>
                  <button
                    type="button"
                    onClick={() => setMode("minutes")}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      mode === "minutes"
                        ? "bg-violet-600/30 text-violet-400 border border-violet-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {String(minutes).padStart(2, "0")}
                  </button>
                </div>

                <div className="flex bg-[#1F2937] p-1 rounded-xl border border-slate-700/80 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => togglePeriod("AM")}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      period === "AM"
                        ? "bg-violet-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePeriod("PM")}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      period === "PM"
                        ? "bg-violet-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              <div className="relative w-56 h-56 mx-auto rounded-full bg-[#1F2937]/70 border border-slate-700/80 flex items-center justify-center shadow-inner">
                <div className="absolute w-2 h-2 rounded-full bg-violet-500 z-20" />
                <div
                  className="absolute bottom-1/2 left-1/2 w-0.5 h-20 bg-gradient-to-t from-violet-500 to-purple-400 origin-bottom z-10 transition-transform duration-200"
                  style={{
                    transform: `translateX(-50%) rotate(${currentAngle}deg)`,
                  }}
                >
                  <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-violet-400 border-2 border-white shadow-md" />
                </div>

                {mode === "hours" ? (
                  <>
                    {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hNum, i) => {
                      const angleRad = ((i * 30 - 90) * Math.PI) / 180;
                      const radius = 88;
                      const x = radius * Math.cos(angleRad);
                      const y = radius * Math.sin(angleRad);
                      const isSelected = hours === hNum;

                      return (
                        <button
                          key={hNum}
                          type="button"
                          onClick={() => handleHourSelect(hNum)}
                          style={{
                            transform: `translate(${x}px, ${y}px)`,
                          }}
                          className={`absolute w-8 h-8 rounded-full text-xs font-black flex items-center justify-center transition-all cursor-pointer z-20 ${
                            isSelected
                              ? "bg-violet-600 text-white shadow-md shadow-violet-500/40 scale-110"
                              : "text-slate-300 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          {hNum}
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(
                      (mNum, i) => {
                        const angleRad = ((i * 30 - 90) * Math.PI) / 180;
                        const radius = 88;
                        const x = radius * Math.cos(angleRad);
                        const y = radius * Math.sin(angleRad);
                        const isSelected = minutes === mNum;

                        return (
                          <button
                            key={mNum}
                            type="button"
                            onClick={() => handleMinuteSelect(mNum)}
                            style={{
                              transform: `translate(${x}px, ${y}px)`,
                            }}
                            className={`absolute w-8 h-8 rounded-full text-xs font-black flex items-center justify-center transition-all cursor-pointer z-20 ${
                              isSelected
                                ? "bg-violet-600 text-white shadow-md shadow-violet-500/40 scale-110"
                                : "text-slate-300 hover:bg-slate-700 hover:text-white"
                            }`}
                          >
                            {String(mNum).padStart(2, "0")}
                          </button>
                        );
                      },
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const EditGroupExpensePage: React.FC = () => {
  const params = useParams<{ groupId: string; expenseId: string }>();
  const groupId = params?.groupId || "";
  const expenseId = params?.expenseId || "";
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Database options state
  const [rawMembersList, setRawMembersList] = useState<any[]>([]);
  const [dbMembers, setDbMembers] = useState<any[]>([]);
  const [dbAccounts, setDbAccounts] = useState<any[]>([]);

  // Selected Members array for Equal/Itemized split
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

  // Form Fields
  const [expenseTitle, setExpenseTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [expenseTime, setExpenseTime] = useState("14:30");
  const [paidBy, setPaidBy] = useState("");
  const [paidFromAccount, setPaidFromAccount] = useState("");
  const [notes, setNotes] = useState("");
  const [splitMethod, setSplitMethod] = useState("Item-wise");

  // Receipt Scanner
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Itemized List state
  const [itemsList, setItemsList] = useState<any[]>([]);

  // Custom Split Amounts state
  const [customShares, setCustomShares] = useState<{ [key: string]: string }>(
    {},
  );

  // Toast Notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3500,
    );
  };

  const [error, setError] = useState<string | null>(null);

  // FETCH INITIAL EXPENSE DETAILS & DATABASE OPTIONS
  useEffect(() => {
    if (!groupId || !expenseId) {
      setIsLoading(true);
      return;
    }

    let isMounted = true;

    const loadAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [detailsData, membersData, accountsData] = await Promise.all([
          getExpenseDetails(groupId, expenseId).catch((err) => {
            console.error("getExpenseDetails error:", err);
            return null;
          }),
          getMembers(groupId).catch((err) => {
            console.error("getMembers error:", err);
            return [];
          }),
          getAccounts().catch((err) => {
            console.error("getAccounts error:", err);
            return [];
          }),
        ]);

        if (!isMounted) return;

        if (!detailsData) {
          console.error("Expense details data returned null");
          setError(
            "Failed to load expense details from backend. Please check network connection.",
          );
          setIsLoading(false);
          return;
        }

        const validRawMembers =
          Array.isArray(membersData) && membersData.length > 0
            ? membersData
            : DEFAULT_MEMBERS;
        setRawMembersList(validRawMembers);

        const mappedMembers = validRawMembers.map((m: any) => ({
          ...m,
          member_name: m?.member_name || m?.name || `Member #${m?.id || 1}`,
          icon: User,
        }));
        setDbMembers(mappedMembers);

        const mappedAccounts =
          Array.isArray(accountsData) && accountsData.length > 0
            ? accountsData.map((a: any) => ({
                ...a,
                name: a?.name || a?.account_name || `Account #${a?.id || 1}`,
                icon: Building2,
              }))
            : ACCOUNTS;
        setDbAccounts(mappedAccounts);

        // Populate Expense Fields
        setExpenseTitle(detailsData.title || detailsData.expense_name || "");
        setTotalAmount(
          String(detailsData.amount || detailsData.total_amount || ""),
        );
        setSelectedCategory(detailsData.category || "Food");
        setNotes(detailsData.description || "");

        if (detailsData.date) {
          const d = new Date(detailsData.date);
          if (!isNaN(d.getTime())) {
            setExpenseDate(d.toISOString().split("T")[0]);
            setExpenseTime(
              `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
            );
          } else {
            setExpenseDate(detailsData.date);
          }
        }

        // Match Payer Name
        const matchedPayer = (mappedMembers ?? []).find(
          (m: any) => String(m?.id) === String(detailsData.paid_by),
        );
        setPaidBy(
          matchedPayer
            ? matchedPayer.member_name || matchedPayer.name
            : mappedMembers[0]?.member_name || "",
        );

        // Match Account Name
        const matchedAccount = (mappedAccounts ?? []).find(
          (a: any) => String(a?.id) === String(detailsData.account_id),
        );
        setPaidFromAccount(
          matchedAccount
            ? matchedAccount.name
            : mappedAccounts[0]?.name || "Cash",
        );

        setSplitMethod(
          detailsData.split_method || detailsData.splitMethod || "Item-wise",
        );

        // Map Items and Consumers
        if (Array.isArray(detailsData.items) && detailsData.items.length > 0) {
          const mappedItems = detailsData.items.map((i: any) => {
            const uPrice = Number(i?.unit_price || i?.price || 0);

            const consumersArr = Array.isArray(i?.consumers)
              ? i.consumers.map((c: any) => {
                  const cMem = (mappedMembers ?? []).find(
                    (m: any) => String(m?.id) === String(c?.member_id),
                  );
                  const cQty = Number(c?.quantity_consumed ?? c?.quantity ?? 1);
                  return {
                    name: cMem
                      ? cMem.member_name || cMem.name
                      : c?.member_name ||
                        mappedMembers[0]?.member_name ||
                        "Member",
                    qty: cQty,
                    amount: Math.round(cQty * uPrice * 100) / 100,
                  };
                })
              : (mappedMembers ?? []).slice(0, 2).map((m: any) => ({
                  name: m?.member_name || m?.name,
                  qty: 1,
                  amount: uPrice,
                }));

            const calcQty =
              (consumersArr ?? []).reduce(
                (sum: number, c: any) => sum + (c?.qty || 0),
                0,
              ) || Number(i?.quantity || 1);
            const calcTotalPrice = Math.round(uPrice * calcQty * 100) / 100;

            return {
              id: i?.id || Date.now() + Math.random(),
              name: i?.item_name || i?.name || "Item",
              unitPrice: String(uPrice),
              quantity: calcQty,
              totalPrice: calcTotalPrice,
              consumers: consumersArr,
            };
          });
          setItemsList(mappedItems);
        } else {
          setItemsList([
            {
              id: 1,
              name: "",
              unitPrice: "",
              quantity: 2,
              totalPrice: 0,
              consumers: (mappedMembers ?? []).slice(0, 2).map((m: any) => ({
                name: m?.member_name || m?.name,
                qty: 1,
                amount: 0,
              })),
            },
          ]);
        }

        setSelectedMembers(
          (mappedMembers ?? []).map((m: any) => m?.member_name || m?.name),
        );
      } catch (err: any) {
        console.error("Error loading details for edit:", err);
        if (isMounted) {
          setError(
            "Failed to load expense details. Please check network connection.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [groupId, expenseId]);

  // Handle Receipt Upload Mock Scan
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptImage(reader.result as string);
        setIsScanning(true);
        setTimeout(() => {
          setIsScanning(false);
          setExpenseTitle("Restaurant Bill");
          setTotalAmount("450.00");
          setSelectedCategory("Food");
          showToast("Bill scanned successfully! Details populated.", "success");
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle selected member for equal split
  const toggleMemberSelection = (memberName: string) => {
    if (selectedMembers.includes(memberName)) {
      if (selectedMembers.length <= 1) {
        showToast(
          "At least one member must be selected for the split",
          "error",
        );
        return;
      }
      setSelectedMembers(selectedMembers.filter((m) => m !== memberName));
    } else {
      setSelectedMembers([...selectedMembers, memberName]);
    }
  };

  // Calculate Equal Share per person
  const equalSharePerPerson = useMemo(() => {
    const numAmount = parseFloat(totalAmount) || 0;
    const count = selectedMembers.length || 1;
    return (numAmount / count).toFixed(2);
  }, [totalAmount, selectedMembers]);

  // RECALCULATE ITEM DERIVED VALUES HELPER
  // 1. consumer.amount = quantity_consumed * unit_price
  // 2. item.quantity = sum of all consumer.quantity_consumed
  // 3. item.total_price = item.unit_price * item.quantity
  const recalculateItem = (item: any) => {
    const uPrice = parseFloat(item.unitPrice) || 0;

    const updatedConsumers = (item.consumers || []).map((c: any) => {
      const cQty = Math.max(0, Number(c.qty) || 0);
      return {
        ...c,
        qty: cQty,
        amount: Math.round(cQty * uPrice * 100) / 100,
      };
    });

    const sumConsumerQty = updatedConsumers.reduce(
      (sum: number, c: any) => sum + c.qty,
      0,
    );
    const calcQty =
      sumConsumerQty > 0 ? sumConsumerQty : parseInt(item.quantity, 10) || 1;
    const calcTotalPrice = Math.round(uPrice * calcQty * 100) / 100;

    return {
      ...item,
      unitPrice: item.unitPrice,
      quantity: calcQty,
      totalPrice: calcTotalPrice,
      consumers: updatedConsumers,
    };
  };

  // ITEM-WISE CALCULATIONS & HANDLERS
  const handleAddItem = () => {
    const defaultConsumers = dbMembers.slice(0, 2).map((m: any) => ({
      name: m.member_name || m.name,
      qty: 1,
      amount: 0,
    }));

    const rawItem = {
      id: Date.now(),
      name: "",
      unitPrice: "",
      quantity: 2,
      totalPrice: 0,
      consumers: defaultConsumers,
    };

    setItemsList([...itemsList, recalculateItem(rawItem)]);
  };

  const handleRemoveItem = (id: number) => {
    if (itemsList.length <= 1) {
      showToast("Item-wise split must contain at least 1 item", "error");
      return;
    }
    setItemsList(itemsList.filter((item) => item.id !== id));
  };

  const handleItemFieldChange = (id: number, field: string, value: any) => {
    setItemsList(
      itemsList.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          return recalculateItem(updated);
        }
        return item;
      }),
    );
  };

  const handleAddConsumerToItem = (itemId: number) => {
    setItemsList(
      itemsList.map((item) => {
        if (item.id === itemId) {
          const currentConsumerNames = item.consumers.map((c: any) => c.name);
          const available =
            dbMembers.find(
              (m: any) =>
                !currentConsumerNames.includes(m.member_name || m.name),
            ) || dbMembers[0];

          if (!available) return item;

          const newConsumer = {
            name: available.member_name || available.name,
            qty: 1,
            amount: 0,
          };

          const updated = {
            ...item,
            consumers: [...item.consumers, newConsumer],
          };

          return recalculateItem(updated);
        }
        return item;
      }),
    );
  };

  const handleRemoveConsumerFromItem = (
    itemId: number,
    consumerIndex: number,
  ) => {
    setItemsList(
      itemsList.map((item) => {
        if (item.id === itemId) {
          if (item.consumers.length <= 1) {
            showToast("Item must have at least 1 consumer", "error");
            return item;
          }
          const updated = {
            ...item,
            consumers: item.consumers.filter(
              (_: any, idx: number) => idx !== consumerIndex,
            ),
          };
          return recalculateItem(updated);
        }
        return item;
      }),
    );
  };

  const handleConsumerQtyChange = (
    itemId: number,
    consumerIndex: number,
    newQty: number,
  ) => {
    setItemsList(
      itemsList.map((item) => {
        if (item.id === itemId) {
          const validQty = Math.max(0, newQty || 0);
          const updatedConsumers = [...item.consumers];
          updatedConsumers[consumerIndex] = {
            ...updatedConsumers[consumerIndex],
            qty: validQty,
          };

          const updated = {
            ...item,
            consumers: updatedConsumers,
          };

          return recalculateItem(updated);
        }
        return item;
      }),
    );
  };

  const handleConsumerNameChange = (
    itemId: number,
    consumerIndex: number,
    newName: string,
  ) => {
    setItemsList(
      itemsList.map((item) => {
        if (item.id === itemId) {
          const updatedConsumers = [...item.consumers];
          updatedConsumers[consumerIndex] = {
            ...updatedConsumers[consumerIndex],
            name: newName,
          };
          return {
            ...item,
            consumers: updatedConsumers,
          };
        }
        return item;
      }),
    );
  };

  // Sum of all items total price for Item-wise split
  const itemWiseGrandTotal = useMemo(() => {
    return itemsList.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }, [itemsList]);

  // Overall effective total amount
  const computedExpenseTotal = useMemo(() => {
    if (splitMethod === "Item-wise") {
      return itemWiseGrandTotal;
    }
    return parseFloat(totalAmount) || 0;
  }, [splitMethod, itemWiseGrandTotal, totalAmount]);

  // SUBMIT UPDATE FORM WITH PRE-FLIGHT DERIVATION & VALIDATIONS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseTitle.trim()) {
      showToast("Please enter an expense title", "error");
      return;
    }

    if (!paidBy) {
      showToast("Please select who paid for this expense", "error");
      return;
    }

    if (
      splitMethod !== "Item-wise" &&
      (!totalAmount || parseFloat(totalAmount) <= 0)
    ) {
      showToast("Please enter a valid expense amount", "error");
      return;
    }

    // Find paid_by ID from rawMembersList
    const matchedPayer = rawMembersList.find(
      (m: any) =>
        (m.member_name || m.name || "").toLowerCase().trim() ===
        paidBy.toLowerCase().trim(),
    );
    const paidById = matchedPayer
      ? Number(matchedPayer.id)
      : Number(rawMembersList[0]?.id || 1);

    // Find account ID
    const matchedAccount = dbAccounts.find(
      (a: any) =>
        (a.name || a.account_name || "").toLowerCase().trim() ===
        paidFromAccount.toLowerCase().trim(),
    );
    const accountId = matchedAccount ? Number(matchedAccount.id) : 1;

    // PRE-FLIGHT RECALCULATION BEFORE SENDING PUT
    let itemsPayload: any[] = [];
    if (splitMethod === "Item-wise") {
      if (itemsList.length === 0) {
        showToast("Item-wise split must contain at least 1 item", "error");
        return;
      }

      for (const rawItem of itemsList) {
        const itemName = rawItem.name?.trim() || "Item";
        const uPrice = parseFloat(rawItem.unitPrice) || 0;

        if (uPrice <= 0) {
          showToast(`Item "${itemName}" must have a unit price > 0`, "error");
          return;
        }

        if (!rawItem.consumers || rawItem.consumers.length === 0) {
          showToast(
            `Item "${itemName}" must have at least 1 consumer`,
            "error",
          );
          return;
        }

        // Derivation 1: Calculate sum of all consumer quantity_consumed
        const sumConsumerQty = rawItem.consumers.reduce(
          (sum: number, c: any) => sum + Math.max(0, Number(c.qty) || 0),
          0,
        );

        if (sumConsumerQty <= 0) {
          showToast(
            `Item "${itemName}" has 0 total consumer quantity`,
            "error",
          );
          return;
        }

        // Derivation 2: item.quantity = sumConsumerQty
        const itemQuantity = sumConsumerQty;

        // Derivation 3: item.total_price = uPrice * itemQuantity
        const itemTotalPrice = Math.round(uPrice * itemQuantity * 100) / 100;

        // Derivation 4: consumer.amount = quantity_consumed * uPrice
        const consumers = rawItem.consumers.map((c: any) => {
          const matchedConsumerMem = rawMembersList.find(
            (rm: any) =>
              (rm.member_name || rm.name || "").toLowerCase().trim() ===
              (c.name || "").toLowerCase().trim(),
          );
          const consumerMemberId = matchedConsumerMem
            ? Number(matchedConsumerMem.id)
            : paidById;
          const cQty = Math.max(0, Number(c.qty) || 0);
          const cAmount = Math.round(cQty * uPrice * 100) / 100;

          return {
            member_id: consumerMemberId,
            quantity_consumed: cQty,
            amount: cAmount,
          };
        });

        // PRE-SUBMIT VALIDATIONS
        const derivedQtySum = consumers.reduce(
          (sum: number, c: any) => sum + c.quantity_consumed,
          0,
        );
        if (itemQuantity !== derivedQtySum) {
          showToast(
            `Validation Mismatch on "${itemName}": Item Quantity (${itemQuantity}) !== Consumer Quantity Sum (${derivedQtySum})`,
            "error",
          );
          return;
        }

        const derivedAmountSum = consumers.reduce(
          (sum: number, c: any) => sum + c.amount,
          0,
        );
        if (Math.abs(itemTotalPrice - derivedAmountSum) > 0.05) {
          showToast(
            `Validation Mismatch on "${itemName}": Item Total (₹${itemTotalPrice}) !== Consumer Amount Sum (₹${derivedAmountSum})`,
            "error",
          );
          return;
        }

        itemsPayload.push({
          item_name: itemName,
          unit_price: uPrice,
          quantity: itemQuantity,
          total_price: itemTotalPrice,
          consumers,
        });
      }
    }

    const calculatedExpenseTotal =
      splitMethod === "Item-wise"
        ? itemsPayload.reduce((sum, item) => sum + item.total_price, 0)
        : parseFloat(totalAmount) || 0;

    if (splitMethod === "Item-wise") {
      const sumItemTotals = itemsPayload.reduce(
        (sum, item) => sum + item.total_price,
        0,
      );
      if (Math.abs(calculatedExpenseTotal - sumItemTotals) > 0.05) {
        showToast(
          `Validation Mismatch: Expense Total (₹${calculatedExpenseTotal}) !== Sum of Item Totals (₹${sumItemTotals})`,
          "error",
        );
        return;
      }
    }

    const expensePayload = {
      title: expenseTitle.trim(),
      amount: Math.round(calculatedExpenseTotal * 100) / 100,
      category: selectedCategory,
      description: notes.trim(),
      date: expenseDate,
      paid_by: paidById,
      account_id: accountId,
      split_method: splitMethod,
      items: itemsPayload,
    };

    console.log(
      "RECALCULATED PUT PAYLOAD:",
      JSON.stringify(expensePayload, null, 2),
    );

    setIsSubmitting(true);

    try {
      await updateExpense(groupId, expenseId, expensePayload);
      showToast("Expense updated successfully!", "success");

      setTimeout(() => {
        navigate(`/groups/${groupId}`);
      }, 1000);
    } catch (err: any) {
      console.error("Update expense failed:", err);
      showToast(
        err.response?.data?.detail || "Failed to update expense",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!groupId || !expenseId || isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/40 animate-pulse flex items-center justify-center">
          <Receipt className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-400">
          Loading Expense Details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white p-6 flex flex-col items-center justify-center space-y-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#111827] border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">
            Failed to Load Expense
          </h2>
          <p className="text-xs font-semibold text-slate-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-lg shadow-violet-500/20 mx-auto transition-all cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans pb-28">
      {/* TOAST ALERTS */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-[#111827]/95 border-emerald-500/50 text-emerald-300"
                : "bg-[#111827]/95 border-rose-500/50 text-rose-300"
            }`}
          >
            <div
              className={`p-2 rounded-xl ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-white">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/groups/${groupId}`}
              className="p-2.5 rounded-2xl bg-[#111827] hover:bg-[#1F2937] border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Edit Group Expense</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-950 text-violet-400 border border-violet-800">
                  #{expenseId}
                </span>
              </h1>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Modify details, payer, and itemized consumption for this
                expense.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* RECEIPT SCANNER CARD */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Scan Receipt / Bill</span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-950 text-violet-400 text-[10px] font-extrabold border border-violet-800">
                      AI Powered
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload receipt image to auto-update expense items.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-500/20 transition-all cursor-pointer shrink-0">
                <Upload className="w-4 h-4" />
                <span>{isScanning ? "Scanning..." : "Upload Bill"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </label>
            </div>

            {receiptImage && (
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <img
                  src={receiptImage}
                  alt="Receipt preview"
                  className="w-12 h-12 object-cover rounded-xl border border-slate-700"
                />
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Bill uploaded
                </span>
              </div>
            )}
          </div>

          {/* BASIC EXPENSE DETAILS CARD */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-violet-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Expense Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Expense Title */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="e.g. Bachelor Room Grocery & Snacks"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1F2937] border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-violet-500 transition-all shadow-xs"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Category *
                </label>
                <CustomSelect
                  options={CATEGORIES}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Select Category"
                />
              </div>

              {/* Paid By */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Paid By *
                </label>
                <CustomSelect
                  options={dbMembers}
                  value={paidBy}
                  onChange={setPaidBy}
                  placeholder="Select Member"
                />
              </div>

              {/* Payment Account */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Paid From Account
                </label>
                <CustomSelect
                  options={dbAccounts}
                  value={paidFromAccount}
                  onChange={setPaidFromAccount}
                  placeholder="Select Account"
                />
              </div>

              {/* Expense Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1F2937] border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-violet-500 transition-all shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Time
                  </label>
                  <InteractiveClockPicker
                    value={expenseTime}
                    onChange={setExpenseTime}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SPLIT METHOD & SHARE SELECTION CARD */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-violet-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Split Method</span>
              </h2>

              <div className="flex items-center gap-1.5 bg-[#1F2937] p-1 rounded-2xl border border-slate-700">
                {["Item-wise", "Equal", "Custom"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSplitMethod(method)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      splitMethod === method
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
            {/* IF NOT ITEM-WISE: TOTAL AMOUNT INPUT */}
            {splitMethod !== "Item-wise" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Total Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full py-3 pl-8 pr-4 text-base font-black text-white bg-[#1F2937] rounded-xl border border-slate-700 focus:border-violet-500 focus:outline-none transition-all shadow-xs"
                  />
                </div>
              </div>
            )}
            {/* EQUAL SPLIT MEMBERS LIST */}
            {splitMethod === "Equal" && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">
                    Select Participants for Equal Split
                  </span>
                  <span className="text-emerald-400">
                    {formatCurrency(equalSharePerPerson)} / person
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {dbMembers.map((m: any) => {
                    const mName = m.member_name || m.name;
                    const isSelected = selectedMembers.includes(mName);

                    return (
                      <button
                        key={mName}
                        type="button"
                        onClick={() => toggleMemberSelection(mName)}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                          isSelected
                            ? "bg-violet-950/60 border-violet-600 text-white shadow-md shadow-violet-500/10"
                            : "bg-[#1F2937]/50 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-violet-600 border-violet-500 text-white"
                              : "border-slate-600"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 stroke-[3]" />
                          )}
                        </div>
                        <span className="text-xs font-bold truncate">
                          {mName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {/* ITEM-WISE BILL BUILDER */}

            {splitMethod === "Item-wise" && (
              <div className="space-y-5 pt-1">
                <div className="flex items-center justify-between bg-violet-950/40 p-4 rounded-2xl border border-violet-800/60">
                  <div>
                    <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider block">
                      Computed Item Total
                    </span>
                    <span className="text-lg font-black text-white">
                      {formatCurrency(itemWiseGrandTotal)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* ITEM CARDS */}
                <div className="space-y-4">
                  {itemsList.map((item, itemIdx) => (
                    <motion.div
                      key={item.id || itemIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-2xl bg-[#1F2937]/60 border border-slate-700/80 space-y-3.5 relative"
                    >
                      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
                        <span className="text-xs font-black text-violet-400 uppercase tracking-wider">
                          Item #{itemIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded-lg text-rose-400 hover:bg-rose-950/60 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 block">
                            Item Name
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              handleItemFieldChange(
                                item.id,
                                "name",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. Chicken Biryani"
                            className="w-full px-3 py-1.5 rounded-xl bg-[#111827] border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 block">
                            Unit Price (₹)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemFieldChange(
                                item.id,
                                "unitPrice",
                                e.target.value,
                              )
                            }
                            placeholder="0.00"
                            className="w-full px-3 py-1.5 rounded-xl bg-[#111827] border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 block">
                            Total Qty
                          </label>
                          <input
                            type="number"
                            readOnly
                            value={
                              (item.consumers || []).reduce(
                                (sum: number, c: any) =>
                                  sum + Math.max(0, Number(c.qty || 0)),
                                0,
                              ) ||
                              item.quantity ||
                              1
                            }
                            className="w-full px-3 py-1.5 rounded-xl bg-[#111827]/80 border border-slate-700 text-xs font-bold text-violet-400 focus:outline-none cursor-default"
                            title="Total Qty is automatically calculated as the sum of all consumer quantities"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end text-xs font-bold text-slate-300 gap-2">
                        <span>Item Subtotal:</span>
                        <span className="font-black text-white">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>

                      {/* CONSUMERS BREAKDOWN TABLE */}
                      <div className="space-y-2 pt-2 border-t border-slate-700/60">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Users className="w-3 h-3 text-emerald-400" />
                            <span>Consumers Breakdown</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleAddConsumerToItem(item.id)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-bold hover:bg-emerald-900 transition-colors cursor-pointer"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>+ Consumer</span>
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {item.consumers.map((c: any, cIdx: number) => (
                            <div
                              key={cIdx}
                              className="p-2.5 rounded-xl bg-[#111827] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
                            >
                              <div className="w-full sm:w-1/2">
                                <select
                                  value={c.name}
                                  onChange={(e) =>
                                    handleConsumerNameChange(
                                      item.id,
                                      cIdx,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-2.5 py-1 rounded-lg bg-[#1F2937] border border-slate-700 font-bold text-white text-xs focus:outline-none"
                                >
                                  {dbMembers.map((m: any) => {
                                    const mName = m.member_name || m.name;
                                    return (
                                      <option key={mName} value={mName}>
                                        {mName}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>

                              <div className="w-full sm:w-1/4 flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-500">
                                  Qty:
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  value={c.qty}
                                  onChange={(e) =>
                                    handleConsumerQtyChange(
                                      item.id,
                                      cIdx,
                                      parseInt(e.target.value, 10),
                                    )
                                  }
                                  className="w-full px-2 py-1 rounded-lg bg-[#1F2937] border border-slate-700 font-bold text-white text-xs focus:outline-none"
                                />
                              </div>

                              <div className="w-full sm:w-1/4 flex items-center justify-between sm:justify-end gap-2">
                                <span className="font-extrabold text-emerald-400">
                                  {formatCurrency(c.amount)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveConsumerFromItem(item.id, cIdx)
                                  }
                                  className="p-1 rounded-lg text-rose-400 hover:bg-rose-950 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* NOTES / DESCRIPTION CARD */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              Notes & Description
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add extra details, bill links, or notes..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#1F2937] border border-slate-700 text-xs font-medium text-white focus:outline-none focus:border-violet-500 transition-all shadow-xs"
            />
          </div>

          {/* STICKY BOTTOM ACTION FOOTER */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#111827]/95 border-t border-slate-800/90 backdrop-blur-md z-40">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Expense
                </span>
                <span className="text-xl font-black text-white">
                  {formatCurrency(computedExpenseTotal)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/groups/${groupId}`)}
                  className="px-5 py-2.5 rounded-xl bg-[#1F2937] hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg shadow-violet-500/25 transition-all cursor-pointer ${
                    isSubmitting
                      ? "bg-slate-700 opacity-60 cursor-not-allowed"
                      : "bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 hover:shadow-violet-500/35"
                  }`}
                >
                  {isSubmitting ? "Updating Expense..." : "Update Expense"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ERROR BOUNDARY WRAPPER FOR SAFE RENDERING
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class EditGroupErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(
      "CRITICAL RENDER CRASH IN EDIT EXPENSE PAGE:",
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F17] text-white p-6 flex flex-col items-center justify-center space-y-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#111827] border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">Rendering Error</h2>
            <p className="text-xs font-semibold text-slate-400">
              {this.state.error?.message ||
                "An unexpected error occurred during rendering."}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-lg shadow-violet-500/20 mx-auto transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const WrappedEditGroupExpensePage: React.FC = () => (
  <EditGroupErrorBoundary>
    <EditGroupExpensePage />
  </EditGroupErrorBoundary>
);

export default WrappedEditGroupExpensePage;
