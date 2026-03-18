import AppShell from "@/components/layout/AppShell";
import RequestQuoteTable from "@/components/request-quote/RequestQuoteTable";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

export const metadata = { title: "คำขอใบเสนอราคา | NBA Tech Engineer" };

export default function RequestQuotesPage() {
  return (
    <AppShell>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          คำขอใบเสนอราคา
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ติดตามและอัปเดตสถานะคำขอจากหน้าเว็บไซต์
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <RequestQuoteTable />
    </AppShell>
  );
}
