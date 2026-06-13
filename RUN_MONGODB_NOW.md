# ⚡ RUN MONGODB NOW - 3 Commands

**Copy-paste these commands. That's it!**

---

## 🎯 Option 1: Windows (Easiest) ⭐

**Command 1: Start MongoDB**
```bash
mongod
```

Keep this running in a terminal.

**Command 2: Insert Blogs**
```bash
python scripts/insert_blogs_mongodb.py
```

Wait 2-5 minutes...

**Command 3: Verify**
```bash
mongosh
> db.blogs.countDocuments()
100
```

✅ Done!

---

## 🎯 Option 2: Mac/Linux

**Command 1: Start MongoDB**
```bash
brew services start mongodb-community
# or
mongod
```

**Command 2: Insert Blogs**
```bash
python scripts/insert_blogs_mongodb.py
```

Wait 2-5 minutes...

**Command 3: Verify**
```bash
mongosh
> db.blogs.countDocuments()
100
```

✅ Done!

---

## 🎯 Option 3: Docker (No Installation Needed)

**Command 1: Start MongoDB with Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

**Command 2: Insert Blogs**
```bash
python scripts/insert_blogs_mongodb.py
```

Wait 2-5 minutes...

**Command 3: Verify**
```bash
docker exec -it mongodb mongosh
> db.blogs.countDocuments()
100
```

✅ Done!

---

## 🚀 Then Start API Server

**In another terminal:**

```bash
cd backend
python main.py
```

API will be at: `http://localhost:8000`

---

## 🧪 Test the API

**Open a new terminal and run:**

```bash
# List blogs
curl "http://localhost:8000/api/v1/blogs-mongo"

# Get one blog
curl "http://localhost:8000/api/v1/blogs-mongo/what-is-an-ai-freelancing-platform"

# Search
curl "http://localhost:8000/api/v1/blogs-mongo/search?q=freelancing"

# Categories
curl "http://localhost:8000/api/v1/blogs-mongo/categories/list"

# Stats
curl "http://localhost:8000/api/v1/blogs-mongo/stats/overview"
```

All should return JSON data! ✅

---

## 📍 What Each Command Does

| Command | What Happens | Time |
|---------|--------------|------|
| `mongod` | Starts MongoDB server | 5 sec |
| `python scripts/insert_blogs_mongodb.py` | Inserts 100 blogs from CSV | 2-5 min |
| `mongosh` | Opens MongoDB CLI | 1 sec |
| `db.blogs.countDocuments()` | Counts blogs (should be 100) | 1 sec |
| `python main.py` | Starts API server | 5 sec |
| `curl "http://..."` | Tests API endpoint | 1 sec |

---

## ✅ Checklist

- [ ] MongoDB running
- [ ] Blogs inserted (100)
- [ ] API server started
- [ ] One API endpoint tested
- [ ] Data shows up ✅

---

## 📊 Expected Output

### After `python scripts/insert_blogs_mongodb.py`:
```
======================================================================
MongoDB Blog Insertion for MegiLance
======================================================================

[1/6] Connecting to MongoDB...
✓ Connected to MongoDB

[2/6] Loading blog metadata...
✓ Loaded 100 blog entries from CSV

[3/6] Processing images to WebP...
✓ Processed 100 images

[4/6] Preparing blog content...
✓ Prepared 100 blogs

[5/6] Creating MongoDB indexes...
✓ All indexes created

[6/6] Inserting 100 blogs into MongoDB...
[1/100] 1.0% ✓ what-is-an-ai-freelancing-platform
[2/100] 2.0% ✓ ai-and-blockchain-freelancing
...
[100/100] 100.0% ✓ final-blog-slug

======================================================================
INSERTION COMPLETE
Inserted: 100/100
Failed: 0/100
======================================================================
```

### After `curl "http://localhost:8000/api/v1/blogs-mongo"`:
```json
{
  "items": [
    {
      "_id": "what-is-an-ai-freelancing-platform",
      "title": "What Is an AI Freelancing Platform...",
      "slug": "what-is-an-ai-freelancing-platform",
      "category": "Platform Strategy",
      "views": 0,
      "seo_score": 75
    }
  ],
  "total": 100,
  "skip": 0,
  "limit": 10,
  "pages": 10
}
```

✅ Perfect!

---

## 🎯 Next Steps After This

1. ✅ Keep MongoDB running (don't close that terminal)
2. ✅ Keep API server running (don't close that terminal)
3. ✅ Update frontend to use the API
4. ✅ Test in browser at `http://localhost:3000/blog`

---

## 💡 Quick Fixes

**"mongod: command not found"**
```bash
# Use Docker instead
docker run -d -p 27017:27017 mongo
```

**"Python not found"**
```bash
# Install from https://python.org
# Make sure "Add Python to PATH" is checked
```

**"ModuleNotFoundError: No module named 'pymongo'"**
```bash
pip install pymongo
```

**"Connection refused"**
```bash
# Make sure MongoDB is running!
# Keep the mongod terminal open
```

---

## 📚 Full Documentation

- **Quick Start**: `MONGODB_START_HERE.md`
- **Complete Guide**: `MONGODB_AND_API_COMPLETE.md`
- **Setup Guide**: `MONGODB_CLI_SETUP.md`
- **Full Reference**: `MONGODB_INSERTION_COMPLETE.md`

---

## 🚀 YOU'RE READY!

**Pick an option above. Run the commands. Done in ~10 minutes!**

---

**Don't overthink it. Just run:**

```bash
mongod
# Keep running

python scripts/insert_blogs_mongodb.py
# Wait 2-5 minutes

python main.py
# In another terminal
```

**That's it!** 🎉

Your 100 blogs are now in MongoDB and accessible via API! 

---

**Questions?** See the documentation files above.

**Ready?** Start with `mongod` now! ⚡
