// src/pages/AddStation.jsx
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader, Zap,LayoutDashboard,Calendar,BarChart3,Settings, Building2,Book} from 'lucide-react';
import { stationService } from '../../Services/api';
import { useNavigate, NavLink } from 'react-router-dom';
import StationLocationPicker from '../../Services/StationLocationPicker';

export default function AddStation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    level2Chargers: 0,
    dcFastChargers: 0,
    level2Rate: 0.25,
    dcFastRate: 0.50,
    peakPricing: false,
    peakMultiplier: 1.25,
    notes: '',
    latitude: null,
    longitude: null,
   imageUrl: '',
  //   level1Chargers: 0,
  // dcUltraChargers: 0,
  // dcComboChargers: 0,
  // level1Rate: 0.2,
  // dcUltraRate: 0.8,
  // dcComboRate: 0.9,
  });

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Station name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Station name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      errors.name = 'Station name must not exceed 100 characters';
    }

    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    if (!formData.zipCode) {
      errors.zipCode = 'Zip code is required';
    } else if (!/^\d{5}$/.test(formData.zipCode)) {
      errors.zipCode = 'Zip code must be 5 digits';
    }

    const level2 = parseInt(formData.level2Chargers, 10) || 0;
    const dcFast = parseInt(formData.dcFastChargers, 10) || 0;

    // const level1 = parseInt(formData.level1Chargers, 10) || 0;
    // const dcUltra = parseInt(formData.dcUltraChargers, 10) || 0;
    // const dcCombo = parseInt(formData.dcComboChargers, 10) || 0;

    if (level2 < 0) {
      errors.level2Chargers = 'Level 2 chargers cannot be negative';
    }
    if (dcFast < 0) {
      errors.dcFastChargers = 'DC Fast chargers cannot be negative';
    }
    if (level2 === 0 && dcFast === 0) {
      errors.chargers = 'At least one charger is required';
    }

    // if (level1 < 0) errors.level1Chargers = 'Level 1 chargers cannot be negative';
    // if (dcUltra < 0) errors.dcUltraChargers = 'DC Ultra chargers cannot be negative';
    // if (dcCombo < 0) errors.dcComboChargers = 'DC Combo chargers cannot be negative';

    // if (level1 + level2 + dcFast + dcUltra + dcCombo === 0) {
    //   errors.chargers = 'At least one charger is required';
    // }
    const level2Rate = parseFloat(formData.level2Rate) || 0;
    const dcFastRate = parseFloat(formData.dcFastRate) || 0;


//  const level1Rate = parseFloat(formData.level1Rate) || 0;
//  const dcUltraRate = parseFloat(formData.dcUltraRate) || 0;
//  const dcComboRate = parseFloat(formData.dcComboRate) || 0;

    if (level2Rate <= 0) {
      errors.level2Rate = 'Level 2 rate must be greater than 0';
    }
    if (dcFastRate <= 0) {
      errors.dcFastRate = 'DC Fast rate must be greater than 0';
    }

    
