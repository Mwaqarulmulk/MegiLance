"""
MegiLance - MongoDB Blog Insertion Script
Inserts 100 SEO blogs from extracted ZIP data into MongoDB with:
- Full content from MDX files
- WebP image optimization
- Smart backlinking (top 5 per blog)
- JSON-LD schema.org markup
- 6 performance indexes
"""

import csv
import io
import json
import os
import re
import sys

# Force UTF-8 output on Windows to support checkmark characters
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
from datetime import datetime
from io import BytesIO
from pathlib import Path

# ── Python executable hint (Windows) ──────────────────────────────────────────
PYTHON = r"C:\Users\ghula\AppData\Local\Python\bin\python.exe"

try:
    from pymongo import MongoClient, ASCENDING, DESCENDING
    from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError
except ImportError:
    print("ERROR: pymongo not installed. Run:")
    print(f'  "{PYTHON}" -m pip install pymongo')
    sys.exit(1)

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("WARNING: Pillow not installed – images will be linked, not converted to WebP")

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
ROOT_DIR   = SCRIPT_DIR.parent
BLOGS_DIR  = ROOT_DIR / "blogs_temp" / "megilance_100_blogs_with_images_updated"
CSV_FILE   = BLOGS_DIR / "megilance_blog_seo_index.csv"
MDX_DIR    = BLOGS_DIR / "articles_mdx"
IMG_DIR    = BLOGS_DIR / "featured_images"
WEBP_OUT   = ROOT_DIR / "frontend" / "public" / "blog-images"

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME     = "megilance"
COLLECTION  = "blogs"

# ── Internal link destinations ─────────────────────────────────────────────────
INTERNAL_LINKS = [
    {"url": "/",              "text": "MegiLance Home"},
    {"url": "/how-it-works",  "text": "How It Works"},
    {"url": "/about",         "text": "About MegiLance"},
    {"url": "/clients",       "text": "Hire Freelancers"},
    {"url": "/freelancers",   "text": "Find Work"},
    {"url": "/blog",          "text": "MegiLance Blog"},
]

# ──────────────────────────────────────────────────────────────────────────────

def divider(char="=", width=70):
    print(char * width)


def read_mdx(slug: str) -> str:
    """Return content section of MDX file (after frontmatter)."""
    for f in MDX_DIR.glob("*.mdx"):
        if slug in f.stem or f.stem.endswith(slug):
            text = f.read_text(encoding="utf-8", errors="ignore")
            # Strip YAML frontmatter
            if text.startswith("---"):
                parts = text.split("---", 2)
                return parts[2].strip() if len(parts) >= 3 else text
            return text
    # Fallback: try numeric prefix match
    slug_clean = slug.replace("-", "")
    for f in MDX_DIR.glob("*.mdx"):
        stem_clean = re.sub(r"^\d+-", "", f.stem).replace("-", "")
        if stem_clean == slug_clean:
            text = f.read_text(encoding="utf-8", errors="ignore")
            if text.startswith("---"):
                parts = text.split("---", 2)
                return parts[2].strip() if len(parts) >= 3 else text
            return text
    return ""


def to_webp(src_path: Path, slug: str) -> str | None:
    """Convert image to WebP and save to public/blog-images/. Returns relative URL."""
    if not PIL_AVAILABLE:
        return None
    WEBP_OUT.mkdir(parents=True, exist_ok=True)
    dest = WEBP_OUT / f"{slug}.webp"
    if dest.exists():
        return f"/blog-images/{slug}.webp"
    try:
        with Image.open(src_path) as img:
            img = img.convert("RGB")
            img.save(dest, "WEBP", quality=85, method=6)
        return f"/blog-images/{slug}.webp"
    except Exception as e:
        print(f"  [img] {src_path.name}: {e}")
        return None


