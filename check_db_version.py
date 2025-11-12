import oracledb
c = oracledb.connect(user='ADMIN',password='Bfw5ZvHQXjkDb!3lAa1!',dsn='megilanceai_high',
                     config_dir='/wallet',wallet_location='/wallet',wallet_password='MegiLance2025!Wallet')
cur = c.cursor()
cur.execute("SELECT * FROM v$version WHERE banner LIKE 'Oracle%'")
print("Database Version:")
for row in cur:
    print(f"  {row[0]}")
cur.execute("SELECT value FROM v$parameter WHERE name='compatible'")
print(f"\nCompatible: {cur.fetchone()[0]}")
c.close()
