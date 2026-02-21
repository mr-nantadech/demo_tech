import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.jobHistory.findMany({
    orderBy: { createdAt: "desc" },
    include: { quotation: { select: { quotationNo: true } } },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { quotationId, jobName, clientName, startDate, endDate, description, amount, status } = body;

  if (!jobName || !clientName) {
    return NextResponse.json(
      { error: "jobName and clientName are required" },
      { status: 400 }
    );
  }

  const job = await prisma.jobHistory.create({
    data: {
      quotationId: quotationId || null,
      jobName,
      clientName,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      description,
      amount,
      status,
    },
  });

  return NextResponse.json(job, { status: 201 });
}
