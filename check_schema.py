import oracledb
c = oracledb.connect(user='ADMIN',password='Bfw5ZvHQXjkDb!3lAa1!',dsn='megilanceai_high',
                     config_dir='/wallet',wallet_location='/wallet',wallet_password='MegiLance2025!Wallet')
cur = c.cursor()
cur.execute("SELECT column_name, data_type FROM user_tab_columns WHERE table_name='USERS' ORDER BY column_id")
print("26ai USERS columns:")
for row in cur:
    print(f"  {row[0]}: {row[1]}")
c.close()
