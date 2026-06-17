// @AI-HINT: Renders an AIReport into an editable, branded .docx Word file using the `docx` library.
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  TabStopType,
} from 'docx';
import {
  AIReport,
  ReportBlock,
  REPORT_BRAND as B,
  reportFileName,
  formatReportDate,
} from './reportTypes';
import { triggerDownload } from './download';

const hex = (c: string) => c.replace('#', '');

function noBorders() {
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  return { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
}

function cell(text: string, opts: { bold?: boolean; color?: string; fill?: string } = {}): TableCell {
  return new TableCell({
    shading: opts.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: hex(opts.fill) } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: opts.bold,
            size: 18,
            color: hex(opts.color ?? B.body),
            font: 'Calibri',
          }),
        ],
      }),
    ],
  });
}

function brandHeader(report: AIReport): (Paragraph | Table)[] {
  const band = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: hex(B.primary) },
            margins: { top: 220, bottom: 220, left: 240, right: 240 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${B.name}  `, bold: true, size: 26, color: 'FFFFFF', font: 'Calibri' }),
                  new TextRun({ text: report.toolName.toUpperCase(), size: 16, color: 'E0E7FF', font: 'Calibri' }),
                ],
              }),
              new Paragraph({
                spacing: { before: 120 },
                children: [new TextRun({ text: report.title, bold: true, size: 40, color: 'FFFFFF', font: 'Calibri' })],
              }),
              ...(report.subtitle
                ? [new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: report.subtitle, size: 18, color: 'E0E7FF', font: 'Calibri' })] })]
                : []),
              new Paragraph({
                spacing: { before: 80 },
                children: [new TextRun({ text: `Generated ${formatReportDate(report.generatedAt ?? new Date())}`, size: 15, color: 'C7D2FE', font: 'Calibri' })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
  return [band, new Paragraph({ spacing: { after: 160 }, children: [] })];
}

function kpiTable(report: AIReport): (Paragraph | Table)[] {
  const kpis = report.kpis ?? [];
  if (!kpis.length) return [];
  const cells = kpis.map(
    (k) =>
      new TableCell({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: hex(B.card) },
        margins: { top: 140, bottom: 140, left: 160, right: 160 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: hex(B.line) },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: hex(B.line) },
          left: { style: BorderStyle.SINGLE, size: 24, color: hex(B.primary) },
          right: { style: BorderStyle.SINGLE, size: 6, color: hex(B.line) },
        },
        children: [
          new Paragraph({ children: [new TextRun({ text: k.label.toUpperCase(), bold: true, size: 14, color: hex(B.muted), font: 'Calibri' })] }),
          new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: k.value, bold: true, size: 30, color: hex(B.ink), font: 'Calibri' })] }),
          ...(k.hint ? [new Paragraph({ children: [new TextRun({ text: k.hint, size: 14, color: hex(B.muted), font: 'Calibri' })] })] : []),
        ],
      }),
  );
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders(),
      rows: [new TableRow({ children: cells })],
    }),
    new Paragraph({ spacing: { after: 160 }, children: [] }),
  ];
}

function metaLine(report: AIReport): Paragraph[] {
  const meta = report.meta ?? [];
  if (!meta.length) return [];
  return [
    new Paragraph({
      spacing: { after: 200 },
      children: meta.flatMap((m, i) => [
        new TextRun({ text: `${m.label}: `, bold: true, size: 16, color: hex(B.muted), font: 'Calibri' }),
        new TextRun({ text: m.value, size: 16, color: hex(B.ink), font: 'Calibri' }),
        ...(i < meta.length - 1 ? [new TextRun({ text: '     ', size: 16, font: 'Calibri' })] : []),
      ]),
    }),
  ];
}

function sectionHeading(heading: string, description?: string): Paragraph[] {
  const out = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 160, after: 60 },
      border: { left: { style: BorderStyle.SINGLE, size: 24, color: hex(B.primary), space: 8 } },
      children: [new TextRun({ text: heading, bold: true, size: 24, color: hex(B.ink), font: 'Calibri' })],
    }),
  ];
  if (description) {
    out.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: description, italics: true, size: 17, color: hex(B.muted), font: 'Calibri' })],
      }),
    );
  }
  return out;
}

function renderBlock(block: ReportBlock): (Paragraph | Table)[] {
  switch (block.kind) {
    case 'paragraph':
      return [new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: block.text, size: 19, color: hex(B.body), font: 'Calibri' })] })];

    case 'bullets':
      return block.items.map(
        (item) =>
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [new TextRun({ text: item, size: 19, color: hex(B.body), font: 'Calibri' })],
          }),
      );

    case 'keyValue':
      return block.rows.map(
        (r) =>
          new Paragraph({
            spacing: { after: 60 },
            tabStops: [{ type: TabStopType.LEFT, position: 2600 }],
            children: [
              new TextRun({ text: `${r.label}:\t`, bold: true, size: 18, color: hex(B.muted), font: 'Calibri' }),
              new TextRun({ text: r.value, size: 18, color: hex(B.ink), font: 'Calibri' }),
            ],
          }),
      );

    case 'callout': {
      const tone = block.tone ?? 'info';
      const fill = tone === 'success' ? B.successBg : tone === 'warning' ? B.warningBg : B.infoBg;
      const fg = tone === 'success' ? B.success : tone === 'warning' ? B.warning : B.primaryDark;
      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { ...noBorders(), left: { style: BorderStyle.SINGLE, size: 24, color: hex(fg) } },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { type: ShadingType.CLEAR, color: 'auto', fill: hex(fill) },
                  margins: { top: 140, bottom: 140, left: 200, right: 200 },
                  children: [
                    ...(block.title ? [new Paragraph({ children: [new TextRun({ text: block.title, bold: true, size: 19, color: hex(fg), font: 'Calibri' })] })] : []),
                    new Paragraph({ children: [new TextRun({ text: block.text, size: 18, color: hex(B.body), font: 'Calibri' })] }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ spacing: { after: 120 }, children: [] }),
      ];
    }

    case 'table': {
      const head = new TableRow({
        tableHeader: true,
        children: block.columns.map((c) => cell(c, { bold: true, color: B.white, fill: B.primary })),
      });
      const body = block.rows.map((r, ri) => {
        const isHi = block.highlightRowIndex === ri;
        const fill = isHi ? B.infoBg : ri % 2 === 1 ? B.card : B.white;
        return new TableRow({
          children: r.map((c) => cell(String(c), { fill, bold: isHi, color: isHi ? B.primaryDark : B.body })),
        });
      });
      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [head, ...body],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: hex(B.line) },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: hex(B.line) },
            left: { style: BorderStyle.SINGLE, size: 4, color: hex(B.line) },
            right: { style: BorderStyle.SINGLE, size: 4, color: hex(B.line) },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: hex(B.line) },
            insideVertical: { style: BorderStyle.SINGLE, size: 4, color: hex(B.line) },
          },
        }),
        new Paragraph({ spacing: { after: 140 }, children: [] }),
      ];
    }
  }
}

function footer(report: AIReport): Paragraph[] {
  const out = [
    new Paragraph({
      spacing: { before: 240 },
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: hex(B.line), space: 8 } },
      children: [
        new TextRun({ text: `${B.name} — ${B.tagline}  ·  ${B.url}`, size: 14, color: hex(B.muted), font: 'Calibri' }),
      ],
    }),
  ];
  if (report.disclaimer) {
    out.push(
      new Paragraph({
        spacing: { before: 60 },
        children: [new TextRun({ text: report.disclaimer, size: 13, italics: true, color: hex(B.muted), font: 'Calibri' })],
      }),
    );
  }
  return out;
}

export async function exportReportDOCX(report: AIReport): Promise<void> {
  const children: (Paragraph | Table)[] = [
    ...brandHeader(report),
    ...kpiTable(report),
    ...metaLine(report),
  ];

  for (const section of report.sections) {
    children.push(...sectionHeading(section.heading, section.description));
    for (const block of section.blocks) children.push(...renderBlock(block));
  }

  children.push(...footer(report));

  const doc = new Document({
    creator: B.name,
    title: report.title,
    description: report.subtitle,
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${reportFileName(report)}.docx`);
}
