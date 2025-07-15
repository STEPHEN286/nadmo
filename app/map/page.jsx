"use client"
import { NadmoLayout } from "@/components/layout/nadmo-layout";
import GoogleMap from "../../components/GoogleMap";
import useReports from "@/hooks/use-reports";

export default function MapPage() {
  const { reports, isLoading, error } = useReports();

  const markers = reports
    .map((report) => {
      const coords = report.gps_coordinates || report.coordinates;
      if (!coords) return null;
      const [lat, lng] = coords.split(",").map(Number);
      if (isNaN(lat) || isNaN(lng)) return null;
      return {
        lat,
        lng,
        title: report.disaster_type || "Disaster",
        description: report.location_description || "",
        id: report.id,
        severity: report.severity_level || "",
        status: report.status || "",
      };
    })
    .filter(Boolean);

  if (isLoading) return <div>Loading map...</div>;
  if (error) return <div>Error loading reports</div>;

  return (
    <NadmoLayout>
      <GoogleMap
        center={{ lat: 5.6037, lng: -0.187 }}
        zoom={7}
        style={{ width: "100%", height: "500px" }}
        markers={markers}
      />
    </NadmoLayout>
  );
} 