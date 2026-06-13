import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from pymongo import MongoClient
c = MongoClient("mongodb://localhost:27017")
col = c["megilance"]["blogs"]

total = col.count_documents({})
print(f"Total blogs: {total}")

sample = col.find_one({"slug": "what-is-an-ai-freelancing-platform-and-why-it-matters-in-2026"})
print(f"Title: {sample['title']}")
print(f"WebP image: {sample['featured_image_webp_url']}")
print(f"Related slugs: {sample['related_blog_slugs'][:3]}")
print(f"Internal links: {len(sample['internal_links'])}")
print(f"Has JSON-LD: {'YES' if sample.get('schema_jsonld') else 'NO'}")
print(f"Reading time: {sample['reading_time_minutes']} min")
print(f"Focus keyword: {sample['focus_keyword']}")

cats = col.distinct("category")
print(f"\nCategories ({len(cats)}):")
for cat in cats:
    count = col.count_documents({"category": cat})
    print(f"  {cat}: {count} blogs")
