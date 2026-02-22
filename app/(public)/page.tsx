import AppShell from "@/components/layout/AppShell";
import HeroSlider from "@/components/home/HeroSlider";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import LinkButton from "@/components/ui/LinkButton";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import OpacityIcon from "@mui/icons-material/Opacity";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import ConstructionIcon from "@mui/icons-material/Construction";
import StorefrontIcon from "@mui/icons-material/Storefront";
import HandymanIcon from "@mui/icons-material/Handyman";

const services = [
  {
    no: 1,
    icon: <AcUnitIcon sx={{ fontSize: 40 }} />,
    title: "ติดตั้ง ซ่อมแซม และบำรุงรักษาระบบปรับอากาศ",
    desc: "ให้บริการติดตั้ง ซ่อมแซม บำรุงรักษา ตรวจสอบ และปรับปรุงเครื่องปรับอากาศ ระบบทำความเย็น และระบบระบายอากาศทุกชนิด",
    color: "#1565C0",
  },
  {
    no: 2,
    icon: <OpacityIcon sx={{ fontSize: 40 }} />,
    title: "ล้าง ซ่อม และเติมสารทำความเย็น",
    desc: "ให้บริการล้าง ซ่อม รีเช็ต รีชาร์จ ตรวจเช็ก และเติมสารทำความเย็นเครื่องปรับอากาศและระบบทำความเย็น",
    color: "#0288D1",
  },
  {
    no: 3,
    icon: <ElectricalServicesIcon sx={{ fontSize: 40 }} />,
    title: "ระบบไฟฟ้าและระบบควบคุมไฟฟ้า",
    desc: "ให้บริการออกแบบ ติดตั้ง ซ่อมแซม และบำรุงรักษาระบบไฟฟ้า ระบบควบคุมไฟฟ้า และระบบไฟฟ้าภายในอาคาร",
    color: "#F57C00",
  },
  {
    no: 4,
    icon: <ConstructionIcon sx={{ fontSize: 40 }} />,
    title: "รับเหมางานระบบวิศวกรรมประกอบอาคาร",
    desc: "รับเหมาติดตั้งงานระบบวิศวกรรมประกอบอาคาร ได้แก่ ระบบไฟฟ้า ระบบเครื่องกล ระบบปรับอากาศ และระบบที่เกี่ยวข้อง",
    color: "#2E7D32",
  },
  {
    no: 5,
    icon: <StorefrontIcon sx={{ fontSize: 40 }} />,
    title: "จำหน่ายเครื่องปรับอากาศและอุปกรณ์",
    desc: "จำหน่าย จัดหา เครื่องปรับอากาศ อุปกรณ์ไฟฟ้า อุปกรณ์ทำความเย็น อะไหล่ และวัสดุที่เกี่ยวข้องกับกิจการ",
    color: "#6A1B9A",
  },
  {
    no: 6,
    icon: <HandymanIcon sx={{ fontSize: 40 }} />,
    title: "บริการอื่นที่เกี่ยวเนื่อง",
    desc: "ประกอบกิจการอื่นใดที่เกี่ยวเนื่องหรือคล้ายคลึงกันกับกิจการดังกล่าว ทั้งนี้ไม่ขัดต่อกฎหมาย",
    color: "#00695C",
  },
];

export default function HomePage() {
  return (
    <AppShell noPadding>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight={700} color="primary" gutterBottom>
          บริการของเรา
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          ให้บริการงานระบบวิศวกรรมครบวงจร โดยทีมช่างผู้เชี่ยวชาญ
        </Typography>

        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={service.no}>
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
                <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                  {/* Icon + number badge */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        bgcolor: `${service.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: service.color,
                        flexShrink: 0,
                      }}
                    >
                      {service.icon}
                    </Box>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: service.color,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {service.no}
                    </Box>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, lineHeight: 1.4 }}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {service.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </AppShell>
  );
}
