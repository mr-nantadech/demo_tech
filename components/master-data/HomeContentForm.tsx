"use client";

import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import NextImage from "next/image";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  defaultHomeContent,
  HOME_SERVICE_COUNT,
  HOME_SLIDE_COUNT,
  type HomeContent,
} from "@/lib/home-content";

export default function HomeContentForm() {
  const [form, setForm] = useState<HomeContent>(defaultHomeContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      const res = await fetch("/api/master-data/home-content");
      if (res.ok) {
        const data = (await res.json()) as HomeContent;
        setForm(data);
      } else {
        setError("ไม่สามารถโหลดข้อมูลหน้าแรกได้");
      }
      setLoading(false);
    };

    void load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const res = await fetch("/api/master-data/home-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setSnackbar({
        open: true,
        message: data.error || "ไม่สามารถบันทึกข้อมูลหน้าแรกได้",
        severity: "error",
      });
      return;
    }

    setSnackbar({
      open: true,
      message: "บันทึกข้อมูลหน้าแรกเรียบร้อยแล้ว",
      severity: "success",
    });
  };

  const handleUploadSlideImage = async (index: number, file: File | null) => {
    if (!file) return;

    setUploadingIndex(index);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/master-data/home-content/upload", {
      method: "POST",
      body: formData,
    });

    setUploadingIndex(null);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setSnackbar({
        open: true,
        message: data.error || "ไม่สามารถอัปโหลดรูปสไลด์ได้",
        severity: "error",
      });
      return;
    }

    const data = (await res.json()) as { url: string };
    const slides = [...form.slides];
    slides[index] = { ...slides[index], image: data.url };
    setForm({ ...form, slides });
    setSnackbar({
      open: true,
      message: `อัปโหลดรูปสไลด์ ${index + 1} เรียบร้อยแล้ว`,
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
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 2 }}>
          เนื้อหาหน้าแรก
        </Typography>

        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                ส่วนบริการ
              </Typography>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="หัวข้อส่วนบริการ"
                    value={form.servicesTitle}
                    onChange={(e) =>
                      setForm({ ...form, servicesTitle: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="คำอธิบายส่วนบริการ"
                    value={form.servicesSubtitle}
                    onChange={(e) =>
                      setForm({ ...form, servicesSubtitle: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                สไลด์หน้าแรก
              </Typography>
              <Grid container spacing={2}>
                {form.slides.slice(0, HOME_SLIDE_COUNT).map((slide, idx) => (
                  <Grid size={12} key={`slide-${idx}`}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography fontWeight={700} sx={{ mb: 2 }}>
                          สไลด์ {idx + 1}
                        </Typography>
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
                                  width: { xs: "100%", md: 240 },
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
                                  src={slide.image || defaultHomeContent.slides[idx].image}
                                  alt={`Slide ${idx + 1}`}
                                  fill
                                  sizes="240px"
                                  style={{ objectFit: "cover" }}
                                  unoptimized={slide.image.startsWith("http")}
                                />
                              </Box>
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                                <input
                                  ref={(el) => {
                                    fileInputRefs.current[idx] = el;
                                  }}
                                  type="file"
                                  accept="image/*"
                                  style={{ display: "none" }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    void handleUploadSlideImage(idx, file);
                                    e.currentTarget.value = "";
                                  }}
                                />
                                <Button
                                  variant="outlined"
                                  startIcon={<CloudUploadIcon />}
                                  onClick={() => fileInputRefs.current[idx]?.click()}
                                  disabled={uploadingIndex === idx}
                                  sx={{ alignSelf: "flex-start" }}
                                >
                                  {uploadingIndex === idx ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
                                </Button>
                                <Button
                                  variant="text"
                                  color="inherit"
                                  startIcon={<ReplayIcon />}
                                  onClick={() => {
                                    const slides = [...form.slides];
                                    slides[idx] = {
                                      ...slides[idx],
                                      image: defaultHomeContent.slides[idx].image,
                                    };
                                    setForm({ ...form, slides });
                                  }}
                                  sx={{ alignSelf: "flex-start" }}
                                >
                                  รีเซ็ตรูป default
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                  ระบบจะแปลงไฟล์เป็น WebP และบันทึก URL ให้สไลด์นี้อัตโนมัติ
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid size={12}>
                            <TextField
                              fullWidth
                              label="Image URL"
                              value={slide.image}
                              onChange={(e) => {
                                const slides = [...form.slides];
                                slides[idx] = { ...slides[idx], image: e.target.value };
                                setForm({ ...form, slides });
                              }}
                              helperText="รองรับทั้งรูปใน public เช่น /portfolio/slide-1.jpg และ URL ภายนอก"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              label="หัวข้อ"
                              value={slide.title}
                              onChange={(e) => {
                                const slides = [...form.slides];
                                slides[idx] = { ...slides[idx], title: e.target.value };
                                setForm({ ...form, slides });
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              label="คำอธิบาย"
                              value={slide.subtitle}
                              onChange={(e) => {
                                const slides = [...form.slides];
                                slides[idx] = {
                                  ...slides[idx],
                                  subtitle: e.target.value,
                                };
                                setForm({ ...form, slides });
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                รายการบริการ
              </Typography>
              <Grid container spacing={2}>
                {form.services.slice(0, HOME_SERVICE_COUNT).map((service, idx) => (
                  <Grid size={12} key={`service-${idx}`}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography fontWeight={700} sx={{ mb: 2 }}>
                          บริการ {idx + 1}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={12}>
                            <TextField
                              fullWidth
                              label="หัวข้อบริการ"
                              value={service.title}
                              onChange={(e) => {
                                const services = [...form.services];
                                services[idx] = {
                                  ...services[idx],
                                  title: e.target.value,
                                };
                                setForm({ ...form, services });
                              }}
                            />
                          </Grid>
                          <Grid size={12}>
                            <TextField
                              fullWidth
                              multiline
                              minRows={3}
                              label="คำอธิบายบริการ"
                              value={service.desc}
                              onChange={(e) => {
                                const services = [...form.services];
                                services[idx] = {
                                  ...services[idx],
                                  desc: e.target.value,
                                };
                                setForm({ ...form, services });
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

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
