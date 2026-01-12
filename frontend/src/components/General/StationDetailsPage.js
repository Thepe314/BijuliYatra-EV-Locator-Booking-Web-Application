import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Zap,
  Clock,
  Navigation,
  Shield,
  Check,
  ArrowLeft,
  Phone,
  Share2,
  Heart,
  Info,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { stationService } from '../../Services/api';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// local images mapped by key
import stationImg1 from '../Assets/stations/Station-1.jpg';

// same marker icon style you used elsewhere
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const imageMap = {
  'station-1': stationImg1,
  // 'station-2': stationImg2,
  // 'station-3': stationImg3,
};

function CenterOnStation({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function StationDetailsPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { stationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await stationService.getStationByIdO(stationId);
        setStation(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load station details');
      } finally {
        setLoading(false);
      }
    };
    fetchStation();
  }, [stationId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Loading station details...</p>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="text-sm text-red-600 mb-4">{error || 'Station not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const fullAddress = `${station.address}, ${station.city}, ${station.state} ${station.zipCode}`;
  const createdAt = station.createdAt || '-';
  const updatedAt = station.updatedAt || '-';

  const mainImage = imageMap[station.imageKey] || stationImg1;
  const images = [{ src: mainImage }];

  const hasCoords = station.latitude && station.longitude;
  const centerLat = hasCoords ? station.latitude : 27.7172;
  const centerLng = hasCoords ? station.longitude : 85.324;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2 transition-colors text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Stations
          </button>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                {station.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-slate-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm sm:text-base">{fullAddress}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm sm:text-base font-medium capitalize">
                    {station.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isFavorite
                    ? 'border-rose-500 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? 'fill-rose-600' : ''}`}
                />
              </button>
              <button className="p-3 rounded-lg border-2 border-slate-200 text-slate-600 hover:border-slate-300 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image / banner */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
              <div className="h-64 md:h-96 relative">
                {images[activeImage]?.src ? (
                  <img
                    src={images[activeImage].src}
                    alt={station.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-sky-500 flex items-center justify-center text-white">
                    <div className="text-center">
                      <Zap className="w-20 h-20 mx-auto mb-4" />
                      <p className="text-xl font-semibold">{station.name}</p>
                      <p className="text-sm mt-1">
                        {station.location || fullAddress}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2 p-4 bg-slate-50 border-t border-slate-100">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-16 md:h-20 rounded-lg overflow-hidden transition-all ${
                      activeImage === idx
                        ? 'ring-4 ring-emerald-500'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {img.src ? (
                      <img
                        src={img.src}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
                Station Overview
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700">
                      Chargers
                    </p>
                  </div>
                  <p className="text-3xl font-semibold text-emerald-900">
                    {station.totalChargers}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Level 2: {station.level2Chargers} • DC Fast:{' '}
                    {station.dcFastChargers}
                  </p>
                </div>
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-sky-600" />
                    <p className="text-sm font-medium text-sky-700">
                      Peak pricing
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-sky-900">
                    {station.peakPricing ? 'Enabled' : 'Disabled'}
                  </p>
                  {station.peakPricing && (
                    <p className="text-xs text-sky-700 mt-1">
                      Multiplier: {station.peakMultiplier}x
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-slate-700">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm font-medium">{fullAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Operator</p>
                    <p className="text-sm font-medium">
                      {station.operatorName ||
                        `ID: ${station.operatorId || 'N/A'}`}
                    </p>
                  </div>
                </div>
              </div>

              {station.notes && (
                <div className="mt-6">
                  <p className="text-xs text-slate-500 mb-1">Internal notes</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">
                    {station.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Charger configuration */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
                Charger configuration
              </h3>
              <div className="space-y-4">
                <div className="border-2 border-slate-200 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-lg mb-1">
                        Level 2 chargers
                      </h4>
                      <p className="text-sm text-slate-600">
                        Count: {station.level2Chargers}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-emerald-600">
                        NPR{station.level2Rate?.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">per kWh</p>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-slate-200 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-lg mb-1">
                        DC fast chargers
                      </h4>
                      <p className="text-sm text-slate-600">
                        Count: {station.dcFastChargers}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-emerald-600">
                        NPR{station.dcFastRate?.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">per kWh</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Station status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-100">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">
                Station status
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    station.status === 'operational'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {station.status}
                </span>
                <span className="text-sm text-slate-600">
                  Chargers: {station.totalChargers}
                </span>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      Managed station
                    </p>
                    <p className="text-xs text-slate-600">
                      Operator:{' '}
                      {station.operatorName || station.operatorId || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      Created / updated
                    </p>
                    <p className="text-xs text-slate-600">
                      Created: {createdAt}
                    </p>
                    <p className="text-xs text-slate-600">
                      Updated: {updatedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      Peak pricing
                    </p>
                    <p className="text-xs text-slate-600">
                      {station.peakPricing
                        ? `Enabled (${station.peakMultiplier}x)`
                        : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        fullAddress
                      )}`,
                      '_blank'
                    )
                  }
                >
                  <Navigation className="w-4 h-4" />
                  Open in Google Maps
                </button>
              </div>
            </div>

            {/* Live map */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Station location
                </h3>
                <span className="text-[11px] text-slate-500">
                  {hasCoords ? 'Exact pin' : 'Approximate'}
                </span>
              </div>
              <div className="rounded-lg overflow-hidden h-52 border border-slate-200">
                <MapContainer
                  center={[centerLat, centerLng]}
                  zoom={13}
                  style={{ width: '100%', height: '100%' }}
                  scrollWheelZoom={false}
                >
                  <CenterOnStation lat={centerLat} lng={centerLng} />
                  <TileLayer
                    attribution="© OpenStreetMap contributors, © CARTO"
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[centerLat, centerLng]} icon={markerIcon} />
                </MapContainer>
              </div>
              {hasCoords && (
                <p className="mt-2 text-[11px] text-slate-500">
                  Lat: {station.latitude}, Lng: {station.longitude}
                </p>
              )}
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
              <p className="text-sm font-medium text-emerald-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Internal view
              </p>
              <p className="text-xs text-emerald-800">
                This page is visible to operators and admins only and shows live
                data from the station service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
