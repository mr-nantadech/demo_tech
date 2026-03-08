import AppShell from "@/components/layout/AppShell";
import MapPlannerLoader from "@/components/map-planner/MapPlannerLoader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "วางแผนเส้นทาง | NBA Tech Engineer",
};

export default function MapPlannerPage() {
  return (
    <AppShell noPadding>
      <MapPlannerLoader />
    </AppShell>
  );
}
