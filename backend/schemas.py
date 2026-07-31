from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import date


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ExpenseItemConsumerCreate(BaseModel):
    member_id: int
    quantity_consumed: int
    amount: float


class ExpenseItemCreate(BaseModel):
    item_name: str
    unit_price: float
    quantity: int
    total_price: float

    consumers: list[ExpenseItemConsumerCreate]


class ExpenseBase(BaseModel):
    title: str
    amount: float
    category: str
    description: str | None = None
    date: str

    group_id: int | None = None
    paid_by: int | None = None
    account_id: int | None = None

    split_method: str = "Equal"


class ExpenseCreate(ExpenseBase):
    items: list[ExpenseItemCreate] = []


class ExpenseUpdate(ExpenseBase):
    items: list[ExpenseItemCreate] = []


class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class BudgetCreate(BaseModel):
    category: str
    amount: float


class BudgetResponse(BaseModel):
    id: int
    category: str
    amount: float

    model_config = ConfigDict(from_attributes=True)


class AccountBase(BaseModel):
    account_name: str
    account_type: str
    opening_balance: float
    current_balance: float
    is_default: bool = False


class AccountCreate(AccountBase):
    pass


class AccountUpdate(AccountBase):
    pass


class AccountResponse(AccountBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class GroupMemberBase(BaseModel):
    member_name: str
    member_email: str | None = None
    phone: str | None = None


class GroupMemberCreate(GroupMemberBase):
    pass


class GroupMemberResponse(GroupMemberBase):
    id: int
    group_id: int

    model_config = ConfigDict(from_attributes=True)


class GroupBase(BaseModel):
    name: str
    description: str | None = None

    category: str = "General"

    icon: str = "🏠"

    theme_color: str = "purple"


class GroupCreate(GroupBase):
    members: list[GroupMemberCreate]


class GroupUpdate(GroupBase):
    pass


class GroupResponse(GroupBase):
    id: int
    created_by: int
    members: list[GroupMemberResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ExpenseItemConsumerResponse(BaseModel):
    member_id: int
    member_name: str
    quantity_consumed: int
    amount: float

    model_config = ConfigDict(from_attributes=True)


class ExpenseItemResponse(BaseModel):
    id: int
    item_name: str
    unit_price: float
    quantity: int
    total_price: float

    consumers: list[ExpenseItemConsumerResponse]

    model_config = ConfigDict(from_attributes=True)


class ExpenseDetailsResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    description: str | None
    date: date

    group_id: int
    paid_by: int
    account_id: int

    split_method: str

    items: list[ExpenseItemResponse]

    class Config:
        from_attributes = True


class ExpenseUpdate(BaseModel):
    title: str
    amount: float
    category: str
    description: str | None = None
    date: date
    paid_by: int
    account_id: int
    split_method: str
    items: list[ExpenseItemCreate] = []
