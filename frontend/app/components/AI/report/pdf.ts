// @AI-HINT: Renders an AIReport into a polished, branded multi-page PDF using jsPDF + autotable.
import { jsPDF } from 'jspdf';
import autoTable, { CellHookData } from 'jspdf-autotable';
import {
  AIReport,
  ReportBlock,
  REPORT_BRAND as B,
  reportFileName,
  formatReportDate,
} from './reportTypes';

type RGB = [number, number, number];

function rgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

// A4 portrait in points.
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BIG_HEADER_H = 116;
const COMPACT_HEADER_H = 52;
const FOOTER_H = 44;
const CONTENT_BOTTOM = PAGE_H - FOOTER_H - 12;

export function exportReportPDF(report: AIReport): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const generatedAt = report.generatedAt ?? new Date();
  let y = 0;

  /* ---------- low-level helpers ---------- */
  const setFill = (hex: string) => doc.setFillColor(...rgb(hex));
  const setText = (hex: string) => doc.setTextColor(...rgb(hex));
  const setDraw = (hex: string) => doc.setDrawColor(...rgb(hex));

  function newPage() {
    doc.addPage();
    drawCompactHeader();
    y = COMPACT_HEADER_H + 22;
  }

  function ensureSpace(h: number) {
    if (y + h > CONTENT_BOTTOM) newPage();
  }

  /* ---------- header / footer chrome ---------- */
  function drawBigHeader() {
    setFill(B.primary);
    doc.rect(0, 0, PAGE_W, BIG_HEADER_H, 'F');
    setFill(B.accent);
    doc.rect(0, BIG_HEADER_H - 5, PAGE_W, 5, 'F');

    // Brand mark
    setFill(B.white);
    doc.circle(MARGIN + 12, 34, 12, 'F');
    setText(B.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('M', MARGIN + 12, 39, { align: 'center' });

    setText(B.white);
    doc.setFontSize(13);
    doc.text(B.name, MARGIN + 32, 31);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setText('#E0E7FF');
    doc.text(report.toolName.toUpperCase(), MARGIN + 32, 43);

    // Title
    setText(B.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(report.title, MARGIN, 82);

    if (report.subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      setText('#E0E7FF');
      const lines = doc.splitTextToSize(report.subtitle, CONTENT_W - 150);
      doc.text(lines.slice(0, 2), MARGIN, 98);
    }

    // Date (top-right)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setText('#E0E7FF');
    doc.text(`Generated ${formatReportDate(generatedAt)}`, PAGE_W - MARGIN, 31, { align: 'right' });
  }

  function drawCompactHeader() {
    setFill(B.primary);
    doc.rect(0, 0, PAGE_W, COMPACT_HEADER_H, 'F');
    setFill(B.white);
    doc.circle(MARGIN + 10, 26, 10, 'F');
    setText(B.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('M', MARGIN + 10, 30, { align: 'center' });
    setText(B.white);
    doc.setFontSize(11);
    doc.text(`${B.name} · ${report.toolName}`, MARGIN + 28, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setText('#E0E7FF');
    doc.text(report.title, PAGE_W - MARGIN, 30, { align: 'right' });
  }

  function drawFooters() {
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      setDraw(B.line);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, PAGE_H - FOOTER_H, PAGE_W - MARGIN, PAGE_H - FOOTER_H);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      setText(B.muted);
      doc.text(
        `${B.name} — ${B.tagline}  ·  ${B.url}`,
        MARGIN,
        PAGE_H - FOOTER_H + 16,
      );
      doc.text(`Page ${p} of ${total}`, PAGE_W - MARGIN, PAGE_H - FOOTER_H + 16, {
        align: 'right',
      });
      if (report.disclaimer && p === total) {
        const dl = doc.splitTextToSize(report.disclaimer, CONTENT_W);
        setText(B.muted);
        doc.setFontSize(6.8);
        doc.text(dl.slice(0, 2), MARGIN, PAGE_H - FOOTER_H + 28);
      }
    }
  }

  /* ---------- content primitives ---------- */
  function kpiCards() {
    const kpis = report.kpis ?? [];
    if (!kpis.length) return;
    const cols = Math.min(kpis.length, 3);
    const gap = 12;
    const cardW = (CONTENT_W - gap * (cols - 1)) / cols;
    const rows = Math.ceil(kpis.length / cols);
    for (let r = 0; r < rows; r++) {
      const cardH = 58;
      ensureSpace(cardH + gap);
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (i >= kpis.length) break;
        const k = kpis[i];
        const x = MARGIN + c * (cardW + gap);
        setFill(B.card);
        setDraw(B.line);
        doc.setLineWidth(0.8);
        doc.roundedRect(x, y, cardW, cardH, 6, 6, 'FD');
        setFill(B.primary);
        doc.roundedRect(x, y, 4, cardH, 2, 2, 'F');
        setText(B.muted);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(k.label.toUpperCase(), x + 14, y + 17);
        setText(B.ink);
        doc.setFontSize(17);
        doc.text(k.value, x + 14, y + 38);
        if (k.hint) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          setText(B.muted);
          doc.text(doc.splitTextToSize(k.hint, cardW - 22)[0] ?? '', x + 14, y + 50);
        }
      }
      y += cardH + gap;
    }
  }

  function metaChips() {
    const meta = report.meta ?? [];
    if (!meta.length) return;
    const gap = 8;
    let x = MARGIN;
    ensureSpace(26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    for (const m of meta) {
      const label = `${m.label}: ${m.value}`;
      const w = doc.getTextWidth(label) + 18;
      if (x + w > PAGE_W - MARGIN) {
        x = MARGIN;
        y += 24;
        ensureSpace(24);
      }
      setFill(B.infoBg);
      setDraw(B.line);
      doc.roundedRect(x, y, w, 18, 9, 9, 'FD');
      setText(B.primaryDark);
      doc.text(label, x + 9, y + 12);
      x += w + gap;
    }
    y += 28;
  }

  function sectionHeading(text: string, description?: string) {
    ensureSpace(description ? 48 : 34);
    setFill(B.primary);
    doc.roundedRect(MARGIN, y, 4, 16, 2, 2, 'F');
    setText(B.ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(text, MARGIN + 12, y + 13);
    y += 22;
    if (description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      setText(B.muted);
      const lines = doc.splitTextToSize(description, CONTENT_W);
      doc.text(lines, MARGIN, y + 2);
      y += lines.length * 11 + 6;
    }
  }

  function paragraph(text: string) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    setText(B.body);
    const lines = doc.splitTextToSize(text, CONTENT_W);
    for (const line of lines) {
      ensureSpace(14);
      doc.text(line, MARGIN, y + 8);
      y += 14;
    }
    y += 6;
  }

  function bullets(items: string[]) {
    doc.setFontSize(9.5);
    for (const item of items) {
      doc.setFont('helvetica', 'normal');
      setText(B.body);
      const lines = doc.splitTextToSize(item, CONTENT_W - 16);
      ensureSpace(lines.length * 13 + 2);
      setFill(B.accent);
      doc.circle(MARGIN + 3, y + 4.5, 1.8, 'F');
      doc.text(lines, MARGIN + 14, y + 8);
      y += lines.length * 13 + 3;
    }
    y += 5;
  }

  function keyValue(rows: { label: string; value: string }[]) {
    doc.setFontSize(9.5);
    for (const r of rows) {
      ensureSpace(16);
      doc.setFont('helvetica', 'bold');
      setText(B.muted);
      doc.text(r.label, MARGIN, y + 8);
      doc.setFont('helvetica', 'normal');
      setText(B.ink);
      const vLines = doc.splitTextToSize(r.value, CONTENT_W - 170);
      doc.text(vLines, MARGIN + 170, y + 8);
      y += Math.max(16, vLines.length * 13);
    }
    y += 6;
  }

  function callout(block: Extract<ReportBlock, { kind: 'callout' }>) {
    const tone = block.tone ?? 'info';
    const bg = tone === 'success' ? B.successBg : tone === 'warning' ? B.warningBg : B.infoBg;
    const fg = tone === 'success' ? B.success : tone === 'warning' ? B.warning : B.primaryDark;
    doc.setFontSize(9);
    const titleH = block.title ? 14 : 0;
    const bodyLines = doc.splitTextToSize(block.text, CONTENT_W - 28);
    const h = titleH + bodyLines.length * 12 + 16;
    ensureSpace(h + 6);
    setFill(bg);
    doc.roundedRect(MARGIN, y, CONTENT_W, h, 6, 6, 'F');
    setFill(fg);
    doc.rect(MARGIN, y, 4, h, 'F');
    let ty = y + 16;
    if (block.title) {
      doc.setFont('helvetica', 'bold');
      setText(fg);
      doc.text(block.title, MARGIN + 16, ty);
      ty += 13;
    }
    doc.setFont('helvetica', 'normal');
    setText(B.body);
    doc.text(bodyLines, MARGIN + 16, ty);
    y += h + 8;
  }

  function table(block: Extract<ReportBlock, { kind: 'table' }>) {
    ensureSpace(60);
    autoTable(doc, {
      startY: y,
      head: [block.columns],
      body: block.rows.map((r) => r.map((c) => String(c))),
      margin: { left: MARGIN, right: MARGIN, top: COMPACT_HEADER_H + 18, bottom: FOOTER_H + 14 },
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 6,
        textColor: rgb(B.body),
        lineColor: rgb(B.line),
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: rgb(B.primary),
        textColor: rgb(B.white),
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: rgb(B.card) },
      didParseCell: (data: CellHookData) => {
        if (
          data.section === 'body' &&
          block.highlightRowIndex !== undefined &&
          data.row.index === block.highlightRowIndex
        ) {
          data.cell.styles.fillColor = rgb(B.infoBg);
          data.cell.styles.textColor = rgb(B.primaryDark);
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  }

  function renderBlock(block: ReportBlock) {
    switch (block.kind) {
      case 'paragraph':
        return paragraph(block.text);
      case 'bullets':
        return bullets(block.items);
      case 'keyValue':
        return keyValue(block.rows);
      case 'callout':
        return callout(block);
      case 'table':
        return table(block);
    }
  }

  /* ---------- compose ---------- */
  drawBigHeader();
  y = BIG_HEADER_H + 22;

  kpiCards();
  metaChips();

  for (const section of report.sections) {
    sectionHeading(section.heading, section.description);
    for (const block of section.blocks) renderBlock(block);
    y += 6;
  }

  drawFooters();
  doc.save(`${reportFileName(report)}.pdf`);
}
