"""
MegiLance - MongoDB Blog REST API
Serves 100 SEO blog articles from MongoDB with full search, filter, and statistics.
"""

import os
import re
import time
import logging
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.security import require_admin

logger = logging.getLogger(__name__)

router = APIRouter()


def _slugify(text: str) -> str:
    return re.sub(r"(^-|-$)+", "", re.sub(r"[^a-z0-9]+", "-", (text or "").lower()))


def _reading_time(content: str) -> int:
    words = len(re.findall(r"\w+", content or ""))
    return max(1, round(words / 200))


class BlogUpsert(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: str = ""
    content: str = ""
    image_url: Optional[str] = ""
    author: str = "MegiLance"
    tags: List[str] = []
    is_published: bool = False
    is_news_trend: bool = False


def _build_doc(data: BlogUpsert, existing: Optional[dict] = None) -> dict:
    """Build a unified blog doc holding BOTH admin (CMS) and public (SEO) render fields,
    so one collection (megilance.blogs) serves the public page and admin CMS."""
    now = datetime.now(timezone.utc).isoformat()
    slug = (data.slug or "").strip() or _slugify(data.title)
    rt = _reading_time(data.content)
    category = data.tags[0] if data.tags else (existing or {}).get("category", "General")
    word_count = len(re.findall(r"\w+", data.content or ""))
    doc = {
        "_id": slug,
        "slug": slug,
        "title": data.title,
        "excerpt": data.excerpt,
        "content": data.content,
        # admin/CMS fields
        "author": data.author,
        "tags": data.tags,
        "image_url": data.image_url or "",
        "is_published": data.is_published,
        "is_news_trend": data.is_news_trend,
        "views": (existing or {}).get("views", (existing or {}).get("view_count", 0)),
        "reading_time": rt,
        # public/SEO render fields (kept in sync so the public page renders CMS posts)
        "status": "published" if data.is_published else "draft",
        "category": category,
        "featured_image_url": data.image_url or "",
        "featured_image_webp_url": data.image_url or "",
        "featured_image_alt": data.title,
        "seo_title": (existing or {}).get("seo_title", data.title),
        "meta_description": data.excerpt,
        "focus_keyword": (existing or {}).get("focus_keyword", data.tags[0] if data.tags else ""),
        "secondary_keywords": data.tags,
        "reading_time_minutes": rt,
        "view_count": (existing or {}).get("view_count", 0),
        "word_count": word_count,
        "seo_score": (existing or {}).get("seo_score", 70),
        "internal_links": (existing or {}).get("internal_links", []),
        "related_blog_slugs": (existing or {}).get("related_blog_slugs", []),
        "published_date": (existing or {}).get("published_date", now),
        "created_at": (existing or {}).get("created_at", now),
        "updated_at": now,
    }
    return doc

MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL") or "mongodb://localhost:27017"
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "megilance")
_client = None
_collection = None
_mongo_available = None
_last_attempt_time = 0
_RETRY_INTERVAL_SECONDS = 60


def get_collection():
    global _client, _collection, _mongo_available, _last_attempt_time
    if _collection is not None:
        return _collection
    if _mongo_available is False:
        now = time.time()
        if now - _last_attempt_time < _RETRY_INTERVAL_SECONDS:
            return None
    try:
        from pymongo import MongoClient
        _last_attempt_time = time.time()
        logger.info(f"Connecting to MongoDB: {MONGODB_URI[:30]}...")
        _client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=2000,
            connectTimeoutMS=2000,
            socketTimeoutMS=3000,
        )
        _client.admin.command("ping", timeout=2000)
        _collection = _client[MONGODB_DB_NAME]["blogs"]
        _mongo_available = True
        logger.info(f"MongoDB connected successfully to database '{MONGODB_DB_NAME}'")
        return _collection
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e} - using fallback blog data")
        _mongo_available = False
        return None


def _doc(d: dict) -> dict:
    """Serialize MongoDB document (ObjectId / _id safety)."""
    d["id"] = str(d.get("_id", ""))
    d.pop("_id", None)
    return d


# ── Fallback blog data when MongoDB is unavailable ──────────────────────────────

