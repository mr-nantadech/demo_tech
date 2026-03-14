import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { formatMoney, toNumber } from "@/lib/project-file";

type SnapshotLine = {
  itemNo?: string | null;
  description: string;
  quantity?: number | null;
  unit?: string | null;
  materialUnitPrice?: number | null;
  materialAmount?: number | null;
  laborUnitPrice?: number | null;
  laborAmount?: number | null;
  lineTotal?: number | null;
  remark?: string | null;
  lineType: "SECTION" | "ITEM" | "NOTE";
};

type SnapshotCompany = {
  name: string;
  registrationNo: string;
  address: string;
  phone: string;
};

type SnapshotProject = {
  projectCode: string;
  projectName: string;
  subject?: string | null;
  quotationNo?: string | null;
  revisionNo?: string | null;
  quotationDate?: string | null;
  billTo?: string | null;
  dear?: string | null;
  supervisorName?: string | null;
  paymentTermsText?: string | null;
  amountTextTh?: string | null;
  subtotal: number;
  overheadPercent: number;
  overheadAmount: number;
  total: number;
  discount: number;
  grandTotal: number;
};

// ─── Drawing helpers ──────────────────────────────────────────────────────────

type PDFPage = import("pdf-lib").PDFPage;
type PDFFont = import("pdf-lib").PDFFont;

function dt(page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont) {
  if (!text) return;
  page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
}

function dtUnderline(page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont) {
  if (!text) return;
  dt(page, text, x, y, size, font);
  const w = font.widthOfTextAtSize(text, size);
  page.drawLine({ start: { x, y: y - 1 }, end: { x: x + w, y: y - 1 }, thickness: 0.8, color: rgb(0, 0, 0) });
}

function cellText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  font: PDFFont,
  size: number,
  align: "left" | "center" | "right" = "left"
) {
  if (!text) return;
  const tw = font.widthOfTextAtSize(text, size);
  let px = x + 4;
  if (align === "center") px = x + (w - tw) / 2;
  if (align === "right") px = x + w - tw - 4;
  const py = y + (h - size) / 2 + 1;
  dt(page, text, px, py, size, font);
}

function rect(page: PDFPage, x: number, y: number, w: number, h: number, fill?: [number, number, number]) {
  page.drawRectangle({
    x, y, width: w, height: h,
    borderWidth: 0.8, borderColor: rgb(0.3, 0.3, 0.3),
    color: fill ? rgb(fill[0], fill[1], fill[2]) : undefined,
  });
}

function hline(page: PDFPage, x1: number, y1: number, x2: number) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y1 }, thickness: 0.8, color: rgb(0.3, 0.3, 0.3) });
}

function vline(page: PDFPage, x: number, y1: number, y2: number) {
  page.drawLine({ start: { x, y: y1 }, end: { x, y: y2 }, thickness: 0.8, color: rgb(0.3, 0.3, 0.3) });
}

function wrapText(text: string, maxW: number, font: PDFFont, size: number): string[] {
  if (!text) return [""];
  const result: string[] = [];
  for (const para of text.split("\n")) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const words = trimmed.split(" ");
    let cur = "";
    for (const word of words) {
      const trial = cur ? `${cur} ${word}` : word;
      if (font.widthOfTextAtSize(trial, size) <= maxW) {
        cur = trial;
      } else {
        if (cur) result.push(cur);
        cur = word;
      }
    }
    if (cur) result.push(cur);
  }
  return result.length ? result : [text];
}

function thaiDate(iso: string): string {
  const p = iso.split("-");
  if (p.length !== 3) return iso;
  return `${p[2]}/${p[1]}/${parseInt(p[0], 10) + 543}`;
}

// ─── Main generator ───────────────────────────────────────────────────────────

