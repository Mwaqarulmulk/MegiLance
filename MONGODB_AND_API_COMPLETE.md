# 🍃 MongoDB + API Complete Setup Guide

**Everything you need to insert blogs into MongoDB and access them via API**

---

## 📦 What You Have

### 1. **Automated Python Script** ✅
   `scripts/insert_blogs_mongodb.py` - Does everything automatically

### 2. **MongoDB CLI Script** ✅
   `scripts/mongo_cli_insert.js` - Manual CLI insertion

### 3. **FastAPI Endpoints** ✅
   `backend/app/api/v1/mongo_blogs_api.py` - REST API for MongoDB

### 4. **Complete Guides** ✅
   `MONGODB_START_HERE.md`, `MONGODB_CLI_SETUP.md`, etc.

---

## 🚀 Quick Start (All-in-One)

### **Step 1: Start MongoDB**

**Windows:**
```bash
mongod
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongodb
```

**Docker (Any OS):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### **Step 2: Insert All Blogs**

```bash
cd /path/to/MegiLance
python scripts/insert_blogs_mongodb.py
```

**Wait 2-5 minutes** ⏳ ...and you're done!

### **Step 3: Verify**

```bash
mongosh
> use megilance
> db.blogs.countDocuments()
100
```

### **Step 4: Start API Server**

```bash
# Add this to your main.py
from app.api.v1.mongo_blogs_api import router as mongo_router

app.include_router(mongo_router)

# Then run:
python main.py
```

### **Step 5: Test API**

```bash
# List blogs
curl "http://localhost:8000/api/v1/blogs-mongo?limit=5"

# Search
curl "http://localhost:8000/api/v1/blogs-mongo/search?q=freelancing"

# Get one
curl "http://localhost:8000/api/v1/blogs-mongo/what-is-an-ai-freelancing-platform"

# Categories
curl "http://localhost:8000/api/v1/blogs-mongo/categories/list"

# Stats
curl "http://localhost:8000/api/v1/blogs-mongo/stats/overview"
```

✅ **Done!** All 100 blogs are now in MongoDB and accessible via API!

---

## 🔌 API Endpoints (Ready to Use)

### **Base URL**: `http://localhost:8000/api/v1/blogs-mongo`

### **1. List All Blogs**
```bash
GET /
```

**Parameters:**
- `skip=0` - Offset
- `limit=10` - Results per page
- `category=Platform Strategy` - Filter by category
- `keyword=freelancing` - Search keyword

**Response:**
```json
{
  "items": [
    {
      "_id": "what-is-an-ai-freelancing-platform",
      "title": "What Is an AI Freelancing Platform...",
      "slug": "what-is-an-ai-freelancing-platform",
      "excerpt": "Learn AI freelancing...",
      "category": "Platform Strategy",
      "views": 0,
      "seo_score": 75,
      ...
    }
  ],
  "total": 100,
  "skip": 0,
  "limit": 10,
  "pages": 10
}
```

### **2. Get Single Blog**
```bash
GET /{slug}
```

**Example:**
```bash
curl "http://localhost:8000/api/v1/blogs-mongo/what-is-an-ai-freelancing-platform"
```

**Response:**
```json
{
  "_id": "what-is-an-ai-freelancing-platform",
  "title": "What Is an AI Freelancing Platform...",
  "content": "<h2>Full HTML content</h2>...",
  "featured_image_webp_url": "/blog-images/article.webp",
  "schema_jsonld": "{...JSON-LD...}",
  "seo_title": "AI Freelancing Platform Guide | MegiLance",
  "meta_description": "Learn AI freelancing...",
  "focus_keyword": "AI freelancing platform",
  "secondary_keywords": ["keyword1", "keyword2"],
  "views": 1,
  ...
}
```

### **3. Search Blogs**
```bash
GET /search?q={keyword}
```

