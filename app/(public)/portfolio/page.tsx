import AppShell from "@/components/layout/AppShell";
import PortfolioView from "@/components/album/PortfolioView";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "ผลงาน | NBA Tech Engineer" };

export default async function PortfolioPage() {
  const albums = await prisma.album.findMany({
    where: { isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <AppShell>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          ผลงาน
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ผลงานที่ผ่านมาของทีม NBA Tech Engineer
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>

      <PortfolioView albums={albums} />
    </AppShell>
  );
}
