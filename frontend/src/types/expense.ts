export interface Consumer {
  member_id: number;
  member_name: string;
  quantity_consumed: number;
  amount: number;
}

export interface Item {
  id?: number;
  item_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  consumers: Consumer[];
}

export interface Member {
  id: number;
  member_name: string;
  member_email?: string;
  phone?: string;
}

export interface Account {
  id: number;
  name: string;
  account_name?: string;
  type?: string;
}

export interface ExpenseDetailsResponse {
  id: number;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  group_id?: number;
  paid_by: number;
  account_id: number;
  split_method: string;
  items: Item[];
}

export interface UpdateExpensePayload {
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paid_by: number;
  account_id: number;
  split_method: string;
  items: {
    item_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    consumers: {
      member_id: number;
      quantity_consumed: number;
      amount: number;
    }[];
  }[];
}
