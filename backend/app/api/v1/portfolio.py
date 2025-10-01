from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.portfolio import PortfolioItem
from app.models.user import User
from app.schemas.portfolio import PortfolioItemCreate, PortfolioItemRead, PortfolioItemUpdate
from app.core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=List[PortfolioItemRead])
def list_portfolio_items(
    user_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # If user_id is provided, get portfolio for that user
    # Otherwise, get portfolio for current user
    target_user_id = user_id if user_id else current_user.id
    
    # If viewing another user's portfolio, only show if they are a freelancer
    if target_user_id != current_user.id:
        target_user = db.query(User).filter(User.id == target_user_id).first()
        if not target_user or target_user.user_type != "Freelancer":
            raise HTTPException(status_code=404, detail="Portfolio not found")
    
    portfolio_items = db.query(PortfolioItem).filter(PortfolioItem.freelancer_id == target_user_id).offset(skip).limit(limit).all()
    return portfolio_items

@router.get("/{portfolio_item_id}", response_model=PortfolioItemRead)
def get_portfolio_item(
    portfolio_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    portfolio_item = db.query(PortfolioItem).filter(PortfolioItem.id == portfolio_item_id).first()
    if not portfolio_item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    # If viewing another user's portfolio item, only show if they are a freelancer
    if portfolio_item.freelancer_id != current_user.id:
        target_user = db.query(User).filter(User.id == portfolio_item.freelancer_id).first()
        if not target_user or target_user.user_type != "Freelancer":
            raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    return portfolio_item

@router.post("/", response_model=PortfolioItemRead, status_code=status.HTTP_201_CREATED)
def create_portfolio_item(
    portfolio_item: PortfolioItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a freelancer
    if current_user.user_type != "Freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can create portfolio items")
    
    db_portfolio_item = PortfolioItem(
        freelancer_id=current_user.id,
        title=portfolio_item.title,
        description=portfolio_item.description,
        image_url=portfolio_item.image_url,
        project_url=portfolio_item.project_url
    )
    db.add(db_portfolio_item)
    db.commit()
    db.refresh(db_portfolio_item)
    return db_portfolio_item

@router.put("/{portfolio_item_id}", response_model=PortfolioItemRead)
def update_portfolio_item(
    portfolio_item_id: int,
    portfolio_item: PortfolioItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_portfolio_item = db.query(PortfolioItem).filter(PortfolioItem.id == portfolio_item_id).first()
    if not db_portfolio_item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    # Check if user is the owner of the portfolio item
    if db_portfolio_item.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this portfolio item")
    
    update_data = portfolio_item.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_portfolio_item, key, value)
    
    db.commit()
    db.refresh(db_portfolio_item)
    return db_portfolio_item

@router.delete("/{portfolio_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio_item(
    portfolio_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_portfolio_item = db.query(PortfolioItem).filter(PortfolioItem.id == portfolio_item_id).first()
    if not db_portfolio_item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    # Check if user is the owner of the portfolio item
    if db_portfolio_item.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this portfolio item")
    
    db.delete(db_portfolio_item)
    db.commit()
    return