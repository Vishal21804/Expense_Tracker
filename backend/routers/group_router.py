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
    # Check if a group with the same name already exists
    existing_group = (
        db.query(models.Group)
        .filter(
            models.Group.created_by == current_user.id,
            models.Group.name == group.name
        )
        .first()
    )

    if existing_group:
        raise HTTPException(
            status_code=400,
            detail="A group with this name already exists."
        )

    # At least one member is required
    if not group.members:
        raise HTTPException(
            status_code=400,
            detail="Please add at least one member."
        )

    # Create the group
    new_group = models.Group(
        name=group.name,
        description=group.description,
        category=group.category,
        icon=group.icon,
        theme_color=group.theme_color,
        created_by=current_user.id
    )

    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    # Store all members
    added_members = set()

    for member in group.members:

        member_name = member.member_name.strip()

        # Skip empty names
        if member_name == "":
            continue

        # Prevent duplicate names in the same request
        if member_name.lower() in added_members:
            continue

        added_members.add(member_name.lower())

        db_member = models.GroupMember(
            group_id=new_group.id,
            member_name=member_name,
            member_email=member.member_email,
            phone=member.phone
        )

        db.add(db_member)

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
    response_model=schemas.GroupMemberResponse
)
def add_member(
    group_id: int,
    member: schemas.GroupMemberCreate,
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
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    existing = (
        db.query(models.GroupMember)
        .filter(
            models.GroupMember.group_id == group_id,
            models.GroupMember.member_name == member.member_name
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Member already exists"
        )

    new_member = models.GroupMember(
        group_id=group_id,
        member_name=member.member_name,
        member_email=member.member_email,
        phone=member.phone
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member


@router.get(
    "/{group_id}/members",
    response_model=list[schemas.GroupMemberResponse]
)
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
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    return (
        db.query(models.GroupMember)
        .filter(models.GroupMember.group_id == group_id)
        .order_by(models.GroupMember.id)
        .all()
    )


@router.put(
    "/{group_id}/members/{member_id}",
    response_model=schemas.GroupMemberResponse
)
def update_member(
    group_id: int,
    member_id: int,
    member: schemas.GroupMemberCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verify group belongs to current user
    group = (
        db.query(models.Group)
        .filter(
            models.Group.id == group_id,
            models.Group.created_by == current_user.id
        )
        .first()
    )

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    # Find member
    db_member = (
        db.query(models.GroupMember)
        .filter(
            models.GroupMember.id == member_id,
            models.GroupMember.group_id == group_id
        )
        .first()
    )

    if not db_member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    # Prevent duplicate names (excluding current member)
    duplicate = (
        db.query(models.GroupMember)
        .filter(
            models.GroupMember.group_id == group_id,
            models.GroupMember.member_name == member.member_name,
            models.GroupMember.id != member_id
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Member already exists"
        )

    # Update member
    db_member.member_name = member.member_name
    db_member.member_email = member.member_email
    db_member.phone = member.phone

    db.commit()
    db.refresh(db_member)

    return db_member



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
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    member = (
        db.query(models.GroupMember)
        .filter(
            models.GroupMember.id == member_id,
            models.GroupMember.group_id == group_id
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    db.delete(member)
    db.commit()

    return {
        "message": "Member removed successfully"
    }

