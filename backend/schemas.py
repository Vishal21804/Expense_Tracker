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