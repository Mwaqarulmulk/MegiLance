import oracledb
c = oracledb.connect(
    user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!',
    dsn='megilancedb_high',
    config_dir='/wallet', wallet_location='/wallet',
    wallet_password='MegiLance2025!Wallet'
)
cur = c.cursor()
for table in ['USERS', 'PROJECTS', 'PROPOSALS']:
    cur.execute(f"SELECT column_name FROM user_tab_columns WHERE table_name='{table}' ORDER BY column_id")
    print(f"19c {table} columns:", [r[0] for r in cur])
c.close()
