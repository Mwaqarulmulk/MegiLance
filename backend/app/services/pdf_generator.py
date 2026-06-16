"""Production PDF generation service for invoices, contracts, and proposals."""

from io import BytesIO
from datetime import datetime
from decimal import Decimal
from typing import Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Image as RLImage, PageBreak
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


# Brand colors
PRIMARY = colors.HexColor('#2563EB')    # Blue-600
SECONDARY = colors.HexColor('#1E40AF')  # Blue-800
ACCENT = colors.HexColor('#3B82F6')     # Blue-500
SUCCESS = colors.HexColor('#059669')     # Emerald-600
WARNING = colors.HexColor('#D97706')     # Amber-600
DANGER = colors.HexColor('#DC2626')      # Red-600
GRAY_50 = colors.HexColor('#F9FAFB')
GRAY_100 = colors.HexColor('#F3F4F6')
GRAY_200 = colors.HexColor('#E5E7EB')
GRAY_300 = colors.HexColor('#D1D5DB')
GRAY_600 = colors.HexColor('#4B5563')
GRAY_800 = colors.HexColor('#1F2937')
GRAY_900 = colors.HexColor('#111827')
WHITE = colors.white
BLACK = colors.black


def get_styles():
    """Create custom paragraph styles."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=PRIMARY,
        spaceAfter=6,
        alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=GRAY_600,
        spaceAfter=20,
    ))
    styles.add(ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=SECONDARY,
        spaceBefore=16,
        spaceAfter=8,
        borderWidth=0,
        borderPadding=0,
    ))
    styles.add(ParagraphStyle(
        'FieldLabel',
        parent=styles['Normal'],
        fontSize=9,
        textColor=GRAY_600,
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        'FieldValue',
        parent=styles['Normal'],
        fontSize=11,
        textColor=GRAY_900,
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=10,
        textColor=WHITE,
        alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        'TableHeaderRight',
        parent=styles['Normal'],
        fontSize=10,
        textColor=WHITE,
        alignment=TA_RIGHT,
    ))
    styles.add(ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontSize=10,
        textColor=GRAY_800,
    ))
    styles.add(ParagraphStyle(
        'TableCellRight',
        parent=styles['Normal'],
        fontSize=10,
        textColor=GRAY_800,
        alignment=TA_RIGHT,
    ))
    styles.add(ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=GRAY_600,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontSize=10,
        textColor=GRAY_800,
        leading=14,
        alignment=TA_JUSTIFY,
    ))
    styles.add(ParagraphStyle(
        'SmallText',
        parent=styles['Normal'],
        fontSize=8,
        textColor=GRAY_600,
    ))
    styles.add(ParagraphStyle(
        'TotalLabel',
        parent=styles['Normal'],
        fontSize=12,
        textColor=GRAY_900,
        alignment=TA_RIGHT,
    ))
    styles.add(ParagraphStyle(
        'TotalValue',
        parent=styles['Normal'],
        fontSize=16,
        textColor=PRIMARY,
        alignment=TA_RIGHT,
    ))
    return styles


def _add_page_footer(canvas, doc, company_name="MegiLance"):
    """Add page footer with branding."""
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GRAY_600)
    canvas.drawString(40, 30, f"{company_name} | Professional Freelancing Platform")
    canvas.drawRightString(A4[0] - 40, 30, f"Page {doc.page}")
    canvas.setStrokeColor(GRAY_200)
    canvas.line(40, 45, A4[0] - 40, 45)
    canvas.restoreState()


def _format_currency(amount, currency="USD"):
    """Format amount as currency."""
    symbols = {"USD": "$", "EUR": "€", "GBP": "£", "PKR": "Rs"}
    symbol = symbols.get(currency, "$")
    return f"{symbol}{Decimal(str(amount)):,.2f}"


def _format_date(dt):
    """Format datetime to readable string."""
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
        except (ValueError, TypeError):
            return dt
    if isinstance(dt, datetime):
        return dt.strftime("%B %d, %Y")
    return str(dt)


# ============================================================================
# INVOICE PDF
# ============================================================================

def generate_invoice_pdf(
    invoice_id: str,
    invoice_number: str,
    client_name: str,
    client_email: str,
    freelancer_name: str,
    freelancer_email: str,
    items: list[dict],
    subtotal: float,
    tax_rate: float = 0,
    tax_amount: float = 0,
    total: float = 0,
    currency: str = "USD",
    due_date: Optional[str] = None,
    status: str = "pending",
    notes: str = "",
    payment_terms: str = "Net 30",
    company_name: str = "MegiLance",
) -> bytes:
    """Generate a professional invoice PDF."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=60,
    )
    styles = get_styles()
    elements = []

    # Header
    elements.append(Paragraph("INVOICE", styles['DocTitle']))
    elements.append(Paragraph(f"Invoice #{invoice_number}", styles['DocSubtitle']))

    # Status badge text
    status_colors = {
        "pending": WARNING,
        "paid": SUCCESS,
        "overdue": DANGER,
        "cancelled": GRAY_300,
    }
    status_color = status_colors.get(status, GRAY_600)
    elements.append(Paragraph(
        f'<font color="{status_color.hexval()}">Status: {status.upper()}</font>',
        styles['FieldValue']
    ))
    elements.append(Spacer(1, 12))

    # Bill To / From columns
    addr_data = [
        [
            Paragraph("BILL TO", styles['FieldLabel']),
            Paragraph("FROM", styles['FieldLabel']),
        ],
        [
            Paragraph(f"<b>{client_name}</b><br/>{client_email}", styles['FieldValue']),
            Paragraph(f"<b>{freelancer_name}</b><br/>{freelancer_email}", styles['FieldValue']),
        ],
    ]
    addr_table = Table(addr_data, colWidths=[doc.width / 2, doc.width / 2])
    addr_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(addr_table)
    elements.append(Spacer(1, 12))

    # Invoice details
    detail_data = [
        [
            Paragraph("Invoice Date:", styles['FieldLabel']),
            Paragraph("Due Date:", styles['FieldLabel']),
            Paragraph("Payment Terms:", styles['FieldLabel']),
        ],
        [
            Paragraph(datetime.now().strftime("%B %d, %Y"), styles['FieldValue']),
            Paragraph(_format_date(due_date) if due_date else "Upon Receipt", styles['FieldValue']),
            Paragraph(payment_terms, styles['FieldValue']),
        ],
    ]
    detail_table = Table(detail_data, colWidths=[doc.width / 3] * 3)
    detail_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(detail_table)
    elements.append(Spacer(1, 20))

    # Line items table
    elements.append(Paragraph("LINE ITEMS", styles['SectionHeader']))
    elements.append(HRFlowable(width="100%", color=GRAY_200))
    elements.append(Spacer(1, 8))

    table_data = [
        [
            Paragraph("Description", styles['TableHeader']),
            Paragraph("Qty", styles['TableHeaderRight']),
            Paragraph("Rate", styles['TableHeaderRight']),
            Paragraph("Amount", styles['TableHeaderRight']),
        ]
    ]

    for item in items:
        desc = item.get("description", "")
        qty = item.get("quantity", 1)
        rate = item.get("rate", 0)
        amount = float(qty) * float(rate)
        table_data.append([
            Paragraph(desc, styles['TableCell']),
            Paragraph(str(qty), styles['TableCellRight']),
            Paragraph(_format_currency(rate, currency), styles['TableCellRight']),
            Paragraph(_format_currency(amount, currency), styles['TableCellRight']),
        ])

    col_widths = [doc.width * 0.45, doc.width * 0.15, doc.width * 0.2, doc.width * 0.2]
    items_table = Table(table_data, colWidths=col_widths)
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, GRAY_50]),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('LINEABOVE', (0, 0), (-1, 0), 1, PRIMARY),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 16))

    # Totals
    totals_data = [
        [
            Paragraph("Subtotal:", styles['FieldValue']),
            Paragraph(_format_currency(subtotal, currency), styles['TableCellRight']),
        ],
    ]
    if tax_rate > 0:
        totals_data.append([
            Paragraph(f"Tax ({tax_rate}%):", styles['FieldValue']),
            Paragraph(_format_currency(tax_amount, currency), styles['TableCellRight']),
        ])
    totals_data.append([
        Paragraph("<b>TOTAL:</b>", styles['TotalLabel']),
        Paragraph(f"<b>{_format_currency(total if total else subtotal + tax_amount, currency)}</b>", styles['TotalValue']),
    ])

    totals_table = Table(totals_data, colWidths=[doc.width * 0.7, doc.width * 0.3])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEABOVE', (0, -1), (-1, -1), 1.5, PRIMARY),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 24))

    # Notes
    if notes:
        elements.append(Paragraph("NOTES", styles['SectionHeader']))
        elements.append(HRFlowable(width="100%", color=GRAY_200))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(notes, styles['BodyText']))
        elements.append(Spacer(1, 16))

    # Payment instructions
    elements.append(Paragraph("PAYMENT INSTRUCTIONS", styles['SectionHeader']))
    elements.append(HRFlowable(width="100%", color=GRAY_200))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(
        f"Please make payment within {payment_terms}. "
        f"Payments can be made via Stripe, bank transfer, or cryptocurrency. "
        f"For questions about this invoice, contact {freelancer_email}.",
        styles['BodyText']
    ))

    doc.build(elements, onFirstPage=lambda c, d: _add_page_footer(c, d, company_name))
    return buffer.getvalue()


