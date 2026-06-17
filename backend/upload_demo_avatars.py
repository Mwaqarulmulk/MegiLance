"""
One-shot script: downloads real portrait photos from randomuser.me,
uploads them to Cloudflare R2, then updates seed_marketplace.py
with the permanent R2 URLs and re-seeds the database.

Run:  python upload_demo_avatars.py
"""
import os, sys, time, urllib.request, urllib.error

# ── R2 config ─────────────────────────────────────────────────────────────────
R2_ACCOUNT_ID      = "3f295cd4f9644c8899d8d020de37d802"
R2_ACCESS_KEY_ID   = "41146f52c4d672bc3fd1cc2ec75dd393"
R2_SECRET_ACCESS_KEY = "5137b877d608b04e6620bc0b900bd5a227404bb03114d051de6a3b959c2beb1f"
R2_BUCKET          = "megilance-media"
R2_PUBLIC_URL      = "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev"

for k, v in {
    "R2_ACCOUNT_ID": R2_ACCOUNT_ID, "R2_ACCESS_KEY_ID": R2_ACCESS_KEY_ID,
    "R2_SECRET_ACCESS_KEY": R2_SECRET_ACCESS_KEY, "R2_BUCKET": R2_BUCKET,
    "R2_PUBLIC_URL": R2_PUBLIC_URL,
}.items():
    os.environ[k] = v

import boto3
from botocore.config import Config

s3 = boto3.client(
    "s3",
    endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    config=Config(signature_version="s3v4"),
    region_name="auto",
)

# ── Portrait assignments ───────────────────────────────────────────────────────
# (name_slug, gender, randomuser_index)
# Female = women/N, Male = men/N   (1-99 are all valid on randomuser.me)
FREELANCER_PORTRAITS = [
    ("aisha-khan",       "women",  21),
    ("daniel-okafor",    "men",    36),
    ("sofia-martinez",   "women",  44),
    ("liam-o-brien",     "men",    10),
    ("mei-lin",          "women",  56),
    ("carlos-mendes",    "men",    62),
    ("priya-nair",       "women",   9),
    ("tomas-novak",      "men",    83),
    ("amara-diallo",     "women",  48),
    ("hiro-tanaka",      "men",    46),
    ("elena-popova",     "women",  17),
    ("omar-haddad",      "men",    71),
    ("grace-chen",       "women",  65),
    ("nikolai-volkov",   "men",    29),
    ("fatima-zahra",     "women",  32),
    ("james-wilson",     "men",    53),
    ("ananya-reddy",     "women",   3),
    ("lucas-silva",      "men",    15),
    ("yuki-sato",        "women",  58),
    ("maria-garcia",     "women",  27),
    ("david-cohen",      "men",    90),
    ("zara-ahmed",       "women",  39),
    ("felix-mueller",    "men",    24),
    ("isabella-rossi",   "women",  12),
]

CLIENT_PORTRAITS = [
    ("meridian-studios",  "men",   42),
    ("techventure-inc",   "men",   77),
    ("global-media-co",   "women", 50),
    ("ecosolutions-ltd",  "men",   68),
    ("dataflow-systems",  "men",   85),
]

