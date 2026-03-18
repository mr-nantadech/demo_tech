"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const SERVICE_OPTIONS = [
  "ติดตั้ง ซ่อมแซม บำรุงรักษาเครื่องปรับอากาศและระบบทำความเย็น",
  "ล้าง ซ่อม เติมสารทำความเย็นเครื่องปรับอากาศ",
  "ออกแบบ ติดตั้ง ซ่อมแซมระบบไฟฟ้าและระบบควบคุมไฟฟ้า",
  "รับเหมาติดตั้งงานระบบวิศวกรรมประกอบอาคาร",
  "จำหน่ายเครื่องปรับอากาศ อุปกรณ์ไฟฟ้า และอะไหล่",
  "บริการอื่นที่เกี่ยวเนื่อง",
];

export default function RequestQuoteForm() {
  const [form, setForm] = useState({
    contactName: "",
    companyName: "",
    phone: "",
    email: "",
    details: "",
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
    if (errors.serviceType) setErrors((prev) => ({ ...prev, serviceType: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.contactName.trim()) newErrors.contactName = "กรุณากรอกชื่อ-นามสกุล";
    if (!form.phone.trim()) newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    if (selectedServices.length === 0) newErrors.serviceType = "กรุณาเลือกบริการที่สนใจอย่างน้อย 1 รายการ";
    if (!form.details.trim()) newErrors.details = "กรุณากรอกรายละเอียดที่ต้องการสอบถาม";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      const res = await fetch("/api/request-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          serviceType: selectedServices.join(", "),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      setSuccess(true);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CheckCircleIcon sx={{ fontSize: 72, color: "success.main", mb: 2 }} />
        <Box sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}>ส่งคำขอเรียบร้อยแล้ว</Box>
        <Box sx={{ color: "text.secondary", mb: 4 }}>
          ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ ขอบคุณที่ไว้วางใจ Demo Tech Engineer
        </Box>
        <Button variant="outlined" onClick={() => { setSuccess(false); setForm({ contactName: "", companyName: "", phone: "", email: "", details: "" }); setSelectedServices([]); }}>
          ส่งคำขอใหม่
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {apiError && <Alert severity="error" sx={{ mb: 3 }}>{apiError}</Alert>}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 2.5 }}>
        <TextField
          name="contactName"
          label="ชื่อ-นามสกุล"
          value={form.contactName}
          onChange={handleChange}
          error={!!errors.contactName}
          helperText={errors.contactName}
          required
          fullWidth
        />
        <TextField
          name="companyName"
          label="ชื่อบริษัท / องค์กร"
          value={form.companyName}
          onChange={handleChange}
          fullWidth
          placeholder="(ถ้ามี)"
        />
        <TextField
          name="phone"
          label="เบอร์โทรศัพท์"
          value={form.phone}
          onChange={handleChange}
          error={!!errors.phone}
          helperText={errors.phone}
          required
          fullWidth
          inputProps={{ inputMode: "tel" }}
        />
        <TextField
          name="email"
          label="อีเมล"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          placeholder="(ถ้ามี)"
        />
      </Box>

      <FormControl error={!!errors.serviceType} component="fieldset" fullWidth sx={{ mb: 2.5 }}>
        <FormLabel component="legend" required sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
          บริการที่สนใจ
        </FormLabel>
        <FormGroup>
          {SERVICE_OPTIONS.map((service) => (
            <FormControlLabel
              key={service}
              control={
                <Checkbox
                  checked={selectedServices.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                  size="small"
                />
              }
              label={service}
            />
          ))}
        </FormGroup>
        {errors.serviceType && <FormHelperText>{errors.serviceType}</FormHelperText>}
      </FormControl>

      <TextField
        name="details"
        label="รายละเอียดที่ต้องการสอบถาม"
        value={form.details}
        onChange={handleChange}
        error={!!errors.details}
        helperText={errors.details}
        required
        fullWidth
        multiline
        rows={4}
        placeholder="กรุณาระบุรายละเอียดงาน สถานที่ติดตั้ง หรือข้อมูลอื่นที่เป็นประโยชน์"
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
        disabled={loading}
        sx={{ px: 5 }}
      >
        {loading ? "กำลังส่ง..." : "ส่งคำขอใบเสนอราคา"}
      </Button>
    </Box>
  );
}
