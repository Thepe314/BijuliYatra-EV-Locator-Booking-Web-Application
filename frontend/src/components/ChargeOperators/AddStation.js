// src/pages/AddStation.jsx
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { stationService } from '../../Services/api';
import { useNavigate } from 'react-router-dom';
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
    // NEW: image key metadata to send to backend
    imageKey: 'station-1',
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

    if (level2 < 0) {
      errors.level2Chargers = 'Level 2 chargers cannot be negative';
    }
    if (dcFast < 0) {
      errors.dcFastChargers = 'DC Fast chargers cannot be negative';
    }
    if (level2 === 0 && dcFast === 0) {
      errors.chargers = 'At least one charger is required';
    }

    const level2Rate = parseFloat(formData.level2Rate) || 0;
    const dcFastRate = parseFloat(formData.dcFastRate) || 0;

    if (level2Rate <= 0) {
      errors.level2Rate = 'Level 2 rate must be greater than 0';
    }
    if (dcFastRate <= 0) {
      errors.dcFastRate = 'DC Fast rate must be greater than 0';
    }

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

  // Map click: set coords and reverse geocode address
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
      const city =
        addr.city || addr.town || addr.village || addr.hamlet || '';
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
        totalSlots:
          (parseInt(formData.level2Chargers, 10) || 0) +
          (parseInt(formData.dcFastChargers, 10) || 0),
        availableSlots:
          (parseInt(formData.level2Chargers, 10) || 0) +
          (parseInt(formData.dcFastChargers, 10) || 0),
        latitude: formData.latitude,
        longitude: formData.longitude,
        // NEW: send imageKey to backend
        imageKey: formData.imageKey,
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
        imageKey: 'station-1',
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Station</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a new charging station
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
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
                    placeholder="Enter station name (2-100 characters)"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.name && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.name}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {formData.name.length}/100 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter location"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.location
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.location && (
                      <p className="text-red-600 text-sm mt-1">
                        {validationErrors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.address
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.address && (
                      <p className="text-red-600 text-sm mt-1">
                        {validationErrors.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.city
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.city && (
                      <p className="text-red-600 text-sm mt-1">
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
                      placeholder="Enter state"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.state
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.state && (
                      <p className="text-red-600 text-sm mt-1">
                        {validationErrors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="12345"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.zipCode
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.zipCode && (
                      <p className="text-red-600 text-sm mt-1">
                        {validationErrors.zipCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* NEW: imageKey selector field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Station Image Preset
                  </label>
                  <select
                    name="imageKey"
                    value={formData.imageKey}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  >
                    <option value="station-1">Preset 1</option>
                    <option value="station-2">Preset 2</option>
                    <option value="station-3">Preset 3</option>
                  </select>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">
                    Map Location (click on map to set coordinates) *
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
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.mapLocation}
                    </p>
                  )}
                  {formData.latitude && formData.longitude && (
                    <p className="text-gray-500 text-xs mt-2">
                      Selected: {formData.latitude.toFixed(6)},{' '}
                      {formData.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Charger Configuration
              </h2>
              {validationErrors.chargers && (
                <p className="text-red-600 text-sm mb-4">
                  {validationErrors.chargers}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level 2 Chargers *
                  </label>
                  <input
                    type="number"
                    name="level2Chargers"
                    value={formData.level2Chargers}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.level2Chargers
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.level2Chargers && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.level2Chargers}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DC Fast Chargers *
                  </label>
                  <input
                    type="number"
                    name="dcFastChargers"
                    value={formData.dcFastChargers}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.dcFastChargers
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.dcFastChargers && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.dcFastChargers}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pricing Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level 2 Rate ($/kWh) *
                  </label>
                  <input
                    type="number"
                    name="level2Rate"
                    value={formData.level2Rate}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.level2Rate
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.level2Rate && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.level2Rate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DC Fast Rate ($/kWh) *
                  </label>
                  <input
                    type="number"
                    name="dcFastRate"
                    value={formData.dcFastRate}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.dcFastRate
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.dcFastRate && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.dcFastRate}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="peakPricing"
                    checked={formData.peakPricing}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded"
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
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.peakMultiplier && (
                      <p className="text-red-600 text-sm mt-1">
                        {validationErrors.peakMultiplier}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any additional notes about this station"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
