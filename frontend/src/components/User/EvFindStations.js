import React, { useEffect, useState } from 'react';
import { MapPin, SlidersHorizontal, Zap } from 'lucide-react';
import { stationService } from '../../Services/api';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap  } from 'react-leaflet';
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

function MapResizer({ deps = [] }) {
  const map = useMap();

  useEffect(() => {
    // Multiple invalidateSize calls with increasing delays
    const timeouts = [
      setTimeout(() => map.invalidateSize(), 100),
      setTimeout(() => map.invalidateSize(), 300),
      setTimeout(() => map.invalidateSize(), 600),
    ];
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [map, ...deps]);

  useEffect(() => {
    const onResize = () => setTimeout(() => map.invalidateSize(), 100);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [map]);

  return null;
}

// simple round user marker
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
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [detailStation, setDetailStation] = useState(null);
  const [activeStationForMap, setActiveStationForMap] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {

    delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
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

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation error', err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Attach distance to each station
  const stationsWithDistance = stations.map((s) => {
    let dist = null;
    if (userLocation && s.latitude && s.longitude) {
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
        const stationTypes = [];
        // Map station data to charger types
        if (s.level1Chargers && s.level1Chargers > 0) stationTypes.push('AC_LEVEL1');
        if (s.level2Chargers && s.level2Chargers > 0) stationTypes.push('AC_LEVEL2');
        if (s.dcFastChargers && s.dcFastChargers > 0) stationTypes.push('DC_FAST');
        if (s.dcUltraChargers && s.dcUltraChargers > 0) stationTypes.push('DC_ULTRA');
        if (s.dcComboChargers && s.dcComboChargers > 0) stationTypes.push('DC_COMBO');
        
        return stationTypes.some((t) => connectorFilter.includes(t));
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

    const searchFilteredStations = filteredStations.filter((s) =>
  searchTerm === '' ||
  s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  s.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  s.city?.toLowerCase().includes(searchTerm.toLowerCase())
);

  // polyline between user and active station
  const polylinePositions =
    userLocation && activeStationForMap?.latitude && activeStationForMap?.longitude
      ? [
          [userLocation.lat, userLocation.lng],
          [activeStationForMap.latitude, activeStationForMap.longitude],
        ]
      : null;


      const chargingTypes = [
  { value: 'DC_FAST', label: 'DC Fast Charger (50-150kW)', ports: '1 port' },
  { value: 'DC_ULTRA', label: 'DC Ultra Fast (150-350kW)', ports: '1 port' },
  { value: 'AC_LEVEL2', label: 'Level 2 (AC) (7-22kW)', ports: '1 port' },
  { value: 'AC_LEVEL1', label: 'Level 1 (AC) (2-3.7kW)', ports: '1 port' },
  { value: 'DC_COMBO', label: 'DC Combo (CCS/ChAdeMO)', ports: '2 ports' }
];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto my-6 border border-emerald-100 rounded-2xl bg-white shadow-sm overflow-hidden">
        {/* Top bar */}
        <header className="border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                        <Zap className="w-6 h-6 text-white" />
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
             <button onClick={() => navigate('/ev-owner/vehicles')}>My Vehicles</button>
            <button>Wallet/Payments</button>
            <button onClick={() => navigate('/profile')}>Profile</button>
          </nav>
        </header>

        {/* Main finder layout */}
        <main className="flex min-h-[540px] bg-emerald-50/30">
       
          <aside className="w-72 border-r bg-white px-5 py-5 hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                <span>Filters</span>
              </div>
              <button
                className="text-xs text-emerald-600"
                onClick={() => {
                  setCity('');
                  setConnectorFilter([]);
                  setPowerFilter([]);
                  setSortBy('price');
                }}
              >
                Clear all
              </button>
            </div>

            {/* City */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Distance visual */}
            <div className="mb-5">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Distance: 20 km</span>
                <span>50 km</span>
              </div>
              <div className="h-1 rounded-full bg-slate-200 relative">
                <div className="absolute left-0 h-1 rounded-full bg-emerald-500 w-1/3" />
                <div className="absolute left-1/3 -top-1.5 h-4 w-4 rounded-full bg-white border border-emerald-500 shadow-sm" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Connector type */}
           <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 mb-2">Charger Type</p>
              {chargingTypes.map((type) => (
                <label key={type.value} className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={connectorFilter.includes(type.value)}
                    onChange={(e) =>
                      setConnectorFilter((prev) =>
                        e.target.checked
                          ? [...prev, type.value]
                          : prev.filter((x) => x !== type.value)
                      )
                    }
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>

            {/* Power */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 mb-2">Power</p>
              {[
                { label: '≤ 50 kW', code: '50' },
                { label: '50–100 kW', code: '100' },
                { label: '100–120 kW', code: '120' },
                { label: '120 kW+', code: '150+' },
              ].map(({ label, code }) => (
                <label
                  key={code}
                  className="flex items-center gap-2 text-xs text-slate-600 mb-1"
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={powerFilter.includes(code)}
                    onChange={(e) =>
                      setPowerFilter((prev) =>
                        e.target.checked
                          ? [...prev, code]
                          : prev.filter((x) => x !== code)
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* Price range visual */}
            <div className="mb-2">
              <p className="text-xs font-semibold text-slate-500 mb-1">
                Price Range: NPR0 – NPR20/kWh
              </p>
              <div className="h-1 rounded-full bg-slate-200 relative">
                <div className="absolute left-0 right-10 h-1 rounded-full bg-emerald-500/80" />
                <div className="absolute left-0 -top-1.5 h-4 w-4 rounded-full bg-white border border-emerald-500 shadow-sm" />
                <div className="absolute right-10 -top-1.5 h-4 w-4 rounded-full bg-white border border-emerald-500 shadow-sm" />
              </div>
            </div>
          </aside>

        
          <section className="flex-1 flex flex-col">
    
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  </div>
                  <button
                    className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-600"
                    onClick={() => {
                      if (!userLocation && 'geolocation' in navigator) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setUserLocation({
                              lat: pos.coords.latitude,
                              lng: pos.coords.longitude,
                            });
                          },
                          (err) => console.warn('Geolocation error', err)
                        );
                      }
                    }}
                  >
                    Use my location
                  </button>
                </div>
                <div className="flex items-center justify-between lg:justify-end gap-4 text-[11px] text-slate-500">
                  <span>{searchFilteredStations.length} stations found near you</span>
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
              <div className="w-full lg:w-[54%] bg-emerald-50/10 px-4 py-4 space-y-3 overflow-y-auto">
                {loading && (
                  <p className="text-xs text-slate-500 px-2 py-4">
                    Loading stations…
                  </p>
                )}

                {!loading &&
                  searchFilteredStations.map((s) => (
                    <div
                      key={s.id}
                      className={
                        'rounded-2xl bg-white border shadow-sm px-4 py-3 flex flex-col gap-3 ' +
                        (s.id === selectedStationId
                          ? 'border-emerald-500 ring-2 ring-emerald-200'
                          : 'border-emerald-50')
                      }
                      onClick={() => {
                        setSelectedStationId(s.id);
                        setActiveStationForMap(s);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {s.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {s.address}
                            {s.city && `, ${s.city}`}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            Operated by {s.operatorName || 'BijuliYatra'}
                          </p>
                          {s.distanceKm != null && (
                            <p className="mt-1 text-[11px] text-slate-500">
                              Approx. {s.distanceKm.toFixed(1)} km away
                            </p>
                          )}
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                          {s.status || 'Available'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500">
                        <div>
                          <p className="mb-0.5">Chargers</p>
                          <p className="font-medium text-slate-900">
                            Level 2: {s.level2Chargers || 0} • DC Fast:{' '}
                            {s.dcFastChargers || 0}
                          </p>
                        </div>
                        <div>
                          <p className="mb-0.5">Rates</p>
                          <p className="font-medium text-slate-900">
                            L2: NPR
                            {s.level2Rate != null
                              ? s.level2Rate.toFixed(1)
                              : '-'}{' '}
                            /kWh • DC: NPR
                            {s.dcFastRate != null
                              ? s.dcFastRate.toFixed(1)
                              : '-'}{' '}
                            /kWh
                          </p>
                        </div>
                        <div>
                          <p className="mb-0.5">Peak Pricing</p>
                          <p className="font-medium text-slate-900">
                            {s.peakPricing
                              ? `Yes (×${s.peakMultiplier})`
                              : 'No'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <button
                          className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailStation(s);
                            setActiveStationForMap(s);
                          }}
                        >
                          View details
                        </button>
                        <button
                          className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ev-owner/book/${s.id}`);
                          }}
                        >
                          Book now
                        </button>
                      </div>
                    </div>
                  ))}

                {!loading && filteredStations.length === 0 && (
                  <p className="text-xs text-slate-500 px-2 py-4">
                    No stations match your filters.
                  </p>
                )}
              </div>

              {/* Map view */}
           <div className="hidden lg:block flex-1 min-h-[500px]">
            <div className="h-full w-full rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
              <MapContainer
                className="h-full w-full"
                center={userLocation ? [userLocation.lat, userLocation.lng] : [27.7, 85.324]}
                zoom={13}
                scrollWheelZoom={true}
              >
                {/* Enhanced MapResizer - fixes grey area */}
                <MapResizer deps={[filteredStations.length, selectedStationId, polylinePositions, userLocation]} />
                
               <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />

                {/* User location marker */}
                {userLocation && (
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={userIcon}
                  >
                    <Popup>You are here</Popup>
                  </Marker>
                )}

                {/* Line from user to selected station */}
                {polylinePositions && (
                  <>
                    <Polyline
                      positions={polylinePositions}
                      pathOptions={{ color: '#10b981', weight: 3, opacity: 0.8 }}
                    />
                    <Marker
                      position={polylinePositions[1]}
                      icon={stationIcon}
                    >
                      <Popup>
                        <div className="text-xs">
                          <strong>{activeStationForMap?.name || 'Selected station'}</strong>
                          {activeStationForMap?.distanceKm != null && (
                            <>
                              <br />
                              Distance: {activeStationForMap.distanceKm.toFixed(2)} km
                            </>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  </>
                )}

                {/* Station markers - limit to 20 for performance */}
                {searchFilteredStations
                  .filter((s) => s.latitude && s.longitude)
                  .slice(0, 20)
                  .map((s) => (
                    <Marker
                      key={`station-${s.id}`}
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