# ============================================================================
# CONTRACT PDF
# ============================================================================

def generate_contract_pdf(
    contract_id: str,
    title: str,
    client_name: str,
    client_email: str,
    freelancer_name: str,
    freelancer_email: str,
    scope: str,
    terms: list[str],
    total_amount: float,
    currency: str = "USD",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    payment_type: str = "fixed",
    milestones: Optional[list[dict]] = None,
    signature_data_client: Optional[str] = None,
    signature_data_freelancer: Optional[str] = None,
    company_name: str = "MegiLance",
) -> bytes:
    """Generate a professional contract PDF."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=60,
    )
    styles = get_styles()
    elements = []

    # Title
    elements.append(Paragraph("SERVICE AGREEMENT", styles['DocTitle']))
    elements.append(Paragraph(title, styles['DocSubtitle']))
    elements.append(HRFlowable(width="100%", color=PRIMARY, thickness=2))
    elements.append(Spacer(1, 20))

    # Parties
    elements.append(Paragraph("1. PARTIES", styles['SectionHeader']))
    elements.append(Paragraph(
        f"This Service Agreement ('Agreement') is entered into between:<br/><br/>"
        f"<b>Client:</b> {client_name} ({client_email})<br/>"
        f"<b>Freelancer:</b> {freelancer_name} ({freelancer_email})<br/><br/>"
        f"Effective Date: {_format_date(start_date) if start_date else datetime.now().strftime('%B %d, %Y')}",
        styles['BodyText']
    ))
    elements.append(Spacer(1, 12))

    # Scope of Work
    elements.append(Paragraph("2. SCOPE OF WORK", styles['SectionHeader']))
    elements.append(Paragraph(scope, styles['BodyText']))
    elements.append(Spacer(1, 12))

    # Payment Terms
    elements.append(Paragraph("3. COMPENSATION", styles['SectionHeader']))
    elements.append(Paragraph(
        f"Total Contract Value: <b>{_format_currency(total_amount, currency)}</b><br/>"
        f"Payment Type: {payment_type.title()}<br/>"
        f"Currency: {currency}",
        styles['BodyText']
    ))
    elements.append(Spacer(1, 8))

    # Milestones
    if milestones:
        elements.append(Paragraph("3.1 Milestones", styles['FieldLabel']))
        ms_data = [
            [
                Paragraph("Milestone", styles['TableHeader']),
                Paragraph("Description", styles['TableHeader']),
                Paragraph("Amount", styles['TableHeaderRight']),
                Paragraph("Due Date", styles['TableHeader']),
            ]
        ]
        for ms in milestones:
            ms_data.append([
                Paragraph(ms.get("title", ""), styles['TableCell']),
                Paragraph(ms.get("description", ""), styles['TableCell']),
                Paragraph(_format_currency(ms.get("amount", 0), currency), styles['TableCellRight']),
                Paragraph(_format_date(ms.get("due_date", "")), styles['TableCell']),
            ])
        ms_table = Table(ms_data, colWidths=[doc.width * 0.2, doc.width * 0.4, doc.width * 0.2, doc.width * 0.2])
        ms_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
            ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, GRAY_50]),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, GRAY_200),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(ms_table)
        elements.append(Spacer(1, 12))

    # Terms and Conditions
    elements.append(Paragraph("4. TERMS AND CONDITIONS", styles['SectionHeader']))
    default_terms = [
        "The Freelancer agrees to perform the services described above in a professional and timely manner.",
        "The Client agrees to provide necessary access, information, and feedback to enable the Freelancer to complete the work.",
        "All work product created under this Agreement shall be owned by the Client upon full payment.",
        "Either party may terminate this Agreement with 14 days written notice.",
        "Confidential information shared during this engagement shall remain confidential.",
        "Disputes shall be resolved through the MegiLance dispute resolution process.",
        "This Agreement is governed by the terms of service of MegiLance.",
    ]
    all_terms = terms if terms else default_terms
    for i, term in enumerate(all_terms, 1):
        elements.append(Paragraph(f"{i}. {term}", styles['BodyText']))
        elements.append(Spacer(1, 4))
    elements.append(Spacer(1, 20))

    # End Date
    if end_date:
        elements.append(Paragraph("5. TERM", styles['SectionHeader']))
        elements.append(Paragraph(
            f"This Agreement shall commence on {_format_date(start_date)} and continue until "
            f"{_format_date(end_date)}, unless terminated earlier in accordance with this Agreement.",
            styles['BodyText']
        ))
        elements.append(Spacer(1, 20))

    # Signatures
    sig_section = len(all_terms) + (2 if end_date else 1)
    elements.append(Paragraph(f"{sig_section}. SIGNATURES", styles['SectionHeader']))
    elements.append(Paragraph(
        "By signing below, the parties agree to all terms and conditions of this Agreement.",
        styles['BodyText']
    ))
    elements.append(Spacer(1, 20))

    sig_data = [
        [
            Paragraph("<b>Client</b>", styles['FieldValue']),
            Paragraph("<b>Freelancer</b>", styles['FieldValue']),
        ],
        [
            Paragraph(f"Name: {client_name}", styles['SmallText']),
            Paragraph(f"Name: {freelancer_name}", styles['SmallText']),
        ],
        [
            Paragraph("Signature: ________________________", styles['SmallText']),
            Paragraph("Signature: ________________________", styles['SmallText']),
        ],
        [
            Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles['SmallText']),
            Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles['SmallText']),
        ],
    ]
    sig_table = Table(sig_data, colWidths=[doc.width / 2, doc.width / 2])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(sig_table)

    doc.build(elements, onFirstPage=lambda c, d: _add_page_footer(c, d, company_name))
    return buffer.getvalue()


# ============================================================================
# PROPOSAL PDF
# ============================================================================

def generate_proposal_pdf(
    proposal_id: str,
    project_title: str,
    freelancer_name: str,
    freelancer_title: str,
    cover_letter: str,
    bid_amount: float,
    currency: str = "USD",
    estimated_hours: Optional[int] = None,
    hourly_rate: Optional[float] = None,
    timeline: str = "",
    skills: Optional[list[str]] = None,
    portfolio_samples: Optional[list[dict]] = None,
    company_name: str = "MegiLance",
) -> bytes:
    """Generate a professional proposal PDF."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=60,
    )
    styles = get_styles()
    elements = []

    # Title
    elements.append(Paragraph("PROPOSAL", styles['DocTitle']))
    elements.append(Paragraph(f"For: {project_title}", styles['DocSubtitle']))
    elements.append(HRFlowable(width="100%", color=PRIMARY, thickness=2))
    elements.append(Spacer(1, 20))

    # Freelancer Info
    elements.append(Paragraph("SUBMITTED BY", styles['SectionHeader']))
    elements.append(Paragraph(
        f"<b>{freelancer_name}</b><br/>"
        f"{freelancer_title}",
        styles['BodyText']
    ))
    elements.append(Spacer(1, 12))

    # Pricing
    elements.append(Paragraph("PRICING", styles['SectionHeader']))
    price_data = [
        [
            Paragraph("Total Bid:", styles['FieldValue']),
            Paragraph(f"<b>{_format_currency(bid_amount, currency)}</b>", styles['TotalValue']),
        ],
    ]
    if hourly_rate and estimated_hours:
        price_data.insert(0, [
            Paragraph(f"Hourly Rate: {_format_currency(hourly_rate, currency)}/hr × {estimated_hours} hours", styles['FieldValue']),
            Paragraph("", styles['FieldValue']),
        ])
    if timeline:
        price_data.append([
            Paragraph("Estimated Timeline:", styles['FieldValue']),
            Paragraph(timeline, styles['FieldValue']),
        ])

    price_table = Table(price_data, colWidths=[doc.width * 0.6, doc.width * 0.4])
    price_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(price_table)
    elements.append(Spacer(1, 16))

    # Cover Letter
    elements.append(Paragraph("COVER LETTER", styles['SectionHeader']))
    elements.append(HRFlowable(width="100%", color=GRAY_200))
    elements.append(Spacer(1, 8))
    # Split cover letter into paragraphs
    for para in cover_letter.split('\n\n'):
        if para.strip():
            elements.append(Paragraph(para.strip(), styles['BodyText']))
            elements.append(Spacer(1, 8))
    elements.append(Spacer(1, 12))

    # Skills
    if skills:
        elements.append(Paragraph("RELEVANT SKILLS", styles['SectionHeader']))
        elements.append(Paragraph(", ".join(skills), styles['BodyText']))
        elements.append(Spacer(1, 12))

    # Portfolio
    if portfolio_samples:
        elements.append(Paragraph("PORTFOLIO SAMPLES", styles['SectionHeader']))
        for sample in portfolio_samples:
            elements.append(Paragraph(
                f"• <b>{sample.get('title', '')}</b> - {sample.get('description', '')}",
                styles['BodyText']
            ))
        elements.append(Spacer(1, 12))

    # Footer note
    elements.append(Spacer(1, 24))
    elements.append(HRFlowable(width="100%", color=GRAY_200))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        f"This proposal was submitted through {company_name} on {_format_date(datetime.now())}.",
        styles['SmallText']
    ))

    doc.build(elements, onFirstPage=lambda c, d: _add_page_footer(c, d, company_name))
    return buffer.getvalue()


