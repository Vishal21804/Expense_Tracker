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
} from "lucide-react";
import {
  getGroupById,
  createExpense,
} from "../services/expensesApi";
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
const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num);
};

// MODERN CUSTOM DROPDOWN COMPONENT
const CustomSelect = ({ options, value, onChange, placeholder = "Select option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = value ? options.find((opt) => (opt.member_name || opt.name || opt) === value) : null;
  const Icon = selectedOption?.icon;
  const displayName = selectedOption ? (selectedOption.member_name || selectedOption.name || selectedOption) : placeholder;

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
          <span className={`truncate ${!selectedOption ? "text-slate-400 font-semibold" : "text-white"}`}>
            {displayName}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-violet-400" : ""}`} />
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
            {options.map((opt) => {
              const val = opt.member_name || opt.name || opt;
              const OptIcon = opt.icon || User;
              const isSelected = val === value;

              return (
                <button
                  key={val}
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
                    {OptIcon && <OptIcon className="w-4 h-4 text-violet-400 shrink-0" />}
                    <span className="truncate">{val}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
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
const InteractiveClockPicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("hours"); // "hours" | "minutes"
  const pickerRef = useRef(null);

  // Parse time value (format "HH:MM")
  const parseTime = (timeStr) => {
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

  // Convert back to "HH:MM" 24-hour format
  const format24Time = (h, m, p) => {
    let h24 = h;
    if (p === "PM" && h < 12) h24 += 12;
    if (p === "AM" && h === 12) h24 = 0;
    const hFormatted = String(h24).padStart(2, "0");
    const mFormatted = String(m).padStart(2, "0");
    return `${hFormatted}:${mFormatted}`;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHourSelect = (h) => {
    const new24 = format24Time(h, minutes, period);
    onChange(new24);
    setMode("minutes"); // Auto advance to minutes
  };

  const handleMinuteSelect = (m) => {
    const new24 = format24Time(hours, m, period);
    onChange(new24);
  };

  const togglePeriod = (p) => {
    const new24 = format24Time(hours, minutes, p);
    onChange(new24);
  };

  // Angle for clock hand rotation
  const currentAngle = mode === "hours" ? (hours % 12) * 30 : minutes * 6;

  return (
    <div className="relative w-full" ref={pickerRef}>
      {/* Input container: Keyboard input + Dedicated Clock Icon Button */}
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

      {/* ROUND CLOCK PICKER CENTERED MODAL */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
            {/* Dark backdrop click to close */}
            <div
              className="absolute inset-0"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 w-80 p-5 bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl space-y-4 text-center select-none"
            >
              {/* Header Display: Digital Time Readout + AM/PM Toggle */}
              <div className="flex items-center justify-between bg-[#1F2937] p-2.5 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-1 font-black text-xl text-white pl-2">
                  <button
                    type="button"
                    onClick={() => setMode("hours")}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      mode === "hours" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {String(hours).padStart(2, "0")}
                  </button>
                  <span>:</span>
                  <button
                    type="button"
                    onClick={() => setMode("minutes")}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      mode === "minutes" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {String(minutes).padStart(2, "0")}
                  </button>
                </div>

                {/* AM / PM Toggle */}
                <div className="flex bg-[#111827] p-1 rounded-xl border border-slate-700 text-xs font-extrabold">
                  <button
                    type="button"
                    onClick={() => togglePeriod("AM")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      period === "AM" ? "bg-violet-600 text-white" : "text-slate-400"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePeriod("PM")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      period === "PM" ? "bg-violet-600 text-white" : "text-slate-400"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Mode Indicator Pill */}
              <div className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
                {mode === "hours" ? "Select Hour (1 - 12)" : "Select Minute (0 - 55)"}
              </div>

              {/* ROUND ANALOG CLOCK FACE */}
              <div className="relative w-52 h-52 mx-auto rounded-full bg-[#1F2937] border-2 border-slate-700 flex items-center justify-center shadow-inner">
                {/* Clock Center Pin */}
                <div className="w-3.5 h-3.5 rounded-full bg-violet-500 z-20 shadow-md shadow-violet-500/50" />

                {/* Clock Hand pointing to current angle */}
                <div
                  className="absolute top-1/2 left-1/2 w-0.5 h-20 bg-gradient-to-t from-violet-500 to-purple-400 origin-bottom z-10 transition-transform duration-300 ease-out"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${currentAngle}deg)`,
                  }}
                >
                  {/* Clock Hand Tip Circle */}
                  <div className="w-6 h-6 rounded-full bg-violet-600 border-2 border-white absolute -top-3 -left-2.5 shadow-md" />
                </div>

                {/* Hour / Minute Circular Dial Positions */}
                {mode === "hours"
                  ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hNum) => {
                      const angleDeg = (hNum % 12) * 30 - 90;
                      const rad = (angleDeg * Math.PI) / 180;
                      const radiusPx = 80;
                      const x = Math.cos(rad) * radiusPx;
                      const y = Math.sin(rad) * radiusPx;
                      const isSelected = hours === hNum;

                      return (
                        <button
                          key={hNum}
                          type="button"
                          onClick={() => handleHourSelect(hNum)}
                          style={{
                            transform: `translate(${x}px, ${y}px)`,
                          }}
                          className={`absolute w-8 h-8 rounded-full text-xs font-black flex items-center justify-center z-20 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/50 scale-110"
                              : "text-slate-200 hover:bg-slate-700/80 hover:scale-105"
                          }`}
                        >
                          {hNum}
                        </button>
                      );
                    })
                  : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((mNum) => {
                      const angleDeg = (mNum / 5) * 30 - 90;
                      const rad = (angleDeg * Math.PI) / 180;
                      const radiusPx = 80;
                      const x = Math.cos(rad) * radiusPx;
                      const y = Math.sin(rad) * radiusPx;
                      const isSelected = Math.floor(minutes / 5) * 5 === mNum;

                      return (
                        <button
                          key={mNum}
                          type="button"
                          onClick={() => handleMinuteSelect(mNum)}
                          style={{
                            transform: `translate(${x}px, ${y}px)`,
                          }}
                          className={`absolute w-8 h-8 rounded-full text-[11px] font-black flex items-center justify-center z-20 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/50 scale-110"
                              : "text-slate-200 hover:bg-slate-700/80 hover:scale-105"
                          }`}
                        >
                          {String(mNum).padStart(2, "0")}
                        </button>
                      );
                    })}
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode(mode === "hours" ? "minutes" : "hours")}
                  className="text-xs font-bold text-violet-400 hover:underline cursor-pointer"
                >
                  Switch to {mode === "hours" ? "Minutes" : "Hours"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="py-2 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 cursor-pointer"
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

// MODERN GLASSMORPHIC ADD PARTICIPANT MODAL
const AddParticipantModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-sm p-6 bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl space-y-4 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-500/30">
                <UserPlus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Add Participant</h3>
                <p className="text-xs text-slate-400 font-medium">Add a new participant to split this expense</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Participant Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full py-2.5 px-3.5 pl-9 text-xs text-white bg-[#1F2937] rounded-xl border border-slate-700 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md shadow-violet-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Participant</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AddExpensePage = () => {
  const { groupId = "bachelor-room" } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File Upload Drag & Drop State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const getCurrentTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(getCurrentTime);
  const [paidBy, setPaidBy] = useState("");
  const [paidFromAccount, setPaidFromAccount] = useState("");
  const [description, setDescription] = useState("");

  // Custom added participants & Modal state
  const [customParticipants, setCustomParticipants] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Split Information
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitMethod, setSplitMethod] = useState("Equal");
  const [memberPercentages, setMemberPercentages] = useState({});
  const [memberCustomAmounts, setMemberCustomAmounts] = useState({});

  // Item-wise Split Items List (With Per-Member Quantity)
  const [itemsList, setItemsList] = useState([]);

  const [accountsList, setAccountsList] = useState(ACCOUNTS);
  const [rawMembersList, setRawMembersList] = useState([]);
  const [rawAccountsList, setRawAccountsList] = useState([]);

  useEffect(() => {
    // Automatically set current live time on page mount
    const d = new Date();
    const currentLiveTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    setTime(currentLiveTime);

    const loadGroupAndDependencies = async () => {
      try {
        const gData = await getGroupById(groupId);
        let membersData = [];
        try {
          membersData = await getMembers(groupId);
        } catch (mErr) {
          console.error("Failed to load members:", mErr);
        }

        const validMembers = Array.isArray(membersData) && membersData.length > 0
          ? membersData
          : (gData?.members || []);

        setRawMembersList(validMembers);
        setGroup({
          ...(gData || {}),
          members: validMembers,
        });

        if (validMembers.length > 0) {
          const memberNames = validMembers.map((m) => m.member_name || m.name || "Member");
          setSelectedMembers(memberNames);
          setPaidBy((prev) => prev || memberNames[0]);
        }

        const fetchedAccounts = await getAccounts();
        if (Array.isArray(fetchedAccounts) && fetchedAccounts.length > 0) {
          setRawAccountsList(fetchedAccounts);
          const mappedAccs = fetchedAccounts.map((a) => ({
            id: a.id,
            name: a.name || a.account_name,
            icon: a.type === "UPI" ? QrCode : a.type === "Credit Card" ? CreditCard : a.type === "Cash" ? Banknote : Building2,
          }));
          setAccountsList(mappedAccs);
          setPaidFromAccount((prev) => prev || mappedAccs[0].name);
        }
      } catch (err) {
        console.error("Error loading group details:", err);
      }
    };
    loadGroupAndDependencies();
  }, [groupId]);

  // Combine base members and dynamically added participants
  const groupMembersList = useMemo(() => {
    const base = (group?.members && group.members.length > 0) ? group.members : DEFAULT_MEMBERS;
    const existingNames = new Set(base.map((m) => (m.member_name || m.name || m).toLowerCase()));
    const extraCustoms = customParticipants.filter(
      (c) => !existingNames.has((c.member_name || c.name || "").toLowerCase())
    );
    return [...base, ...extraCustoms];
  }, [group, customParticipants]);

  // Auto-sync main Total Amount when in Item-wise split mode
  useEffect(() => {
    if (splitMethod === "Item-wise") {
      const totalItemBill = itemsList.reduce((sum, item) => {
        const itemQty = Object.values(item.memberQty || {}).reduce(
          (qSum, q) => qSum + Number(q || 0),
          0
        );
        return sum + itemQty * Number(item.price || 0);
      }, 0);
      setAmount(String(totalItemBill));
    }
  }, [splitMethod, itemsList]);

  // Add Participant Handler
  const handleAddParticipant = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newMemberObj = {
      id: `custom-${Date.now()}`,
      member_name: trimmed,
      name: trimmed,
      avatar: trimmed.substring(0, 2).toUpperCase(),
    };

    if (!customParticipants.some((p) => (p.member_name || p.name || "").toLowerCase() === trimmed.toLowerCase())) {
      setCustomParticipants((prev) => [...prev, newMemberObj]);
    }

    if (!selectedMembers.includes(trimmed)) {
      setSelectedMembers((prev) => [...prev, trimmed]);
      setMemberPercentages((prev) => ({ ...prev, [trimmed]: 0 }));
      setMemberCustomAmounts((prev) => ({ ...prev, [trimmed]: 0 }));
    }

    setIsAddModalOpen(false);
  };

  // Item-wise Helper Handlers
  const handleAddItem = () => {
    const defaultQty = {};
    selectedMembers.forEach((mName) => {
      defaultQty[mName] = 0;
    });

    setItemsList([
      {
        id: `item-${Date.now()}`,
        name: "",
        price: 0,
        memberQty: defaultQty,
      },
      ...itemsList,
    ]);
  };

  const handleUpdateItemPrice = (id, price) => {
    const val = price === "" ? 0 : parseFloat(price);
    setItemsList(
      itemsList.map((item) =>
        item.id === id ? { ...item, price: isNaN(val) ? 0 : val } : item
      )
    );
  };

  const handleUpdateItemName = (id, name) => {
    setItemsList(
      itemsList.map((item) =>
        item.id === id ? { ...item, name } : item
      )
    );
  };

  const handleUpdateItemTotalQty = (id, totalQty) => {
    const val = totalQty === "" ? 0 : parseFloat(totalQty);
    const parsed = isNaN(val) || val < 0 ? 0 : Math.round(val * 100) / 100;
    setItemsList(
      itemsList.map((item) =>
        item.id === id ? { ...item, totalQty: parsed } : item
      )
    );
  };

  const handleSetMemberQty = (itemId, mName, exactQty) => {
    setItemsList(
      itemsList.map((item) => {
        if (item.id !== itemId) return item;
        const parsed = typeof exactQty === "number" ? exactQty : parseFloat(exactQty);
        const newQty = isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100) / 100;

        const newMemberQty = {
          ...item.memberQty,
          [mName]: newQty,
        };

        const totalQtySum = Object.values(newMemberQty).reduce(
          (sum, q) => sum + Number(q || 0),
          0
        );

        return {
          ...item,
          totalQty: totalQtySum > 0 ? Math.round(totalQtySum * 100) / 100 : item.totalQty || 1,
          memberQty: newMemberQty,
        };
      })
    );
  };

  const handleUpdateMemberQty = (itemId, mName, delta) => {
    setItemsList(
      itemsList.map((item) => {
        if (item.id !== itemId) return item;
        const currentQty = Number(item.memberQty?.[mName] || 0);
        let newQty = Math.max(0, currentQty + delta);
        newQty = Math.round(newQty * 100) / 100;

        const newMemberQty = {
          ...item.memberQty,
          [mName]: newQty,
        };

        const totalQtySum = Object.values(newMemberQty).reduce(
          (sum, q) => sum + Number(q || 0),
          0
        );

        return {
          ...item,
          totalQty: totalQtySum > 0 ? Math.round(totalQtySum * 100) / 100 : item.totalQty || 1,
          memberQty: newMemberQty,
        };
      })
    );
  };

  const handleRemoveItem = (id) => {
    if (itemsList.length > 1) {
      setItemsList(itemsList.filter((item) => item.id !== id));
    }
  };

  // File Handlers
  const handleFileSelect = (file) => {
    if (!file) return;
    setUploadedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Toggle member selection
  const toggleMember = (mName) => {
    if (selectedMembers.includes(mName)) {
      if (selectedMembers.length > 1) {
        setSelectedMembers(selectedMembers.filter((name) => name !== mName));
      }
    } else {
      setSelectedMembers([...selectedMembers, mName]);
    }
  };

  // Live Member Breakdown Calculations
  const memberBreakdown = useMemo(() => {
    const total = Number(amount || 0);
    const memberCount = selectedMembers.length || 1;

    if (splitMethod === "Item-wise") {
      const roommateShares = {};
      selectedMembers.forEach((mName) => (roommateShares[mName] = 0));

      itemsList.forEach((item) => {
        const unitPrice = Number(item.price || 0);
        Object.entries(item.memberQty || {}).forEach(([mName, qty]) => {
          if (selectedMembers.includes(mName) && qty > 0) {
            roommateShares[mName] =
              (roommateShares[mName] || 0) + Number(qty) * unitPrice;
          }
        });
      });

      return selectedMembers.map((mName) => {
        const share = roommateShares[mName] || 0;
        const pct = total > 0 ? (share / total) * 100 : 0;
        return {
          name: mName,
          shareAmount: Math.round(share * 100) / 100,
          percentage: Math.round(pct * 10) / 10,
        };
      });
    } else if (splitMethod === "Percentage") {
      return selectedMembers.map((mName) => {
        const pct = Number(memberPercentages[mName] || 0);
        const share = total > 0 ? (total * pct) / 100 : 0;
        return {
          name: mName,
          shareAmount: Math.round(share * 100) / 100,
          percentage: Math.round(pct * 10) / 10,
        };
      });
    } else if (splitMethod === "Custom") {
      return selectedMembers.map((mName) => {
        const share = Number(memberCustomAmounts[mName] || 0);
        const pct = total > 0 ? (share / total) * 100 : 0;
        return {
          name: mName,
          shareAmount: Math.round(share * 100) / 100,
          percentage: Math.round(pct * 10) / 10,
        };
      });
    } else {
      // Equal Split
      return selectedMembers.map((mName) => {
        const share = total > 0 ? total / memberCount : 0;
        const pct = 100 / memberCount;
        return {
          name: mName,
          shareAmount: Math.round(share * 100) / 100,
          percentage: Math.round(pct * 10) / 10,
        };
      });
    }
  }, [amount, selectedMembers, splitMethod, memberPercentages, memberCustomAmounts, itemsList]);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter an expense name");
      return;
    }
    if (!category) {
      alert("Please select a category");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!paidBy) {
      alert("Please select who paid for this expense");
      return;
    }
    if (!paidFromAccount) {
      alert("Please select the payment account");
      return;
    }

    setIsSubmitting(true);
    try {
      const totalNum = Number(amount);

      // Find selected member object strictly from rawMembersList database records
      const selectedMemberObj = rawMembersList.find(
        (m) =>
          String(m.id) === String(paidBy) ||
          (m.member_name || m.name || "").toLowerCase().trim() === String(paidBy || "").toLowerCase().trim()
      );
      if (!selectedMemberObj || !selectedMemberObj.id) {
        alert("Error: Selected payer is not a valid group member.");
        setIsSubmitting(false);
        return;
      }
      const paidById = Number(selectedMemberObj.id);

      // Find selected account object from rawAccountsList
      const selectedAccountObj = rawAccountsList.find(
        (a) =>
          String(a.id) === String(paidFromAccount) ||
          (a.name || a.account_name || "").toLowerCase().trim() === String(paidFromAccount || "").toLowerCase().trim()
      );
      const accountId = selectedAccountObj?.id ? Number(selectedAccountObj.id) : 1;

      // Construct items array payload if splitMethod is Item-wise
      let itemsPayload = [];
      if (splitMethod === "Item-wise" && Array.isArray(itemsList) && itemsList.length > 0) {
        itemsPayload = itemsList.map((item) => {
          const unitPrice = Number(item.price || item.unitPrice || item.unit_price || 0);
          const totalItemQty = Number(item.qty || item.quantity || 1);
          const totalPrice = Number(item.total_price || item.totalPrice || (unitPrice * totalItemQty));

          const consumers = [];
          Object.entries(item.memberQty || {}).forEach(([mName, qtyConsumed]) => {
            const numQty = Number(qtyConsumed || 0);
            if (numQty > 0) {
              // Match member STRICTLY from rawMembersList database records
              const matchedMem = rawMembersList.find(
                (rm) =>
                  String(rm.id) === String(mName) ||
                  (rm.member_name || rm.name || "").toLowerCase().trim() === String(mName).toLowerCase().trim()
              );

              if (matchedMem && matchedMem.id) {
                const memberId = Number(matchedMem.id);
                const consumerAmount = Math.round(numQty * unitPrice * 100) / 100;

                consumers.push({
                  member_id: memberId,
                  quantity_consumed: numQty,
                  amount: consumerAmount,
                });
              }
            }
          });

          return {
            item_name: item.name || item.title || item.item_name || "Item",
            unit_price: unitPrice,
            quantity: totalItemQty,
            total_price: totalPrice,
            consumers: consumers,
          };
        });
      }

      const expensePayload = {
        title: title.trim(),
        amount: totalNum,
        category,
        description: description.trim(),
        date,
        paid_by: paidById,
        account_id: accountId,
        split_method: splitMethod,
        ...(splitMethod === "Item-wise" && itemsPayload.length > 0 ? { items: itemsPayload } : {}),
      };

      // 5. Add console logs before calling createExpense()
      console.log("Raw Members:", rawMembersList);
      console.log("Selected Members:", selectedMembers);
      console.log("Items Payload:", JSON.stringify(itemsPayload, null, 2));
      console.log("Expense Payload:", JSON.stringify(expensePayload, null, 2));

      await createExpense(groupId, expensePayload);

      // Redirect back to group page where the expense appears immediately!
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full text-slate-100 font-sans flex flex-col h-[calc(100vh-3.25rem)] overflow-hidden space-y-2.5 pb-1">
      
      {/* HEADER BAR WITH ACTION BUTTONS INLINE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-md shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Link to="/expenses" className="hover:text-violet-400 transition-colors">Expenses</Link>
            <span>/</span>
            <Link to={`/groups/${groupId}`} className="hover:text-violet-400 transition-colors">
              {group?.name || "Bachelor Room"}
            </Link>
            <span>/</span>
            <span className="text-white font-extrabold">Add Expense</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
            Add Expense to {group?.name || "Bachelor Room"}
          </h1>
        </div>

        {/* Action Buttons Integrated directly into Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/groups/${groupId}`)}
            className="py-2 px-3.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="py-2 px-5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>Save Expense</span>
          </button>
        </div>
      </div>

      {/* 2-COLUMN FIXED-HEIGHT CARDS WITH INTERNAL SCROLLING */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-hidden">
        
        {/* LEFT COLUMN: EXPENSE INFORMATION (6 COLS) */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-3xl bg-[#111827] border border-slate-800 shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
          <div className="border-b border-slate-800 pb-2.5 shrink-0 mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-violet-400">
              Expense Information
            </h3>
          </div>

          {/* Non-scrollable inner content showing all fields */}
          <div className="flex-1 flex flex-col justify-between space-y-2.5 overflow-hidden">
            {/* Expense Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Expense Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter expense title..."
                className="w-full py-2 px-3 text-xs text-white bg-[#1F2937] rounded-xl border border-slate-700 focus:border-violet-500 focus:outline-none transition-all font-semibold"
              />
            </div>

            {/* Category & Amount Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Category *
                </label>
                <CustomSelect
                  options={CATEGORIES}
                  value={category}
                  onChange={setCategory}
                  placeholder="Select Category"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Total Amount (₹) * {splitMethod === "Item-wise" && "(Auto Calculated)"}
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  readOnly={splitMethod === "Item-wise"}
                  className={`w-full py-2 px-3 text-xs text-violet-400 bg-[#1F2937] rounded-xl border border-slate-700 focus:border-violet-500 focus:outline-none font-black ${
                    splitMethod === "Item-wise" ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Date, Time, Paid By, Paid From Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full py-2 px-3 text-xs text-white bg-[#1F2937] rounded-xl border border-slate-700 focus:outline-none font-semibold cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Time *
                </label>
                {/* INTERACTIVE ROUND CLOCK PICKER */}
                <InteractiveClockPicker
                  value={time}
                  onChange={setTime}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Paid By *
                </label>
                <CustomSelect
                  options={groupMembersList}
                  value={paidBy}
                  onChange={setPaidBy}
                  placeholder="Select Member"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Paid From *
                </label>
                <CustomSelect
                  options={accountsList}
                  value={paidFromAccount}
                  onChange={setPaidFromAccount}
                  placeholder="Select Account"
                />
              </div>
            </div>

            {/* DRAG & DROP UPLOAD RECEIPT */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Upload Receipt
              </label>

              {!uploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`py-2 px-3 rounded-xl border border-dashed text-center cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
                    isDragging
                      ? "border-violet-500 bg-violet-950/40"
                      : "border-slate-700 bg-[#1F2937] hover:border-violet-500"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.png,.jpeg,.pdf"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <Upload className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-300">
                    Drag & Drop receipt or <span className="text-violet-400 underline font-bold">Browse</span> (JPG, PNG, PDF)
                  </span>
                </div>
              ) : (
                <div className="py-2 px-3 rounded-xl bg-[#1F2937] border border-slate-700 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                    <span className="font-bold text-white text-xs truncate">{uploadedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-400 hover:text-red-300 text-xs font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Description / Note
              </label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes or reminder details..."
                className="w-full py-2 px-3 text-xs text-white bg-[#1F2937] rounded-xl border border-slate-700 focus:border-violet-500 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SPLIT INFORMATION (6 COLS) */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-3xl bg-[#111827] border border-slate-800 shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
          <div className="space-y-2 shrink-0 mb-3">
            <div className="border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-violet-400">
                Split Information
              </h3>
            </div>

            {/* DIRECT 1-CLICK SELECTABLE SPLIT METHOD BUTTON TABS */}
            <div className="grid grid-cols-4 gap-2 text-center pt-0.5">
              {["Equal", "Percentage", "Custom", "Item-wise"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSplitMethod(method)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all text-center cursor-pointer ${
                    splitMethod === method
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-500 shadow-md shadow-violet-500/30 ring-1 ring-violet-400/30"
                      : "bg-[#1F2937] text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {method === "Equal" ? "Equal Split" : method}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable inner content */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-5">
            {/* SELECTABLE ELEGANT PARTICIPANT MEMBER CHIPS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Included Participants ({selectedMembers.length}/{groupMembersList.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allSelected = groupMembersList.length > 0 && selectedMembers.length === groupMembersList.length;
                      if (allSelected) {
                        const first = groupMembersList[0]?.name || groupMembersList[0] || "Alex Morgan";
                        setSelectedMembers([first]);
                      } else {
                        setSelectedMembers(groupMembersList.map((m) => m.name || m));
                      }
                    }}
                    className="text-[11px] font-bold text-violet-400 hover:text-violet-300 hover:underline cursor-pointer transition-colors"
                  >
                    {groupMembersList.length > 0 && selectedMembers.length === groupMembersList.length ? "Deselect All" : "Select All"}
                  </button>

                  <span className="text-slate-700 font-semibold">|</span>

                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="py-1 px-2.5 rounded-lg border border-dashed border-violet-500/60 bg-violet-950/40 text-violet-300 hover:bg-violet-900/60 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-violet-400 stroke-[2.5]" />
                    <span>Add Participant</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {groupMembersList.map((m) => {
                  const mName = typeof m === "string" ? m : String(m.member_name || m.name || "Member");
                  const isSelected = selectedMembers.includes(mName);
                  const breakdown = memberBreakdown.find((b) => b.name === mName);
                  const calculatedShare = breakdown ? breakdown.shareAmount : 0;
                  const avatarText = typeof m === "object" && typeof m.avatar === "string" ? m.avatar : mName.substring(0, 2).toUpperCase();

                  return (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => toggleMember(mName)}
                      className={`py-2 px-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-violet-950/60 border-violet-500 text-white shadow-xs ring-1 ring-violet-500/30"
                          : "bg-[#1F2937] border-slate-700/80 text-slate-400 opacity-50 hover:opacity-90"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {avatarText}
                        </div>
                        <div className="min-w-0 leading-tight">
                          <span className="font-bold text-xs text-white block truncate">
                            {mName}
                          </span>
                          {isSelected && Number(amount) > 0 && (
                            <span className="text-xs font-black text-violet-400 block whitespace-nowrap">
                              {formatCurrency(calculatedShare)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "bg-violet-600 text-white" : "border border-slate-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC CONTROLS FOR EQUAL, PERCENTAGE OR CUSTOM SPLIT */}
            {splitMethod === "Equal" && Number(amount) > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#1F2937]/90 border border-slate-700/80 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    Equal Share Summary
                  </span>
                  <span className="text-xs font-extrabold text-violet-400">
                    {formatCurrency(amount || 0)} Total
                  </span>
                </div>

                <div className="space-y-2.5">
                  {memberBreakdown.map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#111827] border border-slate-800"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                          {m.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-200 font-bold truncate">{m.name}</span>
                      </div>

                      <span className="font-black text-violet-400 text-xs shrink-0">{formatCurrency(m.shareAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {splitMethod === "Percentage" && (
              <div className="p-3.5 rounded-2xl bg-[#1F2937] border border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    Adjust Percentage Split
                  </span>
                  <span className="text-xs font-extrabold text-slate-400">
                    Total 100%
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedMembers.map((mName, mIdx) => (
                    <div
                      key={mName}
                      className="flex items-center justify-between p-2.5 bg-[#111827] rounded-xl border border-slate-800"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                          {mName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-200 font-bold truncate">{mName}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          id={`pct-input-${mName}`}
                          type="number"
                          value={!memberPercentages[mName] || Number(memberPercentages[mName]) === 0 ? "" : memberPercentages[mName]}
                          onChange={(e) =>
                            setMemberPercentages({ ...memberPercentages, [mName]: e.target.value })
                          }
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const nextMember = selectedMembers[mIdx + 1];
                              if (nextMember) {
                                const nextInput = document.getElementById(`pct-input-${nextMember}`);
                                if (nextInput) {
                                  nextInput.focus();
                                  nextInput.select();
                                }
                              } else {
                                e.currentTarget.blur();
                              }
                            }
                          }}
                          placeholder="0"
                          className="w-16 py-1 px-2.5 text-xs text-white bg-[#1F2937] rounded-lg border border-slate-700 font-bold text-right focus:outline-none focus:border-violet-500"
                        />
                        <span className="text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {splitMethod === "Custom" && (
              <div className="p-3.5 rounded-2xl bg-[#1F2937] border border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-violet-400" />
                    Custom Share Amounts
                  </span>
                  <span className="text-xs font-extrabold text-violet-400">
                    {formatCurrency(amount || 0)} Total
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedMembers.map((mName, mIdx) => (
                    <div
                      key={mName}
                      className="flex items-center justify-between p-2.5 bg-[#111827] rounded-xl border border-slate-800"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                          {mName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-200 font-bold truncate">{mName}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-black text-violet-400">₹</span>
                        <input
                          id={`custom-input-${mName}`}
                          type="number"
                          step="any"
                          value={!memberCustomAmounts[mName] || Number(memberCustomAmounts[mName]) === 0 ? "" : memberCustomAmounts[mName]}
                          onChange={(e) =>
                            setMemberCustomAmounts({ ...memberCustomAmounts, [mName]: e.target.value })
                          }
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const nextMember = selectedMembers[mIdx + 1];
                              if (nextMember) {
                                const nextInput = document.getElementById(`custom-input-${nextMember}`);
                                if (nextInput) {
                                  nextInput.focus();
                                  nextInput.select();
                                }
                              } else {
                                e.currentTarget.blur();
                              }
                            }
                          }}
                          placeholder="0"
                          className="w-24 py-1 px-2.5 text-xs text-violet-400 bg-[#1F2937] rounded-lg border border-slate-700 font-black text-right focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ITEM-WISE PER-MEMBER QUANTITY SPLIT BUILDER */}
            {splitMethod === "Item-wise" && (
              <div className="p-3.5 rounded-2xl bg-[#1F2937] border border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-violet-400" />
                    Per-Member Itemized Bill Builder
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="py-1 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Items List */}
                {itemsList.length === 0 ? (
                  <div className="py-7 px-4 text-center border-2 border-dashed border-slate-700/80 rounded-2xl bg-[#111827]/60 space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-violet-950/60 border border-violet-800/60 text-violet-400 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">No Items Added Yet</h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Add items and allocate quantities per roommate
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="py-1.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Add First Item</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {itemsList.map((item, idx) => {
                    const totalQtyEaten = Object.values(item.memberQty || {}).reduce(
                      (qSum, q) => qSum + Number(q || 0),
                      0
                    );
                    const itemTotalCost = totalQtyEaten * Number(item.price || 0);

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-[#111827] border border-slate-800 space-y-3"
                      >
                        {/* Item Header & Inputs Row */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4">
                            <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">
                              Item Name
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateItemName(item.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const priceInput = document.getElementById(`price-input-${item.id}`);
                                  if (priceInput) {
                                    priceInput.focus();
                                    priceInput.select();
                                  }
                                }
                              }}
                              placeholder={`Item #${idx + 1} (e.g. Biryani)`}
                              className="w-full py-1 px-2.5 text-xs text-white bg-[#1F2937] rounded-lg border border-slate-700 font-semibold focus:outline-none"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">
                              Price (₹)
                            </label>
                            <input
                              id={`price-input-${item.id}`}
                              type="number"
                              step="any"
                              value={item.price === 0 ? "" : item.price}
                              onChange={(e) => handleUpdateItemPrice(item.id, e.target.value)}
                              onFocus={(e) => e.target.select()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const firstMember = selectedMembers[0];
                                  if (firstMember) {
                                    const firstInput = document.getElementById(`qty-input-${item.id}-${firstMember}`);
                                    if (firstInput) {
                                      firstInput.focus();
                                      firstInput.select();
                                    }
                                  } else {
                                    e.currentTarget.blur();
                                  }
                                }
                              }}
                              placeholder="0"
                              className="w-full py-1 px-2 text-xs text-violet-400 bg-[#1F2937] rounded-lg border border-slate-700 font-black text-right focus:outline-none"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">
                              Total Qty
                            </label>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={item.totalQty === 0 ? "" : (item.totalQty ?? (totalQtyEaten || 1))}
                              onChange={(e) => handleUpdateItemTotalQty(item.id, e.target.value)}
                              onFocus={(e) => e.target.select()}
                              placeholder="1"
                              className="w-full py-1 px-2 text-xs text-amber-400 bg-[#1F2937] rounded-lg border border-slate-700 font-bold text-center focus:outline-none"
                            />
                          </div>

                          <div className="col-span-3 flex items-center justify-end gap-1.5 pt-3">
                            <div className="text-right leading-none">
                              <span className="text-[10px] font-black text-emerald-400 block">
                                {formatCurrency(itemTotalCost)}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold">
                                ({totalQtyEaten} ate)
                              </span>
                            </div>
                            {itemsList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-400 hover:text-red-300 p-1 rounded cursor-pointer shrink-0"
                                title="Remove Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Roommate Individual Quantity Allocation */}
                        <div className="border-t border-slate-800/80 pt-2 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Portion Consumed per Roommate:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {selectedMembers.map((mName, mIdx) => {
                              const qtyEaten = item.memberQty?.[mName] || 0;
                              const memberCost = qtyEaten * Number(item.price || 0);

                              return (
                                <div
                                  key={mName}
                                  className={`p-2 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                                    qtyEaten > 0
                                      ? "bg-violet-950/60 border-violet-500 shadow-xs ring-1 ring-violet-500/20"
                                      : "bg-[#1F2937] border-slate-800 opacity-60"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="font-bold text-[11px] text-white truncate">
                                      {mName}
                                    </span>
                                    {qtyEaten > 0 && (
                                      <span className="text-[9px] font-black text-violet-300 truncate">
                                        {formatCurrency(memberCost)}
                                      </span>
                                    )}
                                  </div>

                                  {/* Stepper + Quantity Input */}
                                  <div className="flex items-center justify-between bg-[#111827] rounded-lg border border-slate-700/80 p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMemberQty(item.id, mName, -1)}
                                      className="w-5 h-5 rounded-md bg-[#1F2937] hover:bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95"
                                      title="Decrease quantity"
                                    >
                                      <Minus className="w-3 h-3 stroke-[2.5]" />
                                    </button>
                                    <input
                                      id={`qty-input-${item.id}-${mName}`}
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={qtyEaten === 0 ? "" : qtyEaten}
                                      onChange={(e) =>
                                        handleSetMemberQty(item.id, mName, e.target.value)
                                      }
                                      onFocus={(e) => e.target.select()}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          const nextMember = selectedMembers[mIdx + 1];
                                          if (nextMember) {
                                            const nextInput = document.getElementById(
                                              `qty-input-${item.id}-${nextMember}`
                                            );
                                            if (nextInput) {
                                              nextInput.focus();
                                              nextInput.select();
                                            }
                                          } else {
                                            e.currentTarget.blur();
                                          }
                                        }
                                      }}
                                      placeholder="0"
                                      className="w-10 text-center bg-transparent text-white font-extrabold text-xs focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMemberQty(item.id, mName, 1)}
                                      className="w-5 h-5 rounded-md bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 shadow-xs"
                                      title="Increase quantity"
                                    >
                                      <Plus className="w-3 h-3 stroke-[2.5]" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            )}

          </div>

        </div>
      </form>

      {/* MODERN GLASSMORPHIC ADD PARTICIPANT MODAL */}
      <AddParticipantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddParticipant}
      />

    </div>
  );
};

export default AddExpensePage;
