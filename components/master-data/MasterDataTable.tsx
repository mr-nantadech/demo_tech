"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { MasterDataRow } from "@/types";

export default function MasterDataTable() {
  const [rows, setRows] = useState<MasterDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<MasterDataRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    category: "", key: "", value: "", label: "", sortOrder: "0", isActive: true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/master-data");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenCreate = () => {
    setEditData(null);
    setForm({ category: "", key: "", value: "", label: "", sortOrder: "0", isActive: true });
    setError("");
    setOpenForm(true);
  };

  const handleOpenEdit = (row: MasterDataRow) => {
    setEditData(row);
    setForm({ category: row.category, key: row.key, value: row.value, label: row.label || "", sortOrder: String(row.sortOrder), isActive: row.isActive });
    setError("");
    setOpenForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const body = { ...form, sortOrder: parseInt(form.sortOrder) || 0 };
    const res = editData
      ? await fetch(`/api/master-data/${editData.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/master-data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { setOpenForm(false); fetchData(); }
    else { const d = await res.json(); setError(d.error || "เกิดข้อผิดพลาด"); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/master-data/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchData();
  };

  const categories = [...new Set(rows.map((r) => r.category))];
  const filtered = rows.filter(
    (r) =>
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.key.toLowerCase().includes(search.toLowerCase()) ||
      r.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <TextField
          placeholder="ค้นหา category, key, value..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 320 }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} /> }}
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          เพิ่มข้อมูล
        </Button>
      </Box>

      {/* Category chips */}
      {categories.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {categories.map((c) => (
            <Chip key={c} label={c} size="small" onClick={() => setSearch(c)} variant="outlined" clickable />
          ))}
        </Box>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Label</TableCell>
                <TableCell align="center">ลำดับ</TableCell>
                <TableCell align="center">ใช้งาน</TableCell>
                <TableCell align="center">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={32} /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><Typography color="text.secondary">ไม่พบข้อมูล</Typography></TableCell></TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell><Chip label={row.category} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{row.key}</TableCell>
                    <TableCell>{row.value}</TableCell>
                    <TableCell>{row.label || "-"}</TableCell>
                    <TableCell align="center">{row.sortOrder}</TableCell>
                    <TableCell align="center">
                      <Chip label={row.isActive ? "ใช้งาน" : "ปิด"} size="small" color={row.isActive ? "success" : "default"} />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="แก้ไข"><IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="ลบ"><IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editData ? "แก้ไขข้อมูล" : "เพิ่มข้อมูลใหม่"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Category *" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} disabled={!!editData} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Key *" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} disabled={!!editData} required />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Value *" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Label (สำหรับแสดงผล)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="ลำดับ" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 6 }} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>ใช้งาน</Typography>
              <Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenForm(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "บันทึก"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent><Typography>ต้องการลบข้อมูลนี้ใช่หรือไม่?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>ยกเลิก</Button>
          <Button onClick={handleDelete} color="error" variant="contained">ลบ</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
