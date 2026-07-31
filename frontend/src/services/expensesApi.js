import api from "./api";

// INITIAL GROUPS DATA
export const INITIAL_GROUPS = [
  {
    id: "bachelor-room",
    name: "Bachelor Room",
    type: "Home",
    icon: "🏠",
    membersCount: 4,
    members: [
      { id: "m1", name: "Alex Morgan", avatar: "AM", email: "alex@vaultflow.io" },
      { id: "m2", name: "Hari", avatar: "HA", email: "hari@vaultflow.io" },
      { id: "m3", name: "Balaji", avatar: "BA", email: "balaji@vaultflow.io" },
      { id: "m4", name: "Sedhu", avatar: "SE", email: "sedhu@vaultflow.io" },
    ],
    totalExpenses: 18250,
    pendingSettlement: 3500,
    expensesCount: 125,
    description: "Shared apartment rent, groceries, bills, and house maintenance.",
  },
  {
    id: "goa-trip",
    name: "Goa Trip",
    type: "Travel",
    icon: "🏖",
    membersCount: 6,
    members: [
      { id: "m1", name: "Alex Morgan", avatar: "AM", email: "alex@vaultflow.io" },
      { id: "m2", name: "Hari", avatar: "HA", email: "hari@vaultflow.io" },
      { id: "m3", name: "Balaji", avatar: "BA", email: "balaji@vaultflow.io" },
      { id: "m4", name: "Sedhu", avatar: "SE", email: "sedhu@vaultflow.io" },
      { id: "m5", name: "Vishal", avatar: "VI", email: "vishal@vaultflow.io" },
      { id: "m6", name: "Rahul", avatar: "RA", email: "rahul@vaultflow.io" },
    ],
    totalExpenses: 48200,
    pendingSettlement: 7800,
    expensesCount: 86,
    description: "Beach resort, car rental, food, and water sports expenses.",
  },
  {
    id: "office-team",
    name: "Office Team",
    type: "Work",
    icon: "💼",
    membersCount: 8,
    members: [
      { id: "m1", name: "Alex Morgan", avatar: "AM", email: "alex@vaultflow.io" },
      { id: "m7", name: "Sarah", avatar: "SA", email: "sarah@vaultflow.io" },
      { id: "m8", name: "Vikram", avatar: "VI", email: "vikram@vaultflow.io" },
      { id: "m9", name: "Ananya", avatar: "AN", email: "ananya@vaultflow.io" },
      { id: "m10", name: "David", avatar: "DA", email: "david@vaultflow.io" },
      { id: "m11", name: "Priya", avatar: "PR", email: "priya@vaultflow.io" },
      { id: "m12", name: "Rohan", avatar: "RO", email: "rohan@vaultflow.io" },
      { id: "m13", name: "Neha", avatar: "NE", email: "neha@vaultflow.io" },
    ],
    totalExpenses: 92000,
    pendingSettlement: 14000,
    expensesCount: 250,
    description: "Team lunches, coffee runs, offsite events, and hackathon snacks.",
  },
];