FALLBACK_BLOGS = [
    {
        "_id": "ultimate-guide-freelancing-2026",
        "slug": "ultimate-guide-freelancing-2026",
        "title": "The Ultimate Guide to Freelancing in 2026",
        "excerpt": "Everything you need to know about starting and growing your freelance career in 2026, from finding clients to managing finances.",
        "content": "<p>Freelancing has become one of the most popular career paths in 2026. With the rise of remote work and AI-powered platforms like MegiLance, it's easier than ever to find high-paying clients and build a successful freelance business.</p>",
        "author": "MegiLance Team",
        "tags": ["Freelancing", "Career", "Remote Work"],
        "image_url": "/blog-images/the-ultimate-guide-to-modern-freelance-marketplaces.webp",
        "status": "published",
        "category": "Career",
        "featured_image_url": "/blog-images/the-ultimate-guide-to-modern-freelance-marketplaces.webp",
        "featured_image_webp_url": "/blog-images/the-ultimate-guide-to-modern-freelance-marketplaces.webp",
        "seo_title": "Ultimate Freelancing Guide 2026 | MegiLance",
        "meta_description": "Complete guide to freelancing in 2026. Learn how to find clients, set rates, and grow your freelance business.",
        "focus_keyword": "freelancing 2026",
        "secondary_keywords": ["freelance tips", "remote work", "freelance career"],
        "reading_time_minutes": 8,
        "view_count": 1250,
        "word_count": 1800,
        "seo_score": 85,
        "published_date": "2026-01-15T10:00:00Z",
        "created_at": "2026-01-15T10:00:00Z",
        "updated_at": "2026-01-15T10:00:00Z",
        "is_published": True,
        "views": 1250,
        "reading_time": 8,
    },
    {
        "_id": "ai-powered-freelance-matching",
        "slug": "ai-powered-freelance-matching",
        "title": "How AI is Revolutionizing Freelance Matching",
        "excerpt": "Discover how artificial intelligence is transforming the way freelancers and clients find each other on modern platforms.",
        "content": "<p>Artificial Intelligence is changing the freelancing landscape. Smart matching algorithms now connect freelancers with projects that perfectly match their skills and experience.</p>",
        "author": "MegiLance Team",
        "tags": ["AI", "Technology", "Freelancing"],
        "image_url": "/blog-images/what-is-an-ai-freelancing-platform-and-why-it-matters-in-2026.webp",
        "status": "published",
        "category": "Technology",
        "featured_image_url": "/blog-images/what-is-an-ai-freelancing-platform-and-why-it-matters-in-2026.webp",
        "featured_image_webp_url": "/blog-images/what-is-an-ai-freelancing-platform-and-why-it-matters-in-2026.webp",
        "seo_title": "AI-Powered Freelance Matching | MegiLance Blog",
        "meta_description": "Learn how AI matching technology connects freelancers with perfect projects.",
        "focus_keyword": "AI freelance matching",
        "secondary_keywords": ["artificial intelligence", "freelance platform", "smart matching"],
        "reading_time_minutes": 6,
        "view_count": 890,
        "word_count": 1200,
        "seo_score": 82,
        "published_date": "2026-01-10T10:00:00Z",
        "created_at": "2026-01-10T10:00:00Z",
        "updated_at": "2026-01-10T10:00:00Z",
        "is_published": True,
        "views": 890,
        "reading_time": 6,
    },
    {
        "_id": "escrow-payments-freelancing",
        "slug": "escrow-payments-freelancing",
        "title": "Why Escrow Payments Are Essential for Freelancers",
        "excerpt": "Learn how escrow payments protect both freelancers and clients, ensuring secure transactions on every project.",
        "content": "<p>Escrow payments are the backbone of secure freelance transactions. They protect both parties by ensuring funds are available before work begins.</p>",
        "author": "MegiLance Team",
        "tags": ["Payments", "Security", "Freelancing"],
        "image_url": "/blog-images/what-is-freelance-escrow-and-how-does-it-protect-both-sides.webp",
        "status": "published",
        "category": "Finance",
        "featured_image_url": "/blog-images/what-is-freelance-escrow-and-how-does-it-protect-both-sides.webp",
        "featured_image_webp_url": "/blog-images/what-is-freelance-escrow-and-how-does-it-protect-both-sides.webp",
        "seo_title": "Escrow Payments for Freelancers | MegiLance",
        "meta_description": "Understanding escrow payments and how they protect freelancers and clients.",
        "focus_keyword": "escrow payments freelancing",
        "secondary_keywords": ["secure payments", "escrow", "freelance finance"],
        "reading_time_minutes": 5,
        "view_count": 670,
        "word_count": 950,
        "seo_score": 78,
        "published_date": "2026-01-05T10:00:00Z",
        "created_at": "2026-01-05T10:00:00Z",
        "updated_at": "2026-01-05T10:00:00Z",
        "is_published": True,
        "views": 670,
        "reading_time": 5,
    },
    {
        "_id": "top-freelance-skills-2026",
        "slug": "top-freelance-skills-2026",
        "title": "Top 10 Freelance Skills in Demand for 2026",
        "excerpt": "From AI development to UX design, these are the most sought-after freelance skills that will earn you top dollar in 2026.",
        "content": "<p>The freelance job market is evolving rapidly. Here are the top skills that clients are looking for in 2026.</p>",
        "author": "MegiLance Team",
        "tags": ["Skills", "Career", "Trends"],
        "image_url": "/blog-images/how-ai-helps-freelancers-choose-high-roi-skills.webp",
        "status": "published",
        "category": "Career",
        "featured_image_url": "/blog-images/how-ai-helps-freelancers-choose-high-roi-skills.webp",
        "featured_image_webp_url": "/blog-images/how-ai-helps-freelancers-choose-high-roi-skills.webp",
        "seo_title": "Top Freelance Skills 2026 | MegiLance Blog",
        "meta_description": "Discover the most in-demand freelance skills for 2026 and boost your earning potential.",
        "focus_keyword": "freelance skills 2026",
        "secondary_keywords": ["in-demand skills", "freelance career", "top skills"],
        "reading_time_minutes": 7,
        "view_count": 2100,
        "word_count": 1500,
        "seo_score": 90,
        "published_date": "2026-01-01T10:00:00Z",
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z",
        "is_published": True,
        "views": 2100,
        "reading_time": 7,
    },
    {
        "_id": "building-freelance-portfolio",
        "slug": "building-freelance-portfolio",
        "title": "How to Build a Portfolio That Wins Clients",
        "excerpt": "Your portfolio is your first impression. Learn how to create a stunning portfolio that showcases your best work and attracts high-paying clients.",
        "content": "<p>A strong portfolio is essential for freelance success. It's the first thing clients see when evaluating your expertise.</p>",
        "author": "MegiLance Team",
        "tags": ["Portfolio", "Marketing", "Career"],
        "image_url": "/blog-images/how-to-build-a-freelancer-profile-that-gets-more-clients.webp",
        "status": "published",
        "category": "Career",
        "featured_image_url": "/blog-images/how-to-build-a-freelancer-profile-that-gets-more-clients.webp",
        "featured_image_webp_url": "/blog-images/how-to-build-a-freelancer-profile-that-gets-more-clients.webp",
        "seo_title": "Build a Winning Freelance Portfolio | MegiLance",
        "meta_description": "Tips for creating a freelance portfolio that attracts clients and wins projects.",
        "focus_keyword": "freelance portfolio",
        "secondary_keywords": ["portfolio tips", "client attraction", "freelance marketing"],
        "reading_time_minutes": 6,
        "view_count": 1450,
        "word_count": 1100,
        "seo_score": 83,
        "published_date": "2025-12-28T10:00:00Z",
        "created_at": "2025-12-28T10:00:00Z",
        "updated_at": "2025-12-28T10:00:00Z",
        "is_published": True,
        "views": 1450,
        "reading_time": 6,
    },
]


