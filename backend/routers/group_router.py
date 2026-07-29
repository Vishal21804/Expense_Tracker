from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas

from database import get_db
from auth import get_current_user

router = APIRouter(
    prefix="/groups",
    tags=["Groups"]
)


@router.get("/", response_model=list[schemas.GroupResponse])
def get_groups(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Group)
        .filter(models.Group.created_by == current_user.id)
        .order_by(models.Group.id.desc())
        .all()
    )


@router.post("/", response_model=schemas.GroupResponse)
def create_group(
    group: schemas.GroupCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    existing = (
    db.query(models.Group)
    .filter(
        models.Group.created_by == current_user.id,
        models.Group.name == group.name
    )
    .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A group with this name already exists."
            )

    new_group = models.Group(
        name=group.name,
        description=group.description,
        category=group.category,
        icon=group.icon,
        theme_color=group.theme_color,
        created_by=current_user.id,
        )

    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    creator_member = models.GroupMember(
        group_id=new_group.id,
        user_id=current_user.id
        )

    db.add(creator_member)
    db.commit()

    return new_group


@router.get("/{group_id}", response_model=schemas.GroupResponse)
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    group = (
        db.query(models.Group)
        .filter(
            models.Group.id == group_id,
            models.Group.created_by == current_user.id,
        )
        .first()
    )

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    return group


@router.put("/{group_id}", response_model=schemas.GroupResponse)
def update_group(
    group_id: int,
    group: schemas.GroupUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_group = (
        db.query(models.Group)
        .filter(
            models.Group.id == group_id,
            models.Group.created_by == current_user.id,
        )
        .first()
    )

    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")

    db_group.name = group.name
    db_group.description = group.description
    db_group.category = group.category
    db_group.icon = group.icon
    db_group.theme_color = group.theme_color

    db.commit()
    db.refresh(db_group)

    return db_group


@router.delete("/{group_id}")
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_group = (
        db.query(models.Group)
        .filter(
            models.Group.id == group_id,
            models.Group.created_by == current_user.id,
        )
        .first()
    )

    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")

    db.delete(db_group)
    db.commit()

    return {"message": "Group deleted successfully"}


@router.post(
    "/{group_id}/members",
    response_model=schemas.GroupMemberAdded
)
def add_member(
    group_id: int,
    member: schemas.GroupMemberInvite,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    group = (
        db.query(models.Group)
        .filter(
            models.Group.id == group_id,
            models.Group.created_by == current_user.id
        )
        .first()
    )

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    user = (
        db.query(models.User)
        .filter(models.User.email == member.email)
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = (
        db.query(models.GroupMember)
        .filter(
            models.GroupMember.group_id == group_id,
            models.GroupMember.user_id == user.id
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="User already in group")

    db_member = models.GroupMember(
        group_id=group_id,
        user_id=user.id
    )

    db.add(db_member)
    db.commit()
    db.refresh(db_member)

    return {
        "id": db_member.id,
        "user_id": user.id,
        "name": user.name,
        "email": user.email
        }


@router.get("/{group_id}/members", response_model=list[schemas.GroupMemberDetails])
def get_members(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    group = (
        db.query(models.Group)
        .filter(
            models.Group.id == group_id,
            models.Group.created_by == current_user.id
        )
        .first()
    )

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    members = (
        db.query(models.GroupMember, models.User)
        .join(
            models.User,
            models.GroupMember.user_id == models.User.id
        )
        .filter(models.GroupMember.group_id == group_id)
        .all()
    )

    return [
        {
            "id": member.id,
            "user_id": user.id,
            "name": user.name,
            "email": user.email
        }
        for member, user in members
    ]

@router.delete("/{group_id}/members/{member_id}")
def remove_member(
    group_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    group = (
        db.query(models.Group)
        .filter(
            models.Group.id == group_id,
            models.Group.created_by == current_user.id
        )
        .first()
    )

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    member = (
        db.query(models.GroupMember)
        .filter(
            models.GroupMember.id == member_id,
            models.GroupMember.group_id == group_id
        )
        .first()
    )

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if member.user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Group creator cannot be removed"
        )

    db.delete(member)
    db.commit()

    return {"message": "Member removed successfully"}

