"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

// Leaflet requires browser APIs — must be loaded client-side only
const MapPlanner = dynamic(() => import("./MapPlanner"), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <CircularProgress />
    </Box>
  ),
});

export default function MapPlannerLoader() {
  return <MapPlanner />;
}
