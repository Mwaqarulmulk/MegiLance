"""PDF generation API endpoints."""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import io

from app.services.pdf_generator import (
    generate_invoice_pdf,
    generate_contract_pdf,
    generate_proposal_pdf,
    generate_receipt_pdf,
)

router = APIRouter(tags=["PDF Generation"])


class InvoicePDFRequest(BaseModel):
    invoice_id: str
    invoice_number: str
    client_name: str
    client_email: str
    freelancer_name: str
    freelancer_email: str
    items: list[dict]
    subtotal: float
    tax_rate: float = 0
    tax_amount: float = 0
    total: float = 0
    currency: str = "USD"
    due_date: Optional[str] = None
    status: str = "pending"
    notes: str = ""
    payment_terms: str = "Net 30"


class ContractPDFRequest(BaseModel):
    contract_id: str
    title: str
    client_name: str
    client_email: str
    freelancer_name: str
    freelancer_email: str
    scope: str
    terms: list[str] = []
    total_amount: float
    currency: str = "USD"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    payment_type: str = "fixed"
    milestones: Optional[list[dict]] = None


class ProposalPDFRequest(BaseModel):
    proposal_id: str
    project_title: str
    freelancer_name: str
    freelancer_title: str
    cover_letter: str
    bid_amount: float
    currency: str = "USD"
    estimated_hours: Optional[int] = None
    hourly_rate: Optional[float] = None
    timeline: str = ""
    skills: Optional[list[str]] = None


class ReceiptPDFRequest(BaseModel):
    receipt_number: str
    payer_name: str
    payee_name: str
    amount: float
    currency: str = "USD"
    payment_method: str = "Stripe"
    project_title: str = ""
    payment_date: Optional[str] = None
    transaction_id: str = ""


@router.post("/invoice")
def create_invoice_pdf(req: InvoicePDFRequest):
    """Generate and download invoice PDF."""
    try:
        pdf_bytes = generate_invoice_pdf(
            invoice_id=req.invoice_id,
            invoice_number=req.invoice_number,
            client_name=req.client_name,
            client_email=req.client_email,
            freelancer_name=req.freelancer_name,
            freelancer_email=req.freelancer_email,
            items=req.items,
            subtotal=req.subtotal,
            tax_rate=req.tax_rate,
            tax_amount=req.tax_amount,
            total=req.total,
            currency=req.currency,
            due_date=req.due_date,
            status=req.status,
            notes=req.notes,
            payment_terms=req.payment_terms,
        )
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=invoice-{req.invoice_number}.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.post("/contract")
def create_contract_pdf(req: ContractPDFRequest):
    """Generate and download contract PDF."""
    try:
        pdf_bytes = generate_contract_pdf(
            contract_id=req.contract_id,
            title=req.title,
            client_name=req.client_name,
            client_email=req.client_email,
            freelancer_name=req.freelancer_name,
            freelancer_email=req.freelancer_email,
            scope=req.scope,
            terms=req.terms,
            total_amount=req.total_amount,
            currency=req.currency,
            start_date=req.start_date,
            end_date=req.end_date,
            payment_type=req.payment_type,
            milestones=req.milestones,
        )
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=contract-{req.contract_id[:8]}.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.post("/proposal")
def create_proposal_pdf(req: ProposalPDFRequest):
    """Generate and download proposal PDF."""
    try:
        pdf_bytes = generate_proposal_pdf(
            proposal_id=req.proposal_id,
            project_title=req.project_title,
            freelancer_name=req.freelancer_name,
            freelancer_title=req.freelancer_title,
            cover_letter=req.cover_letter,
            bid_amount=req.bid_amount,
            currency=req.currency,
            estimated_hours=req.estimated_hours,
            hourly_rate=req.hourly_rate,
            timeline=req.timeline,
            skills=req.skills,
        )
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=proposal-{req.proposal_id[:8]}.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.post("/receipt")
def create_receipt_pdf(req: ReceiptPDFRequest):
    """Generate and download payment receipt PDF."""
    try:
        pdf_bytes = generate_receipt_pdf(
            receipt_number=req.receipt_number,
            payer_name=req.payer_name,
            payee_name=req.payee_name,
            amount=req.amount,
            currency=req.currency,
            payment_method=req.payment_method,
            project_title=req.project_title,
            payment_date=req.payment_date,
            transaction_id=req.transaction_id,
        )
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=receipt-{req.receipt_number}.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
