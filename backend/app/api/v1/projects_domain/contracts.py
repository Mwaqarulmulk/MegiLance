# @AI-HINT: Contracts API - CRUD operations for contracts between clients and freelancers
# Uses Turso HTTP API directly - NO SQLite fallback

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from app.api.v1.core_domain.utils import SCRIPT_PATTERN, sanitize_text
from app.api.v1.core_domain.realtime_notifications import notify_user
from app.api.v1.payments_domain.payments import calculate_tiered_fee
from app.core.security import get_current_active_user
from app.db.turso_http import get_turso_http
from app.models.user import User
from app.schemas.contract import ContractCreate, ContractRead, ContractUpdate
from app.services import contracts_service
from app.services.db_utils import paginate_params
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator

router = APIRouter()
logger = logging.getLogger(__name__)

# Validation constants
MAX_TITLE_LENGTH = 200
MAX_DESCRIPTION_LENGTH = 10000
MAX_MILESTONES_LENGTH = 5000
MAX_TERMS_LENGTH = 10000
MIN_RATE = 0.01
MAX_RATE = 1000000  # $1M max rate
VALID_RATE_TYPES = {"hourly", "fixed", "monthly", "weekly"}
VALID_CONTRACT_STATUSES = {
    "pending",
    "active",
    "completed",
    "cancelled",
    "disputed",
    "paused",
    "terminated",
}


def validate_rate(rate: float, rate_type: str) -> None:
    """Validate rate value and type"""
    if rate < MIN_RATE or rate > MAX_RATE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rate must be between {MIN_RATE} and {MAX_RATE}",
        )
    if rate_type.lower() not in VALID_RATE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rate type must be one of: {', '.join(VALID_RATE_TYPES)}",
        )


class DirectHireRequest(BaseModel):
    freelancer_id: int = Field(..., gt=0)
    title: str = Field(..., min_length=3, max_length=MAX_TITLE_LENGTH)
    description: str = Field(..., min_length=10, max_length=MAX_DESCRIPTION_LENGTH)
    rate_type: str = Field(
        ..., pattern=r"^(hourly|fixed|monthly|weekly|Hourly|Fixed|Monthly|Weekly)$"
    )
    rate: float = Field(..., gt=0, le=MAX_RATE)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    @field_validator("title", "description")
    @classmethod
    def sanitize_fields(cls, v: str) -> str:
        if SCRIPT_PATTERN.search(v):
            raise ValueError("Invalid characters in input")
        return v.strip()

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, v: Optional[datetime], info) -> Optional[datetime]:
        if v and info.data.get("start_date") and v < info.data["start_date"]:
            raise ValueError("End date must be after start date")
        return v


@router.get("/", response_model=List[ContractRead])
def list_contracts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(
        None, alias="status", pattern=r"^(pending|active|completed|cancelled|disputed)$"
    ),
    current_user: User = Depends(get_current_active_user),
) -> list[dict]:
    """List contracts for current user"""
    offset, limit = paginate_params(page, page_size)
    return contracts_service.query_user_contracts(
        current_user.id, status_filter, limit, offset
    )


@router.get("/{contract_id}", response_model=ContractRead)
def get_contract(
    contract_id: str, current_user: User = Depends(get_current_active_user)
) -> dict:
    """Get a specific contract"""
    raw_row = contracts_service.fetch_contract_with_joins(contract_id)

    if not raw_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found"
        )

    client_id, freelancer_id = contracts_service.get_contract_parties(raw_row)

    # Check authorization
    if client_id != current_user.id and freelancer_id != current_user.id:
        logger.warning(
            f"Unauthorized access attempt to contract {contract_id} by user {current_user.id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this contract",
        )

    return contracts_service.contract_from_row(raw_row)


