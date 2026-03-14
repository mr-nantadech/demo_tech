import AppShell from "@/components/layout/AppShell";
import ProjectFileEditor from "@/components/project-file/ProjectFileEditor";
import LinkButton from "@/components/ui/LinkButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

export const metadata = { title: "สร้างใบเสนอราคา | NBA Tech Engineer" };

export default function NewProjectFilePage() {
  return (
    <AppShell maxWidth={false}>
      <Box sx={{ mb: 2 }}>
        <LinkButton href="/project-files" startIcon={<ArrowBackIcon />} variant="text" sx={{ mb: 1 }}>
          กลับไปหน้ารายการ
        </LinkButton>
        <Typography variant="h5" fontWeight={700} color="primary">
          สร้างใบเสนอราคาใหม่
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <ProjectFileEditor initialData={null} />
    </AppShell>
  );
}

