from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas

from auth import get_current_user
from database import get_db

router = APIRouter(tags=["Budget"])

@router.post("/budgets")
def create_budget(
    budget: schemas.BudgetCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing_budget = (
        db.query(models.Budget)
        .filter(
            models.Budget.user_id == current_user.id,
            models.Budget.category == budget.category,
        )
        .first()
    )

    if existing_budget:
        raise HTTPException(
            status_code=400,
            detail="Budget already exists for this category",
        )

    new_budget = models.Budget(
        category=budget.category,
        amount=budget.amount,
        user_id=current_user.id,
    )

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return {
        "message": "Budget created successfully",
        "budget": new_budget,
    }

@router.get("/budgets", response_model=list[schemas.BudgetResponse])
def get_budgets(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budgets = (
        db.query(models.Budget)
        .filter(models.Budget.user_id == current_user.id)
        .all()
    )

    return budgets

@router.put("/budgets/{budget_id}")
def update_budget(
    budget_id: int,
    updated_budget: schemas.BudgetCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = (
        db.query(models.Budget)
        .filter(
            models.Budget.id == budget_id,
            models.Budget.user_id == current_user.id,
        )
        .first()
    )

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    budget.category = updated_budget.category
    budget.amount = updated_budget.amount

    db.commit()
    db.refresh(budget)

    return {
        "message": "Budget updated successfully",
        "budget": budget,
    }


@router.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = (
        db.query(models.Budget)
        .filter(
            models.Budget.id == budget_id,
            models.Budget.user_id == current_user.id,
        )
        .first()
    )

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()

    return {
        "message": "Budget deleted successfully"
    }