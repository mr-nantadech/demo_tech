import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

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

  revalidatePath("/portfolio");
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

  // Delete blobs from Vercel Blob storage
  const urls = album.images.map((img) => img.url).filter(Boolean);
  if (urls.length > 0) {
    try {
      await del(urls);
    } catch {
      // ignore errors
    }
  }

  await prisma.album.delete({ where: { id } });
  revalidatePath("/portfolio");
  return NextResponse.json({ ok: true });
}