def find_image(slug: str, row_index: int) -> tuple[str | None, str | None]:
    """Return (original_url, webp_url) for a given slug."""
    # Try exact slug match: NNN_slug.png or NNN_slug.jpg
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        candidates = list(IMG_DIR.glob(f"*_{slug}{ext}"))
        if candidates:
            src = candidates[0]
            webp_url = to_webp(src, slug)
            orig_url = f"/blog-images/{src.name}"
            return orig_url, webp_url or orig_url

    # Fallback: cycle by numeric index
    img_num = ((row_index - 1) % 30) + 1
    for ext in (".png", ".jpg", ".jpeg"):
        candidates = list(IMG_DIR.glob(f"{img_num:03d}_*{ext}")) + [IMG_DIR / f"{img_num:03d}{ext}"]
        for src in candidates:
            if src.exists():
                webp_url = to_webp(src, slug)
                orig_url = f"/blog-images/{src.name}"
                return orig_url, webp_url or orig_url

    return None, None


def schema_jsonld(row: dict) -> str:
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": row["SEO Title"],
        "description": row["Meta Description"],
        "url": row["URL"],
        "datePublished": row["Suggested Publish Date"],
        "dateModified": row["Suggested Publish Date"],
        "author": {"@type": "Organization", "name": "MegiLance"},
        "publisher": {
            "@type": "Organization",
            "name": "MegiLance",
            "logo": {"@type": "ImageObject", "url": "https://megilance.site/logo.png"},
        },
        "keywords": row["Focus Keyword"],
        "articleSection": row["Category"],
        "inLanguage": "en-US",
        "mainEntityOfPage": {"@type": "WebPage", "@id": row["URL"]},
    }
    return json.dumps(schema, ensure_ascii=False)


def estimate_reading_time(text: str) -> int:
    words = len(re.findall(r"\w+", text))
    return max(1, round(words / 220))


def build_backlinks(all_rows: list[dict]) -> dict[str, list[str]]:
    """Return {slug: [related_slug, …]} top-5 by keyword overlap + category."""
    slugs = [r["Slug"] for r in all_rows]
    kw_map = {
        r["Slug"]: set(
            re.split(r"[,\s]+", (r["Focus Keyword"] + " " + r.get("Secondary Keywords", "")).lower())
        )
        for r in all_rows
    }
    cat_map = {r["Slug"]: r["Category"] for r in all_rows}

    result = {}
    for r in all_rows:
        slug = r["Slug"]
        scores = []
        for other in all_rows:
            if other["Slug"] == slug:
                continue
            overlap = len(kw_map[slug] & kw_map[other["Slug"]])
            cat_bonus = 5 if cat_map[other["Slug"]] == cat_map[slug] else 0
            scores.append((overlap * 10 + cat_bonus, other["Slug"]))
        scores.sort(reverse=True)
        result[slug] = [s for _, s in scores[:5]]
    return result


