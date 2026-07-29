from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models
from routers.auth_router import router as auth_router
from routers.expense_router import router as expense_router
from routers.budget_router import router as budget_router
from routers.dashboard_router import router as dashboard_router
from routers.account_router import router as account_router
from routers import group_router



Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Expense Tracker Backend Running Successfully"}


app.include_router(auth_router)
app.include_router(expense_router)
app.include_router(budget_router)
app.include_router(dashboard_router)
app.include_router(account_router)
app.include_router(group_router.router)
