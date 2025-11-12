import oracledb
c = oracledb.connect(
    user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!',
    dsn='megilanceai_high',
    config_dir='/wallet', wallet_location='/wallet',
    wallet_password='MegiLance2025!Wallet'
)
cur = c.cursor()
cur.execute('DELETE FROM proposals')
cur.execute('DELETE FROM contracts')
cur.execute('DELETE FROM payments')
cur.execute('DELETE FROM projects')
cur.execute('DELETE FROM users')
cur.execute('DELETE FROM skills')
c.commit()
print('✅ Cleared all tables')
c.close()
