import api from "./api";

/**
 * Mapper Function: Converts FastAPI snake_case Backend response into frontend camelCase object
 */
export const mapAccountFromBackend = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    userId: item.user_id ?? item.userId ?? 1,
    name: item.account_name ?? item.name ?? "",
    type: item.account_type ?? item.type ?? "Bank",
    openingBalance: Number(item.opening_balance ?? item.openingBalance ?? 0),
    currentBalance: Number(item.current_balance ?? item.currentBalance ?? 0),
    isDefault: Boolean(item.is_default ?? item.isDefault ?? false),
    createdAt: item.created_at ?? item.createdAt ?? new Date().toISOString(),
  };
};

/**
 * Mapper Function: Converts frontend camelCase object into FastAPI snake_case request payload
 */
export const mapAccountToBackend = (accountData) => {
  if (!accountData) return {};
  return {
    account_name: accountData.name || "",
    account_type: accountData.type || "Bank",
    opening_balance: Number(accountData.openingBalance || 0),
    current_balance: Number(accountData.currentBalance || 0),
    is_default: Boolean(accountData.isDefault),
  };
};

// Helper for local storage simulation (stores snake_case to match backend API exactly)
const INITIAL_ACCOUNTS = [
  {
    id: 1,
    user_id: 1,
    account_name: "HDFC Salary Bank",
    account_type: "Bank",
    opening_balance: 50000.00,
    current_balance: 84520.50,
    is_default: true,
    created_at: "2026-01-10T10:30:00Z",
  },
  {
    id: 2,
    user_id: 1,
    account_name: "PhonePe UPI",
    account_type: "UPI",
    opening_balance: 10000.00,
    current_balance: 12450.00,
    is_default: false,
    created_at: "2026-01-15T14:20:00Z",
  },
  {
    id: 3,
    user_id: 1,
    account_name: "SBI Savings Bank",
    account_type: "Bank",
    opening_balance: 100000.00,
    current_balance: 142300.00,
    is_default: false,
    created_at: "2026-02-01T09:15:00Z",
  },
  {
    id: 4,
    user_id: 1,
    account_name: "ICICI Credit Card",
    account_type: "Credit Card",
    opening_balance: 0.00,
    current_balance: -15400.00,
    is_default: false,
    created_at: "2026-02-12T11:45:00Z",
  },
  {
    id: 5,
    user_id: 1,
    account_name: "Cash Wallet",
    account_type: "Cash",
    opening_balance: 5000.00,
    current_balance: 4800.00,
    is_default: false,
    created_at: "2026-02-20T16:00:00Z",
  },
];

const getStoredAccountsRaw = () => {
  const stored = localStorage.getItem("vaultflow_accounts");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_ACCOUNTS;
    }
  }
  localStorage.setItem("vaultflow_accounts", JSON.stringify(INITIAL_ACCOUNTS));
  return INITIAL_ACCOUNTS;
};

const saveStoredAccountsRaw = (accounts) => {
  localStorage.setItem("vaultflow_accounts", JSON.stringify(accounts));
};

const mapAccountToBackendWithId = (acc) => ({
  id: acc.id,
  user_id: acc.userId || 1,
  account_name: acc.name,
  account_type: acc.type,
  opening_balance: acc.openingBalance,
  current_balance: acc.currentBalance,
  is_default: acc.isDefault,
  created_at: acc.createdAt,
});

/**
 * GET /accounts (or /api/accounts)
 * Returns array of accounts mapped to camelCase
 */
export const getAccounts = async () => {
  try {
    const response = await api.get("/accounts");
    const rawData = Array.isArray(response.data)
      ? response.data
      : response.data?.accounts || response.data?.data || [];
    return rawData.map(mapAccountFromBackend).filter(Boolean);
  } catch (error) {
    console.warn("FastAPI server unavailable, using local mock data:", error);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStoredAccountsRaw().map(mapAccountFromBackend).filter(Boolean);
  }
};

