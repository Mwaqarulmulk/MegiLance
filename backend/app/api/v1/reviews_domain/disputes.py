# @AI-HINT: Disputes router — file, list, resolve disputes. Delegates to disputes_service for data access.
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.schemas.dispute import DisputeCreate, DisputeUpdate, Dispute, DisputeList
from app.services import disputes_service

router = APIRouter()


@router.get("", response_model=DisputeList)
async def list_disputes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    dispute_type: Optional[str] = None,
    contract_id: Optional[int] = None,
    raised_by_me: bool = False,
    current_user=Depends(get_current_user),
):
    user_role = getattr(current_user, "role", None) or getattr(current_user, "user_type", None)
    user_type = "admin" if user_role == "admin" else "user"
    skip = (page - 1) * page_size

    result = disputes_service.list_disputes(
        user_type=user_type,
        user_id=current_user.id,
        contract_id=contract_id,
        status_filter=status_filter,
        dispute_type=dispute_type,
        raised_by_me=raised_by_me,
        skip=skip,
        limit=page_size,
    )
    return DisputeList(total=result["total"], disputes=result["disputes"])


@router.get("/{dispute_id}", response_model=Dispute)
async def get_dispute(dispute_id: int, current_user=Depends(get_current_user)):
    dispute = disputes_service.get_dispute_by_id(dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")

    user_role = getattr(current_user, "role", None) or getattr(current_user, "user_type", None)
    is_admin = user_role == "admin"
    is_party = dispute["raised_by"] == current_user.id

    if not is_admin and not is_party:
        parties = disputes_service.get_contract_client_freelancer(dispute["contract_id"])
        if parties and current_user.id not in (parties["client_id"], parties["freelancer_id"]):
            raise HTTPException(status_code=403, detail="Not authorized to view this dispute")

    return dispute


@router.post("", response_model=Dispute, status_code=status.HTTP_201_CREATED)
async def create_dispute(request: DisputeCreate, current_user=Depends(get_current_user)):
    parties = disputes_service.get_contract_client_freelancer(request.contract_id)
    if not parties:
        raise HTTPException(status_code=404, detail="Contract not found")

    if current_user.id != parties["client_id"] and current_user.id != parties["freelancer_id"]:
        raise HTTPException(status_code=403, detail="Only contract parties can file disputes")

    dispute = disputes_service.create_dispute(
        contract_id=request.contract_id,
        raised_by=current_user.id,
        dispute_type=request.dispute_type,
        description=request.description,
    )
    if not dispute:
        raise HTTPException(status_code=500, detail="Failed to create dispute")
    return dispute


@router.put("/{dispute_id}", response_model=Dispute)
async def update_dispute(dispute_id: int, request: DisputeUpdate, current_user=Depends(get_current_user)):
    dispute = disputes_service.get_dispute_by_id(dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")

    user_role = getattr(current_user, "role", None) or getattr(current_user, "user_type", None)
    is_admin = user_role == "admin"
    is_party = dispute["raised_by"] == current_user.id

    if not is_admin and not is_party:
        parties = disputes_service.get_contract_client_freelancer(dispute["contract_id"])
        if parties and current_user.id not in (parties["client_id"], parties["freelancer_id"]):
            raise HTTPException(status_code=403, detail="Not authorized to update this dispute")

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    disputes_service.update_dispute(dispute_id, updates)
    return disputes_service.get_dispute_by_id(dispute_id)


@router.post("/{dispute_id}/assign")
async def assign_dispute(dispute_id: int, data: dict, current_user=Depends(get_current_user)):
    user_role = getattr(current_user, "role", None) or getattr(current_user, "user_type", None)
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can assign disputes")

    if not disputes_service.dispute_exists(dispute_id):
        raise HTTPException(status_code=404, detail="Dispute not found")

    admin_id = data.get("admin_id")
    if not admin_id:
        raise HTTPException(status_code=400, detail="admin_id is required")

    disputes_service.assign_dispute(dispute_id, admin_id)
    return {"message": "Dispute assigned to admin"}


@router.post("/{dispute_id}/resolve")
async def resolve_dispute(dispute_id: int, data: dict, current_user=Depends(get_current_user)):
    user_role = getattr(current_user, "role", None) or getattr(current_user, "user_type", None)
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can resolve disputes")

    dispute = disputes_service.get_dispute_by_id(dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")

    resolution = data.get("resolution", "")
    contract_status = data.get("contract_status")

    disputes_service.resolve_dispute(dispute_id, resolution)

    if contract_status:
        disputes_service.update_contract_status(dispute["contract_id"], contract_status)

    # Notify the dispute filer
    try:
        disputes_service.send_notification(
            dispute["raised_by"],
            "DISPUTE_RESOLVED",
            "Dispute Resolved",
            f"Your dispute #{dispute_id} has been resolved.",
            {"dispute_id": dispute_id, "resolution": resolution},
            "medium",
            f"/disputes/{dispute_id}",
        )
    except Exception as e:
        logger.warning(f"Failed to notify dispute filer: {e}")

    return {"message": "Dispute resolved"}


@router.post("/{dispute_id}/evidence")
async def upload_evidence(dispute_id: int, file: UploadFile = File(...), current_user=Depends(get_current_user)):
    dispute = disputes_service.get_dispute_by_id(dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")

    user_role = getattr(current_user, "role", None) or getattr(current_user, "user_type", None)
    is_admin = user_role == "admin"
    is_party = dispute["raised_by"] == current_user.id

    if not is_admin and not is_party:
        parties = disputes_service.get_contract_client_freelancer(dispute["contract_id"])
        if parties and current_user.id not in (parties["client_id"], parties["freelancer_id"]):
            raise HTTPException(status_code=403, detail="Only dispute parties can upload evidence")

    file_content = await file.read()
    file_url = f"evidence/{dispute_id}/{file.filename}"

    evidence_data = {
        "filename": file.filename,
        "url": file_url,
        "uploaded_by": current_user.id,
        "uploaded_at": str(dispute["created_at"]),
        "size": len(file_content),
    }

    existing_evidence = dispute.get("evidence") or "[]"
    try:
        evidence_list = __import__("json").loads(existing_evidence)
        if not isinstance(evidence_list, list):
            evidence_list = []
    except (ValueError, TypeError):
        evidence_list = []

    evidence_list.append(evidence_data)
    disputes_service.update_dispute_evidence(dispute_id, __import__("json").dumps(evidence_list))

    return {"message": "Evidence uploaded successfully", "evidence": evidence_data}
