// src/Context/StationLocationPicker.js
import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onChange({ lat, lng });
    },
  });
  return null;
}

// Force Leaflet to recalc size after mount
function InvalidateSizeOnMount() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }, [map]);

  return null;
}

export default function StationLocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(
    value?.lat && value?.lng ? value : { lat: 27.7172, lng: 85.324 }
  );

  const handleClick = (latlng) => {
    setPosition(latlng);
    onChange(latlng);
  };

  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={13}
      style={{ width: '100%', height: '100%' }} // fill parent box
    >
      <InvalidateSizeOnMount />
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={handleClick} />
      <Marker position={[position.lat, position.lng]} icon={markerIcon} />
    </MapContainer>
  );
}
