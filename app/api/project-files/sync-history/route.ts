import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const confirmed = await prisma.projectFile.findMany({
    where: { status: "CONFIRMED" },
    select: {
      id: true,
      projectName: true,
      customerName: true,
      billTo: true,
      quotationDate: true,
      grandTotal: true,
    },
  });

  let created = 0;
  for (const pf of confirmed) {
    const exists = await prisma.jobHistory.findUnique({
      where: { projectFileId: pf.id },
    });
    if (!exists) {
      const clientName = pf.customerName || pf.billTo || "ไม่ระบุลูกค้า";
      await prisma.jobHistory.create({
        data: {
          jobName: pf.projectName,
          clientName,
          startDate: null,
          amount: Number(pf.grandTotal),
          status: "IN_PROGRESS",
          projectFileId: pf.id,
        },
      });
      created++;
    }
  }

  return NextResponse.json({ synced: created, total: confirmed.length });
}
