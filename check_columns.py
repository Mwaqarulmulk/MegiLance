import oracledb

conn = oracledb.connect(
    user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', dsn='megilancedb_high',
    config_dir='/app/oracle-wallet', wallet_location='/app/oracle-wallet',
    wallet_password='MegiLance2025!Wallet'
)
cursor = conn.cursor()
cursor.execute("SELECT column_name FROM user_tab_columns WHERE table_name = 'USERS' ORDER BY column_id")
print("USERS columns:", [r[0] for r in cursor.fetchall()])
cursor.execute("SELECT * FROM users WHERE ROWNUM = 1")
print("Sample row columns:", [d[0] for d in cursor.description])
cursor.close()
conn.close()
