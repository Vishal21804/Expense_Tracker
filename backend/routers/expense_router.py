from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas

from database import get_db
from auth import get_current_user

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.get("/", response_model=list[schemas.ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Expense)
        .filter(models.Expense.user_id == current_user.id)
        .order_by(models.Expense.id.desc())
        .all()
    )


@router.post("/", response_model=schemas.ExpenseResponse)
def add_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    # Validate Group
    if expense.group_id:
        group = (
            db.query(models.Group)
            .filter(
                models.Group.id == expense.group_id,
                models.Group.created_by == current_user.id
            )
            .first()
        )

        if not group:
            raise HTTPException(
                status_code=404,
                detail="Group not found"
            )

    # Validate Payer
    if expense.paid_by:
        payer = (
            db.query(models.GroupMember)
            .filter(
                models.GroupMember.id == expense.paid_by,
                models.GroupMember.group_id == expense.group_id
                )
                .first()
                )

        if not payer:
            raise HTTPException(
                status_code=404,
                detail="Invalid payer."
            )

    # Validate Account
    if expense.account_id:
        account = (
            db.query(models.Account)
            .filter(
                models.Account.id == expense.account_id,
                models.Account.user_id == current_user.id
            )
            .first()
        )

        if not account:
            raise HTTPException(
                status_code=404,
                detail="Account not found."
            )

        if account.current_balance < expense.amount:
            raise HTTPException(
                status_code=400,
                detail="Insufficient balance."
            )

        account.current_balance -= expense.amount

    new_expense = models.Expense(
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        description=expense.description,
        date=expense.date,
        user_id=current_user.id,

        group_id=expense.group_id,
        paid_by=expense.paid_by,
        account_id=expense.account_id,
        split_method=expense.split_method,
        status=expense.status
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


@router.put("/{expense_id}", response_model=schemas.ExpenseResponse)
def update_expense(
    expense_id: int,
    expense: schemas.ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.id == expense_id,
            models.Expense.user_id == current_user.id,
        )
        .first()
    )

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db_expense.title = expense.title
    db_expense.amount = expense.amount
    db_expense.category = expense.category
    db_expense.description = expense.description
    db_expense.date = expense.date

    db_expense.group_id = expense.group_id
    db_expense.paid_by = expense.paid_by
    db_expense.account_id = expense.account_id
    db_expense.split_method = expense.split_method
    db_expense.status = expense.status

    db.commit()
    db.refresh(db_expense)

    return db_expense


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.id == expense_id,
            models.Expense.user_id == current_user.id,
        )
        .first()
    )

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(db_expense)
    db.commit()

    return {"message": "Expense deleted successfully"}