@router.post(
    "/direct", response_model=ContractRead, status_code=status.HTTP_201_CREATED
)
def create_direct_contract(
    hire_data: DirectHireRequest, current_user: User = Depends(get_current_active_user)
) -> dict:
    """Create a direct hire contract (creates project -> proposal -> contract)"""
    user_type = contracts_service._safe_str(current_user.user_type)
    if not user_type or user_type.lower() != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can create contracts",
        )

    # Prevent self-hiring
    if hire_data.freelancer_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot hire yourself"
        )

    # Validate rate
    validate_rate(hire_data.rate, hire_data.rate_type)

    # Check if freelancer exists
    freelancer_data = contracts_service.fetch_user_for_contract(hire_data.freelancer_id)

    if not freelancer_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Freelancer not found"
        )

    if (
        not freelancer_data["user_type"]
        or freelancer_data["user_type"].lower() != "freelancer"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User is not a freelancer"
        )

    if not freelancer_data["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Freelancer account is not active",
        )

    # Sanitize inputs
    title = sanitize_text(hire_data.title, MAX_TITLE_LENGTH)
    description = sanitize_text(hire_data.description, MAX_DESCRIPTION_LENGTH)

    now = datetime.now(timezone.utc).isoformat()

    try:
        # 1. Create Project
        project_id = contracts_service.insert_project(
            title,
            description,
            current_user.id,
            hire_data.rate,
            hire_data.rate_type.lower(),
            now,
        )

        if not project_id:
            raise HTTPException(status_code=500, detail="Failed to create project")

        # 2. Create Proposal (Accepted)
        proposal_ok = contracts_service.insert_proposal(
            project_id,
            hire_data.freelancer_id,
            hire_data.rate,
            hire_data.rate_type.lower(),
            now,
        )

        if not proposal_ok:
            raise HTTPException(status_code=500, detail="Failed to create proposal")

        # 3. Create Contract

        # Determine contract type and fields
        contract_type = "fixed"
        hourly_rate = None
        retainer_amount = None
        retainer_frequency = None

        rt = hire_data.rate_type.lower()
        if rt == "hourly":
            contract_type = "hourly"
            hourly_rate = hire_data.rate
        elif rt in ["monthly", "weekly"]:
            contract_type = "retainer"
            retainer_amount = hire_data.rate
            retainer_frequency = rt

        # Calculate tiered platform fee based on lifetime billing
        turso = get_turso_http()
        lifetime_result = turso.fetch_one(
            """SELECT COALESCE(SUM(amount), 0) FROM payments
               WHERE from_user_id = ? AND to_user_id = ? AND status = 'completed'""",
            [current_user.id, hire_data.freelancer_id],
        )
        lifetime_billing = float(lifetime_result[0]) if lifetime_result else 0
        fee_info = calculate_tiered_fee(hire_data.rate, lifetime_billing)

        contract_id = contracts_service.insert_contract(
            [
                project_id,
                hire_data.freelancer_id,
                current_user.id,
                hire_data.rate,
                contract_type,
                "USD",
                hourly_rate,
                retainer_amount,
                retainer_frequency,
                hire_data.rate,  # contract_amount
                fee_info["platform_fee"],  # tiered platform_fee
                "active",
                hire_data.start_date.isoformat() if hire_data.start_date else now,
                hire_data.end_date.isoformat() if hire_data.end_date else None,
                description,
                now,
                now,
            ]
        )

        if not contract_id:
            raise HTTPException(status_code=500, detail="Failed to create contract")

        # Auto-create escrow record for this direct contract
        escrow_ok = turso.execute(
            """INSERT INTO escrow (contract_id, client_id, freelancer_id, amount, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, 'pending', ?, ?)""",
            [
                contract_id,
                current_user.id,
                hire_data.freelancer_id,
                hire_data.rate,
                now,
                now,
            ],
        )

        logger.info(
            f"Direct contract {contract_id} created by client {current_user.id} for freelancer {hire_data.freelancer_id}"
        )

        return {
            "id": contract_id,
            "project_id": project_id,
            "freelancer_id": hire_data.freelancer_id,
            "client_id": current_user.id,
            "amount": hire_data.rate,
            "contract_amount": hire_data.rate,
            "contract_type": contract_type,
            "currency": "USD",
            "hourly_rate": hourly_rate,
            "retainer_amount": retainer_amount,
            "retainer_frequency": retainer_frequency,
            "status": "active",
            "start_date": hire_data.start_date,
            "end_date": hire_data.end_date,
            "description": description,
            "created_at": now,
            "updated_at": now,
            "job_title": title,
            "client_name": getattr(current_user, "name", None),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create direct contract: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create contract",
        )