def load_csv() -> list[dict]:
    rows = []
    with open(CSV_FILE, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


def prepare_document(row: dict, index: int, backlinks: dict) -> dict:
    slug       = row["Slug"]
    content    = read_mdx(slug)
    orig_url, webp_url = find_image(slug, index)
    wc         = int(row.get("Word Count", 0) or estimate_reading_time(content) * 220)

    secondary = []
    raw_sec = row.get("Secondary Keywords", "")
    if raw_sec:
        secondary = [k.strip() for k in raw_sec.split(",") if k.strip()]

    internal = []
    raw_links = row.get("Internal Links", "")
    for link in raw_links.split("|"):
        link = link.strip()
        if link:
            # Map to relative path
            path = link.replace("https://megilance.site", "").strip() or "/"
            internal.append({"url": path, "text": path.lstrip("/").replace("-", " ").title() or "Home"})

    # Add default internal links if few found
    if len(internal) < 3:
        internal = INTERNAL_LINKS[:4]

    return {
        "_id":                     slug,
        "slug":                    slug,
        "title":                   row["Title"],
        "seo_title":               row["SEO Title"],
        "meta_description":        row["Meta Description"],
        "focus_keyword":           row["Focus Keyword"],
        "secondary_keywords":      secondary,
        "category":                row["Category"],
        "target_audience":         row.get("Audience", ""),
        "search_intent":           row.get("Search Intent", "Informational"),
        "content":                 content,
        "excerpt":                 row["Meta Description"],
        "canonical_url":           row["URL"],
        "featured_image_url":      orig_url,
        "featured_image_webp_url": webp_url or orig_url,
        "featured_image_alt":      row.get("Image Alt Text", row["Title"]),
        "schema_jsonld":           schema_jsonld(row),
        "internal_links":          internal,
        "related_blog_slugs":      backlinks.get(slug, []),
        "word_count":              wc,
        "reading_time_minutes":    estimate_reading_time(content) if content else max(1, wc // 220),
        "status":                  "published",
        "published_date":          row.get("Suggested Publish Date", datetime.utcnow().isoformat()),
        "view_count":              0,
        "seo_score":               75,
        "created_at":              datetime.utcnow().isoformat(),
        "updated_at":              datetime.utcnow().isoformat(),
    }


def create_indexes(collection):
    collection.create_index([("slug", ASCENDING)],        unique=True,  name="idx_slug")
    collection.create_index([("category", ASCENDING)],                  name="idx_category")
    collection.create_index([("focus_keyword", ASCENDING)],             name="idx_keyword")
    collection.create_index([("published_date", DESCENDING)],           name="idx_published")
    collection.create_index([("seo_score", DESCENDING)],                name="idx_seo_score")
    collection.create_index([("view_count", DESCENDING)],               name="idx_views")
    print("  ✓ 6 indexes created")


def main():
    divider()
    print("  MongoDB Blog Insertion for MegiLance")
    divider()
    print()

    # ── 1. Connect ─────────────────────────────────────────────────────────────
    print("[1/6] Connecting to MongoDB …")
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
    except ServerSelectionTimeoutError:
        print(f"\nERROR: Cannot reach MongoDB at {MONGODB_URI}")
        print("Make sure MongoDB is running:")
        print("  net start MongoDB   (if installed as service)")
        print("  or: mongod          (in another terminal)")
        sys.exit(1)

    db         = client[DB_NAME]
    collection = db[COLLECTION]
    print(f"  ✓ Connected  →  {DB_NAME}.{COLLECTION}")

    # ── 2. Load CSV ────────────────────────────────────────────────────────────
    print("\n[2/6] Loading blog metadata …")
    rows = load_csv()
    print(f"  ✓ {len(rows)} blog entries loaded from CSV")

    # ── 3. Build backlinks ─────────────────────────────────────────────────────
    print("\n[3/6] Building backlinks …")
    backlinks = build_backlinks(rows)
    print(f"  ✓ Backlinks computed for {len(backlinks)} blogs")

    # ── 4. Process images ──────────────────────────────────────────────────────
    print("\n[4/6] Processing images to WebP …")
    if PIL_AVAILABLE:
        WEBP_OUT.mkdir(parents=True, exist_ok=True)
        print(f"  Output → {WEBP_OUT}")
    else:
        print("  [SKIP] Pillow not available, using original images")

    # ── 5. Create indexes ──────────────────────────────────────────────────────
    print("\n[5/6] Creating MongoDB indexes …")
    create_indexes(collection)

    # ── 6. Insert documents ────────────────────────────────────────────────────
    print(f"\n[6/6] Inserting {len(rows)} blogs into MongoDB …")
    divider("-")

    inserted = 0
    skipped  = 0
    failed   = 0

    for i, row in enumerate(rows, start=1):
        slug = row.get("Slug", "").strip()
        if not slug:
            failed += 1
            continue
        try:
            doc = prepare_document(row, i, backlinks)
            collection.replace_one({"_id": slug}, doc, upsert=True)
            print(f"  [{i:3d}/{len(rows)}] ✓  {slug[:60]}")
            inserted += 1
        except Exception as e:
            print(f"  [{i:3d}/{len(rows)}] ✗  {slug[:50]}  → {e}")
            failed += 1

    divider()
    print(f"\n  INSERTION COMPLETE")
    print(f"  Inserted / updated : {inserted}")
    print(f"  Skipped            : {skipped}")
    print(f"  Failed             : {failed}")
    divider()

    # ── Verify ─────────────────────────────────────────────────────────────────
    count = collection.count_documents({})
    print(f"\n  Verification: {count} documents in {DB_NAME}.{COLLECTION}")
    cats = collection.distinct("category")
    print(f"  Categories : {', '.join(cats)}")
    print("\n  Done! Start your API server and test:")
    print("    GET /api/v1/blogs-mongo")
    divider()

    client.close()


if __name__ == "__main__":
    main()
