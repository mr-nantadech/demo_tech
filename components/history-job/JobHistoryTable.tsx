"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { JobHistoryRow, JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function JobHistoryTable() {
  const [rows, setRows] = useState<JobHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/history-job");
    if (res.ok) {
      const data = await res.json();
      setRows(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/history-job/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchJobs();
  };

  const filtered = rows.filter(
    (r) =>
      r.jobName.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="ค้นหาชื่องาน, ชื่อลูกค้า..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 320 }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} /> }}
        />
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ชื่องาน</TableCell>
                <TableCell>ชื่อลูกค้า</TableCell>
                <TableCell>เลขที่ใบเสนอราคา</TableCell>
                <TableCell>วันที่เริ่ม</TableCell>
                <TableCell>วันที่สิ้นสุด</TableCell>
                <TableCell align="right">มูลค่า</TableCell>
                <TableCell align="center">สถานะ</TableCell>
                <TableCell align="center">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">ไม่พบข้อมูล</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{row.jobName}</TableCell>
                    <TableCell>{row.clientName}</TableCell>
                    <TableCell>{row.quotation?.quotationNo || "-"}</TableCell>
                    <TableCell>{formatDate(row.startDate)}</TableCell>
                    <TableCell>{formatDate(row.endDate)}</TableCell>
                    <TableCell align="right">{row.amount ? formatCurrency(row.amount) : "-"}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={JOB_STATUS_LABELS[row.status]}
                        color={JOB_STATUS_COLORS[row.status] as "info" | "success" | "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="แก้ไข">
                        <IconButton
                          component={Link}
                          href={`/history-job/new?edit=${row.id}`}
                          size="small"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบ">
                        <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                          <DeleteIcon fontSize="small" />
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

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>ต้องการลบประวัติงานนี้ใช่หรือไม่?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>ยกเลิก</Button>
          <Button onClick={handleDelete} color="error" variant="contained">ลบ</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
