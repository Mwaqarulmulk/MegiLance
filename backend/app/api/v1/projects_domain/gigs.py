# @AI-HINT: Gig Marketplace API — full CRUD for gigs, orders, reviews, deliveries
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime, timezone
import logging
import json
import uuid
logger = logging.getLogger(__name__)

from app.core.security import get_current_user_from_token
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def get_current_user(token_data=Depends(get_current_user_from_token)):
    return token_data


def _parse_json(value):
    if not value:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return []
    return []


def _slugify(text: str) -> str:
    import re
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text[:100]


# ==================== GIGS CRUD ====================

@router.get("")
def list_gigs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    category_id: Optional[int] = Query(None),
    subcategory: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    seller_level: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    sort_by: Optional[str] = Query("newest"),
    query: Optional[str] = Query(None),
):
    """List published gigs with filtering and pagination"""
    offset = (page - 1) * page_size
    conditions = ["g.status = 'active'"]
    params: list = []

    if category_id:
        conditions.append("g.category_id = ?")
        params.append(category_id)
    if subcategory:
        conditions.append("g.subcategory = ?")
        params.append(subcategory)
    if min_price is not None:
        conditions.append("g.basic_price >= ?")
        params.append(min_price)
    if max_price is not None:
        conditions.append("g.basic_price <= ?")
        params.append(max_price)
    if seller_level:
        conditions.append("u.seller_level = ?")
        params.append(seller_level)
    if min_rating is not None:
        conditions.append("g.average_rating >= ?")
        params.append(min_rating)
    if query:
        conditions.append("(g.title LIKE ? OR g.description LIKE ?)")
        params.extend([f"%{query}%", f"%{query}%"])

    sort_map = {
        "newest": "g.created_at DESC",
        "oldest": "g.created_at ASC",
        "price_low": "g.basic_price ASC",
        "price_high": "g.basic_price DESC",
        "rating": "g.average_rating DESC",
        "popular": "g.orders_count DESC",
    }
    order = sort_map.get(sort_by, "g.created_at DESC")

    where = " AND ".join(conditions)
    count_result = execute_query(
        f"SELECT COUNT(*) as total FROM gigs g JOIN users u ON g.seller_id = u.id WHERE {where}",
        params
    )
    total = 0
    if count_result and count_result.get("rows"):
        total = parse_rows(count_result)[0].get("total", 0)

    result = execute_query(
        f"""SELECT g.*, u.name as seller_name, u.profile_image_url as seller_avatar,
                   u.seller_level, u.profile_slug
            FROM gigs g
            JOIN users u ON g.seller_id = u.id
            WHERE {where}
            ORDER BY {order}
            LIMIT ? OFFSET ?""",
        params + [page_size, offset]
    )

    items = parse_rows(result) if result and result.get("rows") else []
    for item in items:
        item["tags"] = _parse_json(item.get("tags"))
        item["images"] = _parse_json(item.get("images"))

    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/slug/{slug}")
def get_gig_by_slug(slug: str):
    """Get a gig by its slug"""
    result = execute_query(
        """SELECT g.*, u.name as seller_name, u.profile_image_url as seller_avatar,
                  u.seller_level, u.bio as seller_bio, u.profile_slug as seller_slug,
                  u.created_at as seller_member_since
           FROM gigs g
           JOIN users u ON g.seller_id = u.id
           WHERE g.slug = ? AND g.status = 'active'""",
        [slug]
    )

    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="Gig not found")

    gig = parse_rows(result)[0]
    gig["tags"] = _parse_json(gig.get("tags"))
    gig["images"] = _parse_json(gig.get("images"))

    # Get FAQs
    faq_result = execute_query(
        "SELECT id, question, answer, sort_order FROM gig_faqs WHERE gig_id = ? ORDER BY sort_order",
        [gig["id"]]
    )
    gig["faqs"] = parse_rows(faq_result) if faq_result and faq_result.get("rows") else []

    # Get reviews
    review_result = execute_query(
        """SELECT r.*, u.name as reviewer_name, u.profile_image_url as reviewer_avatar
           FROM gig_reviews r JOIN users u ON r.buyer_id = u.id
           WHERE r.gig_id = ? ORDER BY r.created_at DESC LIMIT 10""",
        [gig["id"]]
    )
    gig["reviews"] = parse_rows(review_result) if review_result and review_result.get("rows") else []

    return gig