// INITIAL EXPENSES DATA
export const INITIAL_EXPENSES = [
  {
    id: "exp-1",
    groupId: "bachelor-room",
    groupName: "Bachelor Room",
    title: "Apartment Monthly Rent & Maintenance",
    category: "Rent",
    amount: 12000,
    paidBy: "Alex Morgan",
    paidFromAccount: "HDFC Salary Bank",
    splitMethod: "Equal",
    date: "2026-07-20",
    status: "Pending",
    description: "July rent split equally among Bachelor Room members.",
    billImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
    members: [
      { name: "Alex Morgan", shareAmount: 3000, percentage: 25, status: "Paid" },
      { name: "Hari", shareAmount: 3000, percentage: 25, status: "Pending" },
      { name: "Balaji", shareAmount: 3000, percentage: 25, status: "Paid" },
      { name: "Sedhu", shareAmount: 3000, percentage: 25, status: "Pending" },
    ],
    createdAt: "2026-07-20T10:00:00Z",
  },
  {
    id: "exp-2",
    groupId: "bachelor-room",
    groupName: "Bachelor Room",
    title: "Weekly Grocery & Kitchen Supplies",
    category: "Groceries",
    amount: 2400,
    paidBy: "Vishal",
    paidFromAccount: "PhonePe",
    splitMethod: "Equal",
    date: "2026-07-25",
    status: "Paid",
    description: "Vegetables, milk, fruits, and rice from supermarket.",
    billImageUrl: null,
    members: [
      { name: "Hari", shareAmount: 600, percentage: 25, status: "Paid" },
      { name: "Balaji", shareAmount: 600, percentage: 25, status: "Paid" },
      { name: "Sedhu", shareAmount: 600, percentage: 25, status: "Paid" },
      { name: "Vishal", shareAmount: 600, percentage: 25, status: "Paid" },
    ],
    createdAt: "2026-07-25T14:30:00Z",
  },
  {
    id: "exp-3",
    groupId: "bachelor-room",
    groupName: "Bachelor Room",
    title: "TNEB Electricity & Internet Bill",
    category: "Bills",
    amount: 3850,
    paidBy: "Balaji",
    paidFromAccount: "Google Pay",
    splitMethod: "Equal",
    date: "2026-07-22",
    status: "Settled",
    description: "Electricity bill and 300Mbps Wi-Fi broadband connection.",
    billImageUrl: null,
    members: [
      { name: "Alex Morgan", shareAmount: 962.5, percentage: 25, status: "Paid" },
      { name: "Hari", shareAmount: 962.5, percentage: 25, status: "Paid" },
      { name: "Balaji", shareAmount: 962.5, percentage: 25, status: "Paid" },
      { name: "Sedhu", shareAmount: 962.5, percentage: 25, status: "Paid" },
    ],
    createdAt: "2026-07-22T09:15:00Z",
  },
  {
    id: "exp-4",
    groupId: "goa-trip",
    groupName: "Goa Trip",
    title: "Beachside Villa Resort Booking Advance",
    category: "Travel",
    amount: 24000,
    paidBy: "Alex Morgan",
    paidFromAccount: "ICICI Credit Card",
    splitMethod: "Equal",
    date: "2026-07-15",
    status: "Pending",
    description: "Advance payment for 3 nights stay in Baga Beach villa.",
    billImageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80",
    members: [
      { name: "Alex Morgan", shareAmount: 4000, percentage: 16.6, status: "Paid" },
      { name: "Hari", shareAmount: 4000, percentage: 16.6, status: "Pending" },
      { name: "Balaji", shareAmount: 4000, percentage: 16.6, status: "Paid" },
      { name: "Sedhu", shareAmount: 4000, percentage: 16.6, status: "Pending" },
      { name: "Vishal", shareAmount: 4000, percentage: 16.6, status: "Pending" },
      { name: "Rahul", shareAmount: 4000, percentage: 16.6, status: "Paid" },
    ],
    createdAt: "2026-07-15T18:00:00Z",
  },
  {
    id: "exp-5",
    groupId: "office-team",
    groupName: "Office Team",
    title: "Friday Team Lunch & Celebration",
    category: "Food",
    amount: 14200,
    paidBy: "Sarah",
    paidFromAccount: "SBI Bank",
    splitMethod: "Equal",
    date: "2026-07-18",
    status: "Paid",
    description: "Team buffet lunch celebration after successful release.",
    billImageUrl: null,
    members: [
      { name: "Alex Morgan", shareAmount: 1775, percentage: 12.5, status: "Paid" },
      { name: "Sarah", shareAmount: 1775, percentage: 12.5, status: "Paid" },
    ],
    createdAt: "2026-07-18T13:45:00Z",
  },
];

// MAPPERS FOR FASTAPI API BACKEND CONNECTIVITY
export const mapGroupFromBackend = (g) => {
  if (!g) return null;
  return {
    id: String(g.id || g.group_id || "group"),
    name: g.name || g.group_name || "Group",
    type: g.type || g.group_type || "General",
    icon: g.icon || "👥",
    color: g.color || "violet",
    membersCount: Number(g.members_count ?? g.membersCount ?? (g.members ? g.members.length : 4)),
    members: Array.isArray(g.members) ? g.members : [],
    totalExpenses: Number(g.total_expenses ?? g.totalExpenses ?? 0),
    pendingSettlement: Number(g.pending_settlement ?? g.pendingSettlement ?? 0),
    expensesCount: Number(g.expenses_count ?? g.expensesCount ?? 0),
    description: g.description || "",
  };
};

export const mapExpenseFromBackend = (item) => {
  if (!item) return null;
  return {
    id: String(item.id || `exp-${Date.now()}`),
    groupId: String(item.group_id || item.groupId || "bachelor-room"),
    groupName: item.group_name || item.groupName || "Bachelor Room",
    title: item.title || item.expense_name || item.name || "Expense",
    category: item.category || "Others",
    amount: Number(item.amount || item.total_amount || 0),
    paidBy: item.paid_by || item.paidBy || "Alex Morgan",
    paidFromAccount: item.paid_from_account || item.paidFromAccount || "Cash",
    splitMethod: item.split_method || item.splitMethod || "Equal",
    date: item.date || item.expense_date || new Date().toISOString().split("T")[0],
    description: item.description || "",
    billImageUrl: item.bill_image_url || item.billImageUrl || null,
    members: Array.isArray(item.members) ? item.members : [],
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
  };
};

// STORAGE UTILS
const getStoredGroups = () => {
  const stored = localStorage.getItem("vaultflow_groups");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_GROUPS;
    }
  }
  localStorage.setItem("vaultflow_groups", JSON.stringify(INITIAL_GROUPS));
  return INITIAL_GROUPS;
};

const getStoredExpenses = () => {
  const stored = localStorage.getItem("vaultflow_expenses");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_EXPENSES;
    }
  }
  localStorage.setItem("vaultflow_expenses", JSON.stringify(INITIAL_EXPENSES));
  return INITIAL_EXPENSES;
};

const saveStoredExpenses = (data) => {
  localStorage.setItem("vaultflow_expenses", JSON.stringify(data));
};

const saveStoredGroups = (data) => {
  localStorage.setItem("vaultflow_groups", JSON.stringify(data));
};

// API METHODS
export const getGroups = async () => {
  try {
    const response = await api.get("/groups");
    const raw = Array.isArray(response.data) ? response.data : response.data?.groups || [];
    return raw.map(mapGroupFromBackend).filter(Boolean);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStoredGroups().map(mapGroupFromBackend).filter(Boolean);
  }
};

