import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcLineAmounts, calcProjectTotals, toNumber } from "@/lib/project-file";
import { getNextProjectCode } from "@/lib/running-number";
import { parseDateInput } from "@/lib/date";
import { formatApiError } from "@/lib/api-error";

type RequestLine = {
  sortOrder?: number;
  lineType?: "SECTION" | "ITEM" | "NOTE";
  itemNo?: string | null;
  description?: string;
  quantity?: number | null;
  unit?: string | null;
  materialUnitPrice?: number | null;
  materialAmount?: number | null;
  laborUnitPrice?: number | null;
  laborAmount?: number | null;
  lineTotal?: number | null;
  remark?: string | null;
};

function bangkokTodayStart() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return new Date(`${year}-${month}-${day}T00:00:00+07:00`);
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.projectFile.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      projectCode: true,
      projectName: true,
      quotationDate: true,
      status: true,
      grandTotal: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const lines = (Array.isArray(body.lines) ? body.lines : []) as RequestLine[];
    const normalizedLines = lines.map((line, idx) => {
      const lineType = line.lineType ?? "ITEM";
      const description = (line.description ?? "").trim();
      const amounts = calcLineAmounts({
        sortOrder: line.sortOrder ?? idx + 1,
        lineType,
        description,
        itemNo: line.itemNo ?? null,
        quantity: line.quantity ?? null,
        unit: line.unit ?? null,
        materialUnitPrice: line.materialUnitPrice ?? null,
        materialAmount: line.materialAmount ?? null,
        laborUnitPrice: line.laborUnitPrice ?? null,
        laborAmount: line.laborAmount ?? null,
        lineTotal: line.lineTotal ?? null,
        remark: line.remark ?? null,
      });

      return {
        sortOrder: line.sortOrder ?? idx + 1,
        lineType,
        itemNo: line.itemNo ?? null,
        description,
        quantity: amounts.quantity,
        unit: line.unit ?? null,
        materialUnitPrice: amounts.materialUnitPrice,
        materialAmount: amounts.materialAmount,
        laborUnitPrice: amounts.laborUnitPrice,
        laborAmount: amounts.laborAmount,
        lineTotal: amounts.lineTotal,
        remark: line.remark ?? null,
      };
    });

    const totals = calcProjectTotals(
      normalizedLines,
      toNumber(body.overheadPercent, 0),
      toNumber(body.discount, 0)
    );

    let createdId: string | null = null;
    for (let i = 0; i < 5; i++) {
      try {
        const projectCode = await getNextProjectCode();
        const created = await prisma.projectFile.create({
          data: {
            projectCode,
            projectName: (body.projectName as string | undefined)?.trim() || "โครงการใหม่",
            subject: (body.subject as string | undefined)?.trim() || null,
            quotationNo: (body.quotationNo as string | undefined)?.trim() || null,
            revisionNo: (body.revisionNo as string | undefined)?.trim() || "Rev.1",
            quotationDate: parseDateInput(body.quotationDate) ?? bangkokTodayStart(),
            customerName: (body.customerName as string | undefined)?.trim() || null,
            billTo: (body.billTo as string | undefined)?.trim() || null,
            dear: (body.dear as string | undefined)?.trim() || null,
            supervisorName: (body.supervisorName as string | undefined)?.trim() || null,
            paymentTermsText: (body.paymentTermsText as string | undefined)?.trim() || null,
            amountTextTh: (body.amountTextTh as string | undefined)?.trim() || null,
            status:
              (body.status as "DRAFT" | "CONFIRMED" | "APPROVED" | undefined) ??
              "DRAFT",
            subtotal: totals.subtotal,
            overheadPercent: totals.overheadPercent,
            overheadAmount: totals.overheadAmount,
            total: totals.total,
            discount: totals.discount,
            grandTotal: totals.grandTotal,
            createdById: session.user?.id ?? null,
          },
        });
        createdId = created.id;

        if (normalizedLines.length > 0) {
          for (const line of normalizedLines) {
            await prisma.projectFileLine.create({
              data: {
                ...line,
                projectFileId: created.id,
              },
            });
          }
        }
        break;
      } catch (error) {
        const message = String(error);
        if (!message.includes("Unique constraint") && !message.includes("P2002")) {
          throw error;
        }
      }
    }

    if (!createdId) {
      return NextResponse.json(
        { error: "ไม่สามารถออกเลขใบเสนอราคาอัตโนมัติได้ กรุณาลองใหม่" },
        { status: 500 }
      );
    }

    const created = await prisma.projectFile.findUnique({
      where: { id: createdId },
      include: { lines: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("project-files POST error:", error);
    const formatted = formatApiError(error);
    return NextResponse.json(
      { error: formatted.error, detail: formatted.detail },
      { status: formatted.status }
    );
  }
}
