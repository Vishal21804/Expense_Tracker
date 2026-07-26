from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

import models

from auth import get_current_user
from database import get_db

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard")
def dashboard(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_expense = (
        db.query(func.sum(models.Expense.amount))
        .filter(models.Expense.user_id == current_user.id)
        .scalar()
        or 0
    )

    total_budget = (
        db.query(func.sum(models.Budget.amount))
        .filter(models.Budget.user_id == current_user.id)
        .scalar()
        or 0
    )

    total_transactions = (
        db.query(models.Expense)
        .filter(models.Expense.user_id == current_user.id)
        .count()
    )

    remaining_budget = total_budget - total_expense

    category_summary = (
        db.query(
            models.Expense.category,
            func.sum(models.Expense.amount).label("total"),
        )
        .filter(models.Expense.user_id == current_user.id)
        .group_by(models.Expense.category)
        .all()
    )

    return {
        "total_budget": total_budget,
        "total_expense": total_expense,
        "remaining_budget": remaining_budget,
        "total_transactions": total_transactions,
        "category_summary": [
            {
                "category": item.category,
                "amount": item.total,
            }
            for item in category_summary
        ],
    }