from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy import DECIMAL
from sqlalchemy import Boolean, DateTime
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

    expenses = relationship(
        "Expense",
        back_populates="user",
        cascade="all, delete",
        foreign_keys="Expense.user_id"
        )
    
    budgets = relationship("Budget", back_populates="user", cascade="all, delete")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(String(255))
    date = Column(String(20))

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # NEW COLUMNS
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    paid_by = Column(
        Integer,
        ForeignKey("group_members.id"),
        nullable=True
        )
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    split_method = Column(String(30), default="Equal")
    status = Column(String(30), default="Pending")

    # RELATIONSHIPS
    user = relationship(
        "User",
        back_populates="expenses",
        foreign_keys=[user_id]
    )

    group = relationship("Group")

    payer = relationship(
        "GroupMember",
        foreign_keys=[paid_by]
        )

    account = relationship("Account")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="budgets")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    account_name = Column(String(100), nullable=False)

    account_type = Column(String(50), nullable=False)

    opening_balance = Column(Float, nullable=False)

    current_balance = Column(Float, nullable=False)

    is_default = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="accounts")

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    description = Column(String(500))

    category = Column(String(50), default="General")

    icon = Column(String(20), default="🏠")

    theme_color = Column(String(30), default="purple")

    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship(
        "User",
        foreign_keys=[created_by]
    )

    members = relationship(
        "GroupMember",
        back_populates="group",
        cascade="all, delete-orphan",
        lazy="joined"
    )

class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True)

    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)

    member_name = Column(String(100), nullable=False)

    member_email = Column(String(100), nullable=True)

    phone = Column(String(20), nullable=True)

    joined_at = Column(DateTime, default=datetime.utcnow)

    group = relationship(
        "Group",
        back_populates="members"
    )



