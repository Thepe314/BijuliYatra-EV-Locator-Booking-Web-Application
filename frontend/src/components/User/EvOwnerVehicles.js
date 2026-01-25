import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, Plus, Edit3, Trash2, Upload, X, 
  Zap, Battery, Settings, MapPin, Bell, User, 
  ArrowLeft, Home
} from 'lucide-react';
import { toast } from 'react-toastify';
import { vehicleService } from '../../Services/api';
import notify from '../../Utils/notify';

export default function EVOwnerVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    batteryCapacity: '',
    imageUrl: '',
    licensePlate: '',
    colour: '',
    chargingType: 'DC_FAST'
  });
  const navigate = useNavigate();

  const chargingTypes = [
    { value: 'DC_FAST', label: 'DC Fast Charger (50-150kW)', ports: '1 port' },
    // { value: 'DC_ULTRA', label: 'DC Ultra Fast (150-350kW)', ports: '1 port' },
    { value: 'AC_LEVEL2', label: 'Level 2 (AC) (7-22kW)', ports: '1 port' },
    // { value: 'AC_LEVEL1', label: 'Level 1 (AC) (2-3.7kW)', ports: '1 port' },
    // { value: 'DC_COMBO', label: 'DC Combo (CCS/ChAdeMO)', ports: '2 ports' }
  ];

  // Mock data for notifications - replace with real data
  const upcomingBookings = [];

  const handleLogout = () => {
    // Implement logout logic
    navigate('/login');
  };

  useEffect(() => {
    loadVehicles();
  }, []);

 const loadVehicles = async () => {
  try {
    setLoading(true);
    const res = await vehicleService.listVehicles();
    
    // Handle different response structures
    const vehiclesData = res.data || res;
    const mappedVehicles = Array.isArray(vehiclesData) 
      ? vehiclesData.map(v => ({
          id: v.id,
          brand: v.vehicleBrand || v.brand,
          model: v.vehicleModel || v.model,
          year: v.vehicleYear || v.year,
          batteryCapacity: v.batteryCapacity,
          licensePlate: v.vehicleRegistrationNumber,
          imageUrl: v.imageUrl,
          colour: v.colour,
          chargingType: v.chargingType || 'DC_FAST'
        }))
      : [];
    
    setVehicles(mappedVehicles);
    console.log('Loaded vehicles:', mappedVehicles); // Debug
  } catch (err) {
    console.error('Full error:', err.response?.data, err.message);
    
    if (err.response?.status === 401) {
      toast.error('Please login again');
      navigate('/login');
    } else if (err.response?.status === 403) {
      toast.error('Access denied. Contact support.');
    } else if (err.response?.status === 400) {
      toast.error('Server error. Check console for details.');
    } else {
      toast.error('Failed to load vehicles');
    }
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUrlChange = (url) => {
    setFormData({ ...formData, imageUrl: url });
  };

  const validateForm = () => {
    if (!formData.brand || !formData.model || !formData.year || !formData.batteryCapacity) {
      toast.error('Brand, model, year, and battery capacity required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const mappedData = {
        vehicleBrand: formData.brand,
        vehicleModel: formData.model,
        vehicleYear: formData.year.toString(),
        batteryCapacity: formData.batteryCapacity,
        vehicleRegistrationNumber: formData.licensePlate,
        imageUrl: formData.imageUrl,
        chargingType: formData.chargingType, 
        colour: formData.colour, 
        primaryVehicle: false
      };

      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, mappedData);
        toast.success('Vehicle updated!');
      } else {
        await vehicleService.createVehicle(mappedData);
        toast.success('Vehicle added!');
      }
      setShowForm(false);
      setEditingVehicle(null);
      setFormData({ brand: '', model: '', year: '', batteryCapacity: '', imageUrl: '', licensePlate: '', colour: '',chargingType: 'DC_FAST' });
      loadVehicles();
    } catch (err) {
      toast.error('Failed to save vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      batteryCapacity: vehicle.batteryCapacity || '',
      imageUrl: vehicle.imageUrl || '',
      licensePlate: vehicle.licensePlate || '',
      colour: vehicle.colour || '',
      chargingType: vehicle.chargingType || 'DC_FAST' 
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await vehicleService.deleteVehicle(id);
      toast.success('Vehicle deleted');
      loadVehicles();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const imageFallback = (url) => {
    return url ? url : 'https://images.unsplash.com/photo-1583121274602-f18d4f45e595?w=400&fit=crop';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto my-6 border border-emerald-100 rounded-2xl bg-white shadow-sm overflow-hidden">
        {/* Navbar Header */}
        <header className="border-b border-emerald-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-3 rounded-xl">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Vehicles</h1>
                <p className="text-sm text-slate-600">Manage your EV fleet</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Back to Dashboard */}
              <button
                onClick={() => navigate('/ev-owner/dashboard')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium px-4 py-2 hover:bg-slate-50 rounded-xl transition-all"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </button>
              
              {/* Notifications */}
              <button className="p-3 hover:bg-slate-50 rounded-xl relative transition-all">
                <Bell className="w-5 h-5 text-slate-600" />
                {upcomingBookings.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              
              {/* Profile */}
              <button
                onClick={() => navigate('/profile')}
                className="p-3 hover:bg-slate-50 rounded-xl"
              >
                <User className="w-5 h-5 text-slate-600" />
              </button>
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-500 hover:text-red-600 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-50 transition-all"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center gap-1 mt-4 pt-4 border-t border-slate-100">
            <button 
              onClick={() => navigate('/ev-owner/dashboard')}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/ev-owner/station')}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            >
              Find Stations
            </button>
            <button 
              onClick={() => navigate('/ev-owner/bookings')}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            >
              My Bookings
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-xl">
              My Vehicles
            </button>
            <button 
              onClick={() => navigate('/ev-owner/wallet')}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            >
              Wallet
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            >
              Profile
            </button>
          </nav>
        </header>

        {/* Main Content */}
        <main className="p-6 lg:p-8">
          {/* Add Vehicle Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-xl">
                <Battery className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{vehicles.length} Vehicle{vehicles.length !== 1 ? 's' : ''}</h2>
                <p className="text-slate-600">Get personalized charger recommendations</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Vehicle
            </button>
          </div>

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-200">
                <div className="relative h-48 bg-gradient-to-br from-slate-50 to-emerald-50/30 overflow-hidden">
                  <img
                    src={imageFallback(vehicle.imageUrl)}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = imageFallback('');
                    }}
                  />
                  <div className="absolute top-4 right-4 flex gap-2 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border">
                    <Battery className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-900">{vehicle.batteryCapacity} kWh</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-xl text-slate-900 capitalize leading-tight">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="p-2 hover:bg-emerald-50 rounded-xl text-emerald-600 hover:text-emerald-700 hover:shadow-md transition-all"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="p-2 hover:bg-red-50 rounded-xl text-red-600 hover:text-red-700 hover:shadow-md transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span>{vehicle.year}</span>
                    </div>
                    
                    {vehicle.chargingType && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="font-medium capitalize">
                          {chargingTypes.find(t => t.value === vehicle.chargingType)?.label || 
                          vehicle.chargingType.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </div>
                    )}
                    
                    {vehicle.licensePlate && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="font-mono">{vehicle.licensePlate}</span>
                      </div>
                    )}
                    
                    {vehicle.colour && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0 shadow-sm" 
                          style={{ backgroundColor: vehicle.colour.toLowerCase() }}
                          title={vehicle.colour}
                        />
                        <span className="capitalize">{vehicle.colour}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => navigate('/ev-owner/station', { state: { preferredVehicle: vehicle } })}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Use for Booking
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {vehicles.length === 0 && !showForm && (
            <div className="col-span-full text-center py-24 bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl border-2 border-dashed border-emerald-200">
              <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Car className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No vehicles added yet</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                Add your electric vehicle to unlock personalized charger recommendations, 
                range estimates, and faster booking experience.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-emerald-600 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Add Your First Vehicle
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Vehicle Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-white/50">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingVehicle(null);
                    setFormData({ brand: '', model: '', year: '', batteryCapacity: '', imageUrl: '', licensePlate: '', colour: '' });
                  }}
                  className="p-2 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Preview */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Vehicle Image (URL)</label>
                <div className="relative">
                  <input
                    type="url"
                    name="imageUrl"
                    placeholder="https://example.com/your-ev.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => handleImageUrlChange('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="mt-4 w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <img
                    src={imageFallback(formData.imageUrl)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center"></p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Brand *</label>
                  <input
                    required
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="Tesla"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Model *</label>
                  <input
                    required
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="Model 3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Year *</label>
                  <input
                    required
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="2023"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Battery Capacity (kWh) *</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    name="batteryCapacity"
                    value={formData.batteryCapacity}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="75.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Charger Type *</label>
                <select
                  required
                  name="chargingType"
                  value={formData.chargingType}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none bg-white"
                >
                  {chargingTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">License Plate</label>
                  <input
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="BAGMA 1-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Colour</label>
                  <input
                    name="colour"
                    value={formData.colour}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="Pearl White"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVehicle(null);
                    setFormData({ brand: '', model: '', year: '', batteryCapacity: '', imageUrl: '', licensePlate: '', colour: '' });
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-semibold hover:bg-slate-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
