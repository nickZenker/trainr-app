"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});

const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});

const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
  ssr: false,
});

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), {
  ssr: false,
});

export default function Map({
  center = [50.1109, 8.6821], // Frankfurt am Main
  zoom = 13,
  markers = [],
  route = null,
  height = "400px",
  className = ""
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function enableMap() {
      try {
        const L = await import("leaflet");

        // Ensure default marker icons work in Next.js bundles
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (isMounted) {
          setIsClient(true);
        }
      } catch (error) {
        console.error("Leaflet konnte nicht geladen werden", error);
      }
    }

    enableMap();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isClient) {
    return (
      <div 
        className={`bg-surface rounded-lg border border-border flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-text-muted">Karte wird geladen...</div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-border ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route Polyline */}
        {route && route.length > 0 && (
          <Polyline
            positions={route}
            color="#f59e0b"
            weight={4}
            opacity={0.8}
          />
        )}
        
        {/* Markers */}
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            {marker.popup && (
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{marker.popup.title}</div>
                  {marker.popup.description && (
                    <div className="text-text-muted mt-1">{marker.popup.description}</div>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

