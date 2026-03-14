"use client";

import { useState } from "react";
import Link from "next/link";
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
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProjectFileStatus } from "@/types";

type Row = {
  id: string;
  projectCode: string;
  projectName: string;
  quotationDate: string | null;
  status: ProjectFileStatus;
  grandTotal: number;
  updatedAt: string;
};

const STATUS_LABELS: Record<ProjectFileStatus, string> = {
  DRAFT: "ฉบับร่าง",
  CONFIRMED: "ยืนยันแล้ว",
  APPROVED: "อนุมัติแล้ว",
};

const STATUS_COLORS: Record<ProjectFileStatus, "default" | "info" | "success"> = {
  DRAFT: "default",
  CONFIRMED: "info",
  APPROVED: "success",
};

export default function ProjectFileTable({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/project-files/${deleteId}`, { method: "DELETE" });
    setRows((prev) => prev.filter((row) => row.id !== deleteId));
    setDeleteId(null);
  };

  const filtered = rows.filter((row) => {
    const q = search.toLowerCase();
    return (
      row.projectCode.toLowerCase().includes(q) ||
      row.projectName.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="ค้นหาเลขที่ไฟล์ หรือ ชื่อโครงการ..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 360 }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} /> }}
        />
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>เลขที่ใบเสนอราคา</TableCell>
                <TableCell>ชื่อโครงการ</TableCell>
                <TableCell>วันที่เอกสาร</TableCell>
                <TableCell align="right">มูลค่ารวม</TableCell>
                <TableCell align="center">สถานะ</TableCell>
                <TableCell>อัปเดตล่าสุด</TableCell>
                <TableCell align="center">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">ไม่พบข้อมูล</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                      {row.projectCode}
                    </TableCell>
                    <TableCell>{row.projectName}</TableCell>
                    <TableCell>{formatDate(row.quotationDate)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.grandTotal)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={STATUS_LABELS[row.status]}
                        color={STATUS_COLORS[row.status]}
                      />
                    </TableCell>
                    <TableCell>{formatDate(row.updatedAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="เปิดแก้ไข">
                        <IconButton
                          component={Link}
                          href={`/project-files/${row.id}`}
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

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ต้องการลบใบเสนอราคานี้ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้
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
