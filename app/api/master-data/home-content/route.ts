import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildHomeContent,
  defaultHomeContent,
  HOME_CONTENT_CATEGORY,
  HOME_SERVICE_COUNT,
  HOME_SLIDE_COUNT,
} from "@/lib/home-content";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.masterData.findMany({
    where: { category: HOME_CONTENT_CATEGORY, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(buildHomeContent(rows));
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const slides = Array.isArray(body?.slides) ? body.slides : [];
  const services = Array.isArray(body?.services) ? body.services : [];
  const servicesTitle = (body?.servicesTitle as string | undefined)?.trim() ?? "";
  const servicesSubtitle =
    (body?.servicesSubtitle as string | undefined)?.trim() ?? "";

  if (!servicesTitle || !servicesSubtitle) {
    return NextResponse.json(
      { error: "กรุณากรอกหัวข้อและคำอธิบายส่วนบริการให้ครบถ้วน" },
      { status: 400 }
    );
  }

  if (slides.length !== HOME_SLIDE_COUNT || services.length !== HOME_SERVICE_COUNT) {
    return NextResponse.json(
      { error: "ข้อมูลหน้าแรกไม่ครบถ้วน" },
      { status: 400 }
    );
  }

  const entries = [
    {
      key: "SERVICES_SECTION_TITLE",
      value: servicesTitle,
      label: "หัวข้อส่วนบริการ",
      sortOrder: 1,
    },
    {
      key: "SERVICES_SECTION_SUBTITLE",
      value: servicesSubtitle,
      label: "คำอธิบายส่วนบริการ",
      sortOrder: 2,
    },
    ...defaultHomeContent.slides.flatMap((slide, idx) => {
      const item = slides[idx] ?? {};
      const index = idx + 1;
      const image = (item.image as string | undefined)?.trim() || slide.image;
      const title = (item.title as string | undefined)?.trim() || slide.title;
      const subtitle =
        (item.subtitle as string | undefined)?.trim() || slide.subtitle;

      return [
        {
          key: `SLIDE_${index}_IMAGE`,
          value: image,
          label: `รูปภาพสไลด์ ${index}`,
          sortOrder: 100 + index * 10,
        },
        {
          key: `SLIDE_${index}_TITLE`,
          value: title,
          label: `หัวข้อสไลด์ ${index}`,
          sortOrder: 101 + index * 10,
        },
        {
          key: `SLIDE_${index}_SUBTITLE`,
          value: subtitle,
          label: `คำอธิบายสไลด์ ${index}`,
          sortOrder: 102 + index * 10,
        },
      ];
    }),
    ...defaultHomeContent.services.flatMap((service, idx) => {
      const item = services[idx] ?? {};
      const index = idx + 1;
      const title = (item.title as string | undefined)?.trim() || service.title;
      const desc = (item.desc as string | undefined)?.trim() || service.desc;

      return [
        {
          key: `SERVICE_${index}_TITLE`,
          value: title,
          label: `หัวข้อบริการ ${index}`,
          sortOrder: 200 + index * 10,
        },
        {
          key: `SERVICE_${index}_DESC`,
          value: desc,
          label: `คำอธิบายบริการ ${index}`,
          sortOrder: 201 + index * 10,
        },
      ];
    }),
  ];

  try {
    for (const entry of entries) {
      await prisma.masterData.upsert({
        where: {
          category_key: {
            category: HOME_CONTENT_CATEGORY,
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
          category: HOME_CONTENT_CATEGORY,
          key: entry.key,
          value: entry.value,
          label: entry.label,
          sortOrder: entry.sortOrder,
          isActive: true,
        },
      });
    }
  } catch (error) {
    console.error("home-content PUT error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถบันทึกข้อมูลหน้าแรกได้" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
