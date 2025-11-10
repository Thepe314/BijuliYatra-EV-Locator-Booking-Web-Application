import { useState } from 'react';
import { ArrowLeft, MapPin, Zap, DollarSign } from 'lucide-react';
import { stationService } from '../../Services/api';

export default function AddStationPage() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    level2Chargers: 0,
    dcFastChargers: 0,
    level2Rate: 0.35,
    dcFastRate: 0.45,
    peakPricing: false,
    peakMultiplier: 1.25,
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name.includes('Rate') || name === 'peakMultiplier' ? parseFloat(value) : isNaN(value) ? value : parseInt(value) || value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
    console.log("Submitting station data:", JSON.stringify(formData, null, 2));
      await stationService.createStation(formData);
      console.log('Station created successfully');
      
      setSubmitted(true);
      setTimeout(() => {
        setFormData({
          name: '',
          location: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          level2Chargers: 0,
          dcFastChargers: 0,
          level2Rate: 0.35,
          dcFastRate: 0.45,
          peakPricing: false,
          peakMultiplier: 1.25,
          notes: '',
        });
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error('Error creating station:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while creating the station';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalChargers = formData.level2Chargers + formData.dcFastChargers;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CPO Dashboard</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-200 rounded-lg transition">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Charging Station</h1>
        </div>

        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ Station added successfully!</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">✗ Error: {error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Station Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Downtown Hub"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location Name *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Main St"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="ZIP"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Charger Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-green-600" />
              Charger Configuration
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level 2 (AC) Chargers *</label>
                  <input
                    type="number"
                    name="level2Chargers"
                    value={formData.level2Chargers}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Standard charging 7-9 hours for full charge</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DC Fast Chargers *</label>
                  <input
                    type="number"
                    name="dcFastChargers"
                    value={formData.dcFastChargers}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Fast charging 20-30 min for 80% charge</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Total Chargers:</span> {totalChargers}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
              Pricing Configuration
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level 2 Rate (per kWh) *</label>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">$</span>
                    <input
                      type="number"
                      name="level2Rate"
                      value={formData.level2Rate}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DC Fast Rate (per kWh) *</label>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">$</span>
                    <input
                      type="number"
                      name="dcFastRate"
                      value={formData.dcFastRate}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="peakPricing"
                    checked={formData.peakPricing}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable peak hour pricing</span>
                </label>

                {formData.peakPricing && (
                  <div className="ml-3 pt-2 border-l-2 border-blue-300 pl-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peak Hour Multiplier</label>
                    <input
                      type="number"
                      name="peakMultiplier"
                      value={formData.peakMultiplier}
                      onChange={handleInputChange}
                      step="0.05"
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Example: 1.25 = 25% increase during peak hours</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional information about this station..."
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {}}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitted || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-green-600 disabled:opacity-75"
            >
              {loading ? 'Creating...' : submitted ? '✓ Added' : 'Add Station'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}