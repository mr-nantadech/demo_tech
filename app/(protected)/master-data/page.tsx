import AppShell from "@/components/layout/AppShell";
import MasterDataTabs from "@/components/master-data/MasterDataTabs";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

export const metadata = { title: "ข้อมูลหลัก | NBA Tech Engineer" };

export default function MasterDataPage() {
  return (
    <AppShell>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          ข้อมูลหลัก (Master Data)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          จัดการข้อมูลอ้างอิงที่ใช้ในระบบ
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <MasterDataTabs />
    </AppShell>
  );
}
