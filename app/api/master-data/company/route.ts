import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CATEGORY = "COMPANY_PROFILE";

const COMPANY_KEYS = {
  name: "COMPANY_NAME",
  registrationNo: "REGISTRATION_NO",
  address: "ADDRESS",
  phone: "PHONE",
} as const;

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.masterData.findMany({
    where: {
      category: CATEGORY,
      key: { in: Object.values(COMPANY_KEYS) },
      isActive: true,
    },
  });

  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  return NextResponse.json({
    name: byKey.get(COMPANY_KEYS.name) ?? "",
    registrationNo: byKey.get(COMPANY_KEYS.registrationNo) ?? "",
    address: byKey.get(COMPANY_KEYS.address) ?? "",
    phone: byKey.get(COMPANY_KEYS.phone) ?? "",
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = (body?.name as string | undefined)?.trim() ?? "";
  const registrationNo = (body?.registrationNo as string | undefined)?.trim() ?? "";
  const address = (body?.address as string | undefined)?.trim() ?? "";
  const phone = (body?.phone as string | undefined)?.trim() ?? "";

  if (!name || !registrationNo || !address || !phone) {
    return NextResponse.json(
      { error: "กรุณากรอกข้อมูลบริษัทให้ครบถ้วน" },
      { status: 400 }
    );
  }

  try {
    await prisma.masterData.upsert({
      where: { category_key: { category: CATEGORY, key: COMPANY_KEYS.name } },
      update: { value: name, label: "ชื่อบริษัท", sortOrder: 1, isActive: true },
      create: { category: CATEGORY, key: COMPANY_KEYS.name, value: name, label: "ชื่อบริษัท", sortOrder: 1, isActive: true },
    });
    await prisma.masterData.upsert({
      where: { category_key: { category: CATEGORY, key: COMPANY_KEYS.registrationNo } },
      update: { value: registrationNo, label: "เลขนิติบุคคล", sortOrder: 2, isActive: true },
      create: { category: CATEGORY, key: COMPANY_KEYS.registrationNo, value: registrationNo, label: "เลขนิติบุคคล", sortOrder: 2, isActive: true },
    });
    await prisma.masterData.upsert({
      where: { category_key: { category: CATEGORY, key: COMPANY_KEYS.address } },
      update: { value: address, label: "ที่อยู่", sortOrder: 3, isActive: true },
      create: { category: CATEGORY, key: COMPANY_KEYS.address, value: address, label: "ที่อยู่", sortOrder: 3, isActive: true },
    });
    await prisma.masterData.upsert({
      where: { category_key: { category: CATEGORY, key: COMPANY_KEYS.phone } },
      update: { value: phone, label: "เบอร์โทรศัพท์", sortOrder: 4, isActive: true },
      create: { category: CATEGORY, key: COMPANY_KEYS.phone, value: phone, label: "เบอร์โทรศัพท์", sortOrder: 4, isActive: true },
    });
  } catch (error) {
    console.error("company PUT error:", error);
    return NextResponse.json({ error: "ไม่สามารถบันทึกข้อมูลได้" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
