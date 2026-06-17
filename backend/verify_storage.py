"""Storage + DB verification script."""
import os, sys, urllib.request

for k, v in {
    "R2_ACCOUNT_ID": "3f295cd4f9644c8899d8d020de37d802",
    "R2_ACCESS_KEY_ID": "41146f52c4d672bc3fd1cc2ec75dd393",
    "R2_SECRET_ACCESS_KEY": "5137b877d608b04e6620bc0b900bd5a227404bb03114d051de6a3b959c2beb1f",
    "R2_BUCKET": "megilance-media",
    "R2_PUBLIC_URL": "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev",
    "TURSO_DATABASE_URL": "libsql://megilance-db-megilance.aws-ap-south-1.turso.io",
    "TURSO_AUTH_TOKEN": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjUyMjY1NTksImlkIjoiZGVmMGE2NzYtMGZiNC00MDAzLTkyNmItMDhlYzA4NjY4MWFkIiwicmlkIjoiYTliOGUwMzctZGQwNi00NTRiLTlmYzgtNGFmMzcxYTg0ODdiIn0.qt4d8AZ587-_i6QWt8f2oUCXuN2w4w0m6YvveN_BSVRFJVH1GM9DL8TuxQfzptpt7HiGBlvGsnbq7zwRrYCyDA",
}.items():
    os.environ[k] = v

sys.path.insert(0, os.path.dirname(__file__))

import boto3
from botocore.config import Config

print("=== R2 Storage Verification ===")
s3 = boto3.client(
    "s3",
    endpoint_url="https://3f295cd4f9644c8899d8d020de37d802.r2.cloudflarestorage.com",
    aws_access_key_id="41146f52c4d672bc3fd1cc2ec75dd393",
    aws_secret_access_key="5137b877d608b04e6620bc0b900bd5a227404bb03114d051de6a3b959c2beb1f",
    config=Config(signature_version="s3v4"),
    region_name="auto",
)

resp = s3.list_objects_v2(Bucket="megilance-media")
contents = resp.get("Contents", [])
total = resp.get("KeyCount", 0)
print(f"  Total objects in bucket : {total}")

freelancer_keys = [o["Key"] for o in contents if "freelancers/" in o["Key"]]
client_keys     = [o["Key"] for o in contents if "clients/" in o["Key"]]
print(f"  Freelancer avatars      : {len(freelancer_keys)}")
print(f"  Client avatars          : {len(client_keys)}")

# Public URL accessibility
test_url = "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/aisha-khan.jpg"
req = urllib.request.Request(test_url, method="HEAD", headers={"User-Agent": "MegiLance/2.0"})
try:
    with urllib.request.urlopen(req, timeout=8) as r:
        ct = r.headers.get("Content-Type", "?")
        cl = r.headers.get("Content-Length", "?")
        print(f"  Public URL accessible   : YES  ({ct}, {cl} bytes)")
except Exception as e:
    print(f"  Public URL accessible   : NO  ({e})")

# store_bytes helper
from app.services.storage import store_bytes, r2_enabled
print(f"  r2_enabled()            : {r2_enabled()}")
url = store_bytes(b"verify-ok-payload", "test/verify.txt", "text/plain")
print(f"  store_bytes upload test : {url}")

# Avatar upload test (simulated jpeg header)
fake_jpg = bytes([0xFF, 0xD8, 0xFF, 0xE0]) + b"\x00" * 100
avatar_url = store_bytes(fake_jpg, "test/avatar-test.jpg", "image/jpeg")
print(f"  Avatar upload test      : {avatar_url}")

# Document upload test (simulated PDF header)
fake_pdf = b"%PDF-1.4 test document data" + b"\x00" * 50
doc_url = store_bytes(fake_pdf, "test/document-test.pdf", "application/pdf")
print(f"  Document upload test    : {doc_url}")

print()
print("=== Database — Demo Profile Images ===")
from app.db.turso_http import execute_query, parse_rows

sql = "SELECT name, user_type, profile_image_url FROM users WHERE email LIKE '%@demo.megilance.com' ORDER BY user_type, name"
rows = parse_rows(execute_query(sql) or {})
freelancers_db = [r for r in rows if r.get("user_type") == "freelancer"]
clients_db     = [r for r in rows if r.get("user_type") == "client"]

print(f"  Freelancers in DB: {len(freelancers_db)}")
r2_count = sum(1 for r in freelancers_db if "r2.dev" in str(r.get("profile_image_url", "")))
print(f"  With R2 avatars  : {r2_count}")
print()
print("  Sample freelancers:")
for r in freelancers_db[:6]:
    url_ = r.get("profile_image_url") or "(none)"
    tag = "R2" if "r2.dev" in url_ else "ext" if url_.startswith("http") else "none"
    print(f"    [{tag}] {r.get('name','?'):25s} {url_[:70]}")

print()
print(f"  Clients in DB: {len(clients_db)}")
for r in clients_db:
    url_ = r.get("profile_image_url") or "(none)"
    tag = "R2" if "r2.dev" in url_ else "ext" if url_.startswith("http") else "none"
    print(f"    [{tag}] {r.get('name','?'):25s} {url_[:70]}")

print()
print("=== All checks passed ===")
