"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

type AlbumImage = { id: string; filename: string };
type Album = {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  images: AlbumImage[];
};

export default function AlbumManager() {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState("");

  const fetchAlbums = useCallback(async () => {
    const res = await fetch("/api/albums");
    if (res.ok) {
      const data = await res.json();
      setAlbums(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const res = await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setDialogOpen(false);
      setForm({ title: "", description: "", sortOrder: 0 });
      setSnack("สร้างอัลบั้มสำเร็จ");
      fetchAlbums();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/albums/${id}`, { method: "DELETE" });
    setDeleteId(null);
    setSnack("ลบอัลบั้มสำเร็จ");
    fetchAlbums();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          เพิ่มอัลบั้ม
        </Button>
      </Box>

      {albums.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <PhotoLibraryIcon sx={{ fontSize: 72, color: "text.disabled", mb: 2 }} />
          <Typography color="text.secondary">
            ยังไม่มีอัลบั้ม กด &quot;เพิ่มอัลบั้ม&quot; เพื่อสร้างอัลบั้มแรก
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {albums.map((album) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={album.id}>
              <Card
                sx={{
                  height: "100%",
                  opacity: album.isActive ? 1 : 0.6,
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 4 },
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {album.title}
                        </Typography>
                        {!album.isActive && (
                          <VisibilityOffIcon fontSize="small" sx={{ color: "text.disabled" }} />
                        )}
                      </Box>
                      {album.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {album.description}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      size="small"
                      icon={<PhotoLibraryIcon sx={{ fontSize: "14px !important" }} />}
                      label={`${album.images.length} รูป`}
                      variant="outlined"
                      sx={{ flexShrink: 0 }}
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => router.push(`/album/${album.id}`)}
                  >
                    แก้ไข / จัดการรูป
                  </Button>
                  <IconButton size="small" color="error" onClick={() => setDeleteId(album.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>เพิ่มอัลบั้มใหม่</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="ชื่ออัลบั้ม *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <TextField
              fullWidth
              label="รายละเอียด"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="ลำดับการแสดง (น้อย = ขึ้นก่อน)"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving || !form.title.trim()}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบอัลบั้มนี้หรือไม่? รูปทั้งหมดในอัลบั้มจะถูกลบด้วย</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>ยกเลิก</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteId && handleDelete(deleteId)}
          >
            ลบ
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        onClose={() => setSnack("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnack("")}>
          {snack}
        </Alert>
      </Snackbar>
    </>
  );
}
