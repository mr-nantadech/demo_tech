import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcLineAmounts, calcProjectTotals, toNumber } from "@/lib/project-file";
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await prisma.projectFile.findUnique({
    where: { id },
    include: {
      lines: { orderBy: { sortOrder: "asc" } },
      versions: { orderBy: { versionNo: "desc" }, take: 10 },
    },
  });

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.projectFile.findUnique({
      where: { id },
      select: { status: true, projectName: true, customerName: true, billTo: true, quotationDate: true, grandTotal: true },
    });

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

    await prisma.projectFile.update({
      where: { id },
      data: {
        projectName: (body.projectName as string | undefined)?.trim() || undefined,
        subject: (body.subject as string | undefined)?.trim() || null,
        quotationNo: (body.quotationNo as string | undefined)?.trim() || null,
        revisionNo: (body.revisionNo as string | undefined)?.trim() || "Rev.1",
        quotationDate: parseDateInput(body.quotationDate),
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
      },
    });

    await prisma.projectFileLine.deleteMany({ where: { projectFileId: id } });
    for (const line of normalizedLines) {
      await prisma.projectFileLine.create({
        data: { ...line, projectFileId: id },
      });
    }

    const updated = await prisma.projectFile.findUnique({
      where: { id },
      include: { lines: { orderBy: { sortOrder: "asc" } } },
    });

    const newStatus = (body.status as string | undefined) ?? "DRAFT";
    const jobName = (body.projectName as string | undefined)?.trim() || existing?.projectName || "ไม่ระบุชื่องาน";
    const clientName = (body.customerName as string | undefined)?.trim() || (body.billTo as string | undefined)?.trim() || existing?.customerName || existing?.billTo || "ไม่ระบุลูกค้า";

    if (newStatus === "CONFIRMED" && existing?.status !== "CONFIRMED") {
      await prisma.jobHistory.create({
        data: {
          jobName,
          clientName,
          startDate: null,
          amount: totals.grandTotal,
          status: "IN_PROGRESS",
          projectFileId: id,
        },
      });
    } else if (newStatus === "CONFIRMED") {
      const linkedHistory = await prisma.jobHistory.findUnique({
        where: { projectFileId: id },
      });
      if (linkedHistory) {
        await prisma.jobHistory.update({
          where: { id: linkedHistory.id },
          data: { jobName, clientName, amount: totals.grandTotal },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("project-files PUT error:", error);
    const formatted = formatApiError(error);
    return NextResponse.json(
      { error: formatted.error, detail: formatted.detail },
      { status: formatted.status }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.projectFile.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
