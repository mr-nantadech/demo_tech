"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { QuotationRow, QUOTATION_STATUS_LABELS, QUOTATION_STATUS_COLORS, QuotationStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_OPTIONS: { value: QuotationStatus; label: string }[] = [
  { value: "DRAFT", label: "ร่าง" },
  { value: "SENT", label: "ส่งแล้ว" },
  { value: "APPROVED", label: "อนุมัติ" },
  { value: "REJECTED", label: "ปฏิเสธ" },
  { value: "CANCELLED", label: "ยกเลิก" },
];

export default function QuotationDetail({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<QuotationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<QuotationRow>>({});
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/quotation/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setForm(d); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/quotation/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      setData(updated);
      setEditing(false);
    } else {
      setError("บันทึกไม่สำเร็จ");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await fetch(`/api/quotation/${id}`, { method: "DELETE" });
    router.push("/quotation");
    router.refresh();
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">ไม่พบข้อมูล</Alert>;

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>{data.quotationNo}</Typography>
              <Chip
                label={QUOTATION_STATUS_LABELS[data.status]}
                color={QUOTATION_STATUS_COLORS[data.status] as "default" | "info" | "success" | "error" | "warning"}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {!editing ? (
                <>
                  <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditing(true)}>
                    แก้ไข
                  </Button>
                  <Button startIcon={<DeleteIcon />} variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
                    ลบ
                  </Button>
                </>
              ) : (
                <>
                  <Button startIcon={<SaveIcon />} variant="contained" onClick={handleSave} disabled={saving}>
                    บันทึก
                  </Button>
                  <Button startIcon={<CancelIcon />} variant="outlined" onClick={() => { setEditing(false); setForm(data); }}>
                    ยกเลิก
                  </Button>
                </>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {editing ? (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="ชื่อลูกค้า" value={form.clientName || ""} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="ชื่อโครงการ" value={form.projectName || ""} onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="มูลค่า (บาท)" type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth select label="สถานะ" value={form.status || "DRAFT"} onChange={(e) => setForm({ ...form, status: e.target.value as QuotationStatus })}>
                    {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth multiline rows={3} label="รายละเอียด" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </Grid>
              </>
            ) : (
              <>
                {[
                  { label: "ชื่อลูกค้า", value: data.clientName },
                  { label: "ชื่อโครงการ", value: data.projectName || "-" },
                  { label: "มูลค่า", value: formatCurrency(data.amount) },
                  { label: "วันที่สร้าง", value: formatDate(data.createdAt) },
                  { label: "แก้ไขล่าสุด", value: formatDate(data.updatedAt) },
                ].map((item) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="body1" fontWeight={500}>{item.value}</Typography>
                  </Grid>
                ))}
                {data.description && (
                  <Grid size={12}>
                    <Typography variant="caption" color="text.secondary">รายละเอียด</Typography>
                    <Typography variant="body1">{data.description}</Typography>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>ต้องการลบใบเสนอราคา {data.quotationNo} ใช่หรือไม่?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>ยกเลิก</Button>
          <Button onClick={handleDelete} color="error" variant="contained">ลบ</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