@router.post("/", response_model=ContractRead, status_code=status.HTTP_201_CREATED)
def create_contract(
    contract: ContractCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """Create a new contract"""
    try:
        user_type = contracts_service._safe_str(current_user.user_type)
        if not user_type or user_type.lower() != "client":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only clients can create contracts",
            )

        # Prevent self-contracting
        if contract.freelancer_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create contract with yourself",
            )

        # Validate amount
        if contract.amount < MIN_RATE or contract.amount > MAX_RATE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Amount must be between {MIN_RATE} and {MAX_RATE}",
            )

        # Check if project exists and belongs to client
        project_data = contracts_service.fetch_project_for_contract(contract.project_id)

        if not project_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
            )

        if project_data["client_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create contract for this project",
            )

        project_title = project_data["title"]

        # Check if freelancer exists and is active
        freelancer_data = contracts_service.fetch_user_for_contract(
            contract.freelancer_id
        )

        if not freelancer_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Freelancer not found"
            )

        if (
            not freelancer_data["user_type"]
            or freelancer_data["user_type"].lower() != "freelancer"
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a freelancer",
            )

        if not freelancer_data["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Freelancer account is not active",
            )

        # Check if proposal exists and is accepted
        proposal_status = contracts_service.fetch_proposal_status(
            contract.project_id, contract.freelancer_id
        )

        if proposal_status is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found"
            )

        if proposal_status != "accepted":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Proposal is not accepted",
            )

        # Check for existing active contract
        if contracts_service.has_active_contract(
            contract.project_id, contract.freelancer_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An active contract already exists for this project and freelancer",
            )

        # Sanitize text inputs
        description = (
            sanitize_text(contract.description, MAX_DESCRIPTION_LENGTH)
            if contract.description
            else ""
        )
        milestones = (
            sanitize_text(contract.milestones, MAX_MILESTONES_LENGTH)
            if contract.milestones
            else ""
        )
        terms = (
            sanitize_text(contract.terms, MAX_TERMS_LENGTH) if contract.terms else ""
        )

        # Generate contract ID
        contract_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        # Calculate tiered platform fee based on lifetime billing
        turso = get_turso_http()
        lifetime_result = turso.fetch_one(
            """SELECT COALESCE(SUM(amount), 0) FROM payments
               WHERE from_user_id = ? AND to_user_id = ? AND status = 'completed'""",
            [current_user.id, contract.freelancer_id],
        )
        lifetime_billing = float(lifetime_result[0]) if lifetime_result else 0
        fee_info = calculate_tiered_fee(contract.amount, lifetime_billing)

        new_contract_id = contracts_service.insert_contract_full(
            [
                contract.project_id,  # 1  project_id
                contract.freelancer_id,  # 2  freelancer_id
                current_user.id,  # 3  client_id
                contract.amount,  # 4  amount
                contract.contract_type.value,  # 5  contract_type
                contract.currency,  # 6  currency
                contract.hourly_rate,  # 7  hourly_rate
                contract.retainer_amount,  # 8  retainer_amount
                contract.retainer_frequency,  # 9  retainer_frequency
                contract.amount,  # 10 contract_amount
                fee_info["platform_fee"],  # 11 platform_fee (tiered, not hardcoded)
                "active",  # 12 status
                contract.start_date.isoformat()
                if contract.start_date
                else now,  # 13 start_date
                contract.end_date.isoformat()
                if contract.end_date
                else None,  # 14 end_date
                description,  # 15 description
                milestones,  # 16 milestones
                terms,  # 17 terms
                now,  # 18 created_at
                now,  # 19 updated_at
            ]
        )

        if not new_contract_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create contract",
            )

        # Auto-create escrow record for this contract
        escrow_ok = turso.execute(
            """INSERT INTO escrow (contract_id, client_id, freelancer_id, amount, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, 'pending', ?, ?)""",
            [
                new_contract_id,
                current_user.id,
                contract.freelancer_id,
                contract.amount,
                now,
                now,
            ],
        )

        logger.info(
            f"Contract {new_contract_id} created by client {current_user.id} for project {contract.project_id}"
        )

        # Notify freelancer about new contract
        background_tasks.add_task(
            notify_user,
            user_id=contract.freelancer_id,
            notification_type="contract_started",
            title="New Contract Created",
            content=f"A contract has been created for '{project_title}'.",
            data={"contract_id": new_contract_id, "project_id": contract.project_id},
        )

        # Send email to freelancer
        from app.db.turso_http import execute_query, parse_rows
        from app.services.email_service import email_service

        freelancer_result = execute_query(
            "SELECT email, name FROM users WHERE id = ?",
            [contract.freelancer_id]
        )
        if freelancer_result and freelancer_result.get("rows"):
            freelancer_rows = parse_rows(freelancer_result)
            if freelancer_rows:
                freelancer_email = freelancer_rows[0].get("email")
                freelancer_name = freelancer_rows[0].get("name") or "Freelancer"
                if freelancer_email:
                    background_tasks.add_task(
                        email_service.send_contract_created_notification,
                        to_email=freelancer_email,
                        user_name=freelancer_name,
                        project_title=project_title,
                        contract_id=int(new_contract_id) if new_contract_id.isdigit() else 0,
                    )

        # Return created contract
        return {
            "id": new_contract_id,
            "project_id": contract.project_id,
            "freelancer_id": contract.freelancer_id,
            "client_id": current_user.id,
            "amount": contract.amount,
            "contract_amount": contract.amount,
            "contract_type": contract.contract_type,
            "currency": contract.currency,
            "hourly_rate": contract.hourly_rate,
            "retainer_amount": contract.retainer_amount,
            "retainer_frequency": contract.retainer_frequency,
            "status": "active",
            "start_date": contract.start_date,
            "end_date": contract.end_date,
            "description": description,
            "milestones": milestones,
            "terms": terms,
            "created_at": now,
            "updated_at": now,
            "job_title": project_title,
            "client_name": getattr(current_user, "name", None),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create contract: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create contract",
        )


