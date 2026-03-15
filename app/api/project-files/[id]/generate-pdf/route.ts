import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateProjectFilePdf } from "@/lib/project-file-pdf";
import { put } from "@vercel/blob";
import { formatApiError } from "@/lib/api-error";

function sanitizeFilename(value: string) {
  return value.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_").slice(0, 120);
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.projectFile.findUnique({
      where: { id },
      include: { lines: { orderBy: { sortOrder: "asc" } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const latestVersion = await prisma.projectFileVersion.findFirst({
      where: { projectFileId: id },
      orderBy: { versionNo: "desc" },
    });
    const nextVersionNo = (latestVersion?.versionNo ?? 0) + 1;

    // Fetch company profile from master data
    const companyRows = await prisma.masterData.findMany({
      where: {
        category: "COMPANY_PROFILE",
        key: { in: ["COMPANY_NAME", "REGISTRATION_NO", "ADDRESS", "PHONE"] },
        isActive: true,
      },
    });
    const byKey = new Map(companyRows.map((r) => [r.key, r.value]));
    const company = {
      name: byKey.get("COMPANY_NAME") ?? "",
      registrationNo: byKey.get("REGISTRATION_NO") ?? "",
      address: byKey.get("ADDRESS") ?? "",
      phone: byKey.get("PHONE") ?? "",
    };

    const snapshot = {
      company,
      project: {
        projectCode: project.projectCode,
        projectName: project.projectName,
        subject: project.subject,
        quotationNo: project.quotationNo,
        revisionNo: project.revisionNo,
        quotationDate: project.quotationDate?.toISOString().slice(0, 10) ?? null,
        billTo: project.billTo,
        dear: project.dear,
        supervisorName: project.supervisorName,
        paymentTermsText: project.paymentTermsText,
        amountTextTh: project.amountTextTh,
        subtotal: Number(project.subtotal),
        overheadPercent: Number(project.overheadPercent),
        overheadAmount: Number(project.overheadAmount),
        total: Number(project.total),
        discount: Number(project.discount),
        grandTotal: Number(project.grandTotal),
      },
      lines: project.lines.map((line) => ({
        lineType: line.lineType,
        itemNo: line.itemNo,
        description: line.description,
        quantity: line.quantity ? Number(line.quantity) : null,
        unit: line.unit,
        materialUnitPrice: line.materialUnitPrice ? Number(line.materialUnitPrice) : null,
        materialAmount: line.materialAmount ? Number(line.materialAmount) : null,
        laborUnitPrice: line.laborUnitPrice ? Number(line.laborUnitPrice) : null,
        laborAmount: line.laborAmount ? Number(line.laborAmount) : null,
        lineTotal: line.lineTotal ? Number(line.lineTotal) : null,
        remark: line.remark,
      })),
    };

    const pdfBytes = await generateProjectFilePdf({ ...snapshot });
    const fileName = `${sanitizeFilename(project.projectCode)}-v${nextVersionNo}.pdf`;
    const blob = await put(`project-files/${fileName}`, Buffer.from(pdfBytes), {
      access: "public",
      contentType: "application/pdf",
    });
    const publicPath = blob.url;

    await prisma.projectFileVersion.create({
      data: {
        projectFileId: id,
        versionNo: nextVersionNo,
        snapshot,
        pdfPath: publicPath,
      },
    });

    return NextResponse.json({
      success: true,
      versionNo: nextVersionNo,
      pdfPath: publicPath,
    });
  } catch (error) {
    console.error("generate-pdf POST error:", error);
    const formatted = formatApiError(error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างไฟล์ PDF ได้", detail: formatted.detail ?? String(error) },
      { status: 500 }
    );
  }
}
