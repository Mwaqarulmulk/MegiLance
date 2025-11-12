from sqlalchemy import create_engine, text
import os
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    print('--- TABLES ---')
    r = conn.execute(text('SELECT table_name FROM user_tables ORDER BY table_name'))
    for row in r:
        print(row[0])
    print('\n--- INDEXES ---')
    r2 = conn.execute(text("SELECT index_name||'|'||table_name||'|'||uniqueness FROM user_indexes ORDER BY index_name"))
    for row in r2:
        print(row[0])
    print('\n--- ALEMBIC ---')
    try:
        r3 = conn.execute(text('select version_num from alembic_version'))
        for row in r3:
            print(row[0])
    except Exception as e:
        print('alembic_version missing or error:', e)
