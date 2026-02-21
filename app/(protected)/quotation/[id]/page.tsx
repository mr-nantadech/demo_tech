import AppShell from "@/components/layout/AppShell";
import QuotationDetail from "@/components/quotation/QuotationDetail";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import LinkButton from "@/components/ui/LinkButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const metadata = { title: "รายละเอียดใบเสนอราคา | NBA Tech Engineer" };

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell maxWidth="md">
      <Box sx={{ mb: 2 }}>
        <LinkButton href="/quotation" startIcon={<ArrowBackIcon />} variant="text" sx={{ mb: 1 }}>
          กลับไปรายการ
        </LinkButton>
        <Typography variant="h5" fontWeight={700} color="primary">รายละเอียดใบเสนอราคา</Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <QuotationDetail id={id} />
    </AppShell>
  );
}
