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

class GroupBase(BaseModel):
    name: str
    description: str | None = None

    category: str = "General"

    icon: str = "🏠"

    theme_color: str = "purple"


class GroupCreate(GroupBase):
    pass


class GroupUpdate(GroupBase):
    pass


class GroupResponse(GroupBase):
    id: int
    created_by: int

    model_config = ConfigDict(from_attributes=True)


class GroupMemberCreate(BaseModel):
    user_id: int


class GroupMemberResponse(BaseModel):
    id: int
    group_id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)

class GroupMemberInvite(BaseModel):
    email: EmailStr


class GroupMemberDetails(BaseModel):
    id: int
    user_id: int
    name: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)

class GroupMemberAdded(BaseModel):
    id: int
    user_id: int
    name: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)