"use client";

import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Image from "next/image";
import {
  defaultHomeContent,
  type HomeSlideContent,
} from "@/lib/home-content";

const INTERVAL_MS = 5000;

export default function HeroSlider({
  slides = defaultHomeContent.slides,
}: {
  slides?: HomeSlideContent[];
}) {
  const safeSlides =
    Array.isArray(slides) && slides.length > 0
      ? slides
      : defaultHomeContent.slides;
  const [current, setCurrent] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [fade, setFade] = useState(true);

  const goTo = useCallback(
    (index: number) => {
      setFade(false);
      setTimeout(() => {
        setCurrent((index + safeSlides.length) % safeSlides.length);
        setFade(true);
      }, 250);
    },
    [safeSlides.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [next]);

  const slide = safeSlides[current] ?? safeSlides[0];
  const useGradient = imgErrors[current];

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 320, sm: 420, md: 520 },
        overflow: "hidden",
        bgcolor: "#0D47A1",
      }}
    >
      {/* Background image / gradient */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: fade ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {!useGradient ? (
          <Image
            key={current}
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority={current === 0}
            onError={() => setImgErrors((prev) => ({ ...prev, [current]: true }))}
          />
        ) : (
          <Box sx={{ width: "100%", height: "100%", background: slide.gradient }} />
        )}

        {/* Dark overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: useGradient
              ? "rgba(0,0,0,0.25)"
              : "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)",
          }}
        />
      </Box>

      {/* Text overlay */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 48, md: 64 },
          left: { xs: 20, md: 60 },
          right: { xs: 60, md: 120 },
          color: "#fff",
          opacity: fade ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ fontSize: { xs: "1.4rem", sm: "1.8rem", md: "2.2rem" }, mb: 1, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        >
          {slide.title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ opacity: 0.9, maxWidth: 560, textShadow: "0 1px 4px rgba(0,0,0,0.5)", fontSize: { xs: "0.85rem", md: "1rem" } }}
        >
          {slide.subtitle}
        </Typography>
      </Box>

      {/* Prev / Next arrows */}
      <IconButton
        onClick={prev}
        sx={{
          position: "absolute", left: { xs: 4, md: 16 }, top: "50%", transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.2)", color: "#fff",
          "&:hover": { bgcolor: "rgba(255,255,255,0.35)" },
        }}
      >
        <ChevronLeftIcon />
      </IconButton>
      <IconButton
        onClick={next}
        sx={{
          position: "absolute", right: { xs: 4, md: 16 }, top: "50%", transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.2)", color: "#fff",
          "&:hover": { bgcolor: "rgba(255,255,255,0.35)" },
        }}
      >
        <ChevronRightIcon />
      </IconButton>

      {/* Dot indicators */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
        }}
      >
        {safeSlides.map((_, i) => (
          <Box
            key={i}
            onClick={() => goTo(i)}
            sx={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: i === current ? "#fff" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "width 0.3s ease, background-color 0.3s ease",
            }}
          />
        ))}
      </Box>

      {/* Slide counter */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 20,
          color: "rgba(255,255,255,0.8)",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {current + 1} / {safeSlides.length}
      </Box>
    </Box>
  );
}
