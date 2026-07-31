from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas

from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])


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


@router.get("/groups/{group_id}/expenses", response_model=list[schemas.ExpenseResponse])
def get_group_expenses(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verify group belongs to current user
    group = (
        db.query(models.Group)
        .filter(models.Group.id == group_id, models.Group.created_by == current_user.id)
        .first()
    )

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    return (
        db.query(models.Expense)
        .filter(models.Expense.group_id == group_id)
        .order_by(models.Expense.id.desc())
        .all()
    )


@router.get(
    "/groups/{group_id}/expenses/{expense_id}/details",
    response_model=schemas.ExpenseDetailsResponse,
)
def get_expense_details(
    group_id: int,
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.id == expense_id,
            models.Expense.group_id == group_id,
            models.Expense.user_id == current_user.id,
        )
        .first()
    )

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    items_response = []

    for item in expense.items:

        consumers = []

        for consumer in item.consumers:

            consumers.append(
                schemas.ExpenseItemConsumerResponse(
                    member_id=consumer.member.id,
                    member_name=consumer.member.member_name,
                    quantity_consumed=consumer.quantity_consumed,
                    amount=float(consumer.amount),
                )
            )

        items_response.append(
            schemas.ExpenseItemResponse(
                id=item.id,
                item_name=item.item_name,
                unit_price=float(item.unit_price),
                quantity=item.quantity,
                total_price=float(item.total_price),
                consumers=consumers,
            )
        )

    return schemas.ExpenseDetailsResponse(
        id=expense.id,
        title=expense.title,
        amount=float(expense.amount),
        category=expense.category,
        description=expense.description,
        date=expense.date,
        group_id=expense.group_id,
        paid_by=expense.paid_by,
        account_id=expense.account_id,
        split_method=expense.split_method,
        items=items_response,
    )


@router.post("/groups/{group_id}/expenses", response_model=schemas.ExpenseResponse)
def add_group_expense(
    group_id: int,
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    # Verify Group
    group = (
        db.query(models.Group)
        .filter(models.Group.id == group_id, models.Group.created_by == current_user.id)
        .first()
    )

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Verify Payer
    payer = (
        db.query(models.GroupMember)
        .filter(
            models.GroupMember.id == expense.paid_by,
            models.GroupMember.group_id == group_id,
        )
        .first()
    )

    if not payer:
        raise HTTPException(status_code=404, detail="Invalid payer.")

    # Verify Account
    account = (
        db.query(models.Account)
        .filter(
            models.Account.id == expense.account_id,
            models.Account.user_id == current_user.id,
        )
        .first()
    )

    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    # Check Balance
    if account.current_balance < expense.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance.")

    # Deduct Amount
    account.current_balance -= expense.amount

    new_expense = models.Expense(
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        description=expense.description,
        date=expense.date,
        user_id=current_user.id,
        group_id=group_id,
        paid_by=expense.paid_by,
        account_id=expense.account_id,
        split_method=expense.split_method,
    )

    db.add(new_expense)
    db.flush()

    print("Split Method:", expense.split_method)
    print("Items:", expense.items)

    if expense.split_method == "Item-wise":
        for item in expense.items:

            db_item = models.ExpenseItem(
                expense_id=new_expense.id,
                item_name=item.item_name,
                unit_price=item.unit_price,
                quantity=item.quantity,
                total_price=item.total_price,
            )

            db.add(db_item)
            db.flush()  # Generates db_item.id

            for consumer in item.consumers:
                db_consumer = models.ExpenseItemConsumer(
                    item_id=db_item.id,
                    member_id=consumer.member_id,
                    quantity_consumed=consumer.quantity_consumed,
                    amount=consumer.amount,
                )

                db.add(db_consumer)

    db.commit()
    db.refresh(new_expense)
    return new_expense


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
                models.Group.created_by == current_user.id,
            )
            .first()
        )

        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

    # Validate Payer
    if expense.paid_by:
        payer = (
            db.query(models.GroupMember)
            .filter(
                models.GroupMember.id == expense.paid_by,
                models.GroupMember.group_id == expense.group_id,
            )
            .first()
        )

        if not payer:
            raise HTTPException(status_code=404, detail="Invalid payer.")

    # Validate Account
    if expense.account_id:
        account = (
            db.query(models.Account)
            .filter(
                models.Account.id == expense.account_id,
                models.Account.user_id == current_user.id,
            )
            .first()
        )

        if not account:
            raise HTTPException(status_code=404, detail="Account not found.")

        if account.current_balance < expense.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance.")

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
    )

    db.add(new_expense)
    db.flush()

    if expense.split_method == "Item-wise":
        for item in expense.items:

            db_item = models.ExpenseItem(
                expense_id=new_expense.id,
                item_name=item.item_name,
                unit_price=item.unit_price,
                quantity=item.quantity,
                total_price=item.total_price,
            )

            db.add(db_item)
            db.flush()  # Generates db_item.id

            for consumer in item.consumers:
                db_consumer = models.ExpenseItemConsumer(
                    item_id=db_item.id,
                    member_id=consumer.member_id,
                    quantity_consumed=consumer.quantity_consumed,
                    amount=consumer.amount,
                )

                db.add(db_consumer)

    db.commit()
    db.refresh(new_expense)
    return new_expense


