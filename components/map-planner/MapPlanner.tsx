"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import RouteIcon from "@mui/icons-material/Route";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import StraightenIcon from "@mui/icons-material/Straighten";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlaceIcon from "@mui/icons-material/Place";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import TurnRightIcon from "@mui/icons-material/TurnRight";
import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import TurnSharpRightIcon from "@mui/icons-material/TurnSharpRight";
import TurnSharpLeftIcon from "@mui/icons-material/TurnSharpLeft";
import TurnSlightRightIcon from "@mui/icons-material/TurnSlightRight";
import TurnSlightLeftIcon from "@mui/icons-material/TurnSlightLeft";
import StraightIcon from "@mui/icons-material/Straight";
import UTurnLeftIcon from "@mui/icons-material/UTurnLeft";
import NearMeIcon from "@mui/icons-material/NearMe";
import FlagIcon from "@mui/icons-material/Flag";
import LoopIcon from "@mui/icons-material/Loop";
import RampRightIcon from "@mui/icons-material/RampRight";
import RampLeftIcon from "@mui/icons-material/RampLeft";
import MergeIcon from "@mui/icons-material/Merge";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Collapse from "@mui/material/Collapse";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsOffIcon from "@mui/icons-material/GpsOff";
import NavigationIcon from "@mui/icons-material/Navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocationItem {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

interface StepInfo {
  instruction: string;
  roadName: string;
  distanceText: string;
  durationText: string;
  maneuverType: string;
  modifier?: string;
  lat: number; // maneuver start position (for proximity matching)
  lng: number;
}

interface RouteLeg {
  fromName: string;
  toName: string;
  distanceText: string;
  durationText: string;
  distanceValue: number; // metres
  steps: StepInfo[];
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name: string;
}

// ── Free APIs ────────────────────────────────────────────────────────────────
// Nominatim (OpenStreetMap) — free, no API key

async function searchNominatim(query: string): Promise<NominatimResult[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0`,
      { headers: { "Accept-Language": "th,en" } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function reverseNominatim(lat: number, lng: number): Promise<{ address: string; name: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "th,en" } },
    );
    if (!res.ok) return { address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, name: "" };
    const d = await res.json();
    return {
      address: d.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      name: d.address?.amenity || d.address?.leisure || d.address?.road || d.name || "",
    };
  } catch {
    return { address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, name: "" };
  }
}

// OSRM public routing engine — free, no API key

type OsrmRawResult = {
  geometry: [number, number][]; // [lat, lng] for Leaflet
  legs: { distance: number; duration: number; steps: OsrmStep[] }[];
};

// /trip — lets OSRM find the optimal visit order (better than nearest-neighbour)
async function fetchOsrmTrip(waypoints: { lat: number; lng: number }[]): Promise<(OsrmRawResult & { order: number[] }) | null> {
  try {
    const coords = waypoints.map((w) => `${w.lng},${w.lat}`).join(";");
    const res = await fetch(
      `https://router.project-osrm.org/trip/v1/driving/${coords}?roundtrip=false&source=first&destination=last&overview=full&geometries=geojson&steps=true`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.trips?.[0]) return null;
    // waypoints[i].waypoint_index = position of input waypoint i in the optimised trip
    const order = new Array<number>(waypoints.length);
    (data.waypoints as { waypoint_index: number }[]).forEach((wp, i) => { order[wp.waypoint_index] = i; });
    const trip = data.trips[0];
    return {
      geometry: trip.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]),
      legs: trip.legs,
      order,
    };
  } catch {
    return null;
  }
}

// /route — used as fallback when /trip is unavailable
async function fetchOsrmRoute(waypoints: { lat: number; lng: number }[]): Promise<OsrmRawResult | null> {
  try {
    const coords = waypoints.map((w) => `${w.lng},${w.lat}`).join(";");
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]) return null;
    const route = data.routes[0];
    return {
      geometry: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]),
      legs: route.legs,
    };
  } catch {
    return null;
  }
}

interface OsrmStep {
  distance: number;
  duration: number;
  name: string;
  maneuver: { type: string; modifier?: string; location: [number, number] }; // location = [lng, lat]
}

// Find the nearest step across all legs given a GPS position
function findNearestStep(
  lat: number, lng: number, legs: RouteLeg[],
): { legIdx: number; stepIdx: number } | null {
  let minDist = Infinity, result: { legIdx: number; stepIdx: number } | null = null;
  legs.forEach((leg, li) => {
    leg.steps.forEach((step, si) => {
      const d = haversine(lat, lng, step.lat, step.lng);
      if (d < minDist) { minDist = d; result = { legIdx: li, stepIdx: si }; }
    });
  });
  return result;
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} กม.` : `${Math.round(m)} ม.`;
}
function fmtTime(s: number) {
  const mins = Math.round(s / 60);
  if (mins >= 60) {
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h} ชม. ${m} น.` : `${h} ชม.`;
  }
  return `${mins} น.`;
}

