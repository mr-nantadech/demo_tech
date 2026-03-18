import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ABOUT_CONTENT_CATEGORY,
  buildAboutContent,
  defaultAboutContent,
} from "@/lib/about-content";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.masterData.findMany({
    where: { category: ABOUT_CONTENT_CATEGORY, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(buildAboutContent(rows));
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const pageTitle = (body?.pageTitle as string | undefined)?.trim() ?? "";
  const pageSubtitle = (body?.pageSubtitle as string | undefined)?.trim() ?? "";
  const companyTagline =
    (body?.companyTagline as string | undefined)?.trim() ?? "";
  const companyIntro = (body?.companyIntro as string | undefined)?.trim() ?? "";
  const expertiseTitle =
    (body?.expertiseTitle as string | undefined)?.trim() ?? "";
  const expertiseItems = Array.isArray(body?.expertiseItems)
    ? body.expertiseItems
        .map((item: unknown) => String(item).trim())
        .filter(Boolean)
    : defaultAboutContent.expertiseItems;

  if (
    !pageTitle ||
    !pageSubtitle ||
    !companyTagline ||
    !companyIntro ||
    !expertiseTitle ||
    expertiseItems.length === 0
  ) {
    return NextResponse.json(
      { error: "กรุณากรอกข้อมูลหน้าเกี่ยวกับเราให้ครบถ้วน" },
      { status: 400 }
    );
  }

  const entries = [
    { key: "PAGE_TITLE", value: pageTitle, label: "หัวข้อหน้า", sortOrder: 1 },
    {
      key: "PAGE_SUBTITLE",
      value: pageSubtitle,
      label: "คำอธิบายใต้หัวข้อ",
      sortOrder: 2,
    },
    {
      key: "COMPANY_TAGLINE",
      value: companyTagline,
      label: "คำโปรยบริษัท",
      sortOrder: 3,
    },
    {
      key: "COMPANY_INTRO",
      value: companyIntro,
      label: "ข้อความแนะนำบริษัท",
      sortOrder: 4,
    },
    {
      key: "EXPERTISE_TITLE",
      value: expertiseTitle,
      label: "หัวข้อความเชี่ยวชาญ",
      sortOrder: 5,
    },
    {
      key: "EXPERTISE_ITEMS",
      value: expertiseItems.join("\n"),
      label: "รายการความเชี่ยวชาญ",
      sortOrder: 6,
    },
  ];

  try {
    for (const entry of entries) {
      await prisma.masterData.upsert({
        where: {
          category_key: {
            category: ABOUT_CONTENT_CATEGORY,
            key: entry.key,
          },
        },
        update: {
          value: entry.value,
          label: entry.label,
          sortOrder: entry.sortOrder,
          isActive: true,
        },
        create: {
          category: ABOUT_CONTENT_CATEGORY,
          key: entry.key,
          value: entry.value,
          label: entry.label,
          sortOrder: entry.sortOrder,
          isActive: true,
        },
      });
    }
  } catch (error) {
    console.error("about-content PUT error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถบันทึกข้อมูลหน้าเกี่ยวกับเราได้" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