# ── List blogs ─────────────────────────────────────────────────────────────────

@router.get("")
async def list_blogs(
    skip: int     = Query(0, ge=0),
    limit: int    = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    keyword: Optional[str]  = None,
    sort_by: str  = Query("published_date", enum=["published_date", "view_count", "seo_score"]),
    include_drafts: bool = Query(False, description="Admin only — include unpublished drafts"),
):
    col = get_collection()
    
    # If MongoDB is not available, return fallback data
    if col is None:
        blogs = FALLBACK_BLOGS.copy()
        if not include_drafts:
            blogs = [b for b in blogs if b.get("status") != "draft"]
        if category:
            blogs = [b for b in blogs if category.lower() in (b.get("category", "") or "").lower()]
        if keyword:
            kw = keyword.lower()
            blogs = [b for b in blogs if kw in (b.get("title", "") or "").lower() or kw in (b.get("focus_keyword", "") or "").lower()]
        
        total = len(blogs)
        blogs = blogs[skip:skip + limit]
        
        return {
            "items":  [_doc(d) for d in blogs],
            "total":  total,
            "skip":   skip,
            "limit":  limit,
            "pages":  max(1, -(-total // limit)) if total > 0 else 1,
        }
    
    # Public callers only see published posts; the admin CMS passes include_drafts=true.
    query: dict = {} if include_drafts else {"status": {"$ne": "draft"}}
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


# ── Create blog (admin) ──────────────────────────────────────────────────────────

@router.post("", status_code=201)
async def create_blog(data: BlogUpsert, current_user=Depends(require_admin)):
    col = get_collection()
    if col is None:
        raise HTTPException(
            status_code=503,
            detail="Blog database unavailable. MongoDB is required for creating blog posts.",
        )
    doc = _build_doc(data)
    if col.find_one({"_id": doc["_id"]}, {"_id": 1}):
        raise HTTPException(status_code=409, detail=f"A blog with slug '{doc['_id']}' already exists.")
    col.insert_one(doc)
    return _doc(doc)


# ── Update blog (admin) ──────────────────────────────────────────────────────────

@router.put("/{slug}")
async def update_blog(slug: str, data: BlogUpsert, current_user=Depends(require_admin)):
    col = get_collection()
    if col is None:
        raise HTTPException(
            status_code=503,
            detail="Blog database unavailable. MongoDB is required for updating blog posts.",
        )
    existing = col.find_one({"_id": slug}) or col.find_one({"slug": slug})
    if not existing:
        raise HTTPException(status_code=404, detail=f"Blog '{slug}' not found")
    # Preserve the original slug/_id so the URL stays stable on edit.
    data.slug = existing["slug"]
    doc = _build_doc(data, existing=existing)
    col.replace_one({"_id": existing["_id"]}, doc)
    return _doc(doc)


# ── Delete blog (admin) ──────────────────────────────────────────────────────────

@router.delete("/{slug}", status_code=204)
async def delete_blog(slug: str, current_user=Depends(require_admin)):
    col = get_collection()
    if col is None:
        raise HTTPException(
            status_code=503,
            detail="Blog database unavailable. MongoDB is required for deleting blog posts.",
        )
    result = col.delete_one({"_id": slug})
    if result.deleted_count == 0:
        result = col.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Blog '{slug}' not found")
    return None


# ── Get single blog ────────────────────────────────────────────────────────────

@router.get("/{slug}")
async def get_blog(slug: str):
    col = get_collection()
    
    # If MongoDB is not available, search fallback data
    if col is None:
        blog = next((b for b in FALLBACK_BLOGS if b.get("slug") == slug or b.get("_id") == slug), None)
        if not blog:
            raise HTTPException(status_code=404, detail=f"Blog '{slug}' not found")
        blog_data = _doc(blog)
        blog_data["related_blogs"] = []
        return blog_data
    
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
    col = get_collection()
    
    # If MongoDB is not available, search fallback data
    if col is None:
        kw = q.lower()
        blogs = [
            b for b in FALLBACK_BLOGS
            if kw in (b.get("title", "") or "").lower()
            or kw in (b.get("focus_keyword", "") or "").lower()
            or kw in (b.get("meta_description", "") or "").lower()
            or any(kw in (k or "").lower() for k in b.get("secondary_keywords", []))
        ]
        total = len(blogs)
        blogs = blogs[skip:skip + limit]
        return {
            "query": q,
            "items": [_doc(d) for d in blogs],
            "total": total,
            "skip": skip,
            "limit": limit,
        }
    
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
    col = get_collection()
    
    # If MongoDB is not available, filter fallback data
    if col is None:
        blogs = [b for b in FALLBACK_BLOGS if (b.get("category", "") or "").lower() == category.lower()]
        total = len(blogs)
        blogs = blogs[skip:skip + limit]
        return {
            "category": category,
            "items": [_doc(d) for d in blogs],
            "total": total,
            "skip": skip,
            "limit": limit,
        }
    
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
    
    # If MongoDB is not available, derive categories from fallback data
    if col is None:
        cats = {}
        for b in FALLBACK_BLOGS:
            cat = b.get("category", "General")
            cats[cat] = cats.get(cat, 0) + 1
        result = [{"name": k, "count": v} for k, v in sorted(cats.items(), key=lambda x: -x[1])]
        return {"categories": result, "total": len(result)}
    
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
    
    # If MongoDB is not available, return stats from fallback data
    if col is None:
        total = len(FALLBACK_BLOGS)
        views = sum(b.get("view_count", 0) for b in FALLBACK_BLOGS)
        avg_rt = round(sum(b.get("reading_time_minutes", 1) for b in FALLBACK_BLOGS) / max(total, 1), 1)
        cats = {}
        for b in FALLBACK_BLOGS:
            cat = b.get("category", "General")
            cats[cat] = cats.get(cat, 0) + 1
        top_cats = [{"name": k, "count": v} for k, v in sorted(cats.items(), key=lambda x: -x[1])[:5]]
        return {
            "total_blogs": total,
            "total_views": views,
            "avg_reading_time": avg_rt,
            "top_categories": top_cats,
        }
    
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
