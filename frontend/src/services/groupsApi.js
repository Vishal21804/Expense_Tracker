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

export const createGroup = async (groupData) => {
  const payload = {
    name: groupData.name || "",
    description: groupData.description || "",
    category: groupData.category || groupData.type || "General",
    icon: groupData.icon || "🏠",
    theme_color: groupData.theme_color || groupData.color || "violet",
  };

  try {
    const response = await api.post("/groups", payload);
    return mapGroupFromBackend(response.data);
  } catch (error) {
    console.error("POST /groups error:", error);
    // Fallback to local storage
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
      name: m.name || m.full_name || m.username || (m.email ? m.email.split("@")[0] : "Member"),
      email: m.email || "",
      avatar: m.avatar || (m.name ? m.name.substring(0, 2).toUpperCase() : "MB"),
      avatarEmoji: m.avatar_emoji || m.avatarEmoji || null,
      avatarUrl: m.avatar_url || m.avatarUrl || null,
    }));
  } catch (error) {
    console.error(`GET /groups/${groupId}/members error:`, error);
    const grp = await getGroup(groupId);
    return grp?.members || [];
  }
};

export const addMember = async (groupId, email) => {
  try {
    const response = await api.post(`/groups/${groupId}/members`, { email });
    return response.data;
  } catch (error) {
    console.error(`POST /groups/${groupId}/members error:`, error);
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
