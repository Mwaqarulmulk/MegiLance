import sqlite3
conn = sqlite3.connect('local_dev.db')
cursor = conn.cursor()

print("=== CLIENT USERS ===")
cursor.execute("SELECT id, email, name, user_type FROM users WHERE user_type = 'client' LIMIT 5")
for row in cursor.fetchall():
    print(row)

print("\n=== FREELANCER USERS ===")
cursor.execute("SELECT id, email, name, user_type FROM users WHERE user_type = 'freelancer' LIMIT 5")
for row in cursor.fetchall():
    print(row)

print("\n=== PROJECT 61 OWNER ===")
cursor.execute("SELECT p.id, p.title, p.client_id, u.email FROM projects p JOIN users u ON p.client_id = u.id WHERE p.id = 61")
for row in cursor.fetchall():
    print(row)

print("\n=== PROPOSALS FOR PROJECT 61 ===")
cursor.execute("SELECT id, project_id, freelancer_id, status FROM proposals WHERE project_id = 61")
for row in cursor.fetchall():
    print(row)

conn.close()
