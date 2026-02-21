import AppShell from "@/components/layout/AppShell";
import QuotationTable from "@/components/quotation/QuotationTable";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import LinkButton from "@/components/ui/LinkButton";
import AddIcon from "@mui/icons-material/Add";

export const metadata = { title: "ใบเสนอราคา | NBA Tech Engineer" };

export default function QuotationPage() {
  return (
    <AppShell>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">ใบเสนอราคา</Typography>
          <Typography variant="body2" color="text.secondary">จัดการรายการเสนอซื้อเสนอขาย</Typography>
        </Box>
        <LinkButton href="/quotation/new" variant="contained" startIcon={<AddIcon />}>
          สร้างใบเสนอราคา
        </LinkButton>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <QuotationTable />
    </AppShell>
  );
}
