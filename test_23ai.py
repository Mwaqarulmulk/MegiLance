#!/usr/bin/env python3
import oracledb

# Test connection to 23ai database
conn = oracledb.connect(
    user='ADMIN',
    password='Bfw5ZvHQXjkDb!3lAa1!',
    dsn='megilanceai_high',
    config_dir='/app/oracle-wallet-23ai',
    wallet_location='/app/oracle-wallet-23ai',
    wallet_password='MegiLance2025!Wallet'
)

cursor = conn.cursor()

# Test connection
cursor.execute('SELECT 1 FROM DUAL')
result = cursor.fetchone()
print('✅ 23ai Database Connection: SUCCESS')
print('✅ Result:', result)

# Get version
cursor.execute("SELECT BANNER FROM V$VERSION WHERE ROWNUM = 1")
version = cursor.fetchone()
print('✅ Database Version:', version[0])

# Check AI features
cursor.execute("SELECT * FROM V$VERSION")
versions = cursor.fetchall()
print('\n📊 Full Version Info:')
for v in versions:
    print(f'   {v[0]}')

cursor.close()
conn.close()
print('\n✅ Test completed successfully!')
