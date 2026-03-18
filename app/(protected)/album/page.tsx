import AppShell from "@/components/layout/AppShell";
import AlbumManager from "@/components/album/AlbumManager";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

export const metadata = { title: "จัดการอัลบั้ม | Demo Tech Engineer" };

export default function AlbumPage() {
  return (
    <AppShell>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          จัดการอัลบั้ม
        </Typography>
        <Typography variant="body2" color="text.secondary">
          สร้างและจัดการอัลบั้มรูปภาพผลงาน
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <AlbumManager />
    </AppShell>
  );
}
