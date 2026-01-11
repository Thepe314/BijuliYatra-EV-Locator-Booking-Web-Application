import React, { useEffect, useState } from 'react';
import {
  MapPin, Zap, Clock, Navigation, Shield, Check,
  ArrowLeft, Phone, Share2, Heart, Info
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { stationService } from '../../Services/api';

// local images mapped by key
import stationImg2 from '../Assets/stations/Station-2.jpg';

const imageMap = {
  // 'station-1': stationImg1,
   'station-2': stationImg2,
};

export default function StationDetailsA() {
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
        const data = await stationService.getStationById(stationId);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading station details...</p>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-600 mb-4">{error || 'Station not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const fullAddress = `${station.address}, ${station.city}, ${station.state} ${station.zipCode}`;
  const createdAt = station.createdAt || '-';
  const updatedAt = station.updatedAt || '-';

  // resolve image from imageKey (fallback to stationImg1)
  const mainImage = imageMap[station.imageKey] || stationImg2;
  const images = [{ src: mainImage }];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image / banner */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-64 md:h-96 relative">
                {images[activeImage]?.src ? (
                  <img
                    src={images[activeImage].src}
                    alt={station.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <div className="text-center">
                      <Zap className="w-20 h-20 mx-auto mb-4" />
                      <p className="text-xl font-bold">{station.name}</p>
                      <p className="text-sm mt-1">
                        {station.location || fullAddress}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-16 md:h-20 rounded-lg overflow-hidden transition-all ${
                      activeImage === idx
                        ? 'ring-4 ring-blue-500'
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
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Station Overview</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-700">
                      Chargers
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    {station.totalChargers}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Level 2: {station.level2Chargers} • DC Fast: {station.dcFastChargers}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700">
                      Peak Pricing
                    </p>
                  </div>
                  <p className="text-xl font-bold text-blue-900">
                    {station.peakPricing ? 'Enabled' : 'Disabled'}
                  </p>
                  {station.peakPricing && (
                    <p className="text-xs text-blue-600 mt-1">
                      Multiplier: {station.peakMultiplier}x
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium">{fullAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Operator</p>
                    <p className="text-sm font-medium">
                      {station.operatorName || `ID: ${station.operatorId || 'N/A'}`}
                    </p>
                  </div>
                </div>
              </div>

              {station.notes && (
                <div className="mt-6">
                  <p className="text-xs text-gray-500 mb-1">Internal Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {station.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Charger configuration */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Charger Configuration
              </h3>
              <div className="space-y-4">
                <div className="border-2 border-gray-200 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">
                        Level 2 Chargers
                      </h4>
                      <p className="text-sm text-gray-600">
                        Count: {station.level2Chargers}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">
                        ${station.level2Rate?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">per kWh</p>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">
                        DC Fast Chargers
                      </h4>
                      <p className="text-sm text-gray-600">
                        Count: {station.dcFastChargers}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">
                        ${station.dcFastRate?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">per kWh</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right column: admin info only */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Station Status
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    station.status === 'operational'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {station.status}
                </span>
                <span className="text-sm text-gray-600">
                  Chargers: {station.totalChargers}
                </span>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Managed Station
                    </p>
                    <p className="text-xs text-gray-600">
                      Operator: {station.operatorName || station.operatorId || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Created / Updated
                    </p>
                    <p className="text-xs text-gray-600">
                      Created: {createdAt}
                    </p>
                    <p className="text-xs text-gray-600">
                      Updated: {updatedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Peak Pricing
                    </p>
                    <p className="text-xs text-gray-600">
                      {station.peakPricing
                        ? `Enabled (${station.peakMultiplier}x)`
                        : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <button
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 transition-colors"
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
                  Open in Maps
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Internal View
              </p>
              <p className="text-xs text-blue-800">
                This page is visible to operators and admins only and reflects the current values
                from the database (StationResponseDTO).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
