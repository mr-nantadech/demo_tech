import AppShell from "@/components/layout/AppShell";
import JobHistoryTable from "@/components/history-job/JobHistoryTable";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import LinkButton from "@/components/ui/LinkButton";
import AddIcon from "@mui/icons-material/Add";

export const metadata = { title: "ประวัติการรับงาน | NBA Tech Engineer" };

export default function HistoryJobPage() {
  return (
    <AppShell>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">ประวัติการรับงาน</Typography>
          <Typography variant="body2" color="text.secondary">บันทึกและค้นหาประวัติการรับงานทั้งหมด</Typography>
        </Box>
        <LinkButton href="/history-job/new" variant="contained" startIcon={<AddIcon />}>
          เพิ่มประวัติงาน
        </LinkButton>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <JobHistoryTable />
    </AppShell>
  );
}
