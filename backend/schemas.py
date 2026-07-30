from pydantic import BaseModel, EmailStr, ConfigDict


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


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
    status: str = "Pending"


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(ExpenseBase):
    pass


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


