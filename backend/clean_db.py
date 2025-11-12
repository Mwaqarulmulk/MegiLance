#!/usr/bin/env python3
"""
Clean Oracle database and run fresh migrations
"""
from sqlalchemy import create_engine, text
import os
import sys

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("❌ DATABASE_URL not set!")
    sys.exit(1)

print("\n🧹 Cleaning Oracle database...")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Get all tables
    result = conn.execute(text('SELECT table_name FROM user_tables'))
    tables = [row[0] for row in result]
    
    print(f"\n📊 Found {len(tables)} tables to drop:")
    for table in tables:
        print(f"  - {table}")
    
    # Drop all tables with CASCADE CONSTRAINTS
    for table in tables:
        try:
            conn.execute(text(f'DROP TABLE {table} CASCADE CONSTRAINTS'))
            conn.commit()
            print(f"✅ Dropped {table}")
        except Exception as e:
            print(f"⚠️  Error dropping {table}: {e}")
    
    # Drop all indexes (except system ones)
    result = conn.execute(text("SELECT index_name FROM user_indexes WHERE index_name NOT LIKE 'SYS_%'"))
    indexes = [row[0] for row in result]
    
    if indexes:
        print(f"\n🔑 Dropping {len(indexes)} indexes...")
        for idx in indexes:
            try:
                conn.execute(text(f'DROP INDEX {idx}'))
                conn.commit()
            except:
                pass  # Index might be already dropped with table
    
    # Drop all sequences
    result = conn.execute(text('SELECT sequence_name FROM user_sequences'))
    sequences = [row[0] for row in result]
    
    if sequences:
        print(f"\n🔢 Dropping {len(sequences)} sequences...")
        for seq in sequences:
            try:
                conn.execute(text(f'DROP SEQUENCE {seq}'))
                conn.commit()
            except:
                pass
    
    print("\n✅ Database cleaned successfully!")
    print("=" * 50)

conn.close()
