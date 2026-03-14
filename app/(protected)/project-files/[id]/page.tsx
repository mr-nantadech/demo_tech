import AppShell from "@/components/layout/AppShell";
import ProjectFileEditor from "@/components/project-file/ProjectFileEditor";
import LinkButton from "@/components/ui/LinkButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata = { title: "แก้ไขใบเสนอราคา | NBA Tech Engineer" };

export default async function ProjectFileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await prisma.projectFile.findUnique({
    where: { id },
    include: {
      lines: { orderBy: { sortOrder: "asc" } },
      versions: { orderBy: { versionNo: "desc" }, take: 10 },
    },
  });

  if (!data) notFound();

  return (
    <AppShell maxWidth={false}>
      <Box sx={{ mb: 2 }}>
        <LinkButton href="/project-files" startIcon={<ArrowBackIcon />} variant="text" sx={{ mb: 1 }}>
          กลับไปหน้ารายการ
        </LinkButton>
        <Typography variant="h5" fontWeight={700} color="primary">
          แก้ไขใบเสนอราคา
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <ProjectFileEditor
        initialData={{
          ...data,
          subtotal: Number(data.subtotal),
          overheadPercent: Number(data.overheadPercent),
          overheadAmount: Number(data.overheadAmount),
          total: Number(data.total),
          discount: Number(data.discount),
          grandTotal: Number(data.grandTotal),
          quotationDate: data.quotationDate?.toISOString() ?? null,
          createdAt: data.createdAt.toISOString(),
          updatedAt: data.updatedAt.toISOString(),
          customerName: data.customerName ?? null,
          lines: data.lines.map((line) => ({
            ...line,
            itemNo: line.itemNo ?? "",
            unit: line.unit ?? "",
            remark: line.remark ?? "",
            quantity: line.quantity ? Number(line.quantity) : null,
            materialUnitPrice: line.materialUnitPrice
              ? Number(line.materialUnitPrice)
              : null,
            materialAmount: line.materialAmount ? Number(line.materialAmount) : null,
            laborUnitPrice: line.laborUnitPrice ? Number(line.laborUnitPrice) : null,
            laborAmount: line.laborAmount ? Number(line.laborAmount) : null,
            lineTotal: line.lineTotal ? Number(line.lineTotal) : null,
          })),
          versions: data.versions.map((v) => ({
            id: v.id,
            versionNo: v.versionNo,
            pdfPath: v.pdfPath,
            createdAt: v.createdAt.toISOString(),
          })),
        }}
      />
    </AppShell>
  );
}