// ── Step instruction helpers ──────────────────────────────────────────────────

function modifierThai(mod?: string): string {
  switch (mod) {
    case "right":        return "เลี้ยวขวา";
    case "left":         return "เลี้ยวซ้าย";
    case "slight right": return "เลี้ยวขวาเล็กน้อย";
    case "slight left":  return "เลี้ยวซ้ายเล็กน้อย";
    case "sharp right":  return "เลี้ยวขวาคม";
    case "sharp left":   return "เลี้ยวซ้ายคม";
    case "uturn":        return "กลับรถ";
    case "straight":     return "ตรงไป";
    default:             return mod ?? "";
  }
}

function stepInstruction(type: string, modifier?: string): string {
  switch (type) {
    case "depart":           return "ออกเดินทาง";
    case "arrive":           return "ถึงจุดหมาย";
    case "turn":             return modifierThai(modifier);
    case "continue":         return "ตรงไปต่อ";
    case "new name":         return "ตรงไป (เปลี่ยนชื่อถนน)";
    case "merge":            return `รวมเส้นทาง${modifier ? " " + modifierThai(modifier) : ""}`;
    case "on ramp":          return `ขึ้นทางลาด${modifier ? " " + modifierThai(modifier) : ""}`;
    case "off ramp":         return `ลงทางลาด${modifier ? " " + modifierThai(modifier) : ""}`;
    case "fork":             return `แยก${modifier === "right" ? "ขวา" : modifier === "left" ? "ซ้าย" : ""}`;
    case "end of road":      return `ปลายถนน — ${modifierThai(modifier)}`;
    case "roundabout":
    case "rotary":           return "วงเวียน";
    case "exit roundabout":
    case "exit rotary":      return "ออกจากวงเวียน";
    case "use lane":         return "เลือกช่องจราจร";
    case "notification":     return "แจ้งเตือน";
    default:                 return modifierThai(modifier) || "ตรงไป";
  }
}

function StepIcon({ type, modifier }: { type: string; modifier?: string }) {
  const sx = { fontSize: 18 };
  if (type === "depart")                          return <NearMeIcon sx={sx} />;
  if (type === "arrive")                          return <FlagIcon sx={sx} />;
  if (type === "roundabout" || type === "rotary") return <LoopIcon sx={sx} />;
  if (type === "on ramp")   return modifier === "left" ? <RampLeftIcon sx={sx} /> : <RampRightIcon sx={sx} />;
  if (type === "off ramp")  return modifier === "left" ? <RampLeftIcon sx={sx} /> : <RampRightIcon sx={sx} />;
  if (type === "merge")     return <MergeIcon sx={sx} />;
  switch (modifier) {
    case "right":        return <TurnRightIcon sx={sx} />;
    case "left":         return <TurnLeftIcon sx={sx} />;
    case "sharp right":  return <TurnSharpRightIcon sx={sx} />;
    case "sharp left":   return <TurnSharpLeftIcon sx={sx} />;
    case "slight right": return <TurnSlightRightIcon sx={sx} />;
    case "slight left":  return <TurnSlightLeftIcon sx={sx} />;
    case "uturn":        return <UTurnLeftIcon sx={sx} />;
    default:             return <StraightIcon sx={sx} />;
  }
}

// ── Current position marker (pulsing blue dot) ───────────────────────────────

const GPS_CSS_ID = "map-planner-gps-css";

function injectGpsCss() {
  if (document.getElementById(GPS_CSS_ID)) return;
  const style = document.createElement("style");
  style.id = GPS_CSS_ID;
  style.textContent = `
    .gps-dot { width:16px; height:16px; border-radius:50%; background:#1565C0;
                border:3px solid white; box-shadow:0 1px 5px rgba(0,0,0,0.4); position:relative; }
    .gps-dot::after { content:''; position:absolute; top:-8px; left:-8px;
                      width:32px; height:32px; border-radius:50%;
                      background:rgba(21,101,192,0.18);
                      animation:gps-ring 1.8s ease-out infinite; }
    @keyframes gps-ring { 0%{transform:scale(.3);opacity:1} 100%{transform:scale(1.6);opacity:0} }
    .preview-dot { width:14px; height:14px; border-radius:50%; background:#E65100;
                   border:3px solid white; box-shadow:0 1px 5px rgba(0,0,0,0.4); position:relative; }
    .preview-dot::after { content:''; position:absolute; top:-8px; left:-8px;
                          width:30px; height:30px; border-radius:50%;
                          background:rgba(230,81,0,0.2);
                          animation:preview-ring 1.5s ease-out infinite; }
    @keyframes preview-ring { 0%{transform:scale(.3);opacity:1} 100%{transform:scale(1.6);opacity:0} }
  `;
  document.head.appendChild(style);
}

