from app.db.turso_http import TursoHTTP

turso = TursoHTTP.get_instance()

# Check schema
print("Checking schema:")
result_schema = turso.execute("PRAGMA table_info(users)")
print(f"Schema result: {result_schema}")

# Test columns one by one
columns = ["id", "email", "full_name", "bio", "profile_image_url", "hourly_rate", "location"]
for col in columns:
    try:
        sql = f"SELECT {col} FROM users LIMIT 1"
        result = turso.execute(sql)
        print(f"Column {col}: exists = {bool(result.get('rows'))}")
    except Exception as e:
        print(f"Column {col}: ERROR - {e}")


