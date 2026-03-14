"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SaveIcon from "@mui/icons-material/Save";
import type { ProjectFileLineRow, ProjectFileRow, ProjectFileStatus } from "@/types";
import {
  calcLineAmounts,
  calcProjectTotals,
  formatMoney,
  round2,
  toNumber,
} from "@/lib/project-file";
import { toThaiBahtText } from "@/lib/utils";

type EditorData = ProjectFileRow | null;

const STATUS_OPTIONS: { value: ProjectFileStatus; label: string }[] = [
  { value: "DRAFT", label: "ฉบับร่าง" },
  { value: "CONFIRMED", label: "ยืนยันแล้ว" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
];

function fw(val: string | number | null | undefined, min: number): string {
  return `calc(${Math.max(String(val ?? "").length, min)}ch + 32px)`;
}

function NumericTextField({
  value,
  onChange,
  readOnly,
  minCh,
  width,
}: {
  value: number | null | undefined;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  minCh: number;
  width?: string;
}) {
  const [focused, setFocused] = useState(false);
  const fmtStr = value != null ? formatMoney(value) : "";
  const rawStr = value != null ? String(value) : "";
  return (
    <TextField
      size="small"
      value={focused ? rawStr : fmtStr}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      slotProps={readOnly ? { input: { readOnly: true } } : undefined}
      sx={{
        width: width ?? fw(fmtStr, minCh),
        ...(readOnly ? { "& .MuiInputBase-root": { bgcolor: "action.hover" } } : {}),
      }}
    />
  );
}

function defaultLine(sortOrder: number): ProjectFileLineRow {
  return {
    sortOrder,
    lineType: "ITEM",
    itemNo: String(sortOrder),
    description: "",
    quantity: null,
    unit: null,
    materialUnitPrice: null,
    materialAmount: null,
    laborUnitPrice: null,
    laborAmount: null,
    lineTotal: null,
    remark: null,
  };
}

export default function ProjectFileEditor({
  initialData,
}: {
  initialData: EditorData;
}) {
  const today = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const router = useRouter();
  const [id, setId] = useState(initialData?.id ?? "");
  const [loadingCode, setLoadingCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [discountMode, setDiscountMode] = useState<"AMOUNT" | "PERCENT">("AMOUNT");

  const [form, setForm] = useState({
    projectCode: initialData?.projectCode ?? "",
    projectName: initialData?.projectName ?? "",
    subject: initialData?.subject ?? "",
    quotationNo: initialData?.quotationNo ?? "",
    revisionNo: initialData?.revisionNo ?? "Rev.1",
    quotationDate: initialData?.quotationDate
      ? new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Bangkok",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(initialData.quotationDate))
      : today,
    customerName: initialData?.customerName ?? "",
    billTo: initialData?.billTo ?? "",
    dear: initialData?.dear ?? "",
    supervisorName: initialData?.supervisorName ?? "",
    paymentTermsText: initialData?.paymentTermsText ?? "",
    amountTextTh: initialData?.amountTextTh ?? "",
    status: (initialData?.status ?? "DRAFT") as ProjectFileStatus,
    overheadPercent: initialData ? String(initialData.overheadPercent ?? 0) : "0",
    discountInput: initialData ? String(initialData.discount ?? 0) : "0",
  });

  const [lines, setLines] = useState<ProjectFileLineRow[]>(
    initialData?.lines?.length
      ? initialData.lines.map((line, idx) => ({
          ...line,
          sortOrder: line.sortOrder || idx + 1,
          itemNo: line.itemNo ?? "",
          description: line.description ?? "",
          unit: line.unit ?? "",
          remark: line.remark ?? "",
        }))
      : [defaultLine(1)]
  );

  const versions = initialData?.versions ?? [];

  const showError = (message: string) => {
    setSuccess("");
    setError(message);
    setSnackbarOpen(true);
  };

  const showSuccess = (message: string) => {
    setError("");
    setSuccess(message);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    if (id || form.projectCode) return;
    const loadCode = async () => {
      setLoadingCode(true);
      const res = await fetch("/api/project-files/next-code");
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, projectCode: data.projectCode || "" }));
      }
      setLoadingCode(false);
    };
    void loadCode();
  }, [id, form.projectCode]);

  const normalizedLinesForCalc = useMemo(
    () =>
      lines.map((line) => ({
        sortOrder: line.sortOrder,
        lineType: line.lineType,
        itemNo: line.itemNo ?? "",
        description: line.description,
        quantity: line.quantity,
        unit: line.unit,
        materialUnitPrice: line.materialUnitPrice,
        materialAmount: line.materialAmount,
        laborUnitPrice: line.laborUnitPrice,
        laborAmount: line.laborAmount,
        lineTotal: line.lineTotal,
        remark: line.remark,
      })),
    [lines]
  );

  const totals = useMemo(() => {
    const preTotals = calcProjectTotals(
      normalizedLinesForCalc,
      toNumber(form.overheadPercent, 0),
      0
    );

    const discountAmount =
      discountMode === "PERCENT"
        ? round2((preTotals.total * toNumber(form.discountInput, 0)) / 100)
        : round2(toNumber(form.discountInput, 0));

    return {
      ...preTotals,
      discount: discountAmount,
      grandTotal: round2(preTotals.total - discountAmount),
    };
  }, [normalizedLinesForCalc, form.overheadPercent, form.discountInput, discountMode]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, amountTextTh: toThaiBahtText(totals.grandTotal) }));
  }, [totals.grandTotal]);

  const colWidths = useMemo(() => {
    const maxStr = (vals: (string | null | undefined)[], min: number) =>
      fw(null, vals.reduce<number>((m, v) => Math.max(m, (v ?? "").length), min));
    const maxNum = (vals: (number | null | undefined)[], min: number) =>
      fw(null, vals.reduce<number>((m, v) => Math.max(m, v != null ? formatMoney(v).length : 0), min));
    return {
      itemNo:            maxStr(lines.map((l) => l.itemNo), 4),
      description:       maxStr(lines.map((l) => l.description), 15),
      unit:              maxStr(lines.map((l) => l.unit), 4),
      remark:            maxStr(lines.map((l) => l.remark), 8),
      quantity:          maxNum(lines.map((l) => l.quantity), 5),
      materialUnitPrice: maxNum(lines.map((l) => l.materialUnitPrice), 8),
      materialAmount:    maxNum(lines.map((l) => l.materialAmount), 8),
      laborUnitPrice:    maxNum(lines.map((l) => l.laborUnitPrice), 8),
      laborAmount:       maxNum(lines.map((l) => l.laborAmount), 8),
      lineTotal:         maxNum(lines.map((l) => l.lineTotal), 8),
    };
  }, [lines]);

  const updateLine = (
    index: number,
    key: keyof ProjectFileLineRow,
    value: string
  ) => {
    setLines((prev) => {
      const next = [...prev];
      const row = { ...next[index] };

      if (
        key === "quantity" ||
        key === "materialUnitPrice" ||
        key === "materialAmount" ||
        key === "laborUnitPrice" ||
        key === "laborAmount" ||
        key === "lineTotal"
      ) {
        (row[key] as number | null) = value === "" ? null : toNumber(value, 0);
      } else if (key === "lineType") {
        row.lineType = value as "SECTION" | "ITEM" | "NOTE";
      } else {
        (row[key] as string | null) = value;
      }

      const computed = calcLineAmounts({
        sortOrder: row.sortOrder,
        lineType: row.lineType,
        itemNo: row.itemNo,
        description: row.description,
        quantity: row.quantity,
        unit: row.unit,
        materialUnitPrice: row.materialUnitPrice,
        materialAmount: row.materialAmount,
        laborUnitPrice: row.laborUnitPrice,
        laborAmount: row.laborAmount,
        lineTotal: row.lineTotal,
        remark: row.remark,
      });

      row.quantity = computed.quantity;
      row.materialUnitPrice = computed.materialUnitPrice;
      row.materialAmount = computed.materialAmount;
      row.laborUnitPrice = computed.laborUnitPrice;
      row.laborAmount = computed.laborAmount;
      row.lineTotal = computed.lineTotal;

      next[index] = row;
      return next;
    });
  };

  const addLine = () => {
    setLines((prev) => [...prev, defaultLine(prev.length + 1)]);
  };

  const deleteLine = (index: number) => {
    setLines((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((line, idx) => ({
          ...line,
          sortOrder: idx + 1,
          itemNo: line.itemNo || String(idx + 1),
        }))
    );
  };

  const buildPayload = () => ({
    ...form,
    projectName: form.projectName.trim(),
    lines: lines.map((line, idx) => ({
      sortOrder: idx + 1,
      lineType: line.lineType,
      itemNo: line.itemNo || null,
      description: line.description,
      quantity: line.quantity,
      unit: line.unit || null,
      materialUnitPrice: line.materialUnitPrice,
      materialAmount: line.materialAmount,
      laborUnitPrice: line.laborUnitPrice,
      laborAmount: line.laborAmount,
      lineTotal: line.lineTotal,
      remark: line.remark || null,
    })),
    overheadPercent: toNumber(form.overheadPercent, 0),
    discount: totals.discount,
  });

  const readJsonSafe = async <T,>(res: Response): Promise<T | null> => {
    try {
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    if (!form.projectName.trim()) {
      showError("กรุณาระบุชื่อโครงการ");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    const payload = buildPayload();
    const res = id
      ? await fetch(`/api/project-files/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/project-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setSaving(false);
    if (!res.ok) {
      const data = await readJsonSafe<{ error?: string; detail?: string }>(res);
      const message = data?.error || "ไม่สามารถบันทึกข้อมูลได้";
      const detail = data?.detail ? `\n${data.detail}` : "";
      showError(`${message}${detail}`);
      return;
    }

    const data = await readJsonSafe<{ id?: string }>(res);
    if (!data) {
      showError("รูปแบบข้อมูลตอบกลับไม่ถูกต้อง");
      return;
    }
    if (!id && data.id) {
      setId(data.id);
      router.replace(`/project-files/${data.id}`);
    } else {
      router.refresh();
    }
    showSuccess("บันทึกข้อมูลเรียบร้อยแล้ว");
  };

  const handleGeneratePdf = async () => {
    if (!id) {
      showError("กรุณาบันทึกข้อมูลก่อน กดแสดงใบเสนอราคา");
      return;
    }
    setGenerating(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/project-files/${id}/generate-pdf`, {
      method: "POST",
    });
    setGenerating(false);
    if (!res.ok) {
      const data = await readJsonSafe<{ error?: string; detail?: string }>(res);
      const message = data?.error || "ไม่สามารถสร้างไฟล์ PDF ได้";
      const detail = data?.detail ? `\n${data.detail}` : "";
      showError(`${message}${detail}`);
      return;
    }
    const data = await readJsonSafe<{ versionNo: number; pdfPath?: string }>(res);
    if (!data) {
      showError("รูปแบบข้อมูลตอบกลับไม่ถูกต้อง");
      return;
    }
    showSuccess(`สร้าง PDF สำเร็จ (Version ${data.versionNo})`);
    if (data.pdfPath) {
      window.open(data.pdfPath as string, "_blank");
    }
    router.refresh();
  };

  return (
    <Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {error ? (
          <Alert
            severity="error"
            variant="filled"
            onClose={() => setSnackbarOpen(false)}
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        ) : (
          <Alert
            severity="success"
            variant="filled"
            onClose={() => setSnackbarOpen(false)}
            sx={{ width: "100%" }}
          >
            {success}
          </Alert>
        )}
      </Snackbar>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 2 }}>
            ข้อมูลใบเสนอราคา
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="เลขที่ใบเสนอราคา (Auto)"
                value={form.projectCode}
                disabled
                InputProps={{
                  endAdornment: loadingCode ? <CircularProgress size={16} /> : null,
                }}
                placeholder="1/2026"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="ชื่อโครงการ *"
                value={form.projectName}
                onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="หัวข้อ/Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="เลขที่อ้างอิง"
                value={form.quotationNo}
                onChange={(e) => setForm({ ...form, quotationNo: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Revision"
                value={form.revisionNo}
                onChange={(e) => setForm({ ...form, revisionNo: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="วันที่เอกสาร"
                value={form.quotationDate}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                  let masked = digits;
                  if (digits.length > 2) masked = digits.slice(0, 2) + "/" + digits.slice(2);
                  if (digits.length > 4) masked = masked.slice(0, 5) + "/" + masked.slice(5);
                  setForm({ ...form, quotationDate: masked });
                }}
                placeholder="dd/MM/yyyy"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="ชื่อลูกค้า"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Bill To"
                value={form.billTo}
                onChange={(e) => setForm({ ...form, billTo: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Dear"
                value={form.dear}
                onChange={(e) => setForm({ ...form, dear: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="ผู้ควบคุมงาน"
                value={form.supervisorName}
                onChange={(e) => setForm({ ...form, supervisorName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="สถานะ"
                select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ProjectFileStatus })
                }
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={700} color="primary">
              ตารางรายละเอียดงาน
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addLine}>
              เพิ่มรายการ
            </Button>
          </Box>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ width: "max-content", minWidth: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell>ลำดับ</TableCell>
                  <TableCell>ประเภท</TableCell>
                  <TableCell>รายการ</TableCell>
                  <TableCell>ปริมาณ</TableCell>
                  <TableCell>หน่วย</TableCell>
                  <TableCell>วัสดุ/หน่วย</TableCell>
                  <TableCell>วัสดุรวม</TableCell>
                  <TableCell>แรงงาน/หน่วย</TableCell>
                  <TableCell>แรงงานรวม</TableCell>
                  <TableCell>รวมเป็นเงิน</TableCell>
                  <TableCell>หมายเหตุ</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((line, idx) => (
                  <TableRow key={`${line.sortOrder}-${idx}`} hover>
                    <TableCell>
                      <TextField
                        size="small"
                        value={line.itemNo ?? ""}
                        onChange={(e) => updateLine(idx, "itemNo", e.target.value)}
                        sx={{ width: colWidths.itemNo }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={line.lineType}
                        onChange={(e) => updateLine(idx, "lineType", e.target.value)}
                        sx={{ minWidth: 100 }}
                      >
                        <MenuItem value="SECTION">หมวดงาน</MenuItem>
                        <MenuItem value="ITEM">รายการ</MenuItem>
                        <MenuItem value="NOTE">บันทึก</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={line.description}
                        onChange={(e) => updateLine(idx, "description", e.target.value)}
                        sx={{ width: colWidths.description }}
                      />
                    </TableCell>
                    <TableCell>
                      <NumericTextField
                        value={line.quantity}
                        onChange={(v) => updateLine(idx, "quantity", v)}
                        minCh={5}
                        width={colWidths.quantity}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={line.unit ?? ""}
                        onChange={(e) => updateLine(idx, "unit", e.target.value)}
                        sx={{ width: colWidths.unit }}
                      />
                    </TableCell>
                    <TableCell>
                      <NumericTextField
                        value={line.materialUnitPrice}
                        onChange={(v) => updateLine(idx, "materialUnitPrice", v)}
                        minCh={8}
                        width={colWidths.materialUnitPrice}
                      />
                    </TableCell>
                    <TableCell>
                      <NumericTextField value={line.materialAmount} readOnly minCh={8} width={colWidths.materialAmount} />
                    </TableCell>
                    <TableCell>
                      <NumericTextField
                        value={line.laborUnitPrice}
                        onChange={(v) => updateLine(idx, "laborUnitPrice", v)}
                        minCh={8}
                        width={colWidths.laborUnitPrice}
                      />
                    </TableCell>
                    <TableCell>
                      <NumericTextField value={line.laborAmount} readOnly minCh={8} width={colWidths.laborAmount} />
                    </TableCell>
                    <TableCell>
                      <NumericTextField value={line.lineTotal} readOnly minCh={8} width={colWidths.lineTotal} />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={line.remark ?? ""}
                        onChange={(e) => updateLine(idx, "remark", e.target.value)}
                        sx={{ width: colWidths.remark }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => deleteLine(idx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 2 }}>
            สรุปยอด
          </Typography>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Overhead (%)"
                    type="number"
                    value={form.overheadPercent}
                    onChange={(e) => setForm({ ...form, overheadPercent: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      select
                      label="Discount Type"
                      value={discountMode}
                      onChange={(e) =>
                        setDiscountMode(e.target.value as "AMOUNT" | "PERCENT")
                      }
                      sx={{ minWidth: 130 }}
                    >
                      <MenuItem value="AMOUNT">จำนวนเงิน</MenuItem>
                      <MenuItem value="PERCENT">เปอร์เซ็นต์</MenuItem>
                    </TextField>
                    <TextField
                      fullWidth
                      label={discountMode === "PERCENT" ? "Discount (%)" : "Discount (บาท)"}
                      type="number"
                      value={form.discountInput}
                      onChange={(e) =>
                        setForm({ ...form, discountInput: e.target.value })
                      }
                    />
                  </Box>
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="เงื่อนไขการชำระเงิน"
                    multiline
                    minRows={3}
                    value={form.paymentTermsText}
                    onChange={(e) => setForm({ ...form, paymentTermsText: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                {([
                  ["SUB-TOTAL", formatMoney(totals.subtotal)],
                  [`OVERHEAD (${form.overheadPercent}%)`, formatMoney(totals.overheadAmount)],
                  ["TOTAL", formatMoney(totals.total)],
                  ["DISCOUNT", formatMoney(totals.discount)],
                ] as [string, string][]).map(([label, value]) => (
                  <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2">{value}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <Typography variant="subtitle1" fontWeight={700} color="primary">GRAND TOTAL</Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="primary">{formatMoney(totals.grandTotal)}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {form.amountTextTh}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          บันทึก
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={
            generating ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfIcon />
          }
          onClick={handleGeneratePdf}
          disabled={generating}
        >
          แสดงใบเสนอราคา
        </Button>
      </Box>

      {id && versions.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              เวอร์ชัน PDF ล่าสุด
            </Typography>
            {versions.map((v) => (
              <Box key={v.id} sx={{ mb: 0.5 }}>
                <a href={v.pdfPath || "#"} target="_blank" rel="noreferrer">
                  Version {v.versionNo} - {new Date(v.createdAt).toLocaleString("th-TH")}
                </a>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
