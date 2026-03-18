"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  defaultAboutContent,
  type AboutContent,
} from "@/lib/about-content";

export default function AboutContentForm() {
  const [form, setForm] = useState<AboutContent>(defaultAboutContent);
  const [expertiseText, setExpertiseText] = useState(
    defaultAboutContent.expertiseItems.join("\n")
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      const res = await fetch("/api/master-data/about-content");
      if (res.ok) {
        const data = (await res.json()) as AboutContent;
        setForm(data);
        setExpertiseText(data.expertiseItems.join("\n"));
      } else {
        setError("ไม่สามารถโหลดข้อมูลหน้าเกี่ยวกับเราได้");
      }
      setLoading(false);
    };

    void load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const expertiseItems = expertiseText
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    const res = await fetch("/api/master-data/about-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        expertiseItems,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setSnackbar({
        open: true,
        message: data.error || "ไม่สามารถบันทึกข้อมูลหน้าเกี่ยวกับเราได้",
        severity: "error",
      });
      return;
    }

    setForm((prev) => ({ ...prev, expertiseItems }));
    setSnackbar({
      open: true,
      message: "บันทึกข้อมูลหน้าเกี่ยวกับเราเรียบร้อยแล้ว",
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
          เนื้อหาหน้าเกี่ยวกับเรา
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
                <TextField
                  fullWidth
                  label="หัวข้อหน้า"
                  value={form.pageTitle}
                  onChange={(e) => setForm({ ...form, pageTitle: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="คำอธิบายใต้หัวข้อ"
                  value={form.pageSubtitle}
                  onChange={(e) =>
                    setForm({ ...form, pageSubtitle: e.target.value })
                  }
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="คำโปรยบริษัท"
                  value={form.companyTagline}
                  onChange={(e) =>
                    setForm({ ...form, companyTagline: e.target.value })
                  }
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="ข้อความแนะนำบริษัท"
                  value={form.companyIntro}
                  onChange={(e) =>
                    setForm({ ...form, companyIntro: e.target.value })
                  }
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="หัวข้อความเชี่ยวชาญ"
                  value={form.expertiseTitle}
                  onChange={(e) =>
                    setForm({ ...form, expertiseTitle: e.target.value })
                  }
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={6}
                  label="รายการความเชี่ยวชาญ"
                  value={expertiseText}
                  onChange={(e) => setExpertiseText(e.target.value)}
                  helperText="ใส่หนึ่งรายการต่อหนึ่งบรรทัด"
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
