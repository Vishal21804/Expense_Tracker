import api from "./api";

export const mapGroupFromBackend = (g) => {
  if (!g) return null;
  return {
    id: String(g.id || g.group_id || `group-${Date.now()}`),
    name: g.name || g.group_name || "Group",
    description: g.description || "",
    category: g.category || g.type || g.group_type || "General",
    type: g.category || g.type || g.group_type || "General",
    icon: g.icon || "👥",
    theme_color: g.theme_color || g.color || "violet",
    color: g.theme_color || g.color || "violet",
    createdAt: g.created_at || g.createdAt || g.created_date || null,
    membersCount: Number(g.members_count ?? g.membersCount ?? (Array.isArray(g.members) && g.members.length > 0 ? g.members.length : 1)),
    members: Array.isArray(g.members) ? g.members : [],
    totalExpenses: Number(g.total_expenses ?? g.totalExpenses ?? 0),
    pendingSettlement: Number(g.pending_settlement ?? g.pendingSettlement ?? 0),
    expensesCount: Number(g.expenses_count ?? g.expensesCount ?? 0),
  };
};

export const getGroups = async () => {
  try {
    const response = await api.get("/groups");
    const raw = Array.isArray(response.data) ? response.data : response.data?.groups || [];
    return raw.map(mapGroupFromBackend).filter(Boolean);
  } catch (error) {
    console.error("GET /groups error:", error);
    // Fallback to local storage if API is offline
    const stored = localStorage.getItem("vaultflow_groups");
    if (stored) {
      try {
        return JSON.parse(stored).map(mapGroupFromBackend).filter(Boolean);
      } catch {
        return [];
      }
    }
    throw error;
  }
};

const COLOR_HEX_MAP = {
  violet: "#7C3AED",
  emerald: "#059669",
  amber: "#D97706",
  rose: "#E11D48",
  sky: "#0284C7",
  purple: "#9333EA",
  dark: "#334155",
};

export const createGroup = async (groupData) => {
  const colorKey = groupData.color || groupData.theme_color || "violet";
  const hexColor = COLOR_HEX_MAP[colorKey] || (colorKey.startsWith("#") ? colorKey : "#7C3AED");

  const payload = {
    name: groupData.name || "",
    description: groupData.description || "",
    category: groupData.category || groupData.type || "Home",
    icon: groupData.icon || "🏠",
    theme_color: hexColor,
    members: (groupData.members || []).map((m) => ({
      member_name: m.member_name || m.name || "",
      member_email: m.member_email || m.email || "",
      phone: m.phone || "",
    })),
  };

  try {
    const response = await api.post("/groups", payload);
    return mapGroupFromBackend(response.data);
  } catch (error) {
    console.error("POST /groups error:", error);
    // Local fallback for offline/demo if server is not reachable
    if (!error.response) {
      const allGroups = localStorage.getItem("vaultflow_groups")
        ? JSON.parse(localStorage.getItem("vaultflow_groups"))
        : [];
      const slug = (payload.name || "group").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newGroup = {
        id: `${slug}-${Date.now().toString(36).substring(2, 6)}`,
        ...payload,
        members: groupData.members || [],
        membersCount: groupData.members ? groupData.members.length : 1,
        totalExpenses: 0,
        pendingSettlement: 0,
        expensesCount: 0,
      };
      localStorage.setItem("vaultflow_groups", JSON.stringify([newGroup, ...allGroups]));
      return mapGroupFromBackend(newGroup);
    }
    throw error;
  }
};

export const updateGroup = async (id, groupData) => {
  const payload = {
    name: groupData.name,
    description: groupData.description,
    category: groupData.category || groupData.type,
    icon: groupData.icon,
    theme_color: groupData.theme_color || groupData.color,
  };

  try {
    const response = await api.put(`/groups/${id}`, payload);
    return mapGroupFromBackend(response.data);
  } catch (error) {
    console.error(`PUT /groups/${id} error:`, error);
    const allGroups = localStorage.getItem("vaultflow_groups")
      ? JSON.parse(localStorage.getItem("vaultflow_groups"))
      : [];
    const updated = allGroups.map((g) => (String(g.id) === String(id) ? { ...g, ...groupData } : g));
    localStorage.setItem("vaultflow_groups", JSON.stringify(updated));
    return mapGroupFromBackend(updated.find((g) => String(g.id) === String(id)));
  }
};

export const deleteGroup = async (id) => {
  try {
    await api.delete(`/groups/${id}`);
    return true;
  } catch (error) {
    console.error(`DELETE /groups/${id} error:`, error);
    const allGroups = localStorage.getItem("vaultflow_groups")
      ? JSON.parse(localStorage.getItem("vaultflow_groups"))
      : [];
    const filtered = allGroups.filter((g) => String(g.id) !== String(id));
    localStorage.setItem("vaultflow_groups", JSON.stringify(filtered));
    return true;
  }
};

export const getGroup = async (id) => {
  try {
    const response = await api.get(`/groups/${id}`);
    return mapGroupFromBackend(response.data);
  } catch (error) {
    console.error(`GET /groups/${id} error:`, error);
    const stored = localStorage.getItem("vaultflow_groups");
    if (stored) {
      const groups = JSON.parse(stored).map(mapGroupFromBackend);
      return groups.find((g) => String(g.id) === String(id)) || groups[0];
    }
    throw error;
  }
};

export const getMembers = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/members`);
    const raw = Array.isArray(response.data) ? response.data : response.data?.members || [];
    return raw.map((m) => ({
      id: String(m.id || m.member_id || m.user_id || `m-${Date.now()}`),
      group_id: m.group_id || groupId,
      member_name: m.member_name || m.name || m.full_name || (m.member_email ? m.member_email.split("@")[0] : "Member"),
      member_email: m.member_email || m.email || "",
      phone: m.phone || m.phone_number || "",
      created_at: m.created_at || m.createdAt || null,
    }));
  } catch (error) {
    console.error(`GET /groups/${groupId}/members error:`, error);
    const grp = await getGroup(groupId);
    return Array.isArray(grp?.members)
      ? grp.members.map((m) => ({
          id: String(m.id || `m-${Date.now()}`),
          group_id: groupId,
          member_name: m.member_name || m.name || "Member",
          member_email: m.member_email || m.email || "",
          phone: m.phone || "",
        }))
      : [];
  }
};

export const addMember = async (groupId, memberData) => {
  try {
    const payload =
      typeof memberData === "string"
        ? { member_name: memberData.split("@")[0], member_email: memberData, phone: "" }
        : {
            member_name: memberData.member_name || memberData.name || "",
            member_email: memberData.member_email || memberData.email || "",
            phone: memberData.phone || "",
          };
    const response = await api.post(`/groups/${groupId}/members`, payload);
    return response.data;
  } catch (error) {
    console.error(`POST /groups/${groupId}/members error:`, error);
    throw error;
  }
};

export const updateMember = async (groupId, memberId, memberData) => {
  try {
    const payload = {
      member_name: memberData.member_name || memberData.name || "",
      member_email: memberData.member_email || memberData.email || "",
      phone: memberData.phone || "",
    };
    const response = await api.put(`/groups/${groupId}/members/${memberId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`PUT /groups/${groupId}/members/${memberId} error:`, error);
    throw error;
  }
};

export const removeMember = async (groupId, memberId) => {
  try {
    await api.delete(`/groups/${groupId}/members/${memberId}`);
    return true;
  } catch (error) {
    console.error(`DELETE /groups/${groupId}/members/${memberId} error:`, error);
    throw error;
  }
};
