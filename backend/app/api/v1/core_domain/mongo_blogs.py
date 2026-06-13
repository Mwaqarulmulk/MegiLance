"""
MegiLance - MongoDB Blog REST API
Serves 100 SEO blog articles from MongoDB with full search, filter, and statistics.
"""

import os
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger(__name__)

router = APIRouter()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
_client = None
_collection = None


def get_collection():
    global _client, _collection
    if _collection is not None:
        return _collection
    try:
        from pymongo import MongoClient
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
        _client.admin.command("ping")
        _collection = _client["megilance"]["blogs"]
        return _collection
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        raise HTTPException(
            status_code=503,
            detail="Blog database unavailable. Please ensure MongoDB is running.",
        )


def _doc(d: dict) -> dict:
    """Serialize MongoDB document (ObjectId / _id safety)."""
    d["id"] = str(d.get("_id", ""))
    d.pop("_id", None)
    return d


# ── List blogs ─────────────────────────────────────────────────────────────────

@router.get("")
async def list_blogs(
    skip: int     = Query(0, ge=0),
    limit: int    = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    keyword: Optional[str]  = None,
    sort_by: str  = Query("published_date", enum=["published_date", "view_count", "seo_score"]),
):
    col   = get_collection()
    query = {}
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    if keyword:
        query["$or"] = [
            {"focus_keyword": {"$regex": keyword, "$options": "i"}},
            {"title":         {"$regex": keyword, "$options": "i"}},
            {"secondary_keywords": {"$in": [keyword]}},
        ]

    total = col.count_documents(query)
    docs  = list(col.find(query, {"content": 0, "schema_jsonld": 0})
                    .sort(sort_by, -1)
                    .skip(skip)
                    .limit(limit))

    return {
        "items":  [_doc(d) for d in docs],
        "total":  total,
        "skip":   skip,
        "limit":  limit,
        "pages":  max(1, -(-total // limit)),  # ceil division
    }


# ── Get single blog ────────────────────────────────────────────────────────────

@router.get("/{slug}")
async def get_blog(slug: str):
    col = get_collection()
    doc = col.find_one_and_update(
        {"slug": slug},
        {"$inc": {"view_count": 1}},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail=f"Blog '{slug}' not found")

    # Fetch related blogs (without content for speed)
    related_slugs = doc.get("related_blog_slugs", [])[:4]
    related = []
    if related_slugs:
        related = [
            _doc(d)
            for d in col.find(
                {"slug": {"$in": related_slugs}},
                {"content": 0, "schema_jsonld": 0},
            )
        ]
    doc["related_blogs"] = related
    return _doc(doc)


# ── Full-text search ───────────────────────────────────────────────────────────

@router.get("/search/query")
async def search_blogs(
    q:     str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=30),
    skip:  int = Query(0, ge=0),
):
    col   = get_collection()
    query = {
        "$or": [
            {"title":             {"$regex": q, "$options": "i"}},
            {"focus_keyword":     {"$regex": q, "$options": "i"}},
            {"meta_description":  {"$regex": q, "$options": "i"}},
            {"secondary_keywords": {"$in": [q]}},
            {"category":          {"$regex": q, "$options": "i"}},
        ]
    }
    total = col.count_documents(query)
    docs  = list(col.find(query, {"content": 0})
                    .sort("seo_score", -1)
                    .skip(skip)
                    .limit(limit))
    return {
        "query":  q,
        "items":  [_doc(d) for d in docs],
        "total":  total,
        "skip":   skip,
        "limit":  limit,
    }


# ── Filter by category ─────────────────────────────────────────────────────────

@router.get("/category/{category}")
async def blogs_by_category(
    category: str,
    skip:  int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
):
    col   = get_collection()
    query = {"category": {"$regex": f"^{category}$", "$options": "i"}}
    total = col.count_documents(query)
    docs  = list(col.find(query, {"content": 0, "schema_jsonld": 0})
                    .sort("published_date", -1)
                    .skip(skip)
                    .limit(limit))
    return {
        "category": category,
        "items":    [_doc(d) for d in docs],
        "total":    total,
        "skip":     skip,
        "limit":    limit,
    }


# ── Categories list ────────────────────────────────────────────────────────────

@router.get("/categories/list")
async def list_categories():
    col = get_collection()
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort":  {"count": -1}},
        {"$project": {"name": "$_id", "count": 1, "_id": 0}},
    ]
    cats = list(col.aggregate(pipeline))
    return {"categories": cats, "total": len(cats)}


# ── Stats overview ─────────────────────────────────────────────────────────────

@router.get("/stats/overview")
async def stats_overview():
    col = get_collection()
    total       = col.count_documents({})
    total_views = col.aggregate([{"$group": {"_id": None, "v": {"$sum": "$view_count"}}}])
    total_views = list(total_views)
    views       = total_views[0]["v"] if total_views else 0

    avg_rt = col.aggregate([{"$group": {"_id": None, "rt": {"$avg": "$reading_time_minutes"}}}])
    avg_rt = list(avg_rt)
    avg_rt = round(avg_rt[0]["rt"], 1) if avg_rt else 0

    top_cats = list(col.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort":  {"count": -1}},
        {"$limit": 5},
        {"$project": {"category": "$_id", "count": 1, "_id": 0}},
    ]))

    most_viewed = list(col.find({}, {"title": 1, "slug": 1, "view_count": 1, "category": 1, "_id": 0})
                          .sort("view_count", -1)
                          .limit(5))

    return {
        "total_blogs":       total,
        "total_views":       views,
        "avg_reading_time":  avg_rt,
        "top_categories":    top_cats,
        "most_viewed":       most_viewed,
    }
