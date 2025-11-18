import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, Users } from 'lucide-react';
import { stationService } from '../../Services/api';
import { useNavigate } from 'react-router-dom';
import { api } from '../../Services/api';

export default function AddStationAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [operators, setOperators] = useState([]);
  const [operatorsLoading, setOperatorsLoading] = useState(true);
  const [selectedOperatorId, setSelectedOperatorId] = useState('');

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
    peakMultiplier: 1.5,
    notes: ''
  });

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await api.get('/admin/role/ROLE_CHARGER_OPERATOR');
        setOperators(response.data || []);
      } catch (err) {
        console.error('Failed to load operators:', err);
        setError('Could not load operators. Please refresh.');
      } finally {
        setOperatorsLoading(false);
      }
    };
    fetchOperators();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!selectedOperatorId) errors.operatorId = 'Please select an operator';
    if (!formData.name.trim()) errors.name = 'Station name is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zipCode || !/^\d{5}$/.test(formData.zipCode)) errors.zipCode = 'Valid 5-digit ZIP required';

    const l2 = parseInt(formData.level2Chargers) || 0;
    const dc = parseInt(formData.dcFastChargers) || 0;
    if (l2 + dc === 0) errors.chargers = 'At least one charger is required';

    if (parseFloat(formData.level2Rate) <= 0) errors.level2Rate = 'Must be > 0';
    if (parseFloat(formData.dcFastRate) <= 0) errors.dcFastRate = 'Must be > 0';

    if (formData.peakPricing && parseFloat(formData.peakMultiplier) <= 1) {
      errors.peakMultiplier = 'Peak multiplier must be > 1.0';
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
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
        ...formData,
        level2Chargers: parseInt(formData.level2Chargers) || 0,
        dcFastChargers: parseInt(formData.dcFastChargers) || 0,
        level2Rate: parseFloat(formData.level2Rate),
        dcFastRate: parseFloat(formData.dcFastRate),
        peakMultiplier: formData.peakPricing ? parseFloat(formData.peakMultiplier) : null,
        operatorId: parseInt(selectedOperatorId)
      };

      await stationService.createStationAdmin(stationData);
      setSuccess('Station created successfully!');
      setTimeout(() => navigate('/stationmanagement'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create station');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Charging Station</h1>
          <p className="text-sm text-gray-500 mt-1">Create and assign to an operator</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* OPERATOR */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-6 h-6 text-blue-700" />
                <h2 className="text-xl font-semibold">Assign to Operator <span className="text-red-500">*</span></h2>
              </div>
              {operatorsLoading ? (
                <p>Loading operators...</p>
              ) : (
                <select
                  value={selectedOperatorId}
                  onChange={(e) => setSelectedOperatorId(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg ${validationErrors.operatorId ? 'border-red-500' : 'border-gray-300'}`}
                  required
                >
                  <option value="">-- Select Operator --</option>
                  {operators.map(op => (
                    <option key={op.user_id} value={op.user_id}>
                      {op.companyName || op.fullname} • {op.email}
                    </option>
                  ))}
                </select>
              )}
              {validationErrors.operatorId && <p className="text-red-600 text-sm mt-2">{validationErrors.operatorId}</p>}
            </div>

            {/* BASIC INFO */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="grid gap-4">
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Station Name *" className="w-full px-4 py-2 border rounded-lg" />
                {validationErrors.name && <p className="text-red-600 text-sm">{validationErrors.name}</p>}

                <div className="grid md:grid-cols-2 gap-4">
                  <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location (Lat,Lng) *" className="w-full px-4 py-2 border rounded-lg" />
                  <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Address *" className="w-full px-4 py-2 border rounded-lg" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <input name="city" value={formData.city} onChange={handleInputChange} placeholder="City *" className="w-full px-4 py-2 border rounded-lg" />
                  <input name="state" value={formData.state} onChange={handleInputChange} placeholder="State *" className="w-full px-4 py-2 border rounded-lg" />
                  <input name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="ZIP Code *" className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
            </div>

            {/* CHARGERS */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Chargers</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Level 2 Chargers</label>
                  <input type="number" name="level2Chargers" value={formData.level2Chargers} onChange={handleInputChange} min="0" className="w-full px-4 py-2 border rounded-lg mt-1" />
                </div>
                <div>
                  <label>DC Fast Chargers</label>
                  <input type="number" name="dcFastChargers" value={formData.dcFastChargers} onChange={handleInputChange} min="0" className="w-full px-4 py-2 border rounded-lg mt-1" />
                </div>
              </div>
              {validationErrors.chargers && <p className="text-red-600 text-sm mt-2">{validationErrors.chargers}</p>}
            </div>

            {/* PRICING */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Pricing ($/kWh)</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Level 2 Rate *</label>
                  <input type="number" step="0.01" name="level2Rate" value={formData.level2Rate} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg mt-1" />
                  {validationErrors.level2Rate && <p className="text-red-600 text-sm">{validationErrors.level2Rate}</p>}
                </div>
                <div>
                  <label>DC Fast Rate *</label>
                  <input type="number" step="0.01" name="dcFastRate" value={formData.dcFastRate} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg mt-1" />
                  {validationErrors.dcFastRate && <p className="text-red-600 text-sm">{validationErrors.dcFastRate}</p>}
                </div>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="peakPricing" checked={formData.peakPricing} onChange={handleInputChange} className="w-5 h-5" />
                  <span className="font-medium">Enable Peak Pricing</span>
                </label>
                {formData.peakPricing && (
                  <div className="mt-3">
                    <label>Peak Multiplier (e.g. 1.5 = 50% higher)</label>
                    <input type="number" step="0.01" name="peakMultiplier" value={formData.peakMultiplier} onChange={handleInputChange} min="1.01" className="w-full px-4 py-2 border rounded-lg mt-1" />
                    {validationErrors.peakMultiplier && <p className="text-red-600 text-sm">{validationErrors.peakMultiplier}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* NOTES */}
            <div>
              <label>Notes (Optional)</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border rounded-lg mt-1" />
            </div>

            {/* BUTTONS — NOW INSIDE THE FORM! */}
            <div className="flex gap-4 pt-8">
              <button
                type="submit"
                disabled={loading || operatorsLoading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader className="w-5 h-5 animate-spin" /> Creating...</> : 'Create & Assign Station'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/stationmanagement')}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-medium"
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