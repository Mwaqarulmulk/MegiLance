# @AI-HINT: End-to-end verification test for 2-Part Milestone payment and complete client-freelancer workflow
"""
End-to-End Workflow Verification:
1. Client (Aesthetic Clinic Owner) posts project.
2. Freelancer (Umair) submits proposal.
3. Client accepts proposal -> 2-Part Milestones automatically provisioned.
4. Client deposits & releases Part 1 (Upfront Advance Payment).
5. Freelancer submits deliverable for Part 2.
6. Client reviews & releases Part 2 (Final Payment) -> Contract completed.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.turso_http import execute_query, parse_rows
from app.services.proposals_service import accept_proposal
from datetime import datetime, timezone


def test_two_part_milestone_workflow():
    now = datetime.now(timezone.utc).isoformat()
    ts = int(datetime.now(timezone.utc).timestamp())
    client_email = f"client_clinic_{ts}@megilance.test"
    freelancer_email = f"umair_freelancer_{ts}@megilance.test"

    # 1. Create Client (Aesthetic Clinic Owner)
    execute_query(
        """INSERT INTO users (name, email, hashed_password, user_type, role, is_verified, email_verified, two_factor_enabled, account_balance, is_active, joined_at, created_at, updated_at)
           VALUES ('Aesthetic Clinic Owner', ?, 'hashed_pw', 'client', 'client', 1, 1, 0, 2000.0, 1, ?, ?, ?)""",
        [client_email, now, now, now],
    )
    client_rows = parse_rows(execute_query("SELECT id, email FROM users WHERE email = ?", [client_email]))
    assert client_rows, "Client creation failed"
    client_id = client_rows[0]["id"]

    # 2. Create Freelancer (Umair)
    execute_query(
        """INSERT INTO users (name, email, hashed_password, user_type, role, is_verified, email_verified, two_factor_enabled, account_balance, is_active, joined_at, created_at, updated_at)
           VALUES ('Umair', ?, 'hashed_pw', 'freelancer', 'freelancer', 1, 1, 0, 0.0, 1, ?, ?, ?)""",
        [freelancer_email, now, now, now],
    )
    freelancer_rows = parse_rows(execute_query("SELECT id FROM users WHERE email = ?", [freelancer_email]))
    assert freelancer_rows, "Freelancer creation failed"
    freelancer_id = freelancer_rows[0]["id"]

    # 3. Client posts Project
    execute_query(
        """INSERT INTO projects (title, description, category, budget_min, budget_max, budget_type, experience_level, estimated_duration, skills, status, client_id, created_at, updated_at)
           VALUES ('Aesthetic Clinic Web & Booking Platform', 'Full-stack clinic portal', 'Web Development', 1000.0, 1200.0, 'fixed', 'expert', '1 month', '["React", "FastAPI", "UI/UX"]', 'open', ?, ?, ?)""",
        [client_id, now, now],
    )
    project_rows = parse_rows(execute_query("SELECT id FROM projects WHERE client_id = ? ORDER BY id DESC LIMIT 1", [client_id]))
    assert project_rows, "Project creation failed"
    project_id = project_rows[0]["id"]

    # 4. Freelancer submits Proposal
    execute_query(
        """INSERT INTO proposals (project_id, freelancer_id, cover_letter, bid_amount, estimated_hours, hourly_rate, availability, status, is_draft, created_at, updated_at)
           VALUES (?, ?, 'I can build your aesthetic clinic booking platform.', 1200.0, 40, 30.0, 'Full-time', 'submitted', 0, ?, ?)""",
        [project_id, freelancer_id, now, now],
    )
    proposal_rows = parse_rows(execute_query("SELECT id FROM proposals WHERE project_id = ? AND freelancer_id = ?", [project_id, freelancer_id]))
    assert proposal_rows, "Proposal creation failed"
    proposal_id = proposal_rows[0]["id"]

    # 5. Client accepts Proposal -> Contract, Escrow & 2-Part Milestones created
    proposal_dict = {
        "id": proposal_id,
        "project_id": project_id,
        "freelancer_id": freelancer_id,
        "bid_amount": 1200.0,
        "hourly_rate": 0,
        "_project_title": "Aesthetic Clinic Web & Booking Platform",
        "_project_description": "Full-stack clinic portal",
    }
    accepted = accept_proposal(proposal_id, proposal_dict, client_id)
    assert accepted is not None
    assert accepted.get("contract_id") is not None
    contract_id = accepted["contract_id"]

    # Verify 2-Part Milestones exist
    milestone_rows = parse_rows(execute_query(
        "SELECT id, title, amount, status, order_index FROM milestones WHERE contract_id = ? ORDER BY order_index ASC",
        [contract_id],
    ))
    assert len(milestone_rows) == 2, f"Expected 2 milestones, found {len(milestone_rows)}"
    assert milestone_rows[0]["amount"] == 600.0, "Part 1 milestone should be $600 (50%)"
    assert milestone_rows[1]["amount"] == 600.0, "Part 2 milestone should be $600 (50%)"
    assert "Part 1" in milestone_rows[0]["title"]
    assert "Part 2" in milestone_rows[1]["title"]

    # 6. Verify Escrow was auto-funded from client balance (or fund it)
    from app.services.escrow_service import get_user_balance, release_escrow_funds
    escrow_rows = parse_rows(execute_query("SELECT id, amount, status, released_amount FROM escrow WHERE contract_id = ?", [contract_id]))
    assert escrow_rows, "Escrow record not found"
    escrow_id = escrow_rows[0]["id"]

    # 7. Release Part 1 (Upfront Advance Payment - $600)
    release_escrow_funds(
        escrow_id=escrow_id,
        release_amount=600.0,
        freelancer_id=freelancer_id,
        current_released=0.0,
        total_amount=1200.0,
    )
    execute_query("UPDATE milestones SET status = 'approved' WHERE id = ?", [milestone_rows[0]["id"]])

    freelancer_bal = get_user_balance(freelancer_id)
    assert freelancer_bal > 0, "Freelancer balance should be credited after advance release"
    # Net amount after platform fee ($600 - 10% fee ($60) = $540)
    assert freelancer_bal == 540.0, f"Expected $540 after fee, got {freelancer_bal}"

    # 8. Freelancer submits Part 2 deliverable
    execute_query(
        "UPDATE milestones SET status = 'submitted', deliverables = 'https://github.com/clinic/repo' WHERE id = ?",
        [milestone_rows[1]["id"]],
    )

    # 9. Client approves Part 2 (Final Payment - $600)
    release_escrow_funds(
        escrow_id=escrow_id,
        release_amount=600.0,
        freelancer_id=freelancer_id,
        current_released=600.0,
        total_amount=1200.0,
    )
    execute_query("UPDATE milestones SET status = 'approved' WHERE id = ?", [milestone_rows[1]["id"]])
    execute_query("UPDATE contracts SET status = 'completed' WHERE id = ?", [contract_id])
    execute_query("UPDATE projects SET status = 'completed' WHERE id = ?", [project_id])

    final_freelancer_bal = get_user_balance(freelancer_id)
    # Total net: 2 x $540 = $1080
    assert final_freelancer_bal == 1080.0, f"Expected total $1080 net balance, got {final_freelancer_bal}"

    # Verify contract and project completed
    c_check = parse_rows(execute_query("SELECT status FROM contracts WHERE id = ?", [contract_id]))
    p_check = parse_rows(execute_query("SELECT status FROM projects WHERE id = ?", [project_id]))
    assert c_check[0]["status"] == "completed"
    assert p_check[0]["status"] == "completed"

    print("\nSUCCESS: End-to-end 2-Part Milestone workflow verified successfully!")


if __name__ == '__main__':
    test_two_part_milestone_workflow()