// if (level1Rate <= 0) errors.level1Rate = 'Level 1 rate must be greater than 0';
// if (dcUltraRate <= 0) errors.dcUltraRate = 'DC Ultra rate must be greater than 0';
// if (dcComboRate <= 0) errors.dcComboRate = 'DC Combo rate must be greater than 0';

    const peakMultiplier = parseFloat(formData.peakMultiplier) || 0;
    if (formData.peakPricing && peakMultiplier <= 1) {
      errors.peakMultiplier = 'Peak multiplier must be greater than 1';
    }

    if (!formData.latitude || !formData.longitude) {
      errors.mapLocation = 'Please click on the map to set station coordinates';
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleMapLocationChange = async ({ lat, lng }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    }));
    if (validationErrors.mapLocation) {
      setValidationErrors((prev) => ({
        ...prev,
        mapLocation: '',
      }));
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await res.json();

      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.hamlet || '';
      const state = addr.state || '';
      const postcode = addr.postcode || '';
      const road = addr.road || '';
      const suburb = addr.suburb || '';
      const displayAddress =
        data.display_name ||
        [road, suburb, city, state].filter(Boolean).join(', ');

      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        location: displayAddress || prev.location,
        address: road || suburb || prev.address,
        city: city || prev.city,
        state: state || prev.state,
        zipCode: postcode || prev.zipCode,
      }));
    } catch (e) {
      console.error('Reverse geocoding failed', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const stationData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode,
        level2Chargers: parseInt(formData.level2Chargers, 10) || 0,
        dcFastChargers: parseInt(formData.dcFastChargers, 10) || 0,
        level2Rate: parseFloat(formData.level2Rate),
        dcFastRate: parseFloat(formData.dcFastRate),
        peakPricing: formData.peakPricing,
        peakMultiplier: parseFloat(formData.peakMultiplier),
        notes: formData.notes.trim(),
        // level1Chargers: parseInt(formData.level1Chargers, 10) || 0,
        // dcUltraChargers: parseInt(formData.dcUltraChargers, 10) || 0,
        // dcComboChargers: parseInt(formData.dcComboChargers, 10) || 0,
        // level1Rate: parseFloat(formData.level1Rate),
        // dcUltraRate: parseFloat(formData.dcUltraRate),
        // dcComboRate: parseFloat(formData.dcComboRate),


        totalSlots:
          (parseInt(formData.level2Chargers, 10) || 0) +
          (parseInt(formData.dcFastChargers, 10) || 0) ,
          // (parseInt(formData.level1Chargers, 10) || 0) +
          // (parseInt(formData.dcFastChargers, 10) || 0) +
          // (parseInt(formData.dcUltraChargers, 10) || 0) +
          // (parseInt(formData.dcComboChargers, 10) || 0),
          
        availableSlots:
          (parseInt(formData.level2Chargers, 10) || 0) +
          (parseInt(formData.dcFastChargers, 10) || 0) ,
          // (parseInt(formData.level1Chargers, 10) || 0) +
          //  (parseInt(formData.level2Chargers, 10) || 0) +
          // (parseInt(formData.dcFastChargers, 10) || 0) +
          // (parseInt(formData.dcUltraChargers, 10) || 0) +
          // (parseInt(formData.dcComboChargers, 10) || 0),
        latitude: formData.latitude,
        longitude: formData.longitude,
        imageUrl: formData.imageUrl,
      };

      console.log('Submitting station data:', stationData);

      await stationService.createStation(stationData);

      setSuccess('Station created successfully!');
      setFormData({
        name: '',
        location: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        level2Chargers: 0,
        dcFastChargers: 0,
        level2Rate: 0.25,
        dcFastRate: 0.50,
        peakPricing: false,
        peakMultiplier: 1.25,
        notes: '',
        latitude: null,
        longitude: null,
        imageUrl:'',
      });

      setTimeout(() => {
        navigate('/operator/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating station:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to create station'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-40">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">BijuliYatra</p>
            <p className="text-[11px] text-slate-500">Operator Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm overflow-y-auto">
          <NavLink
            to="/operator/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/operator/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Building2 className="w-4 h-4" />
            <span>Stations</span>
          </NavLink>

          <NavLink
            to="/operator/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Book className="w-4 h-4" />
            <span>Bookings</span>
          </NavLink>

          <NavLink
            to="/operator/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </NavLink>

          <NavLink
            to="/operator/settings"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </aside>
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* Top bar / breadcrumb */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center">
          <div className="max-w-5xl w-full mx-auto px-6 flex items-center justify-between">
            <div>
           
              <h1 className="text-xl font-semibold text-slate-900">
                Add New Station
              </h1>
              <p className="text-xs text-slate-500">
                Configure your new charging station
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
             
                <section>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Station Details
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Station Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g., Downtown Hub"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            validationErrors.name
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-emerald-500'
                          }`}
                        />
                        {validationErrors.name && (
                          <p className="text-red-600 text-xs mt-1">
                            {validationErrors.name}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">
                          {formData.name.length}/100 characters
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location *
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="e.g., City Center"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            validationErrors.location
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-emerald-500'
                          }`}
                        />
                        {validationErrors.location && (
                          <p className="text-red-600 text-xs mt-1">
                            {validationErrors.location}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="e.g., 123 Main Street"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            validationErrors.address
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-emerald-500'
                          }`}
                        />
                        {validationErrors.address && (
                          <p className="text-red-600 text-xs mt-1">
                            {validationErrors.address}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="e.g., San Francisco"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                              validationErrors.city
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-emerald-500'
                            }`}
                          />
                          {validationErrors.city && (
                            <p className="text-red-600 text-xs mt-1">
                              {validationErrors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="e.g., CA"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                              validationErrors.state
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-emerald-500'
                            }`}
                          />
                          {validationErrors.state && (
                            <p className="text-red-600 text-xs mt-1">
                              {validationErrors.state}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code *
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            placeholder="e.g., 94102"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                              validationErrors.zipCode
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-emerald-500'
                            }`}
                          />
                          {validationErrors.zipCode && (
                            <p className="text-red-600 text-xs mt-1">
                              {validationErrors.zipCode}
                            </p>
                          )}
                        </div>
                      </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Station Image URL
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Put your Station Image</p>
                    
                    {/* Image Preview */}
                    {formData.imageUrl && (
                      <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-600 mb-1">Preview:</p>
                        <img 
                          src={formData.imageUrl} 
                          alt="Station preview"
                          className="w-full max-h-48 object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'block';
                          }}
                        />
                        <p className="text-xs text-red-500 mt-1 hidden">
                          Invalid image URL
                        </p>
                      </div>
                      
                    )}
                    </div>
                  </div>

                 
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-800">
                        Map Location (click to set coordinates) *
                      </h3>
                      <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200">
                        <StationLocationPicker
                          value={
                            formData.latitude && formData.longitude
                              ? {
                                  lat: formData.latitude,
                                  lng: formData.longitude,
                                }
                              : null
                          }
                          onChange={handleMapLocationChange}
                        />
                      </div>
                      {validationErrors.mapLocation && (
                        <p className="text-red-600 text-xs">
                          {validationErrors.mapLocation}
                        </p>
                      )}
                      {formData.latitude && formData.longitude && (
                        <p className="text-gray-500 text-xs">
                          Selected: {formData.latitude.toFixed(6)},{' '}
                          {formData.longitude.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                 {/* Charger configuration */}
                 <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Charger Types
              </h2>

              {validationErrors.chargers && (
                <p className="text-red-600 text-sm mb-3">
                  {validationErrors.chargers}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Level 1 */}
                {/* <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-800">Level 1</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="level1Chargers"
                        min="0"
                        value={formData.level1Chargers}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Rate (NPR/kWh)
                      </label>
                      <input
                        type="number"
                        name="level1Rate"
                        min="0.01"
                        step="0.01"
                        value={formData.level1Rate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div> */}

                {/* Level 2 */}
                <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-800">Level 2</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="level2Chargers"
                        min="0"
                        value={formData.level2Chargers}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Rate (NPR/kWh)
                      </label>
                      <input
                        type="number"
                        name="level2Rate"
                        min="0.01"
                        step="0.01"
                        value={formData.level2Rate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* DC Fast */}
                <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-800">DC Fast</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="dcFastChargers"
                        min="0"
                        value={formData.dcFastChargers}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Rate (NPR/kWh)
                      </label>
                      <input
                        type="number"
                        name="dcFastRate"
                        min="0.01"
                        step="0.01"
                        value={formData.dcFastRate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* DC Ultra */}
                {/* <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-800">DC Ultra</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="dcUltraChargers"
                        min="0"
                        value={formData.dcUltraChargers}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Rate (NPR/kWh)
                      </label>
                      <input
                        type="number"
                        name="dcUltraRate"
                        min="0.01"
                        step="0.01"
                        value={formData.dcUltraRate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div> */}

                {/* DC Combo */}
                {/* <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-800">DC Combo (CCS)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="dcComboChargers"
                        min="0"
                        value={formData.dcComboChargers}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Rate (NPR/kWh)
                      </label>
                      <input
                        type="number"
                        name="dcComboRate"
                        min="0.01"
                        step="0.01"
                        value={formData.dcComboRate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div> */}
                {/* </div> */}
              </div>
            </section>

                {/* Pricing */}
                <section>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Pricing Configuration
                  </h2>                    
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="peakPricing"
                        checked={formData.peakPricing}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Enable Peak Pricing
                      </span>
                    </label>

                    {formData.peakPricing && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Peak Multiplier (must be &gt; 1.0) *
                        </label>
                        <input
                          type="number"
                          name="peakMultiplier"
                          value={formData.peakMultiplier}
                          onChange={handleInputChange}
                          step="0.01"
                          min="1.01"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            validationErrors.peakMultiplier
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-emerald-500'
                          }`}
                        />
                        {validationErrors.peakMultiplier && (
                          <p className="text-red-600 text-xs mt-1">
                            {validationErrors.peakMultiplier}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* Notes */}
                <section>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes about this station"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </section>

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Creating Station...
                      </>
                    ) : (
                      'Create Station'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/operator/dashboard')}
                    className="flex-1 bg-slate-100 text-slate-800 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                  >
                    Cancel
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
