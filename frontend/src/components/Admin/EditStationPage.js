// src/pages/EditStationPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Save, X, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { stationService } from '../../Services/api'; // you create this similar to userService

export default function EditStationPage() {
  const { id: stationId } = useParams();
  const navigate = useNavigate();

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
  });

  useEffect(() => {
    let mounted = true;
    const loadStation = async () => {
      setLoading(true);
      try {
        const apiStation = await stationService.getStationById(stationId);
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
    const newValue =
      type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

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
    if (!formData.operatorId) {
      newErrors.operatorId = 'Operator id is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          formData.totalSlots !== ''
            ? Number(formData.totalSlots)
            : null,
        availableSlots:
          formData.availableSlots !== ''
            ? Number(formData.availableSlots)
            : null,
        operatorId: Number(formData.operatorId),
      };

      await stationService.updateStationAdmin(stationId, payload);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading station...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                Edit Charging Station
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Update station details and capacity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="p-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">
                {saving ? 'Saving...' : 'Save'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p
              className={`text-xs sm:text-sm font-medium ${
                notification.type === 'success'
                  ? 'text-green-800'
                  : 'text-red-800'
              }`}
            >
              {notification.message}
            </p>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <form
          className="bg-white rounded-lg shadow max-w-4xl mx-auto"
          onSubmit={handleSubmit}
        >
          {/* Basic info */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Station Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Location (label) *
                </label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.location && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.location}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.address && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.address}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.city && (
                  <p className="text-xs text-red-600 mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.state && (
                  <p className="text-xs text-red-600 mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.zipCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.zipCode && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.zipCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Capacity & pricing */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Capacity & Pricing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Level 2 Chargers *
                </label>
                <input
                  type="number"
                  min="0"
                  name="level2Chargers"
                  value={formData.level2Chargers}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.level2Chargers
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.level2Chargers && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.level2Chargers}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  DC Fast Chargers *
                </label>
                <input
                  type="number"
                  min="0"
                  name="dcFastChargers"
                  value={formData.dcFastChargers}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.dcFastChargers
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.dcFastChargers && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.dcFastChargers}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Total Slots
                </label>
                <input
                  type="number"
                  min="0"
                  name="totalSlots"
                  value={formData.totalSlots}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Available Slots
                </label>
                <input
                  type="number"
                  min="0"
                  name="availableSlots"
                  value={formData.availableSlots}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Level 2 Rate (per kWh) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="level2Rate"
                  value={formData.level2Rate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.level2Rate
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.level2Rate && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.level2Rate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  DC Fast Rate (per kWh) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="dcFastRate"
                  value={formData.dcFastRate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.dcFastRate
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.dcFastRate && (
                  <p className="text-xs text-red-600 mt-1">
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
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="peakPricing"
                  className="text-xs sm:text-sm text-gray-700"
                >
                  Enable peak pricing
                </label>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Peak Multiplier
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  name="peakMultiplier"
                  value={formData.peakMultiplier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="operational">Operational</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
                {errors.status && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.status}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Operator & notes */}
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Operator & Notes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Operator ID *
                </label>
                <input
                  type="number"
                  name="operatorId"
                  value={formData.operatorId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${
                    errors.operatorId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.operatorId && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.operatorId}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none border-gray-300 resize-none"
                  placeholder="Internal notes about this station"
                />
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 pb-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