@router.put(
    "/groups/{group_id}/expenses/{expense_id}", response_model=schemas.ExpenseResponse
)
def update_group_expense(
    group_id: int,
    expense_id: int,
    expense: schemas.ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    # Check Expense
    db_expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.id == expense_id,
            models.Expense.group_id == group_id,
            models.Expense.user_id == current_user.id,
        )
        .first()
    )

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Verify Payer
    payer = (
        db.query(models.GroupMember)
        .filter(
            models.GroupMember.id == expense.paid_by,
            models.GroupMember.group_id == group_id,
        )
        .first()
    )

    if not payer:
        raise HTTPException(status_code=404, detail="Invalid payer.")

    # Refund old account
    old_account = (
        db.query(models.Account)
        .filter(
            models.Account.id == db_expense.account_id,
            models.Account.user_id == current_user.id,
        )
        .first()
    )

    if old_account:
        old_account.current_balance += float(db_expense.amount)

    # Get new account
    new_account = (
        db.query(models.Account)
        .filter(
            models.Account.id == expense.account_id,
            models.Account.user_id == current_user.id,
        )
        .first()
    )

    if not new_account:
        raise HTTPException(status_code=404, detail="Account not found.")

    if new_account.current_balance < expense.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance.")

    # Deduct new amount
    new_account.current_balance -= expense.amount

    # Update Expense
    db_expense.title = expense.title
    db_expense.amount = expense.amount
    db_expense.category = expense.category
    db_expense.description = expense.description
    db_expense.date = expense.date
    db_expense.paid_by = expense.paid_by
    db_expense.account_id = expense.account_id
    db_expense.split_method = expense.split_method

    # Delete old items
    db.query(models.ExpenseItem).filter(
        models.ExpenseItem.expense_id == db_expense.id
    ).delete(synchronize_session=False)

    # Add updated items
    if expense.split_method == "Item-wise":
        for item in expense.items:

            db_item = models.ExpenseItem(
                expense_id=db_expense.id,
                item_name=item.item_name,
                unit_price=item.unit_price,
                quantity=item.quantity,
                total_price=item.total_price,
            )

            db.add(db_item)
            db.flush()

            for consumer in item.consumers:
                db.add(
                    models.ExpenseItemConsumer(
                        item_id=db_item.id,
                        member_id=consumer.member_id,
                        quantity_consumed=consumer.quantity_consumed,
                        amount=consumer.amount,
                    )
                )

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


@router.delete("/groups/{group_id}/expenses/{expense_id}")
def delete_group_expense(
    group_id: int,
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    db_expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.id == expense_id,
            models.Expense.group_id == group_id,
            models.Expense.user_id == current_user.id,
        )
        .first()
    )

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Refund amount back to account
    if db_expense.account_id:
        account = (
            db.query(models.Account)
            .filter(
                models.Account.id == db_expense.account_id,
                models.Account.user_id == current_user.id,
            )
            .first()
        )

        if account:
            account.current_balance += float(db_expense.amount)

    db.delete(db_expense)

    db.commit()

    return {"message": "Expense deleted successfully"}
