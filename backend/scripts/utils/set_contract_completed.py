import sqlite3
conn = sqlite3.connect('local_dev.db')
cur = conn.cursor()
cur.execute("UPDATE contracts SET status = 'completed' WHERE id = 23")
conn.commit()
print('Contract 23 set to completed')
conn.close()
