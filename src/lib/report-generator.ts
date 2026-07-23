import jsPDF from "jspdf";
import defaultLogoUrl from "@/assets/templar-logo.png";
import type { CompanyInfo, Inspection } from "./types";

const RED: [number, number, number] = [142, 46, 40];
const DARK: [number, number, number] = [51, 51, 51];
const GREEN: [number, number, number] = [46, 125, 50];
const REDD: [number, number, number] = [198, 40, 40];
const GRAY: [number, number, number] = [158, 158, 158];

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

function digits(s: string): string {
  return (s || "").replace(/\D+/g, "");
}
function whatsappUrl(whatsapp: string): string {
  let d = digits(whatsapp);
  if (d && !d.startsWith("55")) d = "55" + d;
  return `https://wa.me/${d}`;
}
function siteUrl(site: string): string {
  const s = (site || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}
function mailUrl(email: string): string {
  return `mailto:${(email || "").trim()}`;
}

export async function generatePDF(insp: Inspection, company: CompanyInfo): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 15;

  const logoData = company.logoBase64 ? company.logoBase64 : await toDataUrl(defaultLogoUrl);

  // ===== COVER =====
  doc.setFillColor(...RED);
  doc.rect(0, 0, W, 8, "F");

  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", W / 2 - 30, 30, 60, 60);
    } catch {
      try { doc.addImage(logoData, "JPEG", W / 2 - 30, 30, 60, 60); } catch {}
    }
  } else {
    doc.setDrawColor(...GRAY);
    doc.rect(W / 2 - 30, 30, 60, 60);
    doc.setTextColor(...GRAY);
    doc.setFontSize(10);
    doc.text("LOGO DA EMPRESA", W / 2, 62, { align: "center" });
  }

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("RELATÓRIO DE VISTORIA", W / 2, 110, { align: "center" });
  doc.text("DE IMÓVEL NOVO", W / 2, 120, { align: "center" });

  doc.setDrawColor(...RED);
  doc.setLineWidth(0.5);
  doc.line(M, 130, W - M, 130);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  let y = 145;
  const line = (label: string, val: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, M, y);
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(val || "-", W - M - 55);
    doc.text(wrapped, M + 55, y);
    y += 7 * Math.max(1, wrapped.length);
  };
  line("Cliente:", insp.client);
  line("Data:", fmtDate(insp.date));
  line("Localização:", insp.location);
  line("Unidade:", insp.unit);
  line("Responsável da vistoria:", `${insp.responsibleName} — CREA ${insp.responsibleCrea}`);
  line("Responsável da construtora:", insp.constructorResponsible);
  line("Tipo:", insp.propertyType);

  // Footer (with clickable links)
  doc.setDrawColor(...RED);
  doc.line(M, H - 25, W - M, H - 25);
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text(company.name, W / 2, H - 18, { align: "center" });

  doc.setFont("helvetica", "normal");
  const site = (company.site || "").trim();
  const wa = (company.whatsapp || "").trim();
  const email = (company.email || "").trim();
  const sep = "  •  ";
  const parts: Array<{ text: string; url?: string }> = [];
  if (site) parts.push({ text: site, url: siteUrl(site) });
  if (wa) parts.push({ text: wa, url: whatsappUrl(wa) });
  if (email) parts.push({ text: email, url: mailUrl(email) });

  // Compute total width to center manually
  const partWidths = parts.map((p) => doc.getTextWidth(p.text));
  const sepWidth = doc.getTextWidth(sep);
  const totalWidth = partWidths.reduce((a, b) => a + b, 0) + Math.max(0, parts.length - 1) * sepWidth;
  let cx = W / 2 - totalWidth / 2;
  const footerY = H - 12;
  parts.forEach((p, i) => {
    if (p.url) doc.textWithLink(p.text, cx, footerY, { url: p.url });
    else doc.text(p.text, cx, footerY);
    cx += partWidths[i];
    if (i < parts.length - 1) {
      doc.text(sep, cx, footerY);
      cx += sepWidth;
    }
  });

  // ===== CONTENT PER ROOM =====
  const drawHeaderFooter = () => {
    doc.setFillColor(...RED);
    doc.rect(0, 0, W, 8, "F");
    if (logoData) {
      try { doc.addImage(logoData, "PNG", M, 12, 15, 15); } catch {
        try { doc.addImage(logoData, "JPEG", M, 12, 15, 15); } catch {}
      }
    }
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(company.name, M + 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    if (wa || email) doc.text(`${wa}${wa && email ? "  •  " : ""}${email}`, M + 20, 25);
    doc.setDrawColor(...RED);
    doc.line(M, H - 15, W - M, H - 15);
    doc.setFontSize(8);
    if (site) doc.text(site, W / 2, H - 10, { align: "center" });
  };

  const totals = { approved: 0, reproved: 0, na: 0 };

  for (const room of insp.rooms) {
    doc.addPage();
    drawHeaderFooter();
    y = 40;

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

      if (y > H - 40) {
        doc.addPage();
        drawHeaderFooter();
        y = 40;
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
        if (y + wrapped.length * 5 > H - 20) {
          doc.addPage();
          drawHeaderFooter();
          y = 40;
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
          if (y + imgH > H - 20) {
            doc.addPage();
            drawHeaderFooter();
            y = 40;
          }
          try {
            doc.addImage(it.photos[p], "JPEG", M + col * (imgW + 4), y, imgW, imgH, undefined, "FAST");
          } catch {}
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

  // ===== SUMMARY =====
  doc.addPage();
  drawHeaderFooter();
  y = 40;
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
  doc.text(`Total de itens verificados: ${total}`, M, y); y += 8;
  doc.setTextColor(...GREEN);
  doc.text(`Aprovados: ${totals.approved}`, M, y); y += 8;
  doc.setTextColor(...REDD);
  doc.text(`Reprovados: ${totals.reproved}`, M, y); y += 8;
  doc.setTextColor(...GRAY);
  doc.text(`Não se aplica: ${totals.na}`, M, y); y += 8;

  return doc.output("blob");
}

// ============ DOCX ============
export async function generateDOCX(insp: Inspection, company: CompanyInfo): Promise<Blob> {
  const docx = await import("docx");
  const {
    Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType,
    Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, PageBreak,
    ExternalHyperlink,
  } = docx;

  // Fetch logo (company override or default asset)
  let logoBuf: ArrayBuffer | null = null;
  try {
    if (company.logoBase64) {
      const base64 = company.logoBase64.split(",")[1] ?? "";
      const bin = atob(base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      logoBuf = bytes.buffer;
    } else {
      const logoRes = await fetch(defaultLogoUrl);
      logoBuf = await logoRes.arrayBuffer();
    }
  } catch {}

  const logoType: "png" | "jpg" = company.logoBase64?.startsWith("data:image/jpeg") ? "jpg" : "png";

  const RED_HEX = "8E2E28";
  const GREEN_HEX = "2E7D32";
  const REDD_HEX = "C62828";
  const GRAY_HEX = "9E9E9E";
  const DARK_HEX = "333333";

  const statusCell = (label: string, color: string) =>
    new TableCell({
      width: { size: 35, type: WidthType.PERCENTAGE },
      shading: { fill: color, type: ShadingType.CLEAR, color: "auto" },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: label, bold: true, color: "FFFFFF", size: 20 })] })],
    });

  const children: any[] = [];

  // Cover
  if (logoBuf) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new ImageRun({ type: logoType, data: logoBuf, transformation: { width: 180, height: 180 } })],
    }));
  } else {
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "LOGO DA EMPRESA", color: GRAY_HEX, italics: true })] }));
  }
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: "RELATÓRIO DE VISTORIA DE IMÓVEL NOVO", bold: true, size: 40, color: RED_HEX })] }));
  children.push(new Paragraph({ spacing: { before: 400 }, children: [] }));

  const info = (l: string, v: string) => new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `${l} `, bold: true }), new TextRun(v || "-")] });
  children.push(info("Cliente:", insp.client));
  children.push(info("Data:", fmtDate(insp.date)));
  children.push(info("Localização:", insp.location));
  children.push(info("Unidade:", insp.unit));
  children.push(info("Responsável da vistoria:", `${insp.responsibleName} — CREA ${insp.responsibleCrea}`));
  children.push(info("Responsável da construtora:", insp.constructorResponsible));
  children.push(info("Tipo:", insp.propertyType));

  // Contact block with hyperlinks (subtle: same dark color, no underline)
  const contactRuns: any[] = [];
  const linkRun = (text: string) =>
    new TextRun({ text, color: DARK_HEX, size: 18 });
  const site = (company.site || "").trim();
  const wa = (company.whatsapp || "").trim();
  const email = (company.email || "").trim();
  let first = true;
  if (site) {
    contactRuns.push(new ExternalHyperlink({ link: siteUrl(site), children: [linkRun(site)] }));
    first = false;
  }
  if (wa) {
    if (!first) contactRuns.push(new TextRun({ text: "  •  ", color: DARK_HEX, size: 18 }));
    contactRuns.push(new ExternalHyperlink({ link: whatsappUrl(wa), children: [linkRun(wa)] }));
    first = false;
  }
  if (email) {
    if (!first) contactRuns.push(new TextRun({ text: "  •  ", color: DARK_HEX, size: 18 }));
    contactRuns.push(new ExternalHyperlink({ link: mailUrl(email), children: [linkRun(email)] }));
  }
  if (contactRuns.length > 0) {
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600 }, children: [new TextRun({ text: company.name, bold: true, color: DARK_HEX, size: 20 })] }));
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: contactRuns }));
  }

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
          } catch {}
        }
      }
      children.push(new Paragraph({ children: [new TextRun("")], border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "EEEEEE", space: 1 } } }));
    }
  }

  // Summary
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
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } } },
      children,
    }],
  });

  const buffer = await Packer.toBlob(doc);
  return buffer;
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
