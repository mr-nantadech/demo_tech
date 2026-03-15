import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink, rmdir } from "node:fs/promises";
import path from "node:path";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const album = await prisma.album.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(album);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, description, sortOrder, isActive } = body;

  const album = await prisma.album.update({
    where: { id },
    data: {
      title: title?.trim(),
      description: description?.trim() || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json(album);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const album = await prisma.album.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete image files from disk
  const dir = path.join(process.cwd(), "public", "uploads", "albums", id);
  for (const img of album.images) {
    try {
      await unlink(path.join(dir, img.filename));
    } catch {
      // ignore missing files
    }
  }
  try {
    await rmdir(dir);
  } catch {
    // ignore if dir not empty or not exists
  }

  await prisma.album.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
