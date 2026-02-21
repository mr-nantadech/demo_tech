"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { generateQuotationNo } from "@/lib/utils";
import type { QuotationStatus } from "@/types";

const STATUS_OPTIONS: { value: QuotationStatus; label: string }[] = [
  { value: "DRAFT", label: "ร่าง" },
  { value: "SENT", label: "ส่งแล้ว" },
  { value: "APPROVED", label: "อนุมัติ" },
  { value: "REJECTED", label: "ปฏิเสธ" },
  { value: "CANCELLED", label: "ยกเลิก" },
];

export default function QuotationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    quotationNo: generateQuotationNo(),
    clientName: "",
    projectName: "",
    description: "",
    amount: "",
    status: "DRAFT" as QuotationStatus,
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/quotation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: parseFloat(form.amount) || 0,
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/quotation");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="เลขที่ใบเสนอราคา *"
                value={form.quotationNo}
                onChange={handleChange("quotationNo")}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="สถานะ"
                value={form.status}
                onChange={handleChange("status")}
              >
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="ชื่อลูกค้า *"
                value={form.clientName}
                onChange={handleChange("clientName")}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="ชื่อโครงการ"
                value={form.projectName}
                onChange={handleChange("projectName")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="มูลค่า (บาท) *"
                type="number"
                value={form.amount}
                onChange={handleChange("amount")}
                required
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="รายละเอียด"
                value={form.description}
                onChange={handleChange("description")}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={() => router.back()} disabled={loading}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : "บันทึก"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