**Example:**
```bash
curl "http://localhost:8000/api/v1/blogs-mongo/search?q=freelancing"
```

### **4. Filter by Category**
```bash
GET /category/{category}
```

**Example:**
```bash
curl "http://localhost:8000/api/v1/blogs-mongo/category/AI%20Freelancing"
```

### **5. Get All Categories**
```bash
GET /categories/list
```

**Response:**
```json
{
  "categories": [
    { "name": "Platform Strategy", "count": 12 },
    { "name": "AI Freelancing", "count": 18 },
    { "name": "Client Hiring", "count": 15 },
    ...
  ],
  "total": 8
}
```

### **6. Get Blog Statistics**
```bash
GET /stats/overview
```

**Response:**
```json
{
  "total_blogs": 100,
  "total_views": 45,
  "avg_reading_time": 5.2,
  "top_categories": [
    { "category": "AI Freelancing", "count": 18 },
    { "category": "Client Hiring", "count": 15 },
    ...
  ],
  "most_viewed": [...]
}
```

---

## 🛠️ Method 1: Automatic Python Script

### **Easiest Way**

```bash
python scripts/insert_blogs_mongodb.py
```

**What it does:**
1. ✅ Connects to MongoDB
2. ✅ Creates database and collection
3. ✅ Creates 6 indexes
4. ✅ Loads CSV metadata
5. ✅ Processes images to WebP
6. ✅ Loads MDX content
7. ✅ Generates schema.org markup
8. ✅ Creates smart backlinking
9. ✅ Inserts 100 documents
10. ✅ Verifies insertion

**Time:** 2-5 minutes  
**Automation:** 100% ✅

---

## 🛠️ Method 2: MongoDB CLI

### **Manual but Direct**

```bash
# Start mongosh
mongosh

# Load the script
load("scripts/mongo_cli_insert.js")

# Or copy-paste the content from mongo_cli_insert.js
```

**What happens:**
1. ✅ Creates database
2. ✅ Creates collection
3. ✅ Creates indexes
4. ✅ Inserts sample blogs
5. ✅ Verifies insertion

**Time:** 5-10 minutes  
**Manual:** Yes (but straightforward)

---

## 🛠️ Method 3: Direct API Insertion

### **Using Backend API**

Create a new endpoint in your backend:

```python
# backend/app/routes/admin_import.py
from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
import os

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/import-blogs")
async def import_blogs():
    """Import blogs from CSV into MongoDB"""
    try:
        db = get_mongo_db()
        collection = db['blogs']
        
        # Load CSV
        blogs = load_blogs_from_csv()
        
        # Insert
        result = collection.insert_many(blogs)
        
        return {
            "inserted": len(result.inserted_ids),
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add to main.py
app.include_router(router)
```

**Usage:**
```bash
curl -X POST "http://localhost:8000/api/admin/import-blogs"
```

---

## 📊 Verify Everything Works

### **Check MongoDB**
```bash
mongosh
> use megilance
> db.blogs.countDocuments()
100

> db.blogs.findOne({ slug: "what-is-an-ai-freelancing-platform" }).pretty()
```

### **Check API**
```bash
# List
curl "http://localhost:8000/api/v1/blogs-mongo"

# Get one
curl "http://localhost:8000/api/v1/blogs-mongo/what-is-an-ai-freelancing-platform"

# Search
curl "http://localhost:8000/api/v1/blogs-mongo/search?q=AI"

# Categories
curl "http://localhost:8000/api/v1/blogs-mongo/categories/list"

# Stats
curl "http://localhost:8000/api/v1/blogs-mongo/stats/overview"
```

**All should return data!** ✅

---

## 🔧 Integration with Frontend

### **Update Frontend API Client**

