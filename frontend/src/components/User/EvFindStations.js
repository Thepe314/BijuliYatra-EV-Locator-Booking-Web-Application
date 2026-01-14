import React, { useEffect, useState } from 'react';
import { MapPin, SlidersHorizontal, Zap } from 'lucide-react';
import { stationService } from '../../Services/api';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';



// Haversine distance in km between two lat/lng points
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const stationIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// simple round user marker (human-ish dot)
const userIcon = L.divIcon({
  className: 'user-location-icon',
  html: `
    <div style="
      width:18px;height:18px;border-radius:999px;
      background:#10b981;border:2px solid white;
      box-shadow:0 0 4px rgba(0,0,0,0.45);
      position:relative;
    ">
      <div style="
        position:absolute;top:-6px;left:50%;transform:translateX(-50%);
        width:8px;height:8px;border-radius:999px;background:white;
      "></div>
    </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function EVFindStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [city, setCity] = useState('');
  const [connectorFilter, setConnectorFilter] = useState([]); // "Level 2" | "DC Fast"
  const [powerFilter, setPowerFilter] = useState([]); // '50' | '100' | '120' | '150+'
  const [sortBy, setSortBy] = useState('price');
  const [detailStation, setDetailStation] = useState(null);
  const [activeStationForMap, setActiveStationForMap] = useState(null);
  const userLocation = useUserLocation();   // shared origin
  const navigate = useNavigate();

  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const data = await stationService.listStationsForOwner();
        setStations(data || []);
      } catch (err) {
        console.error('Failed to load owner stations', err);
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  // Attach distance (if possible) to each station
  const stationsWithDistance = stations.map((s) => {
    let dist = null;
    if (userLocation.lat && userLocation.lng && s.latitude && s.longitude) {
      dist = distanceKm(
        userLocation.lat,
        userLocation.lng,
        s.latitude,
        s.longitude
      );
    }
    return { ...s, distanceKm: dist };
  });

  // derive filtered + sorted stations
  const filteredStations = stationsWithDistance
    .filter((s) =>
      city ? s.city?.toLowerCase().includes(city.toLowerCase()) : true
    )
    .filter((s) =>
      connectorFilter.length
        ? (() => {
            const connectors = [];
            if (s.level2Chargers && s.level2Chargers > 0)
              connectors.push('Level 2');
            if (s.dcFastChargers && s.dcFastChargers > 0)
              connectors.push('DC Fast');
            return connectors.some((c) => connectorFilter.includes(c));
          })()
        : true
    )
    .filter((s) =>
      powerFilter.length
        ? powerFilter.some((range) => {
            const p =
              s.dcFastChargers && s.dcFastChargers > 0
                ? 60
                : s.level2Chargers && s.level2Chargers > 0
                ? 22
                : 0;
            if (range === '50') return p <= 50;
            if (range === '100') return p > 50 && p <= 100;
            if (range === '120') return p > 100 && p <= 120;
            if (range === '150+') return p > 120;
            return true;
          })
        : true
    )
    .sort((a, b) => {
      if (sortBy === 'price') {
        const aPrice = a.level2Rate ?? a.dcFastRate ?? 0;
        const bPrice = b.level2Rate ?? b.dcFastRate ?? 0;
        return aPrice - bPrice;
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'distance') {
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

  // polyline between user and active station
  const polylinePositions =
    userLocation.lat &&
    userLocation.lng &&
    activeStationForMap?.latitude &&
    activeStationForMap?.longitude
      ? [
          [userLocation.lat, userLocation.lng],
          [activeStationForMap.latitude, activeStationForMap.longitude],
        ]
      : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto my-6 border border-emerald-100 rounded-2xl bg-white shadow-sm overflow-hidden">
        {/* Top bar */}
        <header className="border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900">BijuliYatra</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <button onClick={() => navigate('/ev-owner/dashboard')}>Home</button>
            <button className="text-emerald-600 font-medium">
              Find stations
            </button>
            <button onClick={() => navigate('/ev-owner/bookings')}>
              My bookings
            </button>
            <button>Wallet/Payments</button>
            <button onClick={() => navigate('/profile')}>Profile</button>
          </nav>
        </header>

        {/* Main finder layout */}
        <main className="flex min-h-[540px] bg-emerald-50/30">
          {/* Filters sidebar */}
          {/* ... your sidebar JSX unchanged ... */}

          {/* Right side: search + list + map */}
          <section className="flex-1 flex flex-col">
            {/* Search bar + sort */}
            <div className="border-b bg-white px-6 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 flex items-center gap-2 text-xs text-slate-500">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Search by station or address"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-600"
                    onClick={() => {
                      // location already loaded by useUserLocation hook
                    }}
                  >
                    Use my location
                  </button>
                </div>
                <div className="flex items-center justify-between lg:justify-end gap-4 text-[11px] text-slate-500">
                  <span>{filteredStations.length} stations found near you</span>
                  <div className="flex items-center gap-1">
                    <span>Sort by:</span>
                    <select
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px]"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="price">Price</option>
                      <option value="name">Name</option>
                      <option value="distance">Distance</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* List + map */}
            <div className="flex flex-1">
              {/* Stations list */}
              {/* ... your list JSX unchanged ... */}

              {/* Map view */}
              <div
                className={
                  'hidden lg:block flex-1 bg-emerald-50 transition-opacity ' +
                  (detailStation ? 'opacity-40 pointer-events-none' : 'opacity-100')
                }
              >
                <div className="h-full w-full p-6">
                  <MapContainer
                    center={
                      userLocation.lat && userLocation.lng
                        ? [userLocation.lat, userLocation.lng]
                        : [27.7, 85.32]
                    }
                    zoom={12}
                    className="h-full w-full rounded-3xl"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />

                    {/* user location marker */}
                    {userLocation.lat && userLocation.lng && (
                      <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={userIcon}
                      >
                        <Popup>You are here</Popup>
                      </Marker>
                    )}

                    {/* line from user to selected station */}
                    {polylinePositions && (
                      <>
                        <Polyline
                          positions={polylinePositions}
                          pathOptions={{ color: '#10b981', weight: 3 }}
                        />
                        <Marker
                          position={polylinePositions[1]}
                          icon={stationIcon}
                        >
                          <Popup>
                            <div className="text-xs">
                              <strong>
                                {activeStationForMap?.name || 'Selected station'}
                              </strong>
                              {activeStationForMap?.distanceKm != null && (
                                <>
                                  <br />
                                  Distance:{' '}
                                  {activeStationForMap.distanceKm.toFixed(2)} km
                                </>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      </>
                    )}

                    {/* station markers */}
                    {filteredStations
                      .filter((s) => s.latitude && s.longitude)
                      .map((s) => (
                        <Marker
                          key={s.id}
                          position={[s.latitude, s.longitude]}
                          icon={stationIcon}
                          eventHandlers={{
                            click: () => {
                              setSelectedStationId(s.id);
                              setActiveStationForMap(s);
                            },
                          }}
                        >
                          <Popup>
                            <div className="text-xs">
                              <strong>{s.name}</strong>
                              <br />
                              {s.address}
                              {s.city && `, ${s.city}`}
                              {s.distanceKm != null && (
                                <>
                                  <br />
                                  ~{s.distanceKm.toFixed(1)} km from you
                                </>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>


      {/* View details modal */}
      {detailStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-sm font-semibold text-slate-900">
                {detailStation.name}
              </h2>
              <button
                className="text-xs text-slate-500 hover:text-slate-700"
                onClick={() => setDetailStation(null)}
              >
                ✕
              </button>
            </div>

            <div className="px-4 py-3 space-y-2 text-xs text-slate-600">
              <p className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {detailStation.address}
                {detailStation.city && `, ${detailStation.city}`}
              </p>
              <p>
                Operated by{' '}
                <span className="font-medium">
                  {detailStation.operatorName || 'BijuliYatra'}
                </span>
              </p>
              <p>
                Chargers:{' '}
                <span className="font-medium text-slate-900">
                  Level 2: {detailStation.level2Chargers || 0} • DC Fast:{' '}
                  {detailStation.dcFastChargers || 0}
                </span>
              </p>
              <p>
                Rates:{' '}
                <span className="font-medium text-slate-900">
                  L2: NPR
                  {detailStation.level2Rate != null
                    ? detailStation.level2Rate.toFixed(1)
                    : '-'}{' '}
                  /kWh • DC: NPR
                  {detailStation.dcFastRate != null
                    ? detailStation.dcFastRate.toFixed(1)
                    : '-'}{' '}
                  /kWh
                </span>
              </p>
              {detailStation.distanceKm != null && (
                <p>
                  Distance from you:{' '}
                  <span className="font-medium text-slate-900">
                    {detailStation.distanceKm.toFixed(2)} km
                  </span>
                </p>
              )}
            </div>

            {detailStation.latitude && detailStation.longitude && (
              <div className="mt-2">
                <iframe
                  title="Google Maps preview"
                  width="100%"
                  height="260"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${detailStation.latitude},${detailStation.longitude}&z=16&output=embed`}
                />
              </div>
            )}

            <div className="px-4 py-3 border-t flex justify-end gap-2">
              <button
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={() => setDetailStation(null)}
              >
                Close
              </button>
              <button
                className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600"
                onClick={() => {
                  setDetailStation(null);
                  navigate(`/ev-owner/book/${detailStation.id}`);
                }}
              >
                Book now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
