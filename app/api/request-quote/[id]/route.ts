import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatApiError } from "@/lib/api-error";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await prisma.quoteRequest.findUnique({ where: { id } });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
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
    const {
      contactName,
      companyName,
      phone,
      email,
      serviceType,
      details,
      internalNote,
      followUpAt,
      status,
    } = body;

    if (!contactName || !phone || !serviceType || !details || !status) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const item = await prisma.quoteRequest.update({
      where: { id },
      data: {
        contactName: contactName.trim(),
        companyName: companyName?.trim() || null,
        phone: phone.trim(),
        email: email?.trim() || null,
        serviceType: serviceType.trim(),
        details: details.trim(),
        internalNote: internalNote?.trim() || null,
        followUpAt: followUpAt ? new Date(followUpAt) : null,
        status,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("request-quote PUT error:", error);
    const formatted = formatApiError(error);
    return NextResponse.json(
      { error: formatted.error, detail: formatted.detail },
      { status: formatted.status }
    );
  }
}
