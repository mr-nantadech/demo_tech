"use client";

import { useEffect, useState } from "react";
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

interface CompanyProfile {
  name: string;
  registrationNo: string;
  address: string;
  phone: string;
}

const defaultForm: CompanyProfile = {
  name: "",
  registrationNo: "",
  address: "",
  phone: "",
};

export default function CompanyProfileForm() {
  const [form, setForm] = useState<CompanyProfile>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
