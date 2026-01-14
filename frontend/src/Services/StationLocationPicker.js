
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

function InvalidateSizeOnMount() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }, [map]);

  return null;
}

export default function StationLocationPicker({ value, onChange, userLocation }) {
  const initialPosition =
    value?.lat && value?.lng
      ? value
      : userLocation?.lat && userLocation?.lng
      ? userLocation
      : { lat: 27.7172, lng: 85.324 };

  const [position, setPosition] = useState(initialPosition);

  useEffect(() => {
    // if external userLocation changes and no value chosen yet, recenter
    if (!value?.lat && userLocation?.lat && userLocation?.lng) {
      setPosition({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [userLocation, value]);

  const handleClick = (latlng) => {
    setPosition(latlng);
    onChange(latlng);
  };

  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
    >
      <InvalidateSizeOnMount />

      <TileLayer
        attribution="© OpenStreetMap contributors, © CARTO"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <ClickHandler onChange={handleClick} />
      <Marker position={[position.lat, position.lng]} icon={markerIcon} />
    </MapContainer>
  );
}
