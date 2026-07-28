from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Account
from schemas import AccountCreate, AccountUpdate, AccountResponse
from auth import get_current_user

router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)


@router.get("/", response_model=list[AccountResponse])
def get_accounts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Account).filter(Account.user_id == current_user.id).all()


@router.post("/", response_model=AccountResponse)
def create_account(
    account: AccountCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_account = Account(
        user_id=current_user.id,
        account_name=account.account_name,
        account_type=account.account_type,
        opening_balance=account.opening_balance,
        current_balance=account.current_balance,
        is_default=account.is_default,
    )

    db.add(db_account)
    db.commit()
    db.refresh(db_account)

    return db_account


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int,
    account: AccountUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()

    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")

    db_account.account_name = account.account_name
    db_account.account_type = account.account_type
    db_account.opening_balance = account.opening_balance
    db_account.current_balance = account.current_balance
    db_account.is_default = account.is_default

    db.commit()
    db.refresh(db_account)

    return db_account


@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()

    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")

    db.delete(db_account)
    db.commit()

    return {"message": "Account deleted successfully"}