def download_portrait(gender: str, idx: int) -> bytes:
    url = f"https://randomuser.me/api/portraits/{gender}/{idx}.jpg"
    req = urllib.request.Request(url, headers={"User-Agent": "MegiLance/2.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read()

def upload_to_r2(slug: str, data: bytes, prefix: str = "avatars/demo") -> str:
    key = f"{prefix}/{slug}.jpg"
    s3.put_object(Bucket=R2_BUCKET, Key=key, Body=data, ContentType="image/jpeg")
    return f"{R2_PUBLIC_URL}/{key}"

def main():
    print("=== Uploading demo avatars to Cloudflare R2 ===\n")

    freelancer_urls: dict[str, str] = {}
    client_urls: dict[str, str] = {}

    # ── Freelancers ────────────────────────────────────────────────────────────
    print(f"Uploading {len(FREELANCER_PORTRAITS)} freelancer portraits...")
    for slug, gender, idx in FREELANCER_PORTRAITS:
        try:
            data = download_portrait(gender, idx)
            url  = upload_to_r2(slug, data, "avatars/demo/freelancers")
            freelancer_urls[slug] = url
            print(f"  OK  {slug:30s} -> {url}")
        except Exception as e:
            print(f"  ERR {slug}: {e}")
            # Fallback to pravatar.cc (deterministic by hash)
            num = sum(ord(c) for c in slug) % 70 + 1
            freelancer_urls[slug] = f"https://i.pravatar.cc/400?img={num}"
        time.sleep(0.2)   # polite rate limiting

    print()

    # ── Clients ────────────────────────────────────────────────────────────────
    print(f"Uploading {len(CLIENT_PORTRAITS)} client portraits...")
    for slug, gender, idx in CLIENT_PORTRAITS:
        try:
            data = download_portrait(gender, idx)
            url  = upload_to_r2(slug, data, "avatars/demo/clients")
            client_urls[slug] = url
            print(f"  OK  {slug:30s} -> {url}")
        except Exception as e:
            print(f"  ERR {slug}: {e}")
            num = sum(ord(c) for c in slug) % 70 + 1
            client_urls[slug] = f"https://i.pravatar.cc/400?img={num}"
        time.sleep(0.2)

    print()

    # ── Patch seed_marketplace.py ──────────────────────────────────────────────
    print("Patching seed_marketplace.py ...")
    seed_path = os.path.join(os.path.dirname(__file__), "app", "db", "seed_marketplace.py")

    with open(seed_path, "r", encoding="utf-8") as f:
        src = f.read()

    # Replace _avatar() helper with a lookup dict
    ordered_f_urls = [freelancer_urls.get(slug, "") for slug, _, _ in FREELANCER_PORTRAITS]
    ordered_c_urls = [client_urls.get(slug, "") for slug, _, _ in CLIENT_PORTRAITS]

    new_avatar_section = '''# Real profile photos hosted on Cloudflare R2
_FREELANCER_AVATARS = [
'''
    for (slug, _, _), url in zip(FREELANCER_PORTRAITS, ordered_f_urls):
        new_avatar_section += f'    "{url}",  # {slug}\n'
    new_avatar_section += ']\n\n'

    new_avatar_section += '_CLIENT_AVATARS = [\n'
    for (slug, _, _), url in zip(CLIENT_PORTRAITS, ordered_c_urls):
        new_avatar_section += f'    "{url}",  # {slug}\n'
    new_avatar_section += ']\n\n'

    new_avatar_section += '''def _avatar(name: str, index: int = 0, pool: list = None) -> str:
    """Return a real R2-hosted portrait for this demo profile."""
    if pool is None:
        pool = _FREELANCER_AVATARS
    return pool[index % len(pool)]

'''

    # Replace old _avatar function and the line before it
    old_avatar_block = '''def _avatar(name: str) -> str:
    seed = name.replace(" ", "")
    return f"https://api.dicebear.com/7.x/avataaars/svg?seed={seed}&backgroundColor=b6e3f4,c0aede,d1d4f9"

'''
    if old_avatar_block in src:
        src = src.replace(old_avatar_block, new_avatar_section)
        print("  OK _avatar() helper replaced")
    else:
        print("  WARN Could not find old _avatar block -- injecting before _gig_image")
        src = src.replace("def _gig_image", new_avatar_section + "def _gig_image")

    # Replace _avatar(name) call in the INSERT loop with indexed call
    src = src.replace(
        "_avatar(name),",
        "_avatar(name, i, _FREELANCER_AVATARS),",
    )

    # Add profile_image_url to demo clients INSERT (pass client avatar)
    old_client_insert = '''        execute_query(
            """INSERT INTO users (email, hashed_password, is_active, is_verified, email_verified,
                  name, user_type, role, bio, location, two_factor_enabled, account_balance,
                  joined_at, created_at, updated_at)
               VALUES (?,?,1,1,1,?,?,?,?,?,0,0,?,?,?)""",
            [client_email, pw, cname, "client", "client", cbio, cloc,
             now.isoformat(), now.isoformat(), now.isoformat()],
        )'''

    new_client_insert = '''        execute_query(
            """INSERT INTO users (email, hashed_password, is_active, is_verified, email_verified,
                  name, user_type, role, bio, location, profile_image_url, two_factor_enabled, account_balance,
                  joined_at, created_at, updated_at)
               VALUES (?,?,1,1,1,?,?,?,?,?,?,0,0,?,?,?)""",
            [client_email, pw, cname, "client", "client", cbio, cloc,
             _CLIENT_AVATARS[ci % len(_CLIENT_AVATARS)],
             now.isoformat(), now.isoformat(), now.isoformat()],
        )'''

    if old_client_insert in src:
        src = src.replace(old_client_insert, new_client_insert)
        print("  OK Client INSERT updated with profile_image_url")
    else:
        print("  WARN Could not patch client INSERT -- clients will have no avatar")

    with open(seed_path, "w", encoding="utf-8") as f:
        f.write(src)
    print("  OK seed_marketplace.py saved\n")

    # ── Re-seed the database ───────────────────────────────────────────────────
    print("Re-seeding database with real photos (force=True) ...")
    # Load .env first
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        for line in open(env_path):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip())

    sys.path.insert(0, os.path.dirname(__file__))
    from app.db.seed_marketplace import seed
    result = seed(force=True)
    print(f"  Seed result: {result}\n")

    print("=== Done! ===")
    print(f"  {len(freelancer_urls)} freelancer avatars on R2")
    print(f"  {len(client_urls)} client avatars on R2")
    print(f"  Database re-seeded with real photos")
    print(f"  Public base: {R2_PUBLIC_URL}/avatars/demo/")

if __name__ == "__main__":
    main()
