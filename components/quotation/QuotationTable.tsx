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
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import {
  QuotationRow,
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
} from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function QuotationTable() {
  const [rows, setRows] = useState<QuotationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/quotation");
    if (res.ok) {
      const data = await res.json();
      setRows(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/quotation/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchQuotations();
  };

  const filtered = rows.filter(
    (r) =>
      r.quotationNo.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (r.projectName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="ค้นหาเลขที่, ชื่อลูกค้า, โครงการ..."
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
                <TableCell>เลขที่ใบเสนอราคา</TableCell>
                <TableCell>ชื่อลูกค้า</TableCell>
                <TableCell>ชื่อโครงการ</TableCell>
                <TableCell align="right">มูลค่า (บาท)</TableCell>
                <TableCell align="center">สถานะ</TableCell>
                <TableCell>วันที่สร้าง</TableCell>
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
                    <Typography color="text.secondary">ไม่พบข้อมูล</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{row.quotationNo}</TableCell>
                    <TableCell>{row.clientName}</TableCell>
                    <TableCell>{row.projectName || "-"}</TableCell>
                    <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={QUOTATION_STATUS_LABELS[row.status]}
                        color={QUOTATION_STATUS_COLORS[row.status] as "default" | "info" | "success" | "error" | "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="ดูรายละเอียด">
                        <IconButton
                          component={Link}
                          href={`/quotation/${row.id}`}
                          size="small"
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบ">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteId(row.id)}
                        >
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

      {/* Confirm Delete Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณต้องการลบใบเสนอราคานี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>ยกเลิก</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