function currentPosIcon() {
  return divIcon({ html: '<div class="gps-dot"></div>', className: "", iconSize: [16, 16], iconAnchor: [8, 8] });
}

function previewStepIcon() {
  return divIcon({ html: '<div class="preview-dot"></div>', className: "", iconSize: [14, 14], iconAnchor: [7, 7] });
}

// ── Marker icon (numbered SVG circle) ────────────────────────────────────────

function markerIcon(num: number, color: string) {
  return divIcon({
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:2.5px solid white;color:white;font-weight:700;font-size:${num > 9 ? 11 : 14}px;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;line-height:1">${num}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// ── Nearest-Neighbour TSP heuristic ──────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestNeighbor(pts: (LocationItem & { lat: number; lng: number })[]) {
  if (pts.length <= 2) return pts;
  const result = [pts[0]];
  const remaining = [...pts.slice(1)];
  while (remaining.length > 0) {
    const last = result[result.length - 1];
    let minIdx = 0, minDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(last.lat, last.lng, remaining[i].lat, remaining[i].lng);
      if (d < minDist) { minDist = d; minIdx = i; }
    }
    result.push(...remaining.splice(minIdx, 1));
  }
  return result;
}

// ── Leaflet inner components (must be children of MapContainer) ───────────────

function MapClickHandler({
  activeIdxRef,
  onMapClick,
}: {
  activeIdxRef: React.RefObject<number | null>;
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (activeIdxRef.current !== null) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ target }: { target?: { lat: number; lng: number; zoom: number } }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom, { duration: 1 });
  }, [target, map]);
  return null;
}

// ── Shared id counter ─────────────────────────────────────────────────────────

let nextId = 3;

// ── Main Component ────────────────────────────────────────────────────────────

