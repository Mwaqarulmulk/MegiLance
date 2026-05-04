from app.db.turso_http import TursoHTTP

turso = TursoHTTP.get_instance()

# Test different is_active conditions
queries = [
    ("Without is_active:", "SELECT id, email FROM users WHERE LOWER(user_type) = 'freelancer' LIMIT 3"),
    ("With is_active = 1:", "SELECT id, email FROM users WHERE LOWER(user_type) = 'freelancer' AND is_active = 1 LIMIT 3"),
    ("With is_active = true:", "SELECT id, email FROM users WHERE LOWER(user_type) = 'freelancer' AND is_active = true LIMIT 3"),
    ("With is_active = TRUE:", "SELECT id, email FROM users WHERE LOWER(user_type) = 'freelancer' AND is_active = TRUE LIMIT 3"),
]

for name, sql in queries:
    result = turso.execute(sql)
    print(f'{name} {len(result.get("rows", []))} rows')