# ============================================================================
# PAYMENT RECEIPT PDF
# ============================================================================

def generate_receipt_pdf(
    receipt_number: str,
    payer_name: str,
    payee_name: str,
    amount: float,
    currency: str = "USD",
    payment_method: str = "Stripe",
    project_title: str = "",
    payment_date: Optional[str] = None,
    transaction_id: str = "",
    company_name: str = "MegiLance",
) -> bytes:
    """Generate a payment receipt PDF."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=60,
    )
    styles = get_styles()
    elements = []

    # Header
    elements.append(Paragraph("PAYMENT RECEIPT", styles['DocTitle']))
    elements.append(Paragraph(f"Receipt #{receipt_number}", styles['DocSubtitle']))
    elements.append(Spacer(1, 12))

    # Amount highlight
    amount_data = [[
        Paragraph(
            f'<font size="28" color="{PRIMARY.hexval()}">{_format_currency(amount, currency)}</font>',
            styles['FieldValue']
        ),
    ]]
    amount_table = Table(amount_data, colWidths=[doc.width])
    amount_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (-1, -1), GRAY_50),
        ('TOPPADDING', (0, 0), (-1, -1), 20),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 20),
        ('BOX', (0, 0), (-1, -1), 1, GRAY_200),
    ]))
    elements.append(amount_table)
    elements.append(Spacer(1, 20))

    # Details
    details = [
        ["Date:", _format_date(payment_date) if payment_date else datetime.now().strftime("%B %d, %Y")],
        ["From:", payer_name],
        ["To:", payee_name],
        ["Method:", payment_method],
        ["Project:", project_title or "N/A"],
        ["Transaction ID:", transaction_id or "N/A"],
    ]
    detail_data = []
    for label, value in details:
        detail_data.append([
            Paragraph(f"<b>{label}</b>", styles['FieldValue']),
            Paragraph(value, styles['FieldValue']),
        ])

    detail_table = Table(detail_data, colWidths=[doc.width * 0.35, doc.width * 0.65])
    detail_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, GRAY_100),
    ]))
    elements.append(detail_table)
    elements.append(Spacer(1, 30))

    # Footer
    elements.append(HRFlowable(width="100%", color=GRAY_200))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        f"This receipt was generated by {company_name}. For questions, please contact support.",
        styles['SmallText']
    ))

    doc.build(elements, onFirstPage=lambda c, d: _add_page_footer(c, d, company_name))
    return buffer.getvalue()
