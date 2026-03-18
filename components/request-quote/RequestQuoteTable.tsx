"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import {
  QUOTE_REQUEST_STATUS_COLORS,
  QUOTE_REQUEST_STATUS_LABELS,
  type QuoteRequestRow,
  type QuoteRequestStatus,
} from "@/types";
import { formatDateTime } from "@/lib/utils";

const STATUS_OPTIONS: { value: QuoteRequestStatus; label: string }[] = [
  { value: "NEW", label: "ใหม่" },
  { value: "IN_PROGRESS", label: "กำลังติดตาม" },
  { value: "REPLIED", label: "ตอบกลับแล้ว" },
  { value: "CLOSED", label: "ปิดงาน" },
];

const defaultForm = {
  id: "",
  contactName: "",
  companyName: "",
  phone: "",
  email: "",
  serviceType: "",
  details: "",
  internalNote: "",
  followUpAt: "",
  status: "NEW" as QuoteRequestStatus,
};

export default function RequestQuoteTable() {
  const [rows, setRows] = useState<QuoteRequestRow[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(defaultForm);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/request-quote");
    if (res.ok) {
      const data = (await res.json()) as {
        rows: QuoteRequestRow[];
        summary?: { newCount?: number };
      };
      setRows(data.rows);
      setNewCount(data.summary?.newCount ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  const handleOpenEdit = (row: QuoteRequestRow) => {
    setForm({
      id: row.id,
      contactName: row.contactName,
      companyName: row.companyName ?? "",
      phone: row.phone,
      email: row.email ?? "",
      serviceType: row.serviceType,
      details: row.details,
      internalNote: row.internalNote ?? "",
      followUpAt: row.followUpAt ? row.followUpAt.slice(0, 16) : "",
      status: row.status,
    });
    setError("");
    setOpenEdit(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const res = await fetch(`/api/request-quote/${form.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (res.ok) {
      setOpenEdit(false);
      fetchRows();
    } else {
      let message = "เกิดข้อผิดพลาด";
      try {
        const data = (await res.json()) as { error?: string };
        message = data.error || message;
      } catch {
        const text = await res.text();
        if (text.trim()) message = text;
      }
      setError(message);
    }
  };

  const filtered = rows.filter((row) => {
    const keyword = search.toLowerCase();
    return (
      row.contactName.toLowerCase().includes(keyword) ||
      (row.companyName ?? "").toLowerCase().includes(keyword) ||
      row.phone.toLowerCase().includes(keyword) ||
      row.serviceType.toLowerCase().includes(keyword)
    );
  });

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <Chip color="warning" label={`คำขอใหม่ ${newCount} รายการ`} />
        </Box>
        <TextField
          placeholder="ค้นหาชื่อผู้ติดต่อ, บริษัท, เบอร์โทร, บริการ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: { xs: "100%", sm: 420 } }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
          }}
        />
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>วันที่ส่ง</TableCell>
                <TableCell>ผู้ติดต่อ</TableCell>
                <TableCell>บริษัท</TableCell>
                <TableCell>เบอร์โทร</TableCell>
                <TableCell>บริการที่สนใจ</TableCell>
                <TableCell align="center">สถานะ</TableCell>
                <TableCell align="center">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">ไม่พบคำขอใบเสนอราคา</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{row.contactName}</TableCell>
                    <TableCell>{row.companyName || "-"}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="body2" noWrap title={row.serviceType}>
                        {row.serviceType}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={QUOTE_REQUEST_STATUS_LABELS[row.status]}
                        color={
                          QUOTE_REQUEST_STATUS_COLORS[row.status] as
                            | "default"
                            | "warning"
                            | "info"
                            | "success"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ดู/แก้ไข">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={openEdit}
        onClose={() => !saving && setOpenEdit(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>จัดการคำขอใบเสนอราคา</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="ชื่อ-นามสกุล"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="บริษัท / องค์กร"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="เบอร์โทรศัพท์"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="อีเมล"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="สถานะ"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as QuoteRequestStatus,
                  })
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="บริการที่สนใจ"
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="วันนัดติดต่อกลับ"
                value={form.followUpAt}
                onChange={(e) => setForm({ ...form, followUpAt: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="รายละเอียด"
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="หมายเหตุภายในทีม"
                value={form.internalNote}
                onChange={(e) => setForm({ ...form, internalNote: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenEdit(false)} disabled={saving}>
            ยกเลิก
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "บันทึก"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
