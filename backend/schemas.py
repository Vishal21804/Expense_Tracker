from pydantic import BaseModel, EmailStr, ConfigDict


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    description: str
    date: str


class BudgetCreate(BaseModel):
    category: str
    amount: float


class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    description: str | None = None
    date: str | None = None

    model_config = ConfigDict(from_attributes=True)


class BudgetResponse(BaseModel):
    id: int
    category: str
    amount: float

    model_config = ConfigDict(from_attributes=True)