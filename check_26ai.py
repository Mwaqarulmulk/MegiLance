import oracledb
c = oracledb.connect(user='ADMIN',password='Bfw5ZvHQXjkDb!3lAa1!',dsn='megilanceai_high',
                     config_dir='/wallet',wallet_location='/wallet',wallet_password='MegiLance2025!Wallet')
cur = c.cursor()
for t in ['users','skills','projects','proposals']:
    cur.execute(f'SELECT COUNT(*) FROM {t}')
    print(f'{t}: {cur.fetchone()[0]}')
c.close()
