"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";

type AlbumImage = { id: string; albumId: string; filename: string; sortOrder: number };
type Album = {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  images: AlbumImage[];
};

export default function AlbumDetailManager({ albumId }: { albumId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", sortOrder: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ msg: string; severity: "success" | "error" } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchAlbum = useCallback(async () => {
    const res = await fetch(`/api/albums/${albumId}`);
    if (!res.ok) {
      router.push("/album");
      return;
    }
    const data: Album = await res.json();
    setAlbum(data);
    setForm({
      title: data.title,
      description: data.description ?? "",
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    });
    setLoading(false);
  }, [albumId, router]);

  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/albums/${albumId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSnack({ msg: "บันทึกสำเร็จ", severity: "success" });
      fetchAlbum();
    } else {
      setSnack({ msg: "เกิดข้อผิดพลาด", severity: "error" });
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    const fileArr = Array.from(files);
    for (let i = 0; i < fileArr.length; i++) {
      const fd = new FormData();
      fd.append("file", fileArr[i]);
      await fetch(`/api/albums/${albumId}/images`, { method: "POST", body: fd });
      setUploadProgress(Math.round(((i + 1) / fileArr.length) * 100));
    }

    setUploading(false);
    setSnack({ msg: `อัปโหลด ${fileArr.length} รูปสำเร็จ`, severity: "success" });
    fetchAlbum();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteImage = async (imageId: string) => {
    await fetch(`/api/albums/${albumId}/images/${imageId}`, { method: "DELETE" });
    setDeleteImageId(null);
    setSnack({ msg: "ลบรูปสำเร็จ", severity: "success" });
    fetchAlbum();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!album) return null;

  return (
    <>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <IconButton onClick={() => router.push("/album")} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            แก้ไขอัลบั้ม
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {album.title}
          </Typography>
        </Box>
      </Box>

      {/* Edit Form */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          ข้อมูลอัลบั้ม
        </Typography>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField
              fullWidth
              label="ชื่ออัลบั้ม *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              label="ลำดับ (น้อย = ขึ้นก่อน)"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }} sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              }
              label="แสดงผล"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="รายละเอียด"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </Box>
      </Paper>

      {/* Image Management */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}
        >
          <Typography variant="h6" fontWeight={600}>
            รูปภาพ ({album.images.length} รูป)
          </Typography>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            อัปโหลดรูป
          </Button>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleUpload(e.target.files)}
        />

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              กำลังอัปโหลดและแปลงเป็น WebP... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {/* Drag & Drop Zone */}
        <Box
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          sx={{
            border: "2px dashed",
            borderColor: dragOver ? "primary.main" : "divider",
            borderRadius: 2,
            p: 3,
            mb: 3,
            textAlign: "center",
            bgcolor: dragOver ? "action.hover" : "background.default",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUploadIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            ลากวางรูปที่นี่ หรือคลิกเพื่อเลือกรูป
          </Typography>
          <Typography variant="caption" color="text.disabled">
            รองรับ JPG, PNG, WEBP, GIF — จะแปลงเป็น WebP อัตโนมัติ
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {album.images.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>
            ยังไม่มีรูป
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {album.images.map((image) => (
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={image.id}>
                <Card
                  sx={{
                    position: "relative",
                    "&:hover .delete-btn": { opacity: 1 },
                  }}
                >
                  <Box sx={{ position: "relative", aspectRatio: "1", overflow: "hidden" }}>
                    <NextImage
                      src={`/uploads/albums/${albumId}/${image.filename}`}
                      alt=""
                      fill
                      sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 16vw"
                      style={{ objectFit: "cover" }}
                    />
                    <IconButton
                      className="delete-btn"
                      size="small"
                      onClick={() => setDeleteImageId(image.id)}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        opacity: 0,
                        transition: "opacity 0.2s",
                        "&:hover": { bgcolor: "rgba(200,0,0,0.8)" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Delete Image Dialog */}
      <Dialog open={Boolean(deleteImageId)} onClose={() => setDeleteImageId(null)}>
        <DialogTitle>ยืนยันการลบรูป</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบรูปนี้หรือไม่?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteImageId(null)}>ยกเลิก</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteImageId && handleDeleteImage(deleteImageId)}
          >
            ลบ
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack?.severity} onClose={() => setSnack(null)}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
