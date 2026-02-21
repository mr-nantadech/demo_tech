"use client";

import { useState, useEffect } from "react";
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
import type { JobStatus, QuotationRow } from "@/types";

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: "IN_PROGRESS", label: "กำลังดำเนินการ" },
  { value: "COMPLETED", label: "เสร็จสิ้น" },
  { value: "CANCELLED", label: "ยกเลิก" },
];

export default function JobHistoryForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quotations, setQuotations] = useState<QuotationRow[]>([]);

  const [form, setForm] = useState({
    jobName: "",
    clientName: "",
    quotationId: "",
    startDate: "",
    endDate: "",
    description: "",
    amount: "",
    status: "IN_PROGRESS" as JobStatus,
  });

  useEffect(() => {
    fetch("/api/quotation").then((r) => r.json()).then(setQuotations);
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/history-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: form.amount ? parseFloat(form.amount) : null,
        quotationId: form.quotationId || null,
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/history-job");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="ชื่องาน *" value={form.jobName} onChange={handleChange("jobName")} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="ชื่อลูกค้า *" value={form.clientName} onChange={handleChange("clientName")} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="ใบเสนอราคาที่เกี่ยวข้อง (ถ้ามี)" value={form.quotationId} onChange={handleChange("quotationId")}>
                <MenuItem value=""><em>- ไม่ระบุ -</em></MenuItem>
                {quotations.map((q) => (
                  <MenuItem key={q.id} value={q.id}>{q.quotationNo} - {q.clientName}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="สถานะ" value={form.status} onChange={handleChange("status")}>
                {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="วันที่เริ่ม" type="date" value={form.startDate} onChange={handleChange("startDate")} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="วันที่สิ้นสุด" type="date" value={form.endDate} onChange={handleChange("endDate")} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="มูลค่า (บาท)" type="number" value={form.amount} onChange={handleChange("amount")} inputProps={{ min: 0, step: "0.01" }} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth multiline rows={4} label="รายละเอียด" value={form.description} onChange={handleChange("description")} />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={() => router.back()} disabled={loading}>ยกเลิก</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : "บันทึก"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
