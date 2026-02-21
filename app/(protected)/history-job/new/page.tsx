import AppShell from "@/components/layout/AppShell";
import JobHistoryForm from "@/components/history-job/JobHistoryForm";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import LinkButton from "@/components/ui/LinkButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const metadata = { title: "เพิ่มประวัติงาน | NBA Tech Engineer" };

export default function NewHistoryJobPage() {
  return (
    <AppShell maxWidth="md">
      <Box sx={{ mb: 2 }}>
        <LinkButton href="/history-job" startIcon={<ArrowBackIcon />} variant="text" sx={{ mb: 1 }}>
          กลับไปรายการ
        </LinkButton>
        <Typography variant="h5" fontWeight={700} color="primary">เพิ่มประวัติการรับงาน</Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <JobHistoryForm />
    </AppShell>
  );
}