/**
 * POST /accounts
 * Accepts camelCase frontend accountData, converts to snake_case payload for FastAPI,
 * and maps returned snake_case account back to camelCase.
 */
export const createAccount = async (accountData) => {
  const payload = mapAccountToBackend(accountData);
  try {
    const response = await api.post("/accounts", payload);
    const result = response.data?.account || response.data?.data || response.data;
    return mapAccountFromBackend(result);
  } catch (error) {
    console.warn("FastAPI create request failed, falling back locally:", error);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = getStoredAccountsRaw().map(mapAccountFromBackend);

    let updated = current;
    if (accountData.isDefault) {
      updated = current.map((acc) => ({ ...acc, isDefault: false }));
    } else if (current.length === 0) {
      accountData.isDefault = true;
    }

    const newAccount = {
      id: Date.now(),
      userId: 1,
      name: accountData.name,
      type: accountData.type,
      openingBalance: Number(accountData.openingBalance || 0),
      currentBalance: Number(accountData.currentBalance || 0),
      isDefault: Boolean(accountData.isDefault),
      createdAt: new Date().toISOString(),
    };

    updated = [newAccount, ...updated];
    saveStoredAccountsRaw(updated.map(mapAccountToBackendWithId));
    return newAccount;
  }
};

/**
 * PUT /accounts/:id
 * Accepts camelCase frontend accountData, converts to snake_case payload for FastAPI,
 * and maps returned snake_case account back to camelCase.
 */
export const updateAccount = async (id, accountData) => {
  const payload = mapAccountToBackend(accountData);
  try {
    const response = await api.put(`/accounts/${id}`, payload);
    const result = response.data?.account || response.data?.data || response.data;
    return mapAccountFromBackend(result);
  } catch (error) {
    console.warn("FastAPI update request failed, falling back locally:", error);
    await new Promise((resolve) => setTimeout(resolve, 300));
    let current = getStoredAccountsRaw().map(mapAccountFromBackend);

    if (accountData.isDefault) {
      current = current.map((acc) => ({ ...acc, isDefault: false }));
    }

    const updated = current.map((acc) => {
      if (String(acc.id) === String(id)) {
        return {
          ...acc,
          ...accountData,
          openingBalance: Number(accountData.openingBalance || 0),
          currentBalance: Number(accountData.currentBalance || 0),
        };
      }
      return acc;
    });

    saveStoredAccountsRaw(updated.map(mapAccountToBackendWithId));
    return updated.find((acc) => String(acc.id) === String(id));
  }
};

/**
 * DELETE /accounts/:id
 */
export const deleteAccount = async (id) => {
  try {
    await api.delete(`/accounts/${id}`);
    return true;
  } catch (error) {
    console.warn("FastAPI delete request failed, falling back locally:", error);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = getStoredAccountsRaw().map(mapAccountFromBackend);
    const updated = current.filter((acc) => String(acc.id) !== String(id));

    if (updated.length > 0 && !updated.some((acc) => acc.isDefault)) {
      updated[0].isDefault = true;
    }

    saveStoredAccountsRaw(updated.map(mapAccountToBackendWithId));
    return true;
  }
};

/**
 * PATCH or PUT /accounts/:id/default
 */
export const setDefaultAccount = async (id) => {
  try {
    let response;
    try {
      response = await api.patch(`/accounts/${id}/default`);
    } catch {
      response = await api.put(`/accounts/${id}/default`, { is_default: true });
    }
    const result = response.data?.account || response.data?.data || response.data;
    return mapAccountFromBackend(result);
  } catch (error) {
    console.warn("FastAPI setDefault request failed, falling back locally:", error);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = getStoredAccountsRaw().map(mapAccountFromBackend);
    const updated = current.map((acc) => ({
      ...acc,
      isDefault: String(acc.id) === String(id),
    }));
    saveStoredAccountsRaw(updated.map(mapAccountToBackendWithId));
    return updated.find((acc) => String(acc.id) === String(id));
  }
};
