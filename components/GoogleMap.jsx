"use client";
import React, { useRef, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const GoogleMap = ({
  center = { lat: 5.6037, lng: -0.187 },
  zoom = 8,
  style = { width: "100%", height: "400px" },
  markers = [],
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const infoWindowRef = useRef(null);

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

      // Add markers
      markers.forEach((marker) => {
        const gMarker = new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          map,
          title: marker.title,
        });
        map._markers.push(gMarker);

        gMarker.addListener("click", () => {
          if (!infoWindowRef.current) {
            infoWindowRef.current = new window.google.maps.InfoWindow();
          }
          infoWindowRef.current.setContent(`
            <div style="min-width:180px">
              <strong>${marker.title}</strong><br/>
              <span>Severity: <b>${marker.severity || "N/A"}</b></span><br/>
              <span>Status: <b>${marker.status || "N/A"}</b></span>
            </div>
          `);
          infoWindowRef.current.open(map, gMarker);
        });
      });
    });

    // Optional: cleanup
    return () => {
      mapInstance.current = null;
      infoWindowRef.current = null;
    };
  }, [center, zoom, markers]);

  return <div ref={mapRef} style={style} />;
};

export default GoogleMap; 