@router.get("/{gig_id}")
def get_gig(gig_id: int, current_user=Depends(get_current_user)):
    """Get a gig by ID"""
    result = execute_query(
        """SELECT g.*, u.name as seller_name, u.profile_image_url as seller_avatar,
                  u.seller_level, u.bio as seller_bio
           FROM gigs g JOIN users u ON g.seller_id = u.id WHERE g.id = ?""",
        [gig_id]
    )

    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="Gig not found")

    gig = parse_rows(result)[0]
    gig["tags"] = _parse_json(gig.get("tags"))
    gig["images"] = _parse_json(gig.get("images"))
    return gig


@router.post("", status_code=status.HTTP_201_CREATED)
def create_gig(
    gig_data: dict,
    current_user=Depends(get_current_user)
):
    """Create a new gig"""
    user_id = current_user.get("user_id")
    user_role = current_user.get("role", "")
    if user_role.lower() != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can create gigs")

    now = datetime.now(timezone.utc).isoformat()
    slug = _slugify(gig_data.get("title", "")) + "-" + str(uuid.uuid4())[:8]

    # Insert gig
    result = execute_query(
        """INSERT INTO gigs (seller_id, title, slug, category_id, subcategory, description,
            basic_title, basic_description, basic_price, basic_delivery_days, basic_revisions,
            standard_title, standard_description, standard_price, standard_delivery_days, standard_revisions,
            premium_title, premium_description, premium_price, premium_delivery_days, premium_revisions,
            tags, images, thumbnail_url, status, rating_average, rating_count, orders_completed)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0, 0, 0)""",
        [
            user_id,
            gig_data.get("title", ""),
            slug,
            gig_data.get("category_id"),
            gig_data.get("subcategory", ""),
            gig_data.get("description", ""),
            gig_data.get("basic_title", "Basic"),
            gig_data.get("basic_description", ""),
            gig_data.get("basic_price", 0),
            gig_data.get("basic_delivery_days", 3),
            gig_data.get("basic_revisions", 1),
            gig_data.get("standard_title", "Standard"),
            gig_data.get("standard_description", ""),
            gig_data.get("standard_price", 0),
            gig_data.get("standard_delivery_days", 5),
            gig_data.get("standard_revisions", 3),
            gig_data.get("premium_title", "Premium"),
            gig_data.get("premium_description", ""),
            gig_data.get("premium_price", 0),
            gig_data.get("premium_delivery_days", 7),
            gig_data.get("premium_revisions", 5),
            json.dumps(gig_data.get("tags", [])),
            json.dumps(gig_data.get("images", [])),
            gig_data.get("thumbnail_url", ""),
        ]
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to create gig")

    id_result = execute_query("SELECT last_insert_rowid() as id", [])
    new_id = parse_rows(id_result)[0].get("id", 0) if id_result and id_result.get("rows") else 0

    # Insert FAQs
    for i, faq in enumerate(gig_data.get("faqs", [])):
        execute_query(
            "INSERT INTO gig_faqs (gig_id, question, answer, sort_order) VALUES (?, ?, ?, ?)",
            [new_id, faq.get("question", ""), faq.get("answer", ""), i]
        )

    return {"id": new_id, "slug": slug, "status": "draft"}


@router.put("/{gig_id}")
def update_gig(gig_id: int, gig_data: dict, current_user=Depends(get_current_user)):
    """Update a gig"""
    user_id = current_user.get("user_id")

    owner = execute_query("SELECT seller_id FROM gigs WHERE id = ?", [gig_id])
    if not owner or not owner.get("rows"):
        raise HTTPException(status_code=404, detail="Gig not found")
    if parse_rows(owner)[0].get("seller_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    updates = []
    params: list = []

    for field in ("title", "description", "subcategory", "thumbnail_url"):
        if field in gig_data:
            updates.append(f"{field} = ?")
            params.append(gig_data[field])

    for field in ("basic_title", "basic_description", "basic_price", "basic_delivery_days", "basic_revisions",
                  "standard_title", "standard_description", "standard_price", "standard_delivery_days", "standard_revisions",
                  "premium_title", "premium_description", "premium_price", "premium_delivery_days", "premium_revisions"):
        if field in gig_data:
            updates.append(f"{field} = ?")
            params.append(gig_data[field])

    if "tags" in gig_data:
        updates.append("tags = ?")
        params.append(json.dumps(gig_data["tags"]))
    if "images" in gig_data:
        updates.append("images = ?")
        params.append(json.dumps(gig_data["images"]))

    if updates:
        params.append(gig_id)
        execute_query(f"UPDATE gigs SET {', '.join(updates)} WHERE id = ?", params)

    return {"id": gig_id, "status": "updated"}


@router.post("/{gig_id}/publish")
def publish_gig(gig_id: int, current_user=Depends(get_current_user)):
    """Publish a gig"""
    user_id = current_user.get("user_id")
    owner = execute_query("SELECT seller_id FROM gigs WHERE id = ?", [gig_id])
    if not owner or not owner.get("rows") or parse_rows(owner)[0].get("seller_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    execute_query("UPDATE gigs SET status = 'active' WHERE id = ?", [gig_id])
    return {"status": "active"}


@router.post("/{gig_id}/pause")
def pause_gig(gig_id: int, current_user=Depends(get_current_user)):
    """Pause a gig"""
    user_id = current_user.get("user_id")
    owner = execute_query("SELECT seller_id FROM gigs WHERE id = ?", [gig_id])
    if not owner or not owner.get("rows") or parse_rows(owner)[0].get("seller_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    execute_query("UPDATE gigs SET status = 'paused' WHERE id = ?", [gig_id])
    return {"status": "paused"}


@router.delete("/{gig_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gig(gig_id: int, current_user=Depends(get_current_user)):
    """Delete a gig"""
    user_id = current_user.get("user_id")
    owner = execute_query("SELECT seller_id FROM gigs WHERE id = ?", [gig_id])
    if not owner or not owner.get("rows") or parse_rows(owner)[0].get("seller_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    execute_query("DELETE FROM gig_faqs WHERE gig_id = ?", [gig_id])
    execute_query("DELETE FROM gigs WHERE id = ?", [gig_id])


@router.get("/seller/my-gigs")
def my_gigs(current_user=Depends(get_current_user)):
    """Get current user's gigs"""
    user_id = current_user.get("user_id")
    result = execute_query(
        "SELECT * FROM gigs WHERE seller_id = ? ORDER BY created_at DESC",
        [user_id]
    )
    items = parse_rows(result) if result and result.get("rows") else []
    for item in items:
        item["tags"] = _parse_json(item.get("tags"))
        item["images"] = _parse_json(item.get("images"))
    return {"items": items}


# ==================== ORDERS ====================

@router.post("/orders", status_code=status.HTTP_201_CREATED)
def create_order(order_data: dict, current_user=Depends(get_current_user)):
    """Create a gig order"""
    user_id = current_user.get("user_id")
    gig_id = order_data.get("gig_id")
    package = order_data.get("package", "basic")

    gig_result = execute_query(
        "SELECT * FROM gigs WHERE id = ? AND status = 'active'",
        [gig_id]
    )
    if not gig_result or not gig_result.get("rows"):
        raise HTTPException(status_code=404, detail="Gig not found")

    gig = parse_rows(gig_result)[0]

    # Prevent seller from buying their own gig
    if gig["seller_id"] == user_id:
        raise HTTPException(status_code=400, detail="You cannot order your own gig")

    price = gig.get(f"{package}_price", 0)
    delivery_days = gig.get(f"{package}_delivery_days", 3)

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO gig_orders (gig_id, buyer_id, seller_id, package_type, price,
            delivery_days, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)""",
        [gig_id, user_id, gig["seller_id"], package, price, delivery_days, now]
    )

    id_result = execute_query("SELECT last_insert_rowid() as id", [])
    new_id = parse_rows(id_result)[0].get("id", 0) if id_result and id_result.get("rows") else 0

    return {"id": new_id, "status": "pending", "price": price}


@router.get("/orders")
def get_orders(current_user=Depends(get_current_user)):
    """Get user's gig orders (as buyer or seller)"""
    user_id = current_user.get("user_id")
    result = execute_query(
        """SELECT o.*, g.title as gig_title, g.slug as gig_slug
           FROM gig_orders o JOIN gigs g ON o.gig_id = g.id
           WHERE o.buyer_id = ? OR o.seller_id = ?
           ORDER BY o.created_at DESC""",
        [user_id, user_id]
    )
    items = parse_rows(result) if result and result.get("rows") else []
    return {"items": items}


@router.post("/orders/{order_id}/deliver")
def deliver_order(order_id: int, delivery_data: dict, current_user=Depends(get_current_user)):
    """Submit delivery for an order"""
    user_id = current_user.get("user_id")

    # Verify the user is the seller for this order
    order_result = execute_query(
        "SELECT id, seller_id, status FROM gig_orders WHERE id = ?",
        [order_id],
    )
    if not order_result or not order_result.get("rows"):
        raise HTTPException(status_code=404, detail="Order not found")

    order = parse_rows(order_result)[0]
    if order["seller_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only the seller can deliver this order")
    if order["status"] not in ("pending", "active", "revision_requested"):
        raise HTTPException(status_code=400, detail=f"Cannot deliver order in '{order['status']}' status")

    result = execute_query(
        """INSERT INTO gig_deliveries (order_id, seller_id, delivery_message, files, created_at)
           VALUES (?, ?, ?, ?, ?)""",
        [order_id, user_id, delivery_data.get("message", ""),
         json.dumps(delivery_data.get("files", [])),
         datetime.now(timezone.utc).isoformat()]
    )
    execute_query("UPDATE gig_orders SET status = 'delivered', delivered_at = ? WHERE id = ?",
                  [datetime.now(timezone.utc).isoformat(), order_id])
    return {"status": "delivered"}


@router.post("/orders/{order_id}/accept")
def accept_delivery(order_id: int, current_user=Depends(get_current_user)):
    """Accept a delivery"""
    user_id = current_user.get("user_id")

    # Verify the user is the buyer for this order
    order_result = execute_query(
        "SELECT id, buyer_id, status FROM gig_orders WHERE id = ?",
        [order_id],
    )
    if not order_result or not order_result.get("rows"):
        raise HTTPException(status_code=404, detail="Order not found")

    order = parse_rows(order_result)[0]
    if order["buyer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only the buyer can accept a delivery")
    if order["status"] != "delivered":
        raise HTTPException(status_code=400, detail="Order must be in 'delivered' status to accept")

    execute_query("UPDATE gig_orders SET status = 'completed', completed_at = ? WHERE id = ?",
                  [datetime.now(timezone.utc).isoformat(), order_id])
    return {"status": "completed"}


@router.post("/orders/{order_id}/revision")
def request_revision(order_id: int, revision_data: dict, current_user=Depends(get_current_user)):
    """Request a revision"""
    user_id = current_user.get("user_id")

    # Verify the user is the buyer for this order
    order_result = execute_query(
        "SELECT id, buyer_id, status FROM gig_orders WHERE id = ?",
        [order_id],
    )
    if not order_result or not order_result.get("rows"):
        raise HTTPException(status_code=404, detail="Order not found")

    order = parse_rows(order_result)[0]
    if order["buyer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only the buyer can request a revision")
    if order["status"] != "delivered":
        raise HTTPException(status_code=400, detail="Order must be in 'delivered' status to request revision")

    execute_query(
        """INSERT INTO gig_revisions (order_id, buyer_id, revision_message, created_at)
           VALUES (?, ?, ?, ?)""",
        [order_id, user_id,
         revision_data.get("message", ""), datetime.now(timezone.utc).isoformat()]
    )
    execute_query("UPDATE gig_orders SET status = 'revision_requested' WHERE id = ?", [order_id])
    return {"status": "revision_requested"}


# ==================== REVIEWS ====================

@router.post("/reviews", status_code=status.HTTP_201_CREATED)
def create_review(review_data: dict, current_user=Depends(get_current_user)):
    """Create a gig review"""
    user_id = current_user.get("user_id")
    now = datetime.now(timezone.utc).isoformat()

    result = execute_query(
        """INSERT INTO gig_reviews (gig_id, order_id, buyer_id, seller_id, rating,
            communication_rating, service_rating, recommendation_rating, comment, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        [
            review_data.get("gig_id"),
            review_data.get("order_id"),
            user_id,
            review_data.get("seller_id"),
            review_data.get("rating", 5),
            review_data.get("communication_rating", 5),
            review_data.get("service_rating", 5),
            review_data.get("recommendation_rating", 5),
            review_data.get("comment", ""),
            now,
        ]
    )

    # Update gig stats
    execute_query(
        """UPDATE gigs SET total_reviews = total_reviews + 1,
                  average_rating = ((average_rating * (total_reviews - 1)) + ?) / total_reviews
           WHERE id = ?""",
        [review_data.get("rating", 5), review_data.get("gig_id")]
    )

    id_result = execute_query("SELECT last_insert_rowid() as id", [])
    new_id = parse_rows(id_result)[0].get("id", 0) if id_result and id_result.get("rows") else 0
    return {"id": new_id}


@router.get("/{gig_id}/reviews")
def get_gig_reviews(gig_id: int, page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=50)):
    """Get reviews for a gig"""
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT r.*, u.name as reviewer_name, u.profile_image_url as reviewer_avatar
           FROM gig_reviews r JOIN users u ON r.buyer_id = u.id
           WHERE r.gig_id = ? ORDER BY r.created_at DESC LIMIT ? OFFSET ?""",
        [gig_id, page_size, offset]
    )
    items = parse_rows(result) if result and result.get("rows") else []
    return {"items": items}
