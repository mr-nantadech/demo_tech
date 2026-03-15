"use client";

import { useState } from "react";
import NextImage from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

type AlbumImage = { id: string; url: string };
type Album = {
  id: string;
  title: string;
  description: string | null;
  images: AlbumImage[];
};

type ViewMode = "grid" | "column";

export default function PortfolioView({ albums }: { albums: Album[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [lightbox, setLightbox] = useState<{ albumId: string; index: number } | null>(null);

  const openLightbox = (albumId: string, index: number) => setLightbox({ albumId, index });
  const closeLightbox = () => setLightbox(null);

  const currentAlbum = lightbox ? albums.find((a) => a.id === lightbox.albumId) : null;
  const currentImage = currentAlbum?.images[lightbox?.index ?? 0];

  const prevImage = () => {
    if (!lightbox || !currentAlbum) return;
    setLightbox({
      albumId: lightbox.albumId,
      index: (lightbox.index - 1 + currentAlbum.images.length) % currentAlbum.images.length,
    });
  };
  const nextImage = () => {
    if (!lightbox || !currentAlbum) return;
    setLightbox({
      albumId: lightbox.albumId,
      index: (lightbox.index + 1) % currentAlbum.images.length,
    });
  };

  if (albums.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <PhotoLibraryIcon sx={{ fontSize: 72, color: "text.disabled", mb: 2 }} />
        <Typography color="text.secondary">ยังไม่มีผลงาน</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* View Toggle */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, v) => v && setViewMode(v)}
          size="small"
        >
          <ToggleButton value="grid" title="แสดงแบบกริด">
            <GridViewIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="column" title="แสดงแบบคอลัมน์">
            <ViewColumnIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Albums */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {albums.map((album, ai) => (
          <Box key={album.id}>
            {/* Album Header */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Typography variant="h5" fontWeight={700}>
                  {album.title}
                </Typography>
                <Chip
                  size="small"
                  label={`${album.images.length} รูป`}
                  variant="outlined"
                  icon={<PhotoLibraryIcon sx={{ fontSize: "14px !important" }} />}
                />
              </Box>
              {album.description && (
                <Typography variant="body1" color="text.secondary">
                  {album.description}
                </Typography>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            {album.images.length === 0 ? (
              <Typography color="text.disabled" variant="body2">
                ยังไม่มีรูปในอัลบั้มนี้
              </Typography>
            ) : viewMode === "grid" ? (
              /* Grid view: 2-3-4 columns */
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 1,
                }}
              >
                {album.images.map((image, idx) => (
                  <Box
                    key={image.id}
                    onClick={() => openLightbox(album.id, idx)}
                    sx={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      "&:hover img": { transform: "scale(1.05)" },
                    }}
                  >
                    <NextImage
                      src={image.url}
                      alt={`${album.title} รูปที่ ${idx + 1}`}
                      fill
                      sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                      style={{ objectFit: "cover", transition: "transform 0.3s" }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              /* Column view: full-width stacked */
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {album.images.map((image, idx) => (
                  <Box
                    key={image.id}
                    onClick={() => openLightbox(album.id, idx)}
                    sx={{
                      position: "relative",
                      width: "100%",
                      cursor: "pointer",
                      borderRadius: 2,
                      overflow: "hidden",
                      maxHeight: { xs: 280, sm: 480, md: 640 },
                    }}
                  >
                    <NextImage
                      src={image.url}
                      alt={`${album.title} รูปที่ ${idx + 1}`}
                      width={1200}
                      height={800}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "inherit",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            {ai < albums.length - 1 && <Divider sx={{ mt: 6 }} />}
          </Box>
        ))}
      </Box>

      {/* Lightbox */}
      <Dialog
        open={Boolean(lightbox)}
        onClose={closeLightbox}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: "rgba(0,0,0,0.92)",
            boxShadow: "none",
            m: 0,
            maxWidth: "100vw",
            maxHeight: "100vh",
            width: "100vw",
            height: "100vh",
            borderRadius: 0,
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            height: "100%",
          }}
        >
          {/* Close */}
          <IconButton
            onClick={closeLightbox}
            sx={{ position: "absolute", top: 12, right: 12, color: "#fff", zIndex: 10 }}
          >
            <CloseIcon />
          </IconButton>

          {/* Counter */}
          {currentAlbum && (
            <Typography
              sx={{
                position: "absolute",
                top: 16,
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
              }}
            >
              {(lightbox?.index ?? 0) + 1} / {currentAlbum.images.length}
            </Typography>
          )}

          {/* Prev */}
          {(currentAlbum?.images.length ?? 0) > 1 && (
            <IconButton
              onClick={prevImage}
              sx={{
                position: "absolute",
                left: { xs: 4, sm: 16 },
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}

          {/* Image */}
          {currentImage && lightbox && (
            <Box
              sx={{
                position: "relative",
                maxWidth: "90vw",
                maxHeight: "90vh",
                width: "100%",
                height: "100%",
              }}
            >
              <NextImage
                key={currentImage.id}
                src={currentImage.url}
                alt=""
                fill
                sizes="90vw"
                style={{ objectFit: "contain" }}
                priority
              />
            </Box>
          )}

          {/* Next */}
          {(currentAlbum?.images.length ?? 0) > 1 && (
            <IconButton
              onClick={nextImage}
              sx={{
                position: "absolute",
                right: { xs: 4, sm: 16 },
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
