import AppShell from "@/components/layout/AppShell";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";

const projects = [
  {
    title: "ระบบจัดการโรงงาน",
    client: "บริษัท ABC จำกัด",
    year: "2024",
    description: "ออกแบบและติดตั้งระบบไฟฟ้า ควบคุม PLC สำหรับสายการผลิต",
    tags: ["PLC", "Electrical", "Automation"],
  },
  {
    title: "โครงการโซลาร์เซลล์",
    client: "บริษัท XYZ จำกัด",
    year: "2023",
    description: "ออกแบบและติดตั้งระบบโซลาร์เซลล์ขนาด 500kWp บนหลังคาโรงงาน",
    tags: ["Solar", "Electrical", "Renewable Energy"],
  },
  {
    title: "ระบบ BMS อาคารสำนักงาน",
    client: "บริษัท DEF จำกัด",
    year: "2023",
    description: "ติดตั้งระบบ Building Management System ควบคุมไฟฟ้าและ HVAC",
    tags: ["BMS", "HVAC", "IoT"],
  },
  {
    title: "ระบบไฟฟ้าโรงพยาบาล",
    client: "โรงพยาบาล GHI",
    year: "2022",
    description: "ออกแบบระบบไฟฟ้าสำรอง UPS และ Generator สำหรับโรงพยาบาล",
    tags: ["UPS", "Generator", "Medical"],
  },
];

export default function PortfolioPage() {
  return (
    <AppShell>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          Portfolio
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ผลงานที่ผ่านมาของทีม NBA Tech Engineer
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>

      <Grid container spacing={3}>
        {projects.map((project, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
            <Card
              sx={{
                height: "100%",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-2px)" },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                    {project.title}
                  </Typography>
                  <Chip label={project.year} size="small" color="primary" variant="outlined" />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {project.client}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
                  {project.description}
                </Typography>

                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {project.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </AppShell>
  );
}
