import sqlite3

conn = sqlite3.connect('local_dev.db')
cursor = conn.cursor()

# Check projects owned by user 26 (Sarah)
print("=== PROJECTS OWNED BY SARAH (user_id=26) ===")
cursor.execute("SELECT id, title, client_id FROM projects WHERE client_id = 26")
for row in cursor.fetchall():
    print(f"Project ID: {row[0]}, Title: {row[1]}, client_id: {row[2]}")

print("\n=== ALL PROPOSALS IN DATABASE ===")
cursor.execute("SELECT id, project_id, freelancer_id, status FROM proposals LIMIT 20")
for row in cursor.fetchall():
    print(f"Proposal ID: {row[0]}, Project: {row[1]}, Freelancer: {row[2]}, Status: {row[3]}")

print("\n=== PROPOSALS FOR PROJECT 61 ===")
cursor.execute("SELECT * FROM proposals WHERE project_id = 61")
for row in cursor.fetchall():
    print(row)

conn.close()