@router.put("/{contract_id}", response_model=ContractRead)
def update_contract(
    contract_id: str,
    contract: ContractUpdate,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """Update a contract"""
    # Get existing contract
    existing = contracts_service.fetch_contract_for_update(contract_id)

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found"
        )

    client_id = existing["client_id"]
    freelancer_id = existing["freelancer_id"]
    current_status = existing["status"]

    # Check authorization
    if client_id != current_user.id and freelancer_id != current_user.id:
        logger.warning(
            f"Unauthorized update attempt on contract {contract_id} by user {current_user.id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this contract",
        )

    # Check if contract can be updated (not completed or cancelled)
    if current_status in ("completed", "cancelled"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update a {current_status} contract",
        )

    update_data = contract.model_dump(exclude_unset=True, exclude_none=True)

    # Restrict freelancer to description-only updates
    if current_user.id == freelancer_id:
        update_data = {k: v for k, v in update_data.items() if k in ("description",)}

    if not update_data:
        # Just return existing with joins
        return get_contract(contract_id, current_user)

    # Validate status change if included
    if "status" in update_data:
        new_status = update_data["status"].lower()
        if new_status not in VALID_CONTRACT_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(VALID_CONTRACT_STATUSES)}",
            )
        update_data["status"] = new_status

    # Validate amount if included
    if "amount" in update_data:
        if update_data["amount"] < MIN_RATE or update_data["amount"] > MAX_RATE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Amount must be between {MIN_RATE} and {MAX_RATE}",
            )

    # Build update query
    set_parts = []
    values = []
    for key, value in update_data.items():
        # Sanitize text fields
        if key in ("description", "milestones", "terms") and value:
            max_len = (
                MAX_DESCRIPTION_LENGTH
                if key == "description"
                else (
                    MAX_MILESTONES_LENGTH if key == "milestones" else MAX_TERMS_LENGTH
                )
            )
            value = sanitize_text(value, max_len)
        set_parts.append(f"{key} = ?")
        if isinstance(value, datetime):
            values.append(value.isoformat())
        else:
            values.append(value)

    set_parts.append("updated_at = ?")
    values.append(datetime.now(timezone.utc).isoformat())
    values.append(contract_id)

    try:
        contracts_service.update_contract_fields(contract_id, set_parts, values)
        logger.info(f"Contract {contract_id} updated by user {current_user.id}")
    except Exception as e:
        logger.error(f"Failed to update contract {contract_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update contract",
        )

    # On contract completion: release escrow and credit freelancer wallet
    if update_data.get("status") == "completed":
        try:
            turso = get_turso_http()
            now_ts = datetime.now(timezone.utc).isoformat()

            # Release escrow funds
            turso.execute(
                "UPDATE escrow SET status = 'released', updated_at = ? WHERE contract_id = ?",
                [now_ts, contract_id],
            )

            # Credit freelancer wallet after 10% platform fee
            contract_amount = float(existing.get("amount") or 0)
            if contract_amount > 0:
                platform_fee_rate = 0.10
                freelancer_amount = contract_amount * (1 - platform_fee_rate)
                turso.execute(
                    "UPDATE wallet_balances SET available = available + ?, updated_at = ? WHERE user_id = ?",
                    [freelancer_amount, now_ts, existing["freelancer_id"]],
                )
                logger.info(
                    f"Contract {contract_id} completed: released "
                    f"${freelancer_amount:.2f} to freelancer {existing['freelancer_id']}"
                )

            # Notify both parties about contract completion
            from app.api.v1.core_domain.realtime_notifications import notify_user
            from app.db.turso_http import execute_query, parse_rows
            from app.services.email_service import email_service

            background_tasks.add_task(
                notify_user,
                user_id=existing["freelancer_id"],
                notification_type="contract_completed",
                title="Contract Completed",
                content=f"Contract has been completed. ${freelancer_amount:.2f} has been released to your wallet.",
                data={"contract_id": contract_id, "amount": freelancer_amount},
            )
            background_tasks.add_task(
                notify_user,
                user_id=existing["client_id"],
                notification_type="contract_completed",
                title="Contract Completed",
                content=f"Contract has been completed and payment released to freelancer.",
                data={"contract_id": contract_id},
            )

            # Email notifications for completion
            for user_id_col, role in [("freelancer_id", "freelancer"), ("client_id", "client")]:
                user_result = execute_query(
                    "SELECT email, name FROM users WHERE id = ?",
                    [existing[user_id_col]]
                )
                if user_result and user_result.get("rows"):
                    user_rows = parse_rows(user_result)
                    if user_rows:
                        user_email = user_rows[0].get("email")
                        user_name = user_rows[0].get("name") or role.title()
                        if user_email:
                            background_tasks.add_task(
                                email_service.send_email,
                                to_email=user_email,
                                subject=f"Contract Completed - MegiLance",
                                html_content=f"<html><body><h2>Contract Completed</h2><p>Your contract has been completed successfully.</p>{f'<p>${freelancer_amount:.2f} has been released to your wallet.</p>' if role == 'freelancer' else '<p>Payment has been released to the freelancer.</p>'}<p>Thank you for using MegiLance!</p></body></html>",
                                text_content=f"Your contract has been completed. {'Payment released to your wallet.' if role == 'freelancer' else 'Payment released to freelancer.'}",
                            )
        except Exception as e:
            logger.error(
                f"Failed to process completion side-effects for contract {contract_id}: {e}"
            )

    # Fetch updated contract with joins
    return get_contract(contract_id, current_user)


