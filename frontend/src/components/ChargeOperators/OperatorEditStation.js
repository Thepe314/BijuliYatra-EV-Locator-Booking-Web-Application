// src/pages/OperatorEditStation.jsx
import React, { useEffect, useState } from 'react';
import {
  useParams,
  useNavigate,
  NavLink,
  useLocation,
} from 'react-router-dom';
import {
  MapPin,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Zap,
  LayoutDashboard,
  PlugZap,
  CalendarClock,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

import { stationService, authService } from '../../Services/api';
import StationLocationPicker from '../../Services/StationLocationPicker';
import notify from '../../Utils/notify';
export default function OperatorEditStation() {
  const { id: stationId } = useParams();
  const navigate = useNavigate();
  const loc = useLocation();
  const [imgError, setImgError] = useState(false);  

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    level2Chargers: '',
    dcFastChargers: '',
    level2Rate: '',
    dcFastRate: '',
    peakPricing: false,
    peakMultiplier: 1.25,
    notes: '',
    status: 'operational',
    totalSlots: '',
    availableSlots: '',
    operatorId: '',
    latitude: null,
    longitude: null,
    imageUrl: '', 
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const mapApiToForm = (station) => ({
    name: station.name || '',
    location: station.location || '',
    address: station.address || '',
    city: station.city || '',
    state: station.state || '',
    zipCode: station.zipCode || '',
    level2Chargers: station.level2Chargers ?? '',
    dcFastChargers: station.dcFastChargers ?? '',
    level2Rate: station.level2Rate ?? '',
    dcFastRate: station.dcFastRate ?? '',
    peakPricing: station.peakPricing ?? false,
    peakMultiplier: station.peakMultiplier ?? 1.25,
    notes: station.notes || '',
    status: station.status || 'operational',
    totalSlots: station.totalSlots ?? '',
    availableSlots: station.availableSlots ?? '',
    operatorId:
      station.operatorId ||
      (station.operator && station.operator.user_id) ||
      '',
    latitude: station.latitude ?? null,
    longitude: station.longitude ?? null,
     imageUrl: station.imageUrl || '',
  });

  useEffect(() => {
    let mounted = true;
    const loadStation = async () => {
      setLoading(true);
      try {
        const apiStation = await stationService.getStationByIdO(stationId);
        if (!mounted) return;
        setFormData((prev) => ({ ...prev, ...mapApiToForm(apiStation) }));
      } catch (err) {
        console.error('Failed to load station:', err);
        setNotification({
          type: 'error',
          message: 'Unable to load station details.',
        });
        setTimeout(() => setNotification(null), 3000);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (stationId) loadStation();
    return () => {
      mounted = false;
    };
  }, [stationId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (formData.imageUrl && !formData.imageUrl.startsWith('http')) {
  newErrors.imageUrl = 'Must be a valid URL starting with http:// or https://';
}

    if (formData.level2Chargers === '' || formData.level2Chargers < 0) {
      newErrors.level2Chargers = 'Level 2 chargers is required';
    }
    if (formData.dcFastChargers === '' || formData.dcFastChargers < 0) {
      newErrors.dcFastChargers = 'DC fast chargers is required';
    }
    if (formData.level2Rate === '' || formData.level2Rate < 0) {
      newErrors.level2Rate = 'Level 2 rate is required';
    }
    if (formData.dcFastRate === '' || formData.dcFastRate < 0) {
      newErrors.dcFastRate = 'DC fast rate is required';
    }
    if (!formData.operatorId) newErrors.operatorId = 'Operator id is required';
    if (!formData.status) newErrors.status = 'Status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMapLocationChange = async ({ lat, lng }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    }));

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await res.json();
      const addr = data.address || {};

      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        address:
          [
            addr.road,
            addr.neighbourhood,
            addr.suburb,
            addr.village,
            addr.town,
          ]
            .filter(Boolean)
            .join(', ') || prev.address,
        city:
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          prev.city,
        state: addr.state || prev.state,
        zipCode: addr.postcode || prev.zipCode,
      }));
    } catch (err) {
      console.error('Reverse geocoding failed', err);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fix the errors before submitting',
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        level2Chargers: Number(formData.level2Chargers),
        dcFastChargers: Number(formData.dcFastChargers),
        level2Rate: Number(formData.level2Rate),
        dcFastRate: Number(formData.dcFastRate),
        peakPricing: !!formData.peakPricing,
        peakMultiplier: Number(formData.peakMultiplier) || 1.25,
        notes: formData.notes || '',
        status: formData.status,
        totalSlots:
          formData.totalSlots !== '' ? Number(formData.totalSlots) : null,
        availableSlots:
          formData.availableSlots !== ''
            ? Number(formData.availableSlots)
            : null,
        operatorId: Number(formData.operatorId),
        latitude: formData.latitude,
        longitude: formData.longitude,
        imageUrl: formData.imageUrl || null,
      };

      await stationService.updateStationOperator(stationId, payload);
      setNotification({
        type: 'success',
        message: 'Station updated successfully!',
      });
      setTimeout(() => setNotification(null), 3000);
        
    } catch (err) {
      console.error('Update station failed:', err);
      setNotification({
        type: 'error',
        message: 'Failed to update station',
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-base text-slate-600">Loading station...</div>
      </div>
    );
  }

   const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {}
    notify.logout();
    navigate("/login");
  };


  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
            <Zap className="w-6 h-6 text-white" />
          </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base text-slate-900">
                BijuliYatra
              </span>
              <span className="text-xs text-slate-500">Operator Portal</span>
            </div>
          </div>
        </div>

       <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto text-base">
          <NavLink
            to="/operator/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <LayoutDashboard
              className={`w-5 h-5 ${
                loc.pathname === '/operator/dashboard'
                  ? 'text-emerald-500'
                  : 'text-slate-400'
              }`}
            />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/operator/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <PlugZap
              className={`w-5 h-5 ${
                loc.pathname.startsWith('/operator/dashboard')
                  ? 'text-emerald-500'
                  : 'text-slate-400'
              }`}
            />
            <span>Stations</span>
          </NavLink>

          <NavLink
            to="/operator/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <CalendarClock
              className={`w-5 h-5 ${
                loc.pathname.startsWith('/operator/dashboard')
                  ? 'text-emerald-500'
                  : 'text-slate-400'
              }`}
            />
            <span>Bookings</span>
          </NavLink>

          <NavLink
            to="/operator/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <BarChart3
              className={`w-5 h-5 ${
                loc.pathname.startsWith('/operator/dashboard')
                  ? 'text-emerald-500'
                  : 'text-slate-400'
              }`}
            />
            <span>Analytics</span>
          </NavLink>

          <NavLink
            to="/operator/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <Settings
              className={`w-5 h-5 ${
                loc.pathname.startsWith('/operator/settings')
                  ? 'text-emerald-500'
                  : 'text-slate-400'
              }`}
            />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200 p-4 flex-shrink-0">
          <button
            type="button"
              onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-sm text-slate-600 hover:text-slate-800"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center">
          <div className="max-w-5xl w-full mx-auto px-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/operator/dashboard')}
              className="inline-flex items-center gap-2 text-base text-slate-700 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to stations</span>
            </button>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-0.5">
                Editing station #{stationId}
              </p>
            </div>
          </div>
        </header>

        {notification && (
          <div className="max-w-5xl mx-auto px-6 pt-4">
            <div
              className={`flex items-center gap-3 p-4 rounded-lg ${
                notification.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-rose-50 border border-rose-200'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <p
                className={`text-sm font-medium ${
                  notification.type === 'success'
                    ? 'text-emerald-800'
                    : 'text-rose-800'
                }`}
              >
                {notification.message}
              </p>
            </div>
          </div>
        )}

        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
              
                <section>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    Station Details
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Name */}
                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        Name *
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.name ? 'border-rose-500' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.name && <p className="text-sm text-rose-600 mt-1">{errors.name}</p>}
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        Location label *
                      </label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.location ? 'border-rose-500' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.location && <p className="text-sm text-rose-600 mt-1">{errors.location}</p>}
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        Address *
                      </label>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.address ? 'border-rose-500' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.address && <p className="text-sm text-rose-600 mt-1">{errors.address}</p>}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        City *
                      </label>
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.city ? 'border-rose-500' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.city && <p className="text-sm text-rose-600 mt-1">{errors.city}</p>}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        State *
                      </label>
                      <input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.state ? 'border-rose-500' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.state && <p className="text-sm text-rose-600 mt-1">{errors.state}</p>}
                    </div>

                    {/* ZIP */}
                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        ZIP code *
                      </label>
                      <input
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.zipCode ? 'border-rose-500' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.zipCode && <p className="text-sm text-rose-600 mt-1">{errors.zipCode}</p>}
                    </div>

                    {/* Station Image URL */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-base font-medium text-slate-700">
                        Station Image URL
                      </label>

                      <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => {
                          setImgError(false);
                          handleChange(e);
                        }}
                        placeholder="https://... or data:image/...base64,..."
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.imageUrl ? 'border-rose-500' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.imageUrl && <p className="text-sm text-rose-600">{errors.imageUrl}</p>}

                      {formData.imageUrl && (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-500">Preview:</p>

                          <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            {!imgError ? (
                              <img
                                src={formData.imageUrl}
                                alt="Station preview"
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                                Invalid URL or image not found
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-slate-500">
                        Paste Unsplash/S3 URL or a data URL. Leave empty for fallback.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-medium text-slate-800">
                      Map location (click to change)
                    </h3>
                    <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-200">
                      <StationLocationPicker
                        value={
                          formData.latitude && formData.longitude
                            ? { lat: formData.latitude, lng: formData.longitude }
                            : null
                        }
                        onChange={handleMapLocationChange}
                      />
                    </div>
                    {formData.latitude && formData.longitude && (
                      <p className="text-xs text-slate-500">
                        Selected: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                </section>

                {/* Capacity & pricing */}
                <section>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
                    Capacity & Pricing
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        Level 2 chargers *
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="level2Chargers"
                        value={formData.level2Chargers}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.level2Chargers
                            ? 'border-rose-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.level2Chargers && (
                        <p className="text-sm text-rose-600 mt-1">
                          {errors.level2Chargers}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        DC fast chargers *
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="dcFastChargers"
                        value={formData.dcFastChargers}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.dcFastChargers
                            ? 'border-rose-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.dcFastChargers && (
                        <p className="text-sm text-rose-600 mt-1">
                          {errors.dcFastChargers}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        Total slots
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="totalSlots"
                        value={formData.totalSlots}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg text-base outline-none border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        Available slots
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="availableSlots"
                        value={formData.availableSlots}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg text-base outline-none border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        Level 2 rate (per kWh) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="level2Rate"
                        value={formData.level2Rate}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.level2Rate
                            ? 'border-rose-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.level2Rate && (
                        <p className="text-sm text-rose-600 mt-1">
                          {errors.level2Rate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        DC fast rate (per kWh) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="dcFastRate"
                        value={formData.dcFastRate}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.dcFastRate
                            ? 'border-rose-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.dcFastRate && (
                        <p className="text-sm text-rose-600 mt-1">
                          {errors.dcFastRate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        id="peakPricing"
                        type="checkbox"
                        name="peakPricing"
                        checked={formData.peakPricing}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600 border-slate-300 rounded"
                      />
                      <label
                        htmlFor="peakPricing"
                        className="text-base text-slate-700"
                      >
                        Enable peak pricing
                      </label>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        Peak multiplier
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        name="peakMultiplier"
                        value={formData.peakMultiplier}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg text-base outline-none border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.status
                            ? 'border-rose-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      >
                        <option value="operational">Operational</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="offline">Offline</option>
                      </select>
                      {errors.status && (
                        <p className="text-sm text-rose-600 mt-1">
                          {errors.status}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Operator & notes */}
                <section>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
                    Operator & Notes
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        Operator ID *
                      </label>
                      <input
                        type="number"
                        name="operatorId"
                        value={formData.operatorId}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-base outline-none ${
                          errors.operatorId
                            ? 'border-rose-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      {errors.operatorId && (
                        <p className="text-sm text-rose-600 mt-1">
                          {errors.operatorId}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-base font-medium text-slate-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg text-base outline-none border-slate-300 resize-none"
                        placeholder="Internal notes about this station"
                      />
                    </div>
                  </div>
                </section>

                {/* Actions */}
                <div className="flex gap-4 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/operator/dashboard')}
                    className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 text-base font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-base font-medium disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