export async function generateProjectFilePdf(snapshot: {
  project: SnapshotProject;
  lines: SnapshotLine[];
  company?: SnapshotCompany;
}) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Fonts from public/font/
  let font: PDFFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let bold: PDFFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  try {
    const fontBytes = await readFile(path.join(process.cwd(), "public/font/THSarabunNew.ttf"));
    font = await pdfDoc.embedFont(fontBytes, { subset: true });
  } catch { /* fallback */ }
  try {
    const boldBytes = await readFile(path.join(process.cwd(), "public/font/THSarabunNew Bold.ttf"));
    bold = await pdfDoc.embedFont(boldBytes, { subset: true });
  } catch { /* fallback */ }

  // Logo — convert WebP → PNG via sharp, then embed
  let logo: import("pdf-lib").PDFImage | null = null;
  try {
    const webpBytes = await readFile(path.join(process.cwd(), "public/logo_corp.webp"));
    const pngBytes = await sharp(webpBytes).png().toBuffer();
    logo = await pdfDoc.embedPng(pngBytes);
  } catch { /* skip */ }

  const co = snapshot.company ?? { name: "", registrationNo: "", address: "", phone: "" };
  const pr = snapshot.project;

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1 — Portrait A4 (595.28 × 841.89) — ใบเสนอราคา
  // ════════════════════════════════════════════════════════════════════════════
  const p1 = pdfDoc.addPage([595.28, 841.89]);
  const PW = 595.28;
  const LM = 36;

  // ── Title (size 20, centered, underlined) ───────────────────────────────────
  {
    const sz = 20;
    const titleText = "ใบเสนอราคา";
    const tw = bold.widthOfTextAtSize(titleText, sz);
    dtUnderline(p1, titleText, (PW - tw) / 2, 806, sz, bold);
  }

  // ── Company info (left, size 11) / Service lines (right, size 12) ──────────
  const rightX = 400;
  if (co.name) {
    const nameLine = co.registrationNo
      ? `${co.name}  เลขนิติบุคคล  ${co.registrationNo}`
      : co.name;
    dt(p1, nameLine, LM, 782, 11, bold);
  }
  if (co.address) dt(p1, co.address, LM, 765, 11, bold);
  if (co.phone) dt(p1, `Tel.${co.phone}`, LM, 748, 11, bold);

  dt(p1, "CONSTRUCTION", rightX, 782, 12, bold);
  dt(p1, "INTERIOR DECORATION", rightX, 765, 12, bold);
  dt(p1, "SHOWROOM & DISPLAY", rightX, 748, 12, bold);

  // ── Bill To ────────────────────────────────────────────────────────────────
  dt(p1, "Bill To:", LM, 728, 11, bold);
  dt(p1, pr.billTo ?? "", LM + 50, 728, 11, font);

  // ── Dear / Ref.NO ──────────────────────────────────────────────────────────
  dt(p1, "Dear :", LM, 710, 11, bold);
  dt(p1, pr.dear ?? "", LM + 42, 710, 11, font);
  dt(p1, `Ref.NO…………………………  ${pr.revisionNo ?? "Rev.1"}`, 360, 710, 11, font);

  // ── Subjects / Date ────────────────────────────────────────────────────────
  dt(p1, "Subjects:", LM, 692, 12, bold);
  dt(p1, pr.subject ?? pr.projectName, LM + 66, 692, 12, font);
  const dateStr = pr.quotationDate ? thaiDate(pr.quotationDate) : "……/……/……";
  dt(p1, `Date  ${dateStr}`, 420, 692, 12, bold);

  // ── Table ──────────────────────────────────────────────────────────────────
  const TX = LM;
  const TY = 678;          // top of outer border
  const TH = 490;          // table height → bottom = TY - TH = 188
  const TW = 523;
  const hdrH = 26;         // header row height
  const C = [38, 272, 48, 117, 48] as const;

  rect(p1, TX, TY - TH, TW, TH);

  // Header cells
  const hdrLabels = ["ITEM", "DESCRIPTION", "QUANTITY", "UNIT PRICE", "TOTAL"];
  let cxH = TX;
  for (let i = 0; i < C.length; i++) {
    rect(p1, cxH, TY - hdrH, C[i], hdrH);
    cellText(p1, hdrLabels[i], cxH, TY - hdrH, C[i], hdrH, bold, 10, "center");
    cxH += C[i];
  }

  // Vertical dividers through body
  let vx = TX + C[0];
  for (let i = 1; i < C.length; i++) {
    vline(p1, vx, TY - hdrH, TY - TH);
    vx += C[i];
  }

  // ── Table body rows ─────────────────────────────────────────────────────────
  const BODY_TOP = TY - hdrH;
  const rowH1 = 20;
  const reserveBottom = 115;
  let curY1 = BODY_TOP;

  {
    const rowBot = curY1 - rowH1;
    cellText(p1, "1", TX, rowBot, C[0], rowH1, font, 11, "center");
    dt(p1, wrapText(pr.subject ?? pr.projectName ?? "", C[1] - 10, font, 11)[0] ?? "", TX + C[0] + 5, rowBot + 5, 11, font);
    cellText(p1, "1", TX + C[0] + C[1], rowBot, C[2], rowH1, font, 11, "center");
    cellText(p1, formatMoney(pr.grandTotal), TX + C[0] + C[1] + C[2], rowBot, C[3], rowH1, font, 11, "center");
    cellText(p1, formatMoney(pr.grandTotal), TX + C[0] + C[1] + C[2] + C[3], rowBot, C[4], rowH1, font, 11, "center");
    curY1 -= rowH1;
  }

  // ── Payment terms (vertically centered in reserved area) ───────────────────
  if (pr.paymentTermsText) {
    const ptX = TX + C[0] + 5;
    const terms = pr.paymentTermsText.split("\n").map((s) => s.trim()).filter(Boolean);
    const n = terms.length;
    const blockH = n > 0 ? 28 + (n - 1) * 16 : 11;
    const areaTop = curY1;               // bottom of last body row
    const areaBot = TY - TH + 2 + 22;   // top of amount row (amtRowY + amtH)
    const areaCenter = (areaBot + areaTop) / 2;
    const ptY = areaCenter + blockH / 2 - 11;
    dtUnderline(p1, "เงื่อนไขการชำระเงิน", ptX, ptY, 11, bold);
    terms.forEach((t, i) => dt(p1, t, ptX, ptY - 17 - i * 16, 11, font));
  }

  // ── Amount text + grand total (bottom row) — no top border ────────────────
  const amtH = 22;
  const amtRowY = TY - TH + 2;
  if (pr.amountTextTh) {
    cellText(p1, pr.amountTextTh, TX + C[0], amtRowY, C[1], amtH, bold, 11, "center");
  }
  cellText(p1, formatMoney(pr.grandTotal), TX + C[0] + C[1] + C[2] + C[3], amtRowY, C[4], amtH, bold, 11, "center");

  // ── Approval section ───────────────────────────────────────────────────────
  const AH = 96;
  const AY = TY - TH - AH - 6;
  rect(p1, TX, AY, TW, AH);
  vline(p1, TX + TW / 2, AY, AY + AH);

  // Center each text within its half-cell
  const halfW = TW / 2;
  const approvalCenter = (text: string, f: PDFFont, sz: number, side: 0 | 1, y: number) => {
    const xBase = TX + side * halfW;
    const xText = xBase + (halfW - f.widthOfTextAtSize(text, sz)) / 2;
    dt(p1, text, xText, y, sz, f);
  };

  approvalCenter("APPROVED & CONFIRMED BY :", bold, 11, 0, AY + AH - 16);
  approvalCenter(co.name || "บริษัท", bold, 11, 1, AY + AH - 16);
  approvalCenter("(…………………………………)", font, 11, 0, AY + AH - 46);
  approvalCenter("(…………………………………)", font, 11, 1, AY + AH - 46);
  approvalCenter("(                                  )", font, 11, 0, AY + AH - 64);
  const supLabel = pr.supervisorName ? `( ${pr.supervisorName} )` : "(                                  )";
  approvalCenter(supLabel, font, 11, 1, AY + AH - 64);
  approvalCenter("Date ……/……/……", font, 11, 0, AY + 12);
  approvalCenter("Date ……/……/……", font, 11, 1, AY + 12);

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2+ — Landscape A4 (841.89 × 595.28) — ตารางแสดงรายละเอียดงาน
  // ════════════════════════════════════════════════════════════════════════════
  const LW = 841.89;
  const LH = 595.28;
  const LMG = 24;

  // 10 columns — total 794 pt (= 841.89 − 2×24)
  const CL = [40, 210, 52, 42, 68, 68, 68, 68, 84, 94] as const;

  const H1 = 22;  // header row 1
  const H2 = 20;  // header row 2
  const H3 = 20;  // header row 3
  const HDR_H = H1 + H2 + H3; // 62

  const TABLE_TOP_Y = 446;
  const HEADER_BOT_Y = TABLE_TOP_Y - HDR_H; // 384
  const ROW_HL = 20;
  const BOTTOM_MG = 36;

  const colX: number[] = [];
  {
    let cx2 = LMG;
    for (const w of CL) { colX.push(cx2); cx2 += w; }
  }

  const FILL_HDR: [number, number, number] = [0.84, 0.91, 0.97];
  const FILL_SUMMARY: [number, number, number] = [0.86, 0.93, 0.98];
  const FILL_GRAND: [number, number, number] = [0.99, 0.95, 0.1];

  function drawLandscapeHeader(pg: PDFPage) {
    // Logo (top-left)
    if (logo) {
      const dims = logo.scaleToFit(70, 38);
      pg.drawImage(logo, { x: LMG, y: LH - 32 - dims.height, width: dims.width, height: dims.height });
    }
    dt(pg, "NBA Engineering Ltd.", LMG, LH - 92, 12, bold);
    dt(pg, `ผู้ควบคุมงาน :  ${pr.supervisorName ?? "-"}`, LMG, LH - 112, 11, bold);
    dt(pg, `มูลค่างาน :  ${formatMoney(pr.grandTotal)} บาท (ไม่รวมภาษีมูลค่าเพิ่ม)`, LMG, LH - 128, 11, bold);

    // Project info (right-aligned)
    const projTitle = `โครงการ : ${pr.projectName}`;
    dt(pg, projTitle, LW - LMG - bold.widthOfTextAtSize(projTitle, 16), LH - 44, 16, bold);
    const tTitle = "ตารางแสดงรายละเอียดงาน";
    dt(pg, tTitle, LW - LMG - bold.widthOfTextAtSize(tTitle, 14), LH - 66, 14, bold);
    const tSub = "ประกอบการเสนอราคา";
    dt(pg, tSub, LW - LMG - font.widthOfTextAtSize(tSub, 13), LH - 84, 13, font);

    // ── 3-row merged header ─────────────────────────────────────────────────
    const r1Bot = TABLE_TOP_Y - H1;
    const r2Bot = TABLE_TOP_Y - H1 - H2;
    const r3Bot = TABLE_TOP_Y - HDR_H; // = HEADER_BOT_Y

    // Col 0 (ลำดับ), Col 1 (รายการ): span all 3 rows
    for (let i = 0; i <= 1; i++) {
      rect(pg, colX[i], r3Bot, CL[i], HDR_H, FILL_HDR);
      cellText(pg, ["ลำดับ", "รายการ"][i], colX[i], r3Bot, CL[i], HDR_H, bold, 10, "center");
    }

    // Row 1: "มูลค่างานก่อสร้าง" spans cols 2–9
    const spanAll = CL[2] + CL[3] + CL[4] + CL[5] + CL[6] + CL[7] + CL[8] + CL[9];
    rect(pg, colX[2], r1Bot, spanAll, H1, FILL_HDR);
    cellText(pg, "มูลค่างานก่อสร้าง", colX[2], r1Bot, spanAll, H1, bold, 11, "center");

    // Row 2: ปริมาณ (col 2, span rows 2-3), หน่วย (col 3, span rows 2-3),
    //         ค่าวัสดุ (cols 4-5), ค่าแรงงาน (cols 6-7),
    //         รวมเป็นเงิน (col 8, span rows 2-3), หมายเหตุ (col 9, span rows 2-3)
    rect(pg, colX[2], r3Bot, CL[2], H2 + H3, FILL_HDR);
    cellText(pg, "ปริมาณ", colX[2], r3Bot, CL[2], H2 + H3, bold, 10, "center");
    rect(pg, colX[3], r3Bot, CL[3], H2 + H3, FILL_HDR);
    cellText(pg, "หน่วย", colX[3], r3Bot, CL[3], H2 + H3, bold, 10, "center");

    rect(pg, colX[4], r2Bot, CL[4] + CL[5], H2, FILL_HDR);
    cellText(pg, "ค่าวัสดุ", colX[4], r2Bot, CL[4] + CL[5], H2, bold, 10, "center");
    rect(pg, colX[6], r2Bot, CL[6] + CL[7], H2, FILL_HDR);
    cellText(pg, "ค่าแรงงาน", colX[6], r2Bot, CL[6] + CL[7], H2, bold, 10, "center");

    rect(pg, colX[8], r3Bot, CL[8], H2 + H3, FILL_HDR);
    cellText(pg, "รวมเป็นเงิน", colX[8], r3Bot, CL[8], H2 + H3, bold, 10, "center");
    rect(pg, colX[9], r3Bot, CL[9], H2 + H3, FILL_HDR);
    cellText(pg, "หมายเหตุ", colX[9], r3Bot, CL[9], H2 + H3, bold, 10, "center");

    // Row 3: sub-headers for cols 4–7
    for (const [i, label] of [[4, "ราคา/หน่วย"], [5, "เป็นเงิน"], [6, "ราคา/หน่วย"], [7, "เป็นเงิน"]] as [number, string][]) {
      rect(pg, colX[i], r3Bot, CL[i], H3, FILL_HDR);
      cellText(pg, label, colX[i], r3Bot, CL[i], H3, bold, 9, "center");
    }
  }

  let lPg = pdfDoc.addPage([LW, LH]);
  drawLandscapeHeader(lPg);
  let curLY = HEADER_BOT_Y;

  function ensureLandscapePage() {
    if (curLY - ROW_HL < BOTTOM_MG) {
      lPg = pdfDoc.addPage([LW, LH]);
      drawLandscapeHeader(lPg);
      curLY = HEADER_BOT_Y;
    }
  }

  function drawLandscapeRow(ln: SnapshotLine) {
    ensureLandscapePage();
    const y = curLY - ROW_HL;
    curLY = y;

    for (let i = 0; i < CL.length; i++) {
      lPg.drawRectangle({
        x: colX[i], y, width: CL[i], height: ROW_HL,
        borderWidth: 0.5, borderColor: rgb(0.45, 0.45, 0.45),
      });
    }

    if (ln.lineType === "SECTION") {
      if (ln.itemNo) cellText(lPg, ln.itemNo, colX[0], y, CL[0], ROW_HL, bold, 10, "center");
      dtUnderline(lPg, ln.description, colX[1] + 3, y + 5, 10, bold);
    } else if (ln.lineType === "NOTE") {
      dt(lPg, ln.description, colX[1] + 12, y + 5, 10, font);
    } else {
      const vals = [
        ln.itemNo ?? "",
        ln.description ?? "",
        ln.quantity ? formatMoney(toNumber(ln.quantity, 0)) : "",
        ln.unit ?? "",
        ln.materialUnitPrice ? formatMoney(toNumber(ln.materialUnitPrice, 0)) : "",
        ln.materialAmount ? formatMoney(toNumber(ln.materialAmount, 0)) : "",
        ln.laborUnitPrice ? formatMoney(toNumber(ln.laborUnitPrice, 0)) : "",
        ln.laborAmount ? formatMoney(toNumber(ln.laborAmount, 0)) : "",
        ln.lineTotal ? formatMoney(toNumber(ln.lineTotal, 0)) : "",
        ln.remark ?? "",
      ];
      const aligns: ("left" | "center" | "right")[] = [
        "center", "left", "right", "center",
        "right", "right", "right", "right", "right", "center",
      ];
      for (let i = 0; i < CL.length; i++) {
        if (i === 1) {
          dt(lPg, vals[i], colX[i] + 4, y + 5, 10, font);
        } else {
          cellText(lPg, vals[i], colX[i], y, CL[i], ROW_HL, font, 10, aligns[i]);
        }
      }
    }
  }

  snapshot.lines.forEach(drawLandscapeRow);

  // ── Summary rows ─────────────────────────────────────────────────────────────
  const summaryRows: [string, number, boolean][] = [
    ["SUB - TOTAL", pr.subtotal, false],
    [`OVERHEAD (${pr.overheadPercent}%)`, pr.overheadAmount, false],
    ["TOTAL", pr.total, false],
    ["DISCOUNT", pr.discount, false],
    ["GRAND TOTAL", pr.grandTotal, true],
  ];

  for (const [label, amount, isGrand] of summaryRows) {
    ensureLandscapePage();
    const y = curLY - ROW_HL;
    curLY = y;
    const fill = isGrand ? FILL_GRAND : FILL_SUMMARY;

    lPg.drawRectangle({
      x: colX[0], y, width: colX[8] - colX[0], height: ROW_HL,
      borderWidth: 0.8, borderColor: rgb(0.3, 0.3, 0.3),
      color: rgb(fill[0], fill[1], fill[2]),
    });
    lPg.drawRectangle({
      x: colX[8], y, width: CL[8], height: ROW_HL,
      borderWidth: 0.8, borderColor: rgb(0.3, 0.3, 0.3),
      color: rgb(fill[0], fill[1], fill[2]),
    });
    lPg.drawRectangle({
      x: colX[9], y, width: CL[9], height: ROW_HL,
      borderWidth: 0.8, borderColor: rgb(0.3, 0.3, 0.3),
      color: rgb(fill[0], fill[1], fill[2]),
    });

    dt(lPg, label, colX[0] + 6, y + 6, 11, bold);
    cellText(lPg, formatMoney(amount), colX[8], y, CL[8], ROW_HL, bold, 11, "right");
  }

  return pdfDoc.save();
}