@router.delete("/{contract_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contract(
    contract_id: str, current_user: User = Depends(get_current_active_user)
) -> None:
    """Delete a contract (soft delete by setting status to cancelled)"""
    # Get contract
    contract_data = contracts_service.fetch_contract_status(contract_id)

    if not contract_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found"
        )

    client_id = contract_data["client_id"]
    current_status = contract_data["status"]

    # Only client can delete
    if client_id != current_user.id:
        logger.warning(
            f"Unauthorized delete attempt on contract {contract_id} by user {current_user.id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this contract",
        )

    # Check if already completed/cancelled
    if current_status in ("completed", "cancelled"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete a {current_status} contract",
        )

    # Soft delete - set status to cancelled
    try:
        contracts_service.cancel_contract(
            contract_id, datetime.now(timezone.utc).isoformat()
        )
        logger.info(f"Contract {contract_id} cancelled by client {current_user.id}")
    except Exception as e:
        logger.error(f"Failed to cancel contract {contract_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel contract",
        )

    return


@router.get("/{contract_id}/performance")
def get_contract_performance(
    contract_id: str, current_user: User = Depends(get_current_active_user)
) -> dict:
    """
    Get performance metrics for a specific contract.
    Shows milestone progress, payment summary, timeline adherence, and review status.
    """
    try:
        turso = get_turso_http()

        # Get contract details
        contract = turso.fetch_one(
            "SELECT id, project_id, freelancer_id, client_id, status, contract_amount, platform_fee, start_date, end_date FROM contracts WHERE id = ?",
            [contract_id],
        )
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found"
            )

        c_freelancer = contract[2]
        c_client = contract[3]

        if current_user.id not in (c_freelancer, c_client):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
            )

        # Milestone progress
        ms_stats = turso.fetch_one(
            """SELECT COUNT(*) as total,
                      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as completed,
                      SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending_review,
                      COALESCE(SUM(amount), 0) as total_amount,
                      COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as paid_amount
               FROM milestones WHERE contract_id = ?""",
            [contract_id],
        )

        total_ms = int(ms_stats[0]) if ms_stats else 0
        completed_ms = int(ms_stats[1]) if ms_stats else 0
        pending_ms = int(ms_stats[2]) if ms_stats else 0
        total_ms_amount = round(float(ms_stats[3]), 2) if ms_stats else 0
        paid_ms_amount = round(float(ms_stats[4]), 2) if ms_stats else 0

        # Payment summary
        pay_stats = turso.fetch_one(
            """SELECT COALESCE(SUM(amount), 0), COUNT(*),
                      COALESCE(SUM(platform_fee), 0)
               FROM payments WHERE contract_id = ? AND status = 'completed'""",
            [contract_id],
        )

        # Review status
        reviews = turso.execute(
            "SELECT reviewer_id, rating FROM reviews WHERE contract_id = ?",
            [contract_id],
        )
        review_data = {}
        for row in reviews.get("rows", []):
            r_by = "client" if int(row[0]) == c_client else "freelancer"
            review_data[f"{r_by}_rating"] = float(row[1]) if row[1] else None
        review_data["both_reviewed"] = len(reviews.get("rows", [])) >= 2

        contract_amount = float(contract[5]) if contract[5] else 0
        milestone_progress = (
            round((completed_ms / total_ms) * 100, 1) if total_ms > 0 else 0
        )

        return {
            "contract_id": contract_id,
            "status": contract[4],
            "contract_amount": contract_amount,
            "platform_fee": round(float(contract[6]), 2) if contract[6] else 0,
            "milestones": {
                "total": total_ms,
                "completed": completed_ms,
                "pending_review": pending_ms,
                "remaining": total_ms - completed_ms - pending_ms,
                "progress_percent": milestone_progress,
                "total_amount": total_ms_amount,
                "paid_amount": paid_ms_amount,
            },
            "payments": {
                "total_paid": round(float(pay_stats[0]), 2) if pay_stats else 0,
                "transaction_count": int(pay_stats[1]) if pay_stats else 0,
                "total_fees": round(float(pay_stats[2]), 2) if pay_stats else 0,
            },
            "reviews": review_data,
            "timeline": {
                "start_date": contract[7],
                "end_date": contract[8],
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"get_contract_performance failed: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")


@router.post("/{contract_id}/acknowledge")
def acknowledge_contract(
    contract_id: str, current_user: User = Depends(get_current_active_user)
) -> dict:
    """
    Freelancer acknowledges/accepts contract terms before work begins.

    Adds ``freelancer_acknowledged`` and ``freelancer_acknowledged_at`` columns
    on first use via graceful ALTER TABLE statements.
    """
    turso = get_turso_http()

    contract = turso.fetch_one(
        "SELECT id, freelancer_id, status FROM contracts WHERE id = ?",
        [contract_id],
    )
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found"
        )

    if str(contract[1]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the assigned freelancer can acknowledge this contract",
        )

    if contract[2] not in ("active", "pending"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Contract cannot be acknowledged in '{contract[2]}' status",
        )

    now = datetime.now(timezone.utc).isoformat()

    # NOTE: freelancer_acknowledged / freelancer_acknowledged_at columns are created
    # at app startup in main.py lifespan — no per-request DDL needed here (P0-4).
    try:
        turso.execute(
            """UPDATE contracts
               SET freelancer_acknowledged = 1,
                   freelancer_acknowledged_at = ?,
                   updated_at = ?
               WHERE id = ?""",
            [now, now, contract_id],
        )
    except Exception as e:
        logger.error(f"acknowledge_contract update failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database temporarily unavailable",
        )

    return {
        "message": "Contract acknowledged",
        "contract_id": contract_id,
        "acknowledged_at": now,
    }