export const getGroupById = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}`);
    return mapGroupFromBackend(response.data);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const groups = getStoredGroups().map(mapGroupFromBackend);
    return groups.find((g) => String(g.id) === String(groupId)) || groups[0];
  }
};

export const getExpensesByGroup = async (groupId) => {
  const gId = typeof groupId === "object" ? (groupId.groupId || groupId.group_id || groupId.id) : groupId;
  try {
    const response = await api.get(`/expenses/groups/${gId}/expenses`);
    const raw = Array.isArray(response.data) ? response.data : response.data?.expenses || response.data?.data || [];
    return raw.map(mapExpenseFromBackend).filter(Boolean);
  } catch (error) {
    console.error(`GET /expenses/groups/${gId}/expenses error:`, error);
    try {
      const resp2 = await api.get(`/groups/${gId}/expenses`);
      const raw2 = Array.isArray(resp2.data) ? resp2.data : resp2.data?.expenses || [];
      return raw2.map(mapExpenseFromBackend).filter(Boolean);
    } catch {
      return [];
    }
  }
};

export const createExpense = async (groupId, expenseData) => {
  let gId = groupId;
  let rawPayload = expenseData;

  if (typeof groupId === "object") {
    rawPayload = groupId;
    gId = rawPayload?.groupId || rawPayload?.group_id || rawPayload?.id;
  }

  if (!gId) {
    throw new Error("groupId is required to create expense");
  }

  // Map to exact FastAPI ExpenseCreate schema expected by backend
  const payload = {
    title: rawPayload.title || rawPayload.expenseName || "",
    amount: Number(rawPayload.amount || rawPayload.totalAmount || 0),
    category: rawPayload.category || "",
    description: rawPayload.description || "",
    date: rawPayload.date || new Date().toISOString().split("T")[0],
    paid_by: typeof rawPayload.paid_by === "object" ? Number(rawPayload.paid_by.id) : Number(rawPayload.paid_by || rawPayload.paidById || 1),
    account_id: typeof rawPayload.account_id === "object" ? Number(rawPayload.account_id.id) : Number(rawPayload.account_id || rawPayload.accountId || 1),
    split_method: rawPayload.split_method || rawPayload.splitMethod || "Equal",
  };

  if ((payload.split_method === "Item-wise" || rawPayload.split_method === "Item-wise") && Array.isArray(rawPayload.items)) {
    payload.items = rawPayload.items;
  }

  console.log("POST URL:", `/expenses/groups/${gId}/expenses`);
  console.log("POST PAYLOAD:");
  console.log(JSON.stringify(payload, null, 2));

  try {
    console.log("Sending POST request...");
    const response = await api.post(`/expenses/groups/${gId}/expenses`, payload);
    console.log("POST Success:", response.data);
    return mapExpenseFromBackend(response.data);
  } catch (error) {
    console.error("POST Failed");
    console.error(error.response?.status);
    console.error(error.response?.data);
    throw error;
  }
};

export const updateExpense = async (groupId, expenseId, expenseData) => {
  let gId = groupId;
  let eId = expenseId;
  let payload = expenseData;

  if (typeof expenseData === "undefined") {
    payload = expenseId;
    eId = groupId;
    gId = payload?.groupId || payload?.group_id || "";
  }

  try {
    const response = await api.put(`/expenses/groups/${gId}/expenses/${eId}`, payload);
    return mapExpenseFromBackend(response.data);
  } catch (error) {
    console.error(`PUT /expenses/groups/${gId}/expenses/${eId} error:`, error);
    throw error;
  }
};

export const deleteExpense = async (groupId, expenseId) => {
  let gId = groupId;
  let eId = expenseId;

  if (typeof expenseId === "undefined") {
    eId = groupId;
    gId = "";
  }

  try {
    await api.delete(`/expenses/groups/${gId}/expenses/${eId}`);
    return true;
  } catch (error) {
    console.error(`DELETE /expenses/groups/${gId}/expenses/${eId} error:`, error);
    throw error;
  }
};

export const updateGroup = async (groupId, groupData) => {
  try {
    const response = await api.put(`/groups/${groupId}`, groupData);
    return mapGroupFromBackend(response.data);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const allGroups = getStoredGroups();
    const updatedGroups = allGroups.map((g) => {
      if (String(g.id) === String(groupId)) {
        return {
          ...g,
          ...groupData,
        };
      }
      return g;
    });
    saveStoredGroups(updatedGroups);
    return updatedGroups.find((g) => String(g.id) === String(groupId));
  }
};

export const updateGroupMembers = async (groupId, members) => {
  const membersCount = Array.isArray(members) ? members.length : 0;
  return updateGroup(groupId, { members, membersCount });
};

export const createGroup = async (groupData) => {
  try {
    const response = await api.post("/groups", groupData);
    return mapGroupFromBackend(response.data);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const allGroups = getStoredGroups();
    const slug = (groupData.name || "new-group").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const newGroup = {
      id: `${slug}-${Date.now().toString(36).substring(2, 6)}`,
      name: groupData.name || "New Group",
      type: groupData.type || "General",
      icon: groupData.icon || "👥",
      color: groupData.color || "violet",
      membersCount: Array.isArray(groupData.members) ? groupData.members.length : 1,
      members: Array.isArray(groupData.members) ? groupData.members : [],
      totalExpenses: 0,
      pendingSettlement: 0,
      expensesCount: 0,
      description: groupData.description || "",
    };
    const updatedGroups = [newGroup, ...allGroups];
    saveStoredGroups(updatedGroups);
    return newGroup;
  }
};

export const getExpenseDetails = async (groupId, expenseId) => {
  try {
    const response = await api.get(`/expenses/groups/${groupId}/expenses/${expenseId}/details`);
    return response.data;
  } catch (error) {
    console.error(`GET /expenses/groups/${groupId}/expenses/${expenseId}/details error:`, error);
    return null;
  }
};
