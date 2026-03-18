import AppShell from "@/components/layout/AppShell";
import ProjectFileTable from "@/components/project-file/ProjectFileTable";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import LinkButton from "@/components/ui/LinkButton";
import AddIcon from "@mui/icons-material/Add";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "ใบเสนอราคา | Demo Tech Engineer" };
export const dynamic = "force-dynamic";

export default async function ProjectFilesPage() {
  const rows = await prisma.projectFile.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      projectCode: true,
      projectName: true,
      quotationDate: true,
      status: true,
      grandTotal: true,
      updatedAt: true,
    },
  });

  return (
    <AppShell>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            ใบเสนอราคา
          </Typography>
          <Typography variant="body2" color="text.secondary">
            จัดการใบเสนอราคาและเอกสารประกอบโครงการ
          </Typography>
        </Box>
        <LinkButton href="/project-files/new" variant="contained" startIcon={<AddIcon />}>
          สร้างใบเสนอราคา
        </LinkButton>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <ProjectFileTable
        initialRows={rows.map((row) => ({
          ...row,
          grandTotal: Number(row.grandTotal),
          quotationDate: row.quotationDate?.toISOString() ?? null,
          updatedAt: row.updatedAt.toISOString(),
        }))}
      />
    </AppShell>
  );
}
