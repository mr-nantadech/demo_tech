import AppShell from "@/components/layout/AppShell";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import EngineeringIcon from "@mui/icons-material/Engineering";
import BusinessIcon from "@mui/icons-material/Business";
import BadgeIcon from "@mui/icons-material/Badge";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "เกี่ยวกับเรา | Demo Tech Engineer" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const rows = await prisma.masterData.findMany({
    where: {
      category: "COMPANY_PROFILE",
      key: { in: ["COMPANY_NAME", "REGISTRATION_NO", "ADDRESS", "PHONE", "EMAIL"] },
      isActive: true,
    },
  });
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  const company = {
    name: byKey.get("COMPANY_NAME") ?? "",
    registrationNo: byKey.get("REGISTRATION_NO") ?? "",
    address: byKey.get("ADDRESS") ?? "",
    phone: byKey.get("PHONE") ?? "",
    email: byKey.get("EMAIL") ?? "",
  };

  const contactItems = [
    { icon: <BusinessIcon color="primary" />, label: "ชื่อบริษัท", value: company.name },
    { icon: <BadgeIcon color="primary" />, label: "เลขนิติบุคคล", value: company.registrationNo },
    { icon: <LocationOnIcon color="primary" />, label: "ที่อยู่", value: company.address },
    { icon: <PhoneIcon color="primary" />, label: "โทรศัพท์", value: company.phone },
    ...(company.email ? [{ icon: <EmailIcon color="primary" />, label: "อีเมล", value: company.email }] : []),
  ].filter((item) => item.value);

  return (
    <AppShell>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          เกี่ยวกับเรา
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Demo Tech Engineer - ผู้เชี่ยวชาญด้านวิศวกรรมไฟฟ้าและระบบอัตโนมัติ
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>

      <Grid container spacing={4}>
        {/* Company Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                  <EngineeringIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {company.name || "Demo Tech Engineer"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    บริษัทวิศวกรรมชั้นนำ
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
                เราคือทีมวิศวกรมืออาชีพที่มีประสบการณ์มากกว่า 10 ปี ในด้านวิศวกรรมไฟฟ้า
                ระบบอัตโนมัติ และพลังงานทดแทน เราให้บริการออกแบบ ติดตั้ง และดูแลบำรุงรักษา
                ระบบวิศวกรรมอย่างครบวงจร
              </Typography>

              <Typography variant="h6" fontWeight={600} gutterBottom>
                ความเชี่ยวชาญ
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {[
                  "ระบบไฟฟ้ากำลัง",
                  "PLC & Automation",
                  "Solar Energy",
                  "BMS",
                  "UPS & Generator",
                  "HVAC Control",
                  "IoT Systems",
                  "Engineering Design",
                ].map((skill) => (
                  <Chip key={skill} label={skill} color="primary" variant="outlined" size="small" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                ติดต่อเรา
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {contactItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  ยังไม่มีข้อมูลติดต่อ
                </Typography>
              ) : (
                contactItems.map((item) => (
                  <Box key={item.label} sx={{ display: "flex", gap: 2, mb: 3 }}>
                    {item.icon}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="body2">{item.value}</Typography>
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppShell>
  );
}
