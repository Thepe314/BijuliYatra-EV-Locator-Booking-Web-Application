// src/components/Services/useUserLocation.js
import { useEffect, useState } from 'react';

export default function useUserLocation() {
  const [location, setLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    // if browser has geolocation
    if (!('geolocation' in navigator)) {
      const stored = localStorage.getItem('userLocation');
      if (stored) setLocation(JSON.parse(stored));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(loc);
        localStorage.setItem('userLocation', JSON.stringify(loc));
      },
      () => {
        // fallback: last stored value if permission denied
        const stored = localStorage.getItem('userLocation');
        if (stored) setLocation(JSON.parse(stored));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return location;
}
