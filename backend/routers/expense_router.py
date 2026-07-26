from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas

from auth import get_current_user
from database import get_db

router = APIRouter(
    tags=["Expenses"]
)