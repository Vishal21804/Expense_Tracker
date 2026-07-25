from pydantic import BaseModel, EmailStr
from pydantic import BaseModel, ConfigDict


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
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    amount: float
    category: str
    description: str | None = None
    date: str | None = None