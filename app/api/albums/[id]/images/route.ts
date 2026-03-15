import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import sharp from "sharp";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const album = await prisma.album.findUnique({ where: { id } });
  if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });

  const formData = await req.formData();
  const files = formData.getAll("file") as File[];
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

  const created = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();

    const filename = `albums/${id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const blob = await put(filename, webpBuffer, {
      access: "public",
      contentType: "image/webp",
    });

    const lastImage = await prisma.albumImage.findFirst({
      where: { albumId: id },
      orderBy: { sortOrder: "desc" },
    });
    const sortOrder = (lastImage?.sortOrder ?? -1) + 1;

    const image = await prisma.albumImage.create({
      data: { albumId: id, url: blob.url, sortOrder },
    });
    created.push(image);
  }

  revalidatePath("/portfolio");
  return NextResponse.json(created, { status: 201 });
}
