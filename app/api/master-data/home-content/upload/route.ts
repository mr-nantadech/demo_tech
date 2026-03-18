import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "กรุณาเลือกรูปภาพ" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
    const filename = `home-slides/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.webp`;

    const blob = await put(filename, webpBuffer, {
      access: "public",
      contentType: "image/webp",
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    console.error("home-content upload error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถอัปโหลดรูปสไลด์ได้" },
      { status: 500 }
    );
  }
}
