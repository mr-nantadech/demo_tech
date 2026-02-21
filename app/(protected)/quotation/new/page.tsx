import AppShell from "@/components/layout/AppShell";
import QuotationForm from "@/components/quotation/QuotationForm";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import LinkButton from "@/components/ui/LinkButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const metadata = { title: "สร้างใบเสนอราคา | NBA Tech Engineer" };

export default function NewQuotationPage() {
  return (
    <AppShell maxWidth="md">
      <Box sx={{ mb: 2 }}>
        <LinkButton href="/quotation" startIcon={<ArrowBackIcon />} variant="text" sx={{ mb: 1 }}>
          กลับไปรายการ
        </LinkButton>
        <Typography variant="h5" fontWeight={700} color="primary">สร้างใบเสนอราคาใหม่</Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <QuotationForm />
    </AppShell>
  );
}
