import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const masterData = await prisma.masterData.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json(masterData);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { category, key, value, label, sortOrder, isActive } = body;

  if (!category || !key || !value) {
    return NextResponse.json(
      { error: "category, key, and value are required" },
      { status: 400 }
    );
  }

  const data = await prisma.masterData.create({
    data: { category, key, value, label, sortOrder, isActive },
  });

  return NextResponse.json(data, { status: 201 });
}
