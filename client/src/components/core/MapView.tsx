import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  coordinates: [number, number]; // [lng, lat]
}

const MapView: React.FC<MapViewProps> = ({ coordinates }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const [lng, lat] = coordinates;
    const map = L.map(mapRef.current).setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([lat, lng]).addTo(map);

    return () => {
      map.remove();
    };
  }, [coordinates]);

  return <div ref={mapRef} className="w-full h-64" />;
};

export default MapView;
