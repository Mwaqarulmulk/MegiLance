import sqlite3
conn = sqlite3.connect('local_dev.db')
cur = conn.cursor()
cur.execute("SELECT id, title, status FROM projects LIMIT 5")
print([dict(zip([d[0] for d in cur.description], r)) for r in cur.fetchall()])
conn.close()
