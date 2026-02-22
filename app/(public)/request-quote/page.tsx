import AppShell from "@/components/layout/AppShell";
import RequestQuoteForm from "@/components/request-quote/RequestQuoteForm";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export const metadata = { title: "ขอใบเสนอราคา | NBA Tech Engineer" };

export default function RequestQuotePage() {
  return (
    <AppShell>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          ขอใบเสนอราคา
        </Typography>
        <Typography variant="body1" color="text.secondary">
          กรอกรายละเอียดงานที่ต้องการ ทีมงานจะติดต่อกลับโดยเร็วที่สุด
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>

      <Grid container spacing={4}>
        {/* Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                รายละเอียดคำขอ
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <RequestQuoteForm />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                ติดต่อโดยตรง
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                { icon: <PhoneIcon fontSize="small" color="primary" />, label: "โทรศัพท์", value: "02-xxx-xxxx" },
                { icon: <EmailIcon fontSize="small" color="primary" />, label: "อีเมล", value: "nbatechengineering@gmail.com" },
              ].map((item) => (
                <Box key={item.label} sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "flex-start" }}>
                  <Box sx={{ mt: 0.3 }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <AccessTimeIcon fontSize="small" color="primary" sx={{ mt: 0.3 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    เวลาทำการ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    จันทร์ – ศุกร์: 08.00 – 17.00 น.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    เสาร์: 08.00 – 12.00 น.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    ตอบกลับภายใน 1-2 วันทำการ
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppShell>
  );
}