```typescript
// frontend/lib/api/blog.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const blogApi = {
  // MongoDB endpoints
  getAllFromMongo: async (limit = 10, skip = 0) => {
    const res = await fetch(
      `${API_URL}/api/v1/blogs-mongo?limit=${limit}&skip=${skip}`,
      { cache: 'no-store' }
    );
    return res.json();
  },

  getBySlugFromMongo: async (slug: string) => {
    const res = await fetch(`${API_URL}/api/v1/blogs-mongo/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Blog not found');
    return res.json();
  },

  searchFromMongo: async (q: string) => {
    const res = await fetch(`${API_URL}/api/v1/blogs-mongo/search?q=${q}`);
    return res.json();
  },

  getCategoriesFromMongo: async () => {
    const res = await fetch(`${API_URL}/api/v1/blogs-mongo/categories/list`);
    return res.json();
  },

  getStatisticsFromMongo: async () => {
    const res = await fetch(`${API_URL}/api/v1/blogs-mongo/stats/overview`);
    return res.json();
  },
};
```

### **Use in Components**

```typescript
// In your blog page component
import { blogApi } from '@/lib/api/blog';

export default async function BlogPage() {
  const { items, total } = await blogApi.getAllFromMongo(10, 0);
  
  return (
    <div>
      <h1>Blog ({total} articles)</h1>
      {items.map(blog => (
        <article key={blog._id}>
          <h2>{blog.title}</h2>
          <p>{blog.excerpt}</p>
          <img src={blog.featured_image_webp_url} alt={blog.featured_image_alt_text} />
        </article>
      ))}
    </div>
  );
}
```

---

## 🚀 Complete Workflow

```
1. Start MongoDB
   ↓
2. Run Python Script
   python scripts/insert_blogs_mongodb.py
   ↓
3. Verify in CLI
   mongosh → db.blogs.countDocuments()
   ↓
4. Include API in main.py
   from app.api.v1.mongo_blogs_api import router
   app.include_router(router)
   ↓
5. Start Backend
   python main.py
   ↓
6. Test API Endpoints
   curl "http://localhost:8000/api/v1/blogs-mongo"
   ↓
7. Update Frontend API Client
   Use blogApi.getAllFromMongo(), etc.
   ↓
8. Display in Frontend
   Components fetch data from API
   ↓
✅ COMPLETE!
```

---

## 📋 Files Involved

```
MegiLance/
├── scripts/
│   ├── insert_blogs_mongodb.py ✨ (Automatic insertion)
│   └── mongo_cli_insert.js ✨ (Manual CLI)
├── backend/app/api/v1/
│   └── mongo_blogs_api.py ✨ (REST API)
├── backend/main.py
│   └── # Include: from app.api.v1.mongo_blogs_api import router
│       # And: app.include_router(router)
├── frontend/lib/api/
│   └── blog.ts ✨ (Update with MongoDB endpoints)
└── public/blog-images/
    └── # Will contain 100+ WebP images
```

---

## 🎯 Summary

**What You Get:**

1. ✅ **100 blogs** in MongoDB with full metadata
2. ✅ **6 performance indexes** for fast queries
3. ✅ **30+ WebP images** optimized for web
4. ✅ **6 REST API endpoints** ready to use
5. ✅ **Full SEO support** (schema.org, meta tags)
6. ✅ **Smart backlinking** (5 related per blog)
7. ✅ **Analytics tracking** (views, stats)
8. ✅ **Production-ready** code

**Time to Complete:**
- Insertion: 2-5 minutes
- API setup: 5 minutes
- Frontend integration: 10 minutes
- **Total: ~20 minutes**

---

## ✨ Result

After following these steps, you will have:

```
✅ MongoDB with 100 fully-formed blog documents
✅ FastAPI serving blogs via REST endpoints
✅ Frontend consuming blog data from MongoDB
✅ Full search, filter, and category support
✅ Blog statistics and analytics
✅ WebP optimized images
✅ SEO-ready with structured data
✅ Production-grade performance
```

**Everything is automated and ready to use!** 🚀

---

**Ready to get started?** Pick a method above and run it now!
