"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from "react-leaflet";
import { fixLeafletIcons } from "@/lib/leafletFix";
import L from "leaflet";

// Ensure icons are fixed once at module level or in useEffect
fixLeafletIcons();

import { Job } from "@/types/job";

interface MapComponentProps {
  onSelectLocation?: (lat: number, lng: number, address?: string) => void;
  initialLocation?: [number, number]; // [lat, lng]
  jobs?: Job[];
  centerOnUser?: boolean;
  readOnly?: boolean;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

export default function MapComponent({
  onSelectLocation,
  initialLocation,
  jobs = [],
  centerOnUser = false,
  readOnly = false,
}: MapComponentProps) {
  const [marker, setMarker] = useState<[number, number] | null>(initialLocation || null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialLocation || [11.0168, 76.9558]); // Coimbatore center

  // Coimbatore Bounds
  const COIMBATORE_BOUNDS: [[number, number], [number, number]] = [
    [10.9, 76.8],
    [11.2, 77.2]
  ];

  // Update marker and center if initialLocation changes externally
  useEffect(() => {
    if (initialLocation) {
      setMarker(initialLocation);
      setMapCenter(initialLocation);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (centerOnUser && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCenter: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(newCenter);
          if (onSelectLocation && !marker) {
            setMarker(newCenter);
            onSelectLocation(newCenter[0], newCenter[1]);
          }
        },
        (err) => console.warn("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    }
  }, [centerOnUser]);

  const handleMapClick = async (lat: number, lng: number) => {
    if (!onSelectLocation) return;
    
    // Bounds check for Coimbatore if selecting
    if (lat < 10.9 || lat > 11.2 || lng < 76.8 || lng > 77.2) {
      // We'll let the parent handle the alert if needed, but we restrict marker
      return; 
    }

    setMarker([lat, lng]);
    setMapCenter([lat, lng]);
    
    let address = "";
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      address = data.display_name;
    } catch (e) {
      console.error("Geocoding failed", e);
    }
    
    onSelectLocation(lat, lng, address);
  };

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-inner group relative">
      <MapContainer
        center={mapCenter}
        zoom={13}
        minZoom={11}
        maxBounds={COIMBATORE_BOUNDS}
        maxBoundsViscosity={1.0}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CenterMap coords={mapCenter} />

        {onSelectLocation && <MapClickHandler onClick={handleMapClick} />}
        
        {marker && <Marker position={marker} />}

        {jobs.map((job, idx) => {
          if (!job.location?.coordinates) return null;
          return (
            <Marker 
              key={job.jobId || job.id || idx} 
              position={[job.location.coordinates[1], job.location.coordinates[0]]} 
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm text-gray-900">{job.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">₹{job.payment} • {job.duration} hr</p>
                  <a href={`/student/jobs/${job.jobId}`} className="text-[10px] text-primary-600 font-bold mt-2 block">VIEW DETAILS →</a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {!marker && onSelectLocation && !readOnly && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center pointer-events-none z-[1000]">
          <div className="bg-bg-card/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] text-text-muted font-bold uppercase tracking-wider shadow-xl">
             Tap map to pick location
          </div>
        </div>
      )}
    </div>
  );
}
