import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const newCount = rows.filter((row) => row.status === "NEW").length;

  return NextResponse.json({
    rows,
    summary: {
      newCount,
      total: rows.length,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contactName, companyName, phone, email, serviceType, details } = body;

    if (!contactName || !phone || !serviceType || !details) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" }, { status: 400 });
    }

    const record = await prisma.quoteRequest.create({
      data: {
        contactName: contactName.trim(),
        companyName: companyName?.trim() || null,
        phone: phone.trim(),
        email: email?.trim() || null,
        serviceType,
        details: details.trim(),
      },
    });

    return NextResponse.json({ success: true, id: record.id }, { status: 201 });
  } catch (error) {
    console.error("request-quote POST error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