export default function MapPlanner() {
  const [locations, setLocations] = useState<LocationItem[]>([
    { id: "1", name: "", address: "", lat: null, lng: null },
    { id: "2", name: "", address: "", lat: null, lng: null },
  ]);
  const [routeLegs, setRouteLegs] = useState<RouteLeg[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [orderedRoute, setOrderedRoute] = useState<(LocationItem & { lat: number; lng: number })[]>([]);
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState("");

  // Active row — ref for map click handler (avoids stale closure), state for visual
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const activeIdxRef = useRef<number | null>(null);

  const [loadingGpsId, setLoadingGpsId] = useState<string | null>(null);
  const [expandedLegs, setExpandedLegs] = useState<Set<number>>(new Set());
  const [isTracking, setIsTracking] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [activeStep, setActiveStep] = useState<{ legIdx: number; stepIdx: number } | null>(null);
  const [previewStep, setPreviewStep] = useState<{ lat: number; lng: number; legIdx: number; stepIdx: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const firstFixRef = useRef(true);

  const toggleLeg = (i: number) =>
    setExpandedLegs((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  // Inject CSS for pulsing dot once
  useEffect(() => { injectGpsCss(); }, []);

  // Cleanup watchPosition on unmount
  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  const toggleTracking = useCallback(() => {
    if (isTracking) {
      if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
      setIsTracking(false);
      setCurrentPos(null);
      setActiveStep(null);
      firstFixRef.current = true;
      return;
    }
    if (!navigator.geolocation) { setError("เบราว์เซอร์ไม่รองรับ Geolocation"); return; }
    setIsTracking(true);
    firstFixRef.current = true;
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setCurrentPos({ lat, lng });
        const nearest = findNearestStep(lat, lng, routeLegs);
        setActiveStep(nearest);
        if (nearest) {
          // Auto-expand the leg that contains the current step
          setExpandedLegs((prev) => prev.has(nearest.legIdx) ? prev : new Set([...prev, nearest.legIdx]));
        }
        if (firstFixRef.current) {
          firstFixRef.current = false;
          setFlyTo({ lat, lng, zoom: 16 });
        }
      },
      () => { setIsTracking(false); setError("ไม่สามารถติดตามตำแหน่งได้ กรุณาอนุญาต Location"); },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 },
    );
  }, [isTracking, routeLegs]); // eslint-disable-line react-hooks/exhaustive-deps
  const [forcedAddresses, setForcedAddresses] = useState<Record<string, string>>({});
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | undefined>();

  const validLocations = useMemo(
    () => locations.filter((l): l is LocationItem & { lat: number; lng: number } => l.lat !== null && l.lng !== null),
    [locations],
  );

  // ── Helpers ───────────────────────────────────────────────────────────────

  const resetRoute = () => {
    setRouteLegs([]); setRouteGeometry([]); setOrderedRoute([]);
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    setIsTracking(false); setCurrentPos(null); setActiveStep(null); setPreviewStep(null);
  };

  const applyLocation = useCallback((id: string, data: Partial<LocationItem>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    resetRoute();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activateRow = (idx: number) => { activeIdxRef.current = idx; setActiveIdx(idx); };
  const deactivateRow = () => setTimeout(() => { activeIdxRef.current = null; setActiveIdx(null); }, 300);

  // ── Map click → reverse geocode → fill row ────────────────────────────────

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    const idx = activeIdxRef.current;
    if (idx === null || idx >= locations.length) return;
    const id = locations[idx]?.id;
    if (!id) return;
    const { address, name } = await reverseNominatim(lat, lng);
    applyLocation(id, { lat, lng, address, name });
    setForcedAddresses((prev) => ({ ...prev, [id]: address }));
  }, [locations, applyLocation]);

  // ── Step preview ──────────────────────────────────────────────────────────

  const handleStepPreview = useCallback((step: StepInfo, legIdx: number, stepIdx: number) => {
    setPreviewStep((prev) => {
      if (prev?.legIdx === legIdx && prev?.stepIdx === stepIdx) return null; // toggle off
      setFlyTo({ lat: step.lat, lng: step.lng, zoom: 17 });
      return { lat: step.lat, lng: step.lng, legIdx, stepIdx };
    });
    // Ensure the leg is expanded so the highlighted step is visible
    setExpandedLegs((prev) => prev.has(legIdx) ? prev : new Set([...prev, legIdx]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReturnToCurrent = useCallback(() => {
    setPreviewStep(null);
    if (currentPos) setFlyTo({ lat: currentPos.lat, lng: currentPos.lng, zoom: 16 });
  }, [currentPos]);

  // ── GPS ───────────────────────────────────────────────────────────────────

  const handleGps = useCallback(async (id: string) => {
    if (!navigator.geolocation) { setError("เบราว์เซอร์ไม่รองรับ Geolocation"); return; }
    setLoadingGpsId(id);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        const { address, name } = await reverseNominatim(lat, lng);
        setLoadingGpsId(null);
        applyLocation(id, { lat, lng, address, name });
        setForcedAddresses((prev) => ({ ...prev, [id]: address }));
        setFlyTo({ lat, lng, zoom: 15 });
      },
      () => {
        setLoadingGpsId(null);
        setError("ไม่สามารถเข้าถึงตำแหน่ง กรุณาอนุญาต Location ในเบราว์เซอร์");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [applyLocation]);

  // ── Route planning ────────────────────────────────────────────────────────

  const handlePlan = async () => {
    setError("");
    if (validLocations.length < 2) {
      setError("กรุณาเลือกสถานที่อย่างน้อย 2 แห่ง (พิมพ์ค้นหา, คลิกแผนที่ หรือใช้ GPS)");
      return;
    }
    setPlanning(true);

    let ordered: (LocationItem & { lat: number; lng: number })[];
    let rawLegs: { distance: number; duration: number; steps: OsrmStep[] }[];
    let geometry: [number, number][];

    // Try OSRM /trip first (optimal ordering)
    const trip = await fetchOsrmTrip(validLocations);
    if (trip) {
      ordered = trip.order.map((i) => validLocations[i]);
      geometry = trip.geometry;
      rawLegs = trip.legs;
    } else {
      // Fallback: nearest-neighbour heuristic + /route
      ordered = nearestNeighbor(validLocations);
      const route = await fetchOsrmRoute(ordered);
      setPlanning(false);
      if (!route) { setError("ไม่สามารถคำนวณเส้นทางได้ กรุณาลองใหม่อีกครั้ง"); return; }
      geometry = route.geometry;
      rawLegs = route.legs;
    }

    setPlanning(false);
    setOrderedRoute(ordered);
    setRouteGeometry(geometry);
    setRouteLegs(
      rawLegs.map((leg, i) => ({
        fromName: ordered[i].name || ordered[i].address.split(",")[0],
        toName: ordered[i + 1].name || ordered[i + 1].address.split(",")[0],
        distanceText: fmtDist(leg.distance),
        durationText: fmtTime(leg.duration),
        distanceValue: leg.distance,
        steps: leg.steps
          .filter((s) => s.maneuver.type !== "arrive" || s === leg.steps[leg.steps.length - 1])
          .map((s) => ({
            instruction: stepInstruction(s.maneuver.type, s.maneuver.modifier),
            roadName: s.name || "",
            distanceText: s.distance > 0 ? fmtDist(s.distance) : "",
            durationText: s.duration > 0 ? fmtTime(s.duration) : "",
            maneuverType: s.maneuver.type,
            modifier: s.maneuver.modifier,
            lat: s.maneuver.location[1], // OSRM location = [lng, lat]
            lng: s.maneuver.location[0],
          })),
      })),
    );
  };

  const totalKm = (routeLegs.reduce((s, l) => s + l.distanceValue, 0) / 1000).toFixed(1);

  // ── Which markers to draw ─────────────────────────────────────────────────

  const markersToShow = orderedRoute.length > 0 ? orderedRoute : validLocations;

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary"
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <RouteIcon /> วางแผนเส้นทาง
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="body2" color="text.secondary">
            เพิ่มสถานที่โดย <b>พิมพ์ค้นหา</b> · <b>คลิกบนแผนที่</b> · หรือ <b>ใช้ตำแหน่งปัจจุบัน</b>
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2.5, flexDirection: { xs: "column", lg: "row" }, alignItems: { xs: "stretch", lg: "flex-start" } }}>

        {/* ── Left Panel ── */}
        <Box sx={{ width: { xs: "100%", lg: 420 }, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Input card */}
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
              สถานที่ที่ต้องการไป
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
              คลิกที่ช่องรายการ แล้วคลิกบนแผนที่เพื่อตั้งตำแหน่ง
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {locations.map((loc, i) => (
                <LocationRow
                  key={loc.id}
                  index={i}
                  location={loc}
                  isActive={activeIdx === i}
                  canRemove={locations.length > 2}
                  isGpsLoading={loadingGpsId === loc.id}
                  forcedAddress={forcedAddresses[loc.id]}
                  onFocus={() => activateRow(i)}
                  onBlur={deactivateRow}
                  onSelect={(data) => applyLocation(loc.id, data)}
                  onRemove={() => {
                    setLocations((prev) => prev.filter((l) => l.id !== loc.id));
                    resetRoute();
                  }}
                  onGps={() => handleGps(loc.id)}
                />
              ))}
            </Box>

            <Button size="small" startIcon={<AddLocationAltIcon />} onClick={() =>
              setLocations((prev) => [...prev, { id: String(nextId++), name: "", address: "", lat: null, lng: null }])
            } disabled={locations.length >= 10} sx={{ mt: 1.5 }}>
              เพิ่มสถานที่
            </Button>

            {error && <Alert severity="warning" sx={{ mt: 1.5 }} onClose={() => setError("")}>{error}</Alert>}

            <Button variant="contained" fullWidth onClick={handlePlan} disabled={planning}
              startIcon={planning ? <CircularProgress size={16} color="inherit" /> : <DirectionsCarIcon />}
              sx={{ mt: 2 }}>
              {planning ? "กำลังคำนวณเส้นทาง..." : "วางแผนเส้นทาง"}
            </Button>
          </Paper>

          {/* Route result card */}
          {orderedRoute.length > 0 && routeLegs.length > 0 && (
            <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
                  เส้นทางที่แนะนำ
                </Typography>
                <Tooltip title={isTracking ? "หยุดติดตามตำแหน่ง" : "ติดตามตำแหน่งปัจจุบัน"}>
                  <Button
                    size="small"
                    variant={isTracking ? "contained" : "outlined"}
                    color={isTracking ? "error" : "primary"}
                    startIcon={isTracking ? <GpsOffIcon /> : <GpsFixedIcon />}
                    onClick={toggleTracking}
                    sx={{ fontSize: 12, py: 0.4, whiteSpace: "nowrap" }}
                  >
                    {isTracking ? "หยุดติดตาม" : "ติดตามตำแหน่ง"}
                  </Button>
                </Tooltip>
              </Box>
              {isTracking && activeStep && (
                <Alert severity="info" icon={<NavigationIcon />} sx={{ mb: 1.5, py: 0.5, fontSize: 12 }}>
                  กำลังอยู่ที่ขั้นตอนที่ {activeStep.stepIdx + 1} (ช่วงที่ {activeStep.legIdx + 1})
                </Alert>
              )}
              {previewStep !== null && (
                <Alert
                  severity="warning"
                  icon={<PlaceIcon sx={{ fontSize: 16 }} />}
                  sx={{ mb: 1.5, py: 0.5, fontSize: 12, alignItems: "center" }}
                  action={
                    <Button
                      size="small"
                      color="warning"
                      variant="outlined"
                      startIcon={<MyLocationIcon sx={{ fontSize: 14 }} />}
                      onClick={handleReturnToCurrent}
                      sx={{ fontSize: 11, py: 0.3, whiteSpace: "nowrap" }}
                    >
                      {isTracking && currentPos ? "กลับตำแหน่งปัจจุบัน" : "ปิดตัวอย่าง"}
                    </Button>
                  }
                >
                  ดูตัวอย่าง: ขั้นตอนที่ {previewStep.stepIdx + 1} ช่วงที่ {previewStep.legIdx + 1}
                </Alert>
              )}
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {orderedRoute.map((loc, i) => (
                  <Box key={loc.id}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                      <Box sx={{
                        width: 28, height: 28, borderRadius: "50%",
                        bgcolor: i === 0 ? "success.main" : i === orderedRoute.length - 1 ? "error.main" : "primary.main",
                        color: "#fff", display: "flex", alignItems: "center",
                        justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0, mt: 0.2,
                      }}>
                        {i + 1}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {loc.name || loc.address.split(",")[0]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary"
                          sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {loc.address}
                        </Typography>
                        {i === 0 && <Chip label="จุดเริ่มต้น" size="small" color="success" sx={{ mt: 0.5, height: 18, fontSize: 10 }} />}
                        {i === orderedRoute.length - 1 && <Chip label="จุดสิ้นสุด" size="small" color="error" sx={{ mt: 0.5, height: 18, fontSize: 10 }} />}
                      </Box>
                    </Box>
                    {i < routeLegs.length && (
                      <Box sx={{ ml: 1.75, my: 0.5 }}>
                        {/* Leg summary row */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box sx={{ width: 2, alignSelf: "stretch", bgcolor: "divider", borderRadius: 1, flexShrink: 0 }} />
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1, py: 0.5, pl: 1 }}>
                            <StraightenIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary">{routeLegs[i].distanceText}</Typography>
                            <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary", ml: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">{routeLegs[i].durationText}</Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            {/* Toggle button */}
                            <Tooltip title={expandedLegs.has(i) ? "ซ่อนรายละเอียด" : "ดูเส้นทางละเอียด"}>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => toggleLeg(i)}
                                endIcon={expandedLegs.has(i) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                sx={{ fontSize: 11, py: 0.25, px: 0.75, minWidth: 0, color: "primary.main" }}
                              >
                                {expandedLegs.has(i) ? "ซ่อน" : "รายละเอียด"}
                              </Button>
                            </Tooltip>
                          </Box>
                        </Box>

                        {/* Turn-by-turn steps */}
                        <Collapse in={expandedLegs.has(i)}>
                          <Box sx={{
                            ml: 1, mt: 0.5, mb: 1,
                            border: "1px solid", borderColor: "divider",
                            borderRadius: 1.5, overflow: "hidden",
                            bgcolor: "grey.50",
                          }}>
                            {routeLegs[i].steps.map((step, j) => {
                              const isCurrent = activeStep?.legIdx === i && activeStep?.stepIdx === j;
                              const isPreview = previewStep?.legIdx === i && previewStep?.stepIdx === j;
                              return (
                                <Box
                                  key={j}
                                  onClick={() => handleStepPreview(step, i, j)}
                                  sx={{
                                    display: "flex", gap: 1.5, alignItems: "flex-start",
                                    px: 1.5, py: isCurrent ? 1 : 0.9,
                                    borderBottom: j < routeLegs[i].steps.length - 1 ? "1px solid" : "none",
                                    borderColor: isCurrent ? "primary.dark" : isPreview ? "warning.light" : "divider",
                                    boxShadow: isPreview && !isCurrent ? "inset 3px 0 0 #E65100" : "none",
                                    bgcolor: isCurrent ? "primary.main"
                                      : isPreview ? "rgba(230,81,0,0.08)"
                                      : step.maneuverType === "arrive" || step.maneuverType === "depart"
                                      ? "rgba(21,101,192,0.06)" : "transparent",
                                    transition: "background-color 0.2s, box-shadow 0.2s",
                                    cursor: "pointer",
                                    "&:hover": {
                                      bgcolor: isCurrent ? "primary.main"
                                        : isPreview ? "rgba(230,81,0,0.14)"
                                        : "rgba(0,0,0,0.04)",
                                    },
                                  }}
                                >
                                  {/* "Here" indicator */}
                                  {isCurrent && (
                                    <Box sx={{ position: "absolute", left: 6, display: "flex", alignItems: "center" }}>
                                      <NavigationIcon sx={{ fontSize: 13, color: "#fff", opacity: 0.9 }} />
                                    </Box>
                                  )}

                                  {/* Maneuver icon */}
                                  <Box sx={{
                                    color: isCurrent ? "#fff"
                                      : isPreview ? "#E65100"
                                      : step.maneuverType === "arrive" ? "error.main"
                                      : step.maneuverType === "depart" ? "success.main"
                                      : "primary.main",
                                    flexShrink: 0, mt: 0.1,
                                  }}>
                                    <StepIcon type={step.maneuverType} modifier={step.modifier} />
                                  </Box>

                                  {/* Text */}
                                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                      <Typography
                                        variant="caption" fontWeight={600} display="block"
                                        sx={{ color: isCurrent ? "#fff" : isPreview ? "#BF360C" : "inherit" }}
                                      >
                                        {step.instruction}
                                      </Typography>
                                      {isCurrent && (
                                        <Chip
                                          label="ตำแหน่งปัจจุบัน"
                                          size="small"
                                          sx={{ height: 16, fontSize: 9, bgcolor: "rgba(255,255,255,0.25)", color: "#fff" }}
                                        />
                                      )}
                                      {isPreview && !isCurrent && (
                                        <Chip
                                          label="ดูอยู่"
                                          size="small"
                                          sx={{ height: 16, fontSize: 9, bgcolor: "rgba(230,81,0,0.15)", color: "#E65100" }}
                                        />
                                      )}
                                    </Box>
                                    <Typography
                                      variant="caption" display="block" noWrap
                                      sx={{ color: isCurrent ? "rgba(255,255,255,0.8)" : "text.secondary" }}
                                    >
                                      {[
                                        step.roadName && `บน ${step.roadName}`,
                                        step.distanceText,
                                        step.durationText,
                                      ].filter(Boolean).join(" · ")}
                                    </Typography>
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        </Collapse>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <StraightenIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">ระยะทางรวม</Typography>
                </Box>
                <Typography variant="subtitle2" fontWeight={700} color="primary.main">{totalKm} กม.</Typography>
              </Box>
            </Paper>
          )}
        </Box>

        {/* ── Right Panel: Map ── */}
        <Box sx={{
          flexGrow: 1, width: { xs: "100%", lg: "auto" }, height: { xs: "55vw", sm: 420, lg: 680 }, minHeight: 300, maxHeight: { xs: 480, lg: "none" }, borderRadius: 2,
          overflow: "hidden", border: "1px solid",
          borderColor: activeIdx !== null ? "primary.main" : "divider",
          boxShadow: activeIdx !== null ? "0 0 0 2px rgba(21,101,192,0.25)" : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          position: "relative",
        }}>
          {/* Active hint banner */}
          {activeIdx !== null && (
            <Box sx={{
              position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
              bgcolor: "rgba(21,101,192,0.93)", color: "#fff",
              px: 2, py: 0.8, borderRadius: 2, fontSize: 13, fontWeight: 500,
              zIndex: 1000, pointerEvents: "none",
              display: "flex", alignItems: "center", gap: 0.75,
              boxShadow: "0 2px 10px rgba(0,0,0,0.25)", whiteSpace: "nowrap",
            }}>
              <TouchAppIcon sx={{ fontSize: 17 }} />
              คลิกบนแผนที่เพื่อตั้งตำแหน่งที่ {activeIdx + 1}
            </Box>
          )}

          <MapContainer
            center={[13.7563, 100.5018]}
            zoom={6}
            style={{ width: "100%", height: "100%", cursor: activeIdx !== null ? "crosshair" : undefined }}
            zoomControl
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapClickHandler activeIdxRef={activeIdxRef} onMapClick={handleMapClick} />
            <FlyTo target={flyTo} />

            {/* Route polyline */}
            {routeGeometry.length > 0 && (
              <Polyline positions={routeGeometry} pathOptions={{ color: "#1565C0", weight: 5, opacity: 0.85 }} />
            )}

            {/* Current GPS position dot */}
            {currentPos && (
              <Marker position={[currentPos.lat, currentPos.lng]} icon={currentPosIcon()} />
            )}

            {/* Step preview dot */}
            {previewStep && (
              <Marker position={[previewStep.lat, previewStep.lng]} icon={previewStepIcon()} />
            )}

            {/* Markers */}
            {markersToShow.map((loc, i) => {
              const isOrdered = orderedRoute.length > 0;
              const color = isOrdered
                ? (i === 0 ? "#2E7D32" : i === orderedRoute.length - 1 ? "#C62828" : "#1565C0")
                : (i === activeIdx ? "#FF6F00" : "#1565C0");
              return (
                <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={markerIcon(i + 1, color)} />
              );
            })}
          </MapContainer>
        </Box>
      </Box>
    </Container>
  );
}

// ── LocationRow ───────────────────────────────────────────────────────────────

interface LocationRowProps {
  index: number;
  location: LocationItem;
  isActive: boolean;
  canRemove: boolean;
  isGpsLoading: boolean;
  forcedAddress?: string;
  onFocus: () => void;
  onBlur: () => void;
  onSelect: (data: Partial<LocationItem>) => void;
  onRemove: () => void;
  onGps: () => void;
}

function LocationRow({
  index, location, isActive, canRemove,
  isGpsLoading, forcedAddress,
  onFocus, onBlur, onSelect, onRemove, onGps,
}: LocationRowProps) {
  const [inputValue, setInputValue] = useState(location.address);
  const [options, setOptions] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Update input when GPS or map click sets address externally
  useEffect(() => {
    if (forcedAddress !== undefined) setInputValue(forcedAddress);
  }, [forcedAddress]);

  const handleInputChange = (_: React.SyntheticEvent, value: string, reason: string) => {
    setInputValue(value);
    if (reason !== "input") return;
    clearTimeout(searchTimer.current);
    if (value.length < 2) { setOptions([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      setOptions(await searchNominatim(value));
      setSearching(false);
    }, 500); // 500ms debounce — Nominatim rate limit: 1 req/sec
  };

  const handleChange = (_: React.SyntheticEvent, value: NominatimResult | string | null) => {
    if (value && typeof value !== "string") {
      onSelectRef.current({
        name: value.name || value.display_name.split(",")[0],
        address: value.display_name,
        lat: parseFloat(value.lat),
        lng: parseFloat(value.lon),
      });
    }
  };

  const isConfirmed = location.lat !== null;

  return (
    <Box sx={{
      display: "flex", gap: 1, alignItems: "center",
      p: 0.75, borderRadius: 1.5, border: "1.5px solid",
      borderColor: isActive ? "primary.main" : "transparent",
      bgcolor: isActive ? "rgba(21,101,192,0.06)" : "transparent",
      transition: "border-color 0.2s, background-color 0.2s",
      mx: -0.75,
    }}>
      {/* Number dot */}
      <Tooltip title={index === 0 ? "จุดเริ่มต้น" : `สถานที่ที่ ${index + 1}`} placement="top">
        <Box sx={{
          width: 26, height: 26, borderRadius: "50%",
          bgcolor: isConfirmed ? (index === 0 ? "success.main" : "primary.main") : "action.disabledBackground",
          color: isConfirmed ? "#fff" : "text.disabled",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
          {index + 1}
        </Box>
      </Tooltip>

      {/* Search autocomplete (Nominatim) */}
      <Autocomplete
        freeSolo
        fullWidth
        options={options}
        inputValue={inputValue}
        loading={searching}
        filterOptions={(x) => x}
        getOptionLabel={(opt) => typeof opt === "string" ? opt : opt.display_name}
        isOptionEqualToValue={(opt, val) => opt.place_id === val.place_id}
        onInputChange={handleInputChange}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder={index === 0 ? "จุดเริ่มต้น — พิมพ์, คลิกแผนที่ หรือ GPS" : `สถานที่ที่ ${index + 1}`}
            onFocus={onFocus}
            onBlur={onBlur}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {searching && <CircularProgress size={14} sx={{ mr: 0.5 }} />}
                    {isConfirmed && !searching && <PlaceIcon sx={{ fontSize: 18, color: "success.main", mr: 0.25 }} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
            sx={{ "& .MuiOutlinedInput-root": { fontSize: 13, pr: "36px !important" } }}
          />
        )}
        renderOption={(props, option) => {
          const { key: _key, ...rest } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>;
          return (
            <Box component="li" key={option.place_id} {...rest} sx={{ py: 0.75, px: 1.5, display: "flex", alignItems: "flex-start", gap: 1 }}>
              <PlaceIcon fontSize="small" sx={{ color: "text.secondary", flexShrink: 0, mt: 0.2 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {option.name || option.display_name.split(",")[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", whiteSpace: "normal", lineHeight: 1.3 }}>
                  {option.display_name}
                </Typography>
              </Box>
            </Box>
          );
        }}
      />

      {/* GPS button */}
      <Tooltip title="ใช้ตำแหน่งปัจจุบัน" placement="top">
        <span>
          <IconButton size="small" onClick={onGps} disabled={isGpsLoading}
            sx={{ flexShrink: 0, color: "primary.main", "&:hover": { bgcolor: "rgba(21,101,192,0.08)" } }}>
            {isGpsLoading ? <CircularProgress size={16} color="primary" /> : <MyLocationIcon fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>

      {/* Delete */}
      {canRemove && (
        <Tooltip title="ลบสถานที่" placement="top">
          <IconButton size="small" onClick={onRemove} color="error" sx={{ flexShrink: 0 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
