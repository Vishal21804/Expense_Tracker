import { useState, useEffect, useMemo } from "react";
import { Item, Member, Account } from "../types/expense";
import { getExpenseDetails, updateExpense } from "../services/expensesApi";
import { getMembers } from "../services/groupsApi";
import { getAccounts } from "../services/accountsApi";

export const useExpenseEditor = (groupId: string, expenseId: string, navigate: (path: string) => void) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("Food");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [paidBy, setPaidBy] = useState<number | "">("");
  const [paidFromAccount, setPaidFromAccount] = useState<number | "">(1);
  const [splitMethod, setSplitMethod] = useState<string>("Item-wise");

  // Items
  const [items, setItems] = useState<Item[]>([]);

  // Options
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [accountsList, setAccountsList] = useState<Account[]>([]);

  // Errors & Toast
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [detailsData, fetchedMembers, fetchedAccounts] = await Promise.all([
        getExpenseDetails(groupId, expenseId),
        getMembers(groupId),
        getAccounts(),
      ]);

      const validMembers: Member[] = Array.isArray(fetchedMembers)
        ? fetchedMembers.map((m: any) => ({
            id: Number(m.id),
            member_name: m.member_name || m.name || `Member #${m.id}`,
          }))
        : [];

      const validAccounts: Account[] = Array.isArray(fetchedAccounts)
        ? fetchedAccounts.map((a: any) => ({
            id: Number(a.id),
            name: a.name || a.account_name || `Account #${a.id}`,
          }))
        : [{ id: 1, name: "Cash" }];

      setMembersList(validMembers);
      setAccountsList(validAccounts);

      if (detailsData) {
        setTitle(detailsData.title || detailsData.expense_name || "");
        setAmount(String(detailsData.amount || detailsData.total_amount || 0));
        setCategory(detailsData.category || "Food");
        setDescription(detailsData.description || "");
        setDate(detailsData.date || detailsData.expense_date || new Date().toISOString().split("T")[0]);
        setPaidBy(detailsData.paid_by ? Number(detailsData.paid_by) : validMembers[0]?.id || 1);
        setPaidFromAccount(detailsData.account_id ? Number(detailsData.account_id) : validAccounts[0]?.id || 1);
        setSplitMethod(detailsData.split_method || detailsData.splitMethod || "Item-wise");

        if (Array.isArray(detailsData.items) && detailsData.items.length > 0) {
          const mappedItems: Item[] = detailsData.items.map((i: any) => ({
            id: i.id,
            item_name: i.item_name || i.name || "Item",
            unit_price: Number(i.unit_price || i.price || 0),
            quantity: Number(i.quantity || i.qty || 1),
            total_price: Number(i.total_price || (Number(i.unit_price || 0) * Number(i.quantity || 1))),
            consumers: Array.isArray(i.consumers)
              ? i.consumers.map((c: any) => ({
                  member_id: Number(c.member_id),
                  member_name: c.member_name || validMembers.find((m) => m.id === Number(c.member_id))?.member_name || "Member",
                  quantity_consumed: Number(c.quantity_consumed ?? c.quantity ?? 1),
                  amount: Number(c.amount ?? (Number(c.quantity_consumed || 1) * Number(i.unit_price || 0))),
                }))
              : [],
          }));
          setItems(mappedItems);
        } else {
          const firstMember = validMembers[0];
          setItems([
            {
              item_name: "",
              unit_price: 0,
              quantity: 1,
              total_price: 0,
              consumers: firstMember
                ? [
                    {
                      member_id: firstMember.id,
                      member_name: firstMember.member_name,
                      quantity_consumed: 1,
                      amount: 0,
                    },
                  ]
                : [],
            },
          ]);
        }
      }
    } catch (err: any) {
      console.error("Failed to load expense details:", err);
      setError("Failed to load expense details from server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (groupId && expenseId) {
      loadData();
    }
  }, [groupId, expenseId]);

  // Recalculate Computed Total Expense Amount
  const computedTotalAmount = useMemo(() => {
    if (splitMethod === "Item-wise") {
      return items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    }
    return Number(amount || 0);
  }, [items, amount, splitMethod]);

  // Update Item Fields & Auto-Calculate Subtotals
  const handleItemChange = (itemIndex: number, field: keyof Item, value: any) => {
    const updated = [...items];
    const target = { ...updated[itemIndex], [field]: value };

    if (field === "unit_price" || field === "quantity") {
      const uPrice = field === "unit_price" ? Number(value || 0) : target.unit_price;
      const qty = field === "quantity" ? Number(value || 0) : target.quantity;
      target.total_price = Math.round(uPrice * qty * 100) / 100;

      target.consumers = target.consumers.map((c) => ({
        ...c,
        amount: Math.round(c.quantity_consumed * uPrice * 100) / 100,
      }));
    }

    updated[itemIndex] = target;
    setItems(updated);
  };

  // Item Operations
  const handleAddItem = () => {
    const defaultMember = membersList[0];
    setItems([
      ...items,
      {
        item_name: "",
        unit_price: 0,
        quantity: 1,
        total_price: 0,
        consumers: defaultMember
          ? [
              {
                member_id: defaultMember.id,
                member_name: defaultMember.member_name,
                quantity_consumed: 1,
                amount: 0,
              },
            ]
          : [],
      },
    ]);
  };

  const handleDeleteItem = (itemIndex: number) => {
    if (items.length <= 1) {
      alert("At least one item is required for item-wise split.");
      return;
    }
    setItems(items.filter((_, idx) => idx !== itemIndex));
  };

  // Consumer Operations
  const handleConsumerQtyChange = (itemIndex: number, consumerIndex: number, qtyConsumed: number) => {
    const updated = [...items];
    const item = { ...updated[itemIndex] };
    const consumers = [...item.consumers];
    const targetConsumer = { ...consumers[consumerIndex] };

    const validQty = Math.max(0, Number(qtyConsumed || 0));
    targetConsumer.quantity_consumed = validQty;
    targetConsumer.amount = Math.round(validQty * item.unit_price * 100) / 100;

    consumers[consumerIndex] = targetConsumer;
    item.consumers = consumers;
    updated[itemIndex] = item;
    setItems(updated);
  };

  const handleConsumerMemberChange = (itemIndex: number, consumerIndex: number, memberId: number) => {
    const selectedMem = membersList.find((m) => m.id === Number(memberId));
    if (!selectedMem) return;

    const updated = [...items];
    const item = { ...updated[itemIndex] };
    const consumers = [...item.consumers];

    consumers[consumerIndex] = {
      ...consumers[consumerIndex],
      member_id: selectedMem.id,
      member_name: selectedMem.member_name,
    };

    item.consumers = consumers;
    updated[itemIndex] = item;
    setItems(updated);
  };

  const handleAddConsumer = (itemIndex: number) => {
    const item = items[itemIndex];
    const existingMemberIds = item.consumers.map((c) => c.member_id);
    const availableMember = membersList.find((m) => !existingMemberIds.includes(m.id)) || membersList[0];

    if (!availableMember) return;

    const updated = [...items];
    const updatedItem = { ...updated[itemIndex] };

    updatedItem.consumers = [
      ...updatedItem.consumers,
      {
        member_id: availableMember.id,
        member_name: availableMember.member_name,
        quantity_consumed: 1,
        amount: Math.round(1 * updatedItem.unit_price * 100) / 100,
      },
    ];

    updated[itemIndex] = updatedItem;
    setItems(updated);
  };

  const handleDeleteConsumer = (itemIndex: number, consumerIndex: number) => {
    const updated = [...items];
    const item = { ...updated[itemIndex] };
    if (item.consumers.length <= 1) {
      alert("At least one consumer is required per item.");
      return;
    }
    item.consumers = item.consumers.filter((_, idx) => idx !== consumerIndex);
    updated[itemIndex] = item;
    setItems(updated);
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = "Expense title is required";
    if (!category) newErrors.category = "Category is required";
    if (!paidBy) newErrors.paidBy = "Paid By member is required";

    if (splitMethod === "Item-wise") {
      if (items.length === 0) newErrors.items = "At least one item is required";

      items.forEach((item, idx) => {
        if (!item.item_name.trim()) newErrors[`item_name_${idx}`] = "Item name required";
        if (item.quantity <= 0) newErrors[`item_qty_${idx}`] = "Quantity must be > 0";
        if (item.unit_price <= 0) newErrors[`item_price_${idx}`] = "Unit price must be > 0";
        if (item.consumers.length === 0) newErrors[`item_consumers_${idx}`] = "At least 1 consumer required";

        item.consumers.forEach((c, cIdx) => {
          if (c.quantity_consumed <= 0) newErrors[`consumer_qty_${idx}_${cIdx}`] = "Qty > 0";
        });
      });
    } else {
      if (!amount || Number(amount) <= 0) newErrors.amount = "Valid amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast("Please fix validation errors before saving", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalAmount = splitMethod === "Item-wise" ? computedTotalAmount : Number(amount);

      const itemsPayload = splitMethod === "Item-wise"
        ? items.map((item) => ({
            item_name: item.item_name.trim(),
            unit_price: Number(item.unit_price),
            quantity: Number(item.quantity),
            total_price: Number(item.total_price),
            consumers: item.consumers.map((c) => ({
              member_id: Number(c.member_id),
              quantity_consumed: Number(c.quantity_consumed),
              amount: Number(c.amount),
            })),
          }))
        : [];

      const payload = {
        title: title.trim(),
        amount: finalAmount,
        category,
        description: description.trim(),
        date: date || new Date().toISOString().split("T")[0],
        paid_by: Number(paidBy),
        account_id: Number(paidFromAccount || 1),
        split_method: splitMethod,
        items: itemsPayload,
      };

      await updateExpense(groupId, expenseId, payload);
      showToast("Expense updated successfully", "success");

      setTimeout(() => {
        navigate(`/groups/${groupId}`);
      }, 1000);
    } catch (err: any) {
      console.error("Update expense failed:", err);
      showToast(err.response?.data?.detail || "Failed to update expense", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLoading,
    isSubmitting,
    error,
    toast,
    title,
    amount,
    category,
    description,
    date,
    paidBy,
    paidFromAccount,
    splitMethod,
    items,
    membersList,
    accountsList,
    errors,
    computedTotalAmount,
    setTitle,
    setAmount,
    setCategory,
    setDescription,
    setDate,
    setPaidBy,
    setPaidFromAccount,
    setSplitMethod,
    handleItemChange,
    handleAddItem,
    handleDeleteItem,
    handleConsumerMemberChange,
    handleConsumerQtyChange,
    handleAddConsumer,
    handleDeleteConsumer,
    handleSubmit,
    reload: loadData,
  };
};
