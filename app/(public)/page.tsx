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
import { prisma } from "@/lib/prisma";
import {
  buildHomeContent,
  defaultHomeContent,
  HOME_CONTENT_CATEGORY,
} from "@/lib/home-content";

export const dynamic = "force-dynamic";

const serviceIcons = [
  <AcUnitIcon key="service-icon-1" sx={{ fontSize: 40 }} />,
  <OpacityIcon key="service-icon-2" sx={{ fontSize: 40 }} />,
  <ElectricalServicesIcon key="service-icon-3" sx={{ fontSize: 40 }} />,
  <ConstructionIcon key="service-icon-4" sx={{ fontSize: 40 }} />,
  <StorefrontIcon key="service-icon-5" sx={{ fontSize: 40 }} />,
  <HandymanIcon key="service-icon-6" sx={{ fontSize: 40 }} />,
];

export default async function HomePage() {
  const rows = await prisma.masterData.findMany({
    where: { category: HOME_CONTENT_CATEGORY, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const content = rows.length > 0 ? buildHomeContent(rows) : defaultHomeContent;

  return (
    <AppShell noPadding>
      {/* Hero Slider */}
      <HeroSlider slides={content.slides} />

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight={700} color="primary" gutterBottom>
          {content.servicesTitle}
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          {content.servicesSubtitle}
        </Typography>

        <Grid container spacing={3}>
          {content.services.map((service, idx) => (
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
                      {serviceIcons[idx]}
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
