import jsPDF from "jspdf";
import { EMPRESA } from "./company";
import type { Inspection } from "./types";

const RED: [number, number, number] = [142, 46, 40];
const DARK: [number, number, number] = [51, 51, 51];
const GREEN: [number, number, number] = [46, 125, 50];
const REDD: [number, number, number] = [198, 40, 40];
const GRAY: [number, number, number] = [158, 158, 158];
const LIGHT: [number, number, number] = [204, 204, 204];

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function toDataUrl(src: string): Promise<string> {
  if (src.startsWith("data:")) return src;
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
}

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

const CONTACTS: Array<{ text: string; url: string }> = [
  { text: EMPRESA.site, url: EMPRESA.siteUrl },
  { text: EMPRESA.email, url: EMPRESA.emailUrl },
  { text: `WhatsApp ${EMPRESA.whatsapp}`, url: EMPRESA.whatsappUrl },
];

export async function generatePDF(insp: Inspection, inspectionNumber: string): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 15;
  const TOP = 48; // início do conteúdo (abaixo do cabeçalho do template)
  const BOTTOM = H - 22; // limite antes do rodapé

  const logoData = await toDataUrl(EMPRESA.logo).catch(() => "");

  const addLogo = (x: number, y: number, w: number, h: number) => {
    if (!logoData) return;
    try {
      doc.addImage(logoData, "PNG", x, y, w, h);
    } catch {
      try {
        doc.addImage(logoData, "JPEG", x, y, w, h);
      } catch {
        /* ignore */
      }
    }
  };

  // Linha de contatos com hyperlinks, centralizada em cx
  const contactLine = (centerX: number, y: number, size: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...GRAY);
    const sep = "  |  ";
    const widths = CONTACTS.map((c) => doc.getTextWidth(c.text));
    const sepW = doc.getTextWidth(sep);
    const total = widths.reduce((a, b) => a + b, 0) + sepW * (CONTACTS.length - 1);
    let x = centerX - total / 2;
    CONTACTS.forEach((c, i) => {
      doc.textWithLink(c.text, x, y, { url: c.url });
      x += widths[i];
      if (i < CONTACTS.length - 1) {
        doc.text(sep, x, y);
        x += sepW;
      }
    });
  };

  // ===== CONTEÚDO =====
  // Capa
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("RELATÓRIO DE VISTORIA", W / 2, 100, { align: "center" });
  doc.text("DE IMÓVEL NOVO", W / 2, 110, { align: "center" });

  doc.setDrawColor(...RED);
  doc.setLineWidth(0.5);
  doc.line(M, 120, W - M, 120);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  let y = 135;
  const line = (label: string, val: string) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(label, M, y);
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(val || "-", W - M - 55);
    doc.text(wrapped, M + 55, y);
    y += 7 * Math.max(1, wrapped.length);
  };
  line("Nº da vistoria:", inspectionNumber);
  line("Cliente:", insp.client);
  line("Data:", fmtDate(insp.date));
  line("Localização:", insp.location);
  line("Unidade:", insp.unit);
  line("Responsável da vistoria:", `${insp.responsibleName} — CREA ${insp.responsibleCrea}`);
  line("Responsável da construtora:", insp.constructorResponsible);
  line("Tipo:", insp.propertyType);

  const totals = { approved: 0, reproved: 0, na: 0 };

  for (const room of insp.rooms) {
    doc.addPage();
    y = TOP;

    doc.setFillColor(...RED);
    doc.rect(M, y, W - 2 * M, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(room.name.toUpperCase(), M + 3, y + 7);
    y += 15;

    for (let idx = 0; idx < room.items.length; idx++) {
      const it = room.items[idx];
      if (it.exists === null) continue;

      let statusLabel = "NÃO SE APLICA";
      let statusColor = GRAY;
      if (it.exists === false) {
        totals.na++;
      } else if (it.status === "APROVADO") {
        statusLabel = "APROVADO";
        statusColor = GREEN;
        totals.approved++;
      } else if (it.status === "REPROVADO") {
        statusLabel = "REPROVADO";
        statusColor = REDD;
        totals.reproved++;
      } else {
        continue;
      }

      if (y > BOTTOM - 18) {
        doc.addPage();
        y = TOP;
      }

      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${idx + 1}. ${it.title}`, M, y);

      const pillW = statusLabel === "NÃO SE APLICA" ? 34 : 28;
      doc.setFillColor(...statusColor);
      doc.roundedRect(W - M - pillW, y - 5, pillW, 7, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(statusLabel, W - M - pillW / 2, y, { align: "center" });
      y += 6;

      const obs = it.finalObservations || it.observations;
      if (obs && it.exists === true) {
        doc.setTextColor(...DARK);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const wrapped = doc.splitTextToSize(obs, W - 2 * M);
        if (y + wrapped.length * 5 > BOTTOM) {
          doc.addPage();
          y = TOP;
        }
        doc.text(wrapped, M, y);
        y += wrapped.length * 5 + 2;
      }

      if (it.status === "REPROVADO" && it.photos.length > 0) {
        const imgW = (W - 2 * M - 4) / 2;
        const imgH = 45;
        for (let p = 0; p < it.photos.length; p++) {
          const col = p % 2;
          if (col === 0 && p > 0) y += imgH + 3;
          if (y + imgH > BOTTOM) {
            doc.addPage();
            y = TOP;
          }
          try {
            doc.addImage(it.photos[p], "JPEG", M + col * (imgW + 4), y, imgW, imgH, undefined, "FAST");
          } catch {
            /* ignore */
          }
          if (col === 1 || p === it.photos.length - 1) {
            y += imgH + 3;
          }
        }
      }
      y += 5;
      doc.setDrawColor(230, 230, 230);
      doc.line(M, y - 2, W - M, y - 2);
    }
  }

  // ===== RESUMO =====
  doc.addPage();
  y = TOP;
  doc.setFillColor(...RED);
  doc.rect(M, y, W - 2 * M, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("RESUMO DA VISTORIA", M + 3, y + 7);
  y += 20;

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const total = totals.approved + totals.reproved + totals.na;
  doc.text(`Total de itens verificados: ${total}`, M, y);
  y += 8;
  doc.setTextColor(...GREEN);
  doc.text(`Aprovados: ${totals.approved}`, M, y);
  y += 8;
  doc.setTextColor(...REDD);
  doc.text(`Reprovados: ${totals.reproved}`, M, y);
  y += 8;
  doc.setTextColor(...GRAY);
  doc.text(`Não se aplica: ${totals.na}`, M, y);

  // ===== CABEÇALHO E RODAPÉ (template) EM TODAS AS PÁGINAS =====
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);

    // Cabeçalho — logo horizontal + tagline
    addLogo(M, 10, 48, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK);
    doc.text(EMPRESA.tagline, M, 29.5);

    // Cabeçalho — identificação do documento (direita)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text("RELATÓRIO DE VISTORIA", W - M, 16, { align: "right" });
    doc.setTextColor(...RED);
    doc.setFontSize(11);
    doc.text(inspectionNumber, W - M, 22, { align: "right" });

    // Cabeçalho — contatos + separador
    contactLine(W / 2, 35, 7);
    doc.setDrawColor(...LIGHT);
    doc.setLineWidth(0.3);
    doc.line(M, 38, W - M, 38);

    // Rodapé
    doc.setDrawColor(...LIGHT);
    doc.line(M, H - 16, W - M, H - 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(EMPRESA.nome, M, H - 11);
    contactLine(W / 2, H - 11, 7);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`Página ${p} de ${pages}`, W - M, H - 11, { align: "right" });
  }

  return doc.output("blob");
}

// ============ DOCX ============
export async function generateDOCX(insp: Inspection, inspectionNumber: string): Promise<Blob> {
  const docx = await import("docx");
  const {
    Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType,
    Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, PageBreak,
    ExternalHyperlink, Header, Footer, PageNumber, TabStopType, TabStopPosition, Tab,
  } = docx;

  let logoBuf: ArrayBuffer | null = null;
  try {
    const logoRes = await fetch(EMPRESA.logo);
    logoBuf = await logoRes.arrayBuffer();
  } catch {
    /* ignore */
  }

  const RED_HEX = "8E2E28";
  const GREEN_HEX = "2E7D32";
  const REDD_HEX = "C62828";
  const GRAY_HEX = "9E9E9E";
  const DARK_HEX = "333333";

  const contactRuns = (size: number) => {
    const runs: any[] = [];
    CONTACTS.forEach((c, i) => {
      if (i > 0) runs.push(new TextRun({ text: "  |  ", color: GRAY_HEX, size }));
      runs.push(new ExternalHyperlink({ link: c.url, children: [new TextRun({ text: c.text, color: GRAY_HEX, size })] }));
    });
    return runs;
  };

  const headerChildren: any[] = [];
  headerChildren.push(
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [5000, 4026],
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 5000, type: WidthType.DXA },
              margins: { top: 40, bottom: 40, left: 0, right: 60 },
              children: [
                ...(logoBuf
                  ? [new Paragraph({ children: [new ImageRun({ type: "jpg", data: logoBuf, transformation: { width: 180, height: 60 } })] })]
                  : [new Paragraph({ children: [new TextRun({ text: EMPRESA.nome, bold: true, color: DARK_HEX, size: 24 })] })]),
                new Paragraph({ children: [new TextRun({ text: EMPRESA.tagline, color: DARK_HEX, size: 15 })] }),
              ],
            }),
            new TableCell({
              width: { size: 4026, type: WidthType.DXA },
              margins: { top: 40, bottom: 40, left: 60, right: 0 },
              children: [
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "RELATÓRIO DE VISTORIA", bold: true, color: DARK_HEX, size: 18 })] }),
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: inspectionNumber, bold: true, color: RED_HEX, size: 22 })] }),
              ],
            }),
          ],
        }),
      ],
    }),
  );
  headerChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 4 } },
      children: contactRuns(14),
    }),
  );

  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };

  const footer = new Footer({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 2 } },
        children: [new TextRun({ text: "", size: 2 })],
      }),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2400, 4426, 2200],
        borders: noBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2400, type: WidthType.DXA },
                margins: { top: 40, bottom: 0, left: 0, right: 40 },
                children: [new Paragraph({ children: [new TextRun({ text: EMPRESA.nome, color: GRAY_HEX, size: 14 })] })],
              }),
              new TableCell({
                width: { size: 4426, type: WidthType.DXA },
                margins: { top: 40, bottom: 0, left: 40, right: 40 },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: contactRuns(14) })],
              }),
              new TableCell({
                width: { size: 2200, type: WidthType.DXA },
                margins: { top: 40, bottom: 0, left: 40, right: 0 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({ text: "Página ", color: GRAY_HEX, size: 14 }),
                      new TextRun({ children: [PageNumber.CURRENT], color: GRAY_HEX, size: 14 }),
                      new TextRun({ text: " de ", color: GRAY_HEX, size: 14 }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES], color: GRAY_HEX, size: 14 }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const statusCell = (label: string, color: string) =>
    new TableCell({
      width: { size: 35, type: WidthType.PERCENTAGE },
      shading: { fill: color, type: ShadingType.CLEAR, color: "auto" },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: label, bold: true, color: "FFFFFF", size: 20 })] })],
    });

  const children: any[] = [];

  // Capa
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600 }, children: [new TextRun({ text: "RELATÓRIO DE VISTORIA DE IMÓVEL NOVO", bold: true, size: 40, color: RED_HEX })] }));
  children.push(new Paragraph({ spacing: { before: 400 }, children: [] }));

  const info = (l: string, v: string) => new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `${l} `, bold: true }), new TextRun(v || "-")] });
  children.push(info("Nº da vistoria:", inspectionNumber));
  children.push(info("Cliente:", insp.client));
  children.push(info("Data:", fmtDate(insp.date)));
  children.push(info("Localização:", insp.location));
  children.push(info("Unidade:", insp.unit));
  children.push(info("Responsável da vistoria:", `${insp.responsibleName} — CREA ${insp.responsibleCrea}`));
  children.push(info("Responsável da construtora:", insp.constructorResponsible));
  children.push(info("Tipo:", insp.propertyType));

  const totals = { approved: 0, reproved: 0, na: 0 };

  for (const room of insp.rooms) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(new Paragraph({
      spacing: { before: 200, after: 200 },
      shading: { fill: RED_HEX, type: ShadingType.CLEAR, color: "auto" },
      children: [new TextRun({ text: `  ${room.name.toUpperCase()}`, bold: true, color: "FFFFFF", size: 28 })],
    }));

    for (let idx = 0; idx < room.items.length; idx++) {
      const it = room.items[idx];
      if (it.exists === null) continue;

      let label = "NÃO SE APLICA", color = GRAY_HEX;
      if (it.exists === false) { totals.na++; }
      else if (it.status === "APROVADO") { label = "APROVADO"; color = GREEN_HEX; totals.approved++; }
      else if (it.status === "REPROVADO") { label = "REPROVADO"; color = REDD_HEX; totals.reproved++; }
      else continue;

      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({
          children: [
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: `${idx + 1}. ${it.title}`, bold: true, size: 22 })] })],
            }),
            statusCell(label, color),
          ],
        })],
      }));

      const obs = it.finalObservations || it.observations;
      if (obs && it.exists === true) {
        children.push(new Paragraph({ spacing: { before: 100, after: 100 }, children: [new TextRun({ text: obs, size: 20 })] }));
      }

      if (it.status === "REPROVADO" && it.photos.length > 0) {
        for (const photo of it.photos) {
          try {
            const bin = atob(photo.split(",")[1] ?? "");
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            children.push(new Paragraph({
              spacing: { before: 100, after: 100 },
              children: [new ImageRun({ type: "jpg", data: bytes.buffer, transformation: { width: 300, height: 220 } })],
            }));
          } catch {
            /* ignore */
          }
        }
      }
      children.push(new Paragraph({ children: [new TextRun("")], border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "EEEEEE", space: 1 } } }));
    }
  }

  // Resumo
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(new Paragraph({
    spacing: { before: 200, after: 200 },
    shading: { fill: RED_HEX, type: ShadingType.CLEAR, color: "auto" },
    children: [new TextRun({ text: "  RESUMO DA VISTORIA", bold: true, color: "FFFFFF", size: 28 })],
  }));
  const total = totals.approved + totals.reproved + totals.na;
  children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `Total de itens verificados: ${total}`, size: 22 })] }));
  children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `Aprovados: ${totals.approved}`, size: 22, color: GREEN_HEX, bold: true })] }));
  children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `Reprovados: ${totals.reproved}`, size: 22, color: REDD_HEX, bold: true })] }));
  children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `Não se aplica: ${totals.na}`, size: 22, color: GRAY_HEX, bold: true })] }));

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 2100, right: 1000, bottom: 1200, left: 1000 } } },
      headers: { default: new Header({ children: headerChildren }) },
      footers: { default: footer },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareBlob(blob: Blob, filename: string, title: string): Promise<boolean> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean; share?: (d: ShareData) => Promise<void> };
  const file = new File([blob], filename, { type: blob.type });
  const data: ShareData = { title, files: [file] };
  if (nav.canShare && nav.canShare(data) && nav.share) {
    try {
      await nav.share(data);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
