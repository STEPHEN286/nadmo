"use client";
import React, { useRef, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

// Map disaster types to emoji
const DISASTER_EMOJI = {
  flood: "🌊",
  fire: "🔥",
  earthquake: "🌎",
  storm: "🌪️",
  landslide: "🏔️",
  drought: "☀️",
  default: "❗"
};

// Helper to create a data URL for an emoji marker
function emojiToDataUrl(emoji) {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'>
      <filter id='shadow' x='-20%' y='-20%' width='140%' height='140%'>
        <feDropShadow dx='0' dy='2' stdDeviation='2' flood-color='#000' flood-opacity='0.4'/>
      </filter>
      <circle cx='28' cy='28' r='26' fill='#fff' stroke='#1976d2' stroke-width='4' filter='url(#shadow)'/>
      <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='32'>${emoji}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const GoogleMap = ({
  center = { lat: 5.6037, lng: -0.187 },
  zoom = 8,
  style = { width: "100%", height: "400px" },
  markers = [],
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const infoWindowRef = useRef(null);
  const markerClusterRef = useRef(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API,
      version: "weekly",
    });

    loader.load().then(() => {
      if (!mapInstance.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
        });
        mapInstance.current = map;
      }
      const map = mapInstance.current;

      // Remove previous markers
      if (map._markers) {
        map._markers.forEach((m) => m.setMap(null));
      }
      map._markers = [];
      if (markerClusterRef.current) {
        markerClusterRef.current.clearMarkers();
      }

      // Create markers for clustering
      const gMarkers = markers.map((marker) => {
        // Use emoji for the first report's disaster type
        const type = marker.reports[0]?.disaster_type?.toLowerCase() || "default";
        const emoji = DISASTER_EMOJI[type] || DISASTER_EMOJI.default;
        const icon = {
          url: emojiToDataUrl(emoji),
          scaledSize: new window.google.maps.Size(56, 56),
        };
        const gMarker = new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          title: marker.reports[0]?.disaster_type || "Disaster",
          icon,
        });
        gMarker.addListener("click", () => {
          if (!infoWindowRef.current) {
            infoWindowRef.current = new window.google.maps.InfoWindow();
          }
          // Build popup content for all reports at this location
          const content = marker.reports.map((r, i) => `
            <div style='margin-bottom:8px;'>
              <strong>${r.disaster_type || "Disaster"}</strong><br/>
              <span>Severity: <b>${r.severity_level || "N/A"}</b></span><br/>
              <span>Status: <b>${r.status || "N/A"}</b></span>
            </div>
          `).join("");
          infoWindowRef.current.setContent(`
            <div style=\"min-width:180px\">
              <div><b>Reports at this location (${marker.reports.length}):</b></div>
              ${content}
            </div>
          `);
          infoWindowRef.current.open(map, gMarker);
        });
        return gMarker;
      });
      map._markers = gMarkers;
      markerClusterRef.current = new MarkerClusterer({ markers: gMarkers, map });
    });

    // Optional: cleanup
    return () => {
      mapInstance.current = null;
      infoWindowRef.current = null;
      markerClusterRef.current = null;
    };
  }, [center, zoom, markers]);

  return <div ref={mapRef} style={style} />;
};

export default GoogleMap; 