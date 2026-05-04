import sqlite3
conn = sqlite3.connect('local_dev.db')
cur = conn.cursor()
cur.execute("UPDATE proposals SET status = 'submitted' WHERE id = 60")
conn.commit()
print("Done - proposal 60 reset to submitted")
conn.close()
