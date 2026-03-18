"use client";

import { useEffect, useRef, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import NextImage from "next/image";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface CompanyProfile {
  name: string;
  registrationNo: string;
  address: string;
  phone: string;
  logoUrl: string;
}

const defaultForm: CompanyProfile = {
  name: "",
  registrationNo: "",
  address: "",
  phone: "",
  logoUrl: "",
};

export default function CompanyProfileForm() {
  const [form, setForm] = useState<CompanyProfile>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      const res = await fetch("/api/master-data/company");
      if (res.ok) {
        const data = (await res.json()) as CompanyProfile;
        setForm({
          name: data.name ?? "",
          registrationNo: data.registrationNo ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          logoUrl: data.logoUrl ?? "",
        });
      } else {
        setError("ไม่สามารถโหลดข้อมูลบริษัทได้");
      }
      setLoading(false);
    };

    void load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const res = await fetch("/api/master-data/company", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setSnackbar({ open: true, message: data.error || "ไม่สามารถบันทึกข้อมูลได้", severity: "error" });
      return;
    }

    setSnackbar({ open: true, message: "บันทึกข้อมูลบริษัทเรียบร้อยแล้ว", severity: "success" });
  };

  const handleUploadLogo = async (file: File | null) => {
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/master-data/company/upload-logo", {
      method: "POST",
      body: formData,
    });

    setUploadingLogo(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setSnackbar({
        open: true,
        message: data.error || "ไม่สามารถอัปโหลดโลโก้ได้",
        severity: "error",
      });
      return;
    }

    const data = (await res.json()) as { url: string };
    setForm((prev) => ({ ...prev, logoUrl: data.url }));
    setSnackbar({
      open: true,
      message: "อัปโหลดโลโก้เรียบร้อยแล้ว",
      severity: "success",
    });
  };

  return (
    <Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 2 }}>
          ข้อมูลบริษัท
        </Typography>

        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2}>
              <Grid size={12}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: { xs: "stretch", md: "center" },
                    flexDirection: { xs: "column", md: "row" },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: "100%", md: 260 },
                      height: 140,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "grey.100",
                      flexShrink: 0,
                    }}
                  >
                    <NextImage
                      src={form.logoUrl || "/logo_corp.webp?v=20260319"}
                      alt="Company logo"
                      fill
                      sizes="260px"
                      style={{ objectFit: "contain", padding: 12 }}
                      unoptimized={form.logoUrl.startsWith("http")}
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        void handleUploadLogo(file);
                        e.currentTarget.value = "";
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      {uploadingLogo ? "กำลังอัปโหลด..." : "อัปโหลดโลโก้"}
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      อัปโหลดแล้วระบบจะบันทึก URL ลงข้อมูลบริษัท และ navbar จะใช้โลโก้นี้
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="ชื่อบริษัท"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="เลขนิติบุคคล"
                  value={form.registrationNo}
                  onChange={(e) =>
                    setForm({ ...form, registrationNo: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="ที่อยู่"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="เบอร์โทรศัพท์"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  helperText="สามารถวาง URL เองได้ หรือใช้อัปโหลดด้านบน"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? <CircularProgress size={20} color="inherit" /> : "บันทึกข้อมูล"}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
