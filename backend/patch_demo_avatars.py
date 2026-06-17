"""
Direct UPDATE of profile_image_url for all demo users.
No delete/re-insert — avoids FK constraint issues.
"""
import os, sys

for k, v in {
    "TURSO_DATABASE_URL": "libsql://megilance-db-megilance.aws-ap-south-1.turso.io",
    "TURSO_AUTH_TOKEN": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjUyMjY1NTksImlkIjoiZGVmMGE2NzYtMGZiNC00MDAzLTkyNmItMDhlYzA4NjY4MWFkIiwicmlkIjoiYTliOGUwMzctZGQwNi00NTRiLTlmYzgtNGFmMzcxYTg0ODdiIn0.qt4d8AZ587-_i6QWt8f2oUCXuN2w4w0m6YvveN_BSVRFJVH1GM9DL8TuxQfzptpt7HiGBlvGsnbq7zwRrYCyDA",
}.items():
    os.environ[k] = v

sys.path.insert(0, os.path.dirname(__file__))
from app.db.turso_http import execute_query, parse_rows

R2 = "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev"

# Exact name -> R2 URL mapping (order-independent)
FREELANCER_MAP = {
    "Aisha Khan":      f"{R2}/avatars/demo/freelancers/aisha-khan.jpg",
    "Daniel Okafor":   f"{R2}/avatars/demo/freelancers/daniel-okafor.jpg",
    "Sofia Martinez":  f"{R2}/avatars/demo/freelancers/sofia-martinez.jpg",
    "Liam O'Brien":    f"{R2}/avatars/demo/freelancers/liam-o-brien.jpg",
    "Mei Lin":         f"{R2}/avatars/demo/freelancers/mei-lin.jpg",
    "Carlos Mendes":   f"{R2}/avatars/demo/freelancers/carlos-mendes.jpg",
    "Priya Nair":      f"{R2}/avatars/demo/freelancers/priya-nair.jpg",
    "Tomas Novak":     f"{R2}/avatars/demo/freelancers/tomas-novak.jpg",
    "Amara Diallo":    f"{R2}/avatars/demo/freelancers/amara-diallo.jpg",
    "Hiro Tanaka":     f"{R2}/avatars/demo/freelancers/hiro-tanaka.jpg",
    "Elena Popova":    f"{R2}/avatars/demo/freelancers/elena-popova.jpg",
    "Omar Haddad":     f"{R2}/avatars/demo/freelancers/omar-haddad.jpg",
    "Grace Chen":      f"{R2}/avatars/demo/freelancers/grace-chen.jpg",
    "Nikolai Volkov":  f"{R2}/avatars/demo/freelancers/nikolai-volkov.jpg",
    "Fatima Zahra":    f"{R2}/avatars/demo/freelancers/fatima-zahra.jpg",
    "James Wilson":    f"{R2}/avatars/demo/freelancers/james-wilson.jpg",
    "Ananya Reddy":    f"{R2}/avatars/demo/freelancers/ananya-reddy.jpg",
    "Lucas Silva":     f"{R2}/avatars/demo/freelancers/lucas-silva.jpg",
    "Yuki Sato":       f"{R2}/avatars/demo/freelancers/yuki-sato.jpg",
    "Maria Garcia":    f"{R2}/avatars/demo/freelancers/maria-garcia.jpg",
    "David Cohen":     f"{R2}/avatars/demo/freelancers/david-cohen.jpg",
    "Zara Ahmed":      f"{R2}/avatars/demo/freelancers/zara-ahmed.jpg",
    "Felix Mueller":   f"{R2}/avatars/demo/freelancers/felix-mueller.jpg",
    "Isabella Rossi":  f"{R2}/avatars/demo/freelancers/isabella-rossi.jpg",
}

CLIENT_MAP = {
    "Meridian Studios": f"{R2}/avatars/demo/clients/meridian-studios.jpg",
    "TechVenture Inc":  f"{R2}/avatars/demo/clients/techventure-inc.jpg",
    "Global Media Co":  f"{R2}/avatars/demo/clients/global-media-co.jpg",
    "EcoSolutions Ltd": f"{R2}/avatars/demo/clients/ecosolutions-ltd.jpg",
    "DataFlow Systems": f"{R2}/avatars/demo/clients/dataflow-systems.jpg",
}

print("Patching demo user profile_image_url directly in Turso ...")
updated = 0
skipped = 0

all_map = {**FREELANCER_MAP, **CLIENT_MAP}
for name, url in all_map.items():
    result = execute_query(
        "UPDATE users SET profile_image_url = ? WHERE name = ? AND email LIKE '%@demo.megilance.com'",
        [url, name],
    )
    rows_affected = 0
    if result and isinstance(result, dict):
        rows_affected = result.get("rows_affected", 0) or result.get("affected_rows", 0)
    # Turso returns rows_affected 0 even on success for some clients; verify with SELECT
    check = parse_rows(execute_query(
        "SELECT id, profile_image_url FROM users WHERE name = ? AND email LIKE '%@demo.megilance.com'",
        [name],
    ) or {})
    if check and check[0].get("profile_image_url") == url:
        print(f"  OK  {name:25s}")
        updated += 1
    else:
        print(f"  ERR {name:25s} (not found or update failed)")
        skipped += 1

print()
print(f"Updated : {updated}")
print(f"Skipped : {skipped}")

print()
print("Verifying sample rows ...")
rows = parse_rows(execute_query(
    "SELECT name, user_type, profile_image_url FROM users WHERE email LIKE '%@demo.megilance.com' ORDER BY user_type, name LIMIT 12"
) or {})
for r in rows:
    url_ = r.get("profile_image_url") or "(none)"
    tag = "R2" if "r2.dev" in url_ else "DiceBear" if "dicebear" in url_ else "other"
    print(f"  [{tag}] {r.get('name','?'):25s}")

print()
print("Done.")
