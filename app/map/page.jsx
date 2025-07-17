"use client"
import { NadmoLayout } from "@/components/layout/nadmo-layout";
import dynamic from "next/dynamic";
import { usePendingReports } from "@/hooks/use-reports";

const GoogleMap = dynamic(() => import("../../components/GoogleMap"), { ssr: false });

export default function MapPage() {
  const { reports, isPending: isLoading, error } = usePendingReports();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );
  if (error) return <div>Error loading reports</div>;
  // if (!reports || reports.length === 0) return <div>No reports to display</div>;

  // Group reports by unique coordinates
  const markerMap = new Map();
  reports.forEach((report) => {
    const coords = report.gps_coordinates;
    if (!coords) return;
    const [lat, lng] = coords.split(",").map(Number);
    if (isNaN(lat) || isNaN(lng)) return;
    const key = `${lat},${lng}`;
    if (!markerMap.has(key)) {
      markerMap.set(key, []);
    }
    markerMap.get(key).push(report);
  });
  const markers = Array.from(markerMap.entries()).map(([key, reportsAtLocation]) => {
    const [lat, lng] = key.split(",").map(Number);
    return {
      lat,
      lng,
      reports: reportsAtLocation,
    };
  });

  return (
    <NadmoLayout>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Total Reports: {reports?.length || 0}</h2>
      </div>
      <GoogleMap
        center={{ lat: 5.6037, lng: -0.187 }}
        zoom={7}
        style={{ width: "100%", height: "500px" }}
        markers={markers}
      />
    </NadmoLayout>
  );
} 