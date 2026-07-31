/**
 * Splitwise-style Pairwise Net Settlement Calculator
 * Offsets debts between every pair of members (A owes B ₹100 & B owes A ₹60 => A owes B ₹40).
 */

export const isMeMember = (m) => {
  if (!m) return false;
  if (typeof m === "string") {
    const s = m.toLowerCase();
    return s === "vishal" || s === "me";
  }
  const nameStr = (m.member_name || m.name || "").toLowerCase();
  return nameStr === "vishal" || nameStr === "me" || String(m.id) === "1" || String(m.id) === "3";
};

export const calculateNetSettlement = (expenses, groupMembers) => {
  const list = Array.isArray(expenses) ? expenses : [];
  const members = Array.isArray(groupMembers) && groupMembers.length > 0 ? groupMembers : [];
  const memberCount = Math.max(members.length, 1);

  // Canonical member maps
  const memberMap = {};
  const memberInfoMap = {};

  members.forEach((m) => {
    const canonicalName = m.member_name || m.name || `Member-${m.id}`;
    memberInfoMap[canonicalName] = {
      id: m.id,
      name: canonicalName,
      email: m.member_email || m.email || "",
      isMe: isMeMember(m),
    };
    if (m.id) memberMap[String(m.id)] = canonicalName;
    memberMap[canonicalName.toLowerCase()] = canonicalName;
  });

  // Identify "Me" key
  const meKey = Object.keys(memberInfoMap).find((k) => isMeMember(memberInfoMap[k])) || "Vishal";

  // Step 1 & 2: Accumulate Gross Debts: grossDebt[A][B] = amount A owes B
  const grossDebt = {};
  const reasonCountMap = {};

  const canonicalKeys = Object.keys(memberInfoMap);
  canonicalKeys.forEach((a) => {
    grossDebt[a] = {};
    canonicalKeys.forEach((b) => {
      grossDebt[a][b] = 0;
      reasonCountMap[`${a}->${b}`] = 0;
    });
  });

  list.forEach((exp) => {
    if (!exp) return;
    const totalAmount = Number(exp.amount || 0);
    if (totalAmount <= 0) return;

    // Resolve Payer Canonical Name
    const paidByVal = exp.paidBy ?? exp.paid_by;
    let payerKey = null;

    if (typeof paidByVal === "object") {
      payerKey = paidByVal.member_name || paidByVal.name || "Member";
    } else {
      const pStr = String(paidByVal || "");
      payerKey = memberMap[pStr] || memberMap[pStr.toLowerCase()] || pStr;
    }

    if (!memberInfoMap[payerKey]) {
      memberInfoMap[payerKey] = { id: payerKey, name: payerKey, email: "", isMe: isMeMember(payerKey) };
      grossDebt[payerKey] = {};
      canonicalKeys.forEach((k) => {
        grossDebt[payerKey][k] = 0;
        if (!grossDebt[k]) grossDebt[k] = {};
        grossDebt[k][payerKey] = 0;
      });
    }

    // Determine participant shares
    if (Array.isArray(exp.members) && exp.members.length > 0) {
      exp.members.forEach((m) => {
        const share = Number(m.shareAmount || m.share_amount || 0);
        const mName = m.member_name || m.name || `Member-${m.id}`;
        const participantKey = memberMap[mName] || memberMap[mName.toLowerCase()] || mName;

        if (share > 0 && participantKey !== payerKey) {
          if (!grossDebt[participantKey]) grossDebt[participantKey] = {};
          if (!grossDebt[participantKey][payerKey]) grossDebt[participantKey][payerKey] = 0;

          grossDebt[participantKey][payerKey] += share;
          const keyStr = `${participantKey}->${payerKey}`;
          reasonCountMap[keyStr] = (reasonCountMap[keyStr] || 0) + 1;
        }
      });
    } else {
      // Equal split fallback among all group members
      const eachShare = totalAmount / memberCount;
      Object.keys(memberInfoMap).forEach((participantKey) => {
        if (participantKey !== payerKey) {
          if (!grossDebt[participantKey]) grossDebt[participantKey] = {};
          if (!grossDebt[participantKey][payerKey]) grossDebt[participantKey][payerKey] = 0;

          grossDebt[participantKey][payerKey] += eachShare;
          const keyStr = `${participantKey}->${payerKey}`;
          reasonCountMap[keyStr] = (reasonCountMap[keyStr] || 0) + 1;
        }
      });
    }
  });

  // Step 3: Pairwise Net Debt Offsetting
  const netDebt = {};
  const allKeys = Object.keys(memberInfoMap);

  allKeys.forEach((a) => {
    netDebt[a] = {};
    allKeys.forEach((b) => {
      netDebt[a][b] = 0;
    });
  });

  for (let i = 0; i < allKeys.length; i++) {
    for (let j = i + 1; j < allKeys.length; j++) {
      const a = allKeys[i];
      const b = allKeys[j];

      const debtAtoB = grossDebt[a]?.[b] || 0;
      const debtBtoA = grossDebt[b]?.[a] || 0;

      const diff = debtAtoB - debtBtoA;

      if (diff > 0) {
        netDebt[a][b] = diff;
        netDebt[b][a] = 0;
      } else if (diff < 0) {
        netDebt[a][b] = 0;
        netDebt[b][a] = Math.abs(diff);
      } else {
        netDebt[a][b] = 0;
        netDebt[b][a] = 0;
      }
    }
  }

  // Step 4: Extract "Others Owe Me" and "I Owe Others" for "Me" (meKey)
  const othersOweList = [];
  const iOweList = [];

  allKeys.forEach((otherKey) => {
    if (otherKey === meKey) return;

    // Amount otherKey owes me (net)
    const owedToMe = netDebt[otherKey]?.[meKey] || 0;
    if (owedToMe > 0.01) {
      othersOweList.push({
        id: memberInfoMap[otherKey]?.id || otherKey,
        name: memberInfoMap[otherKey]?.name || otherKey,
        email: memberInfoMap[otherKey]?.email || "",
        amount: Math.round(owedToMe * 100) / 100,
        count: reasonCountMap[`${otherKey}->${meKey}`] || 1,
      });
    }

    // Amount I owe otherKey (net)
    const iOwe = netDebt[meKey]?.[otherKey] || 0;
    if (iOwe > 0.01) {
      iOweList.push({
        id: memberInfoMap[otherKey]?.id || otherKey,
        name: memberInfoMap[otherKey]?.name || otherKey,
        email: memberInfoMap[otherKey]?.email || "",
        amount: Math.round(iOwe * 100) / 100,
        count: reasonCountMap[`${meKey}->${otherKey}`] || 1,
      });
    }
  });

  const totalOthersOweMe = othersOweList.reduce((sum, item) => sum + item.amount, 0);
  const totalIOweOthers = iOweList.reduce((sum, item) => sum + item.amount, 0);
  const netDifference = Math.round((totalOthersOweMe - totalIOweOthers) * 100) / 100;

  return {
    othersOweList,
    iOweList,
    totalOthersOweMe,
    totalIOweOthers,
    netDifference,
  };
};
