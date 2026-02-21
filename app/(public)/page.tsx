import AppShell from "@/components/layout/AppShell";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import LinkButton from "@/components/ui/LinkButton";
import EngineeringIcon from "@mui/icons-material/Engineering";
import DescriptionIcon from "@mui/icons-material/Description";
import HistoryIcon from "@mui/icons-material/History";
import StorageIcon from "@mui/icons-material/Storage";

export default function HomePage() {
  return (
    <AppShell noPadding>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)",
          color: "#fff",
          py: { xs: 8, md: 12 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <EngineeringIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" fontWeight={700} gutterBottom>
            NBA Tech Engineer
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, mb: 4, fontWeight: 300 }}>
            ระบบจัดการใบเสนอราคาและประวัติการรับงานสำหรับวิศวกร
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <LinkButton
              href="/portfolio"
              variant="outlined"
              color="inherit"
              size="large"
              sx={{ borderColor: "rgba(255,255,255,0.6)", px: 4 }}
            >
              ดู Portfolio
            </LinkButton>
            <LinkButton
              href="/login"
              variant="contained"
              size="large"
              sx={{ bgcolor: "secondary.main", px: 4, "&:hover": { bgcolor: "secondary.dark" } }}
            >
              เข้าสู่ระบบ
            </LinkButton>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" gutterBottom fontWeight={600} color="primary">
          ฟีเจอร์หลัก
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          ระบบครบวงจรสำหรับการจัดการงานวิศวกรรม
        </Typography>

        <Grid container spacing={3}>
          {[
            {
              icon: <DescriptionIcon sx={{ fontSize: 48, color: "primary.main" }} />,
              title: "ใบเสนอราคา",
              desc: "สร้าง ติดตาม และจัดการใบเสนอราคา (Quotation) ได้อย่างมีระบบ พร้อมสถานะการดำเนินการ",
              href: "/quotation",
            },
            {
              icon: <HistoryIcon sx={{ fontSize: 48, color: "secondary.main" }} />,
              title: "ประวัติการรับงาน",
              desc: "บันทึกและค้นหาประวัติการรับงานทั้งหมด พร้อมเชื่อมโยงกับใบเสนอราคา",
              href: "/history-job",
            },
            {
              icon: <StorageIcon sx={{ fontSize: 48, color: "success.main" }} />,
              title: "ข้อมูลหลัก",
              desc: "จัดการข้อมูลอ้างอิง (Master Data) ที่ใช้ในระบบ เช่น หมวดหมู่งาน ประเภทลูกค้า",
              href: "/master-data",
            },
          ].map((item) => (
            <Grid size={{ xs: 12, md: 4 }} key={item.title}>
              <Card
                sx={{
                  height: "100%",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 4 }}>
                  {item.icon}
                  <Typography variant="h6" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {item.desc}
                  </Typography>
                  <LinkButton href={item.href} variant="outlined" color="primary" size="small">
                    ดูเพิ่มเติม
                  </LinkButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </AppShell>
  );
}
