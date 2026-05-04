# @AI-HINT: Seeds minimum dev/test data for all features - invoices, escrow, user_skills, wallet
"""
Seed Dev Data - fills remaining empty tables with minimum data for feature testing
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.db.turso_http import execute_query


def seed():
    print("🌱 Seeding dev data...")

    # Invoices
    execute_query(
        """INSERT INTO invoices (invoice_number, contract_id, from_user_id, to_user_id,
           subtotal, tax, total, due_date, status, items, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now','-5 days'), 'paid',
           '[]', datetime('now','-10 days'), datetime('now','-5 days'))""",
        ['INV-2025-001', 3, 5, 2, 12750.0, 1275.0, 14025.0]
    )
    execute_query(
        """INSERT INTO invoices (invoice_number, contract_id, from_user_id, to_user_id,
           subtotal, tax, total, due_date, status, items, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now','+7 days'), 'pending',
           '[]', datetime('now','-3 days'), datetime('now','-3 days'))""",
        ['INV-2025-002', 1, 8, 3, 9000.0, 900.0, 9900.0]
    )
    execute_query(
        """INSERT INTO invoices (invoice_number, contract_id, from_user_id, to_user_id,
           subtotal, tax, total, due_date, status, items, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now','+10 days'), 'pending',
           '[]', datetime('now','-1 day'), datetime('now','-1 day'))""",
        ['INV-2025-003', 2, 5, 2, 1400.0, 140.0, 1540.0]
    )
    print("  ✅ 3 invoices")

    # Escrow entries (schema: contract_id, client_id, amount, status, released_amount, released_at, expires_at)
    execute_query(
        """INSERT INTO escrow (contract_id, client_id, amount, status, released_amount, created_at, updated_at)
           VALUES (?, ?, ?, 'active', 0, datetime('now','-14 days'), datetime('now'))""",
        [1, 3, 36000.0]
    )
    execute_query(
        """INSERT INTO escrow (contract_id, client_id, amount, status, released_amount, created_at, updated_at)
           VALUES (?, ?, ?, 'active', 0, datetime('now','-10 days'), datetime('now'))""",
        [2, 2, 4200.0]
    )
    execute_query(
        """INSERT INTO escrow (contract_id, client_id, amount, status, released_amount, released_at, created_at, updated_at)
           VALUES (?, ?, ?, 'released', ?, datetime('now','-5 days'),
           datetime('now','-60 days'), datetime('now','-5 days'))""",
        [3, 2, 12750.0, 12750.0]
    )
    print("  ✅ 3 escrow entries")

    # User skills linking
    skills_data = [
        (5, 1), (5, 2), (5, 3), (5, 4),   # freelancer1: React, Node, Python, TS
        (6, 5),                             # freelancer2: Figma
        (7, 9),                             # freelancer3: SEO (content writer)
        (8, 9),                             # freelancer4: SEO (marketer)
        (9, 3), (9, 10),                    # freelancer5: Python, ML
    ]
    for uid, sid in skills_data:
        try:
            execute_query(
                """INSERT INTO user_skills (user_id, skill_id, proficiency_level, is_verified, created_at, updated_at)
                   VALUES (?, ?, 4, 1, datetime('now'), datetime('now'))""",
                [uid, sid]
            )
        except Exception:
            pass  # skip duplicates
    print("  ✅ User skills linked")

    # Wallet balances (schema: user_id PK, available, pending, escrow, currency, updated_at)
    for uid, bal in [(2, 5000.0), (3, 12000.0), (5, 8750.0), (6, 3200.0), (1, 0.0)]:
        try:
            execute_query(
                """INSERT OR REPLACE INTO wallet_balances (user_id, available, pending, escrow, currency, updated_at)
                   VALUES (?, ?, 0, 0, 'USD', datetime('now'))""",
                [uid, bal]
            )
        except Exception:
            pass
    print("  ✅ Wallet balances")

    # Wallet transactions (schema: user_id, type, amount, currency, status, description, reference_id, metadata, created_at, completed_at)
    txns = [
        (5, 'credit', 4250.0, 'Milestone payment - Research & Planning', 'completed'),
        (5, 'credit', 5100.0, 'Milestone payment - Implementation', 'completed'),
        (2, 'debit', 4250.0, 'Payment for contract #3 milestone 1', 'completed'),
        (2, 'debit', 5100.0, 'Payment for contract #3 milestone 2', 'completed'),
        (3, 'debit', 9000.0, 'Escrow funding for contract #1', 'completed'),
    ]
    for uid, ttype, amt, desc, st in txns:
        execute_query(
            """INSERT INTO wallet_transactions (user_id, type, amount, currency, status,
               description, created_at, completed_at)
               VALUES (?, ?, ?, 'USD', ?, ?, datetime('now','-3 days'), datetime('now','-3 days'))""",
            [uid, ttype, amt, st, desc]
        )
    print("  ✅ Wallet transactions")

    print("\n✨ Dev data seeding complete!")


if __name__ == "__main__":
    seed()
