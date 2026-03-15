import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "node:fs/promises";
import path from "node:path";

type Params = { params: Promise<{ id: string; imageId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, imageId } = await params;

  const image = await prisma.albumImage.findUnique({ where: { id: imageId } });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete file from disk
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", "albums", id, image.filename);
    await unlink(filePath);
  } catch {
    // ignore missing file
  }

  await prisma.albumImage.delete({ where: { id: imageId } });
  return NextResponse.json({ ok: true });
}
