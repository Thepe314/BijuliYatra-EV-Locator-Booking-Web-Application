import React, { useState, useEffect } from 'react';
import { MapPin, Zap, Settings, Plus, Edit, Trash2, AlertCircle, CheckCircle, Clock, Loader, RefreshCw } from 'lucide-react';
import { stationService } from '../../Services/api';

export default function StationManagement() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    totalChargers: 0
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const stationsData = await stationService.listStationAdmin();
      console.log('Stations data:', stationsData);

      // Transform backend data to frontend format
      const transformedStations = stationsData.map(station => {
        const level2 = station.level2Chargers || 0;
        const dcFast = station.dcFastChargers || 0;
        const totalChargers = level2 + dcFast;
        
        // Mock: Assume 30% usage (replace with actual booking data)
        const inUse = Math.floor(totalChargers * 0.3);
        const available = totalChargers - inUse;
        
        // Normalize status
        const normalizedStatus = station.status?.toLowerCase() === 'operational' ? 'Active' :
                                 station.status?.toLowerCase() === 'active' ? 'Active' :
                                 station.status?.toLowerCase() === 'maintenance' ? 'Maintenance' :
                                 'Inactive';

        return {
          id: station.id,
          name: station.name,
          address: `${station.address}, ${station.city}, ${station.state}`,
          location: station.location,
          status: normalizedStatus,
          totalChargers: totalChargers,
          availableChargers: available,
          fastChargers: dcFast,
          slowChargers: level2,
          revenue: '$0', // TODO: Calculate from bookings
          dailyUsers: 0, // TODO: Get from bookings
          rating: 4.5, // TODO: Get from reviews
          level2Rate: station.level2Rate,
          dcFastRate: station.dcFastRate,
          peakPricing: station.peakPricing,
          createdAt: station.createdAt
        };
      });

      setStations(transformedStations);

      // Calculate stats
      const activeStations = transformedStations.filter(s => s.status === 'Active').length;
      const maintenanceStations = transformedStations.filter(s => s.status === 'Maintenance').length;
      const totalChargersCount = transformedStations.reduce((sum, s) => sum + s.totalChargers, 0);

      setStats({
        total: transformedStations.length,
        active: activeStations,
        maintenance: maintenanceStations,
        totalChargers: totalChargersCount
      });

    } catch (err) {
      console.error('Error fetching stations:', err);
      if (err.response?.status === 404) {
        setError('Stations endpoint not found. Please check backend configuration.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication failed. Please log in again.');
      } else if (!err.response) {
        setError('Cannot connect to server. Please check your connection.');
      } else {
        setError(err.response?.data?.message || 'Failed to load stations.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStations(true);
  };

  const handleDelete = async (stationId) => {
    if (!window.confirm('Are you sure you want to delete this station?')) {
      return;
    }

    try {
      await stationService.deleteStation(stationId);
      alert('Station deleted successfully!');
      fetchStations();
    } catch (err) {
      console.error('Error deleting station:', err);
      alert(err.response?.data?.message || 'Failed to delete station.');
    }
  };

  const getUsagePercentage = (station) => {
    if (station.totalChargers === 0) return 0;
    return ((station.totalChargers - station.availableChargers) / station.totalChargers * 100).toFixed(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Station Management</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor and manage charging stations</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Station
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">Total Stations</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">Active Stations</p>
            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">Maintenance</p>
            <p className="text-3xl font-bold text-gray-900">{stats.maintenance}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">Total Chargers</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalChargers}</p>
          </div>
        </div>

        {/* Stations Grid */}
        {stations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stations.map((station) => (
              <div key={station.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{station.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          station.status === 'Active' ? 'bg-green-100 text-green-700' :
                          station.status === 'Maintenance' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {station.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-2" />
                        {station.address}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-5 h-5 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDelete(station.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Charger Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Total</p>
                      <p className="text-xl font-bold text-gray-900">{station.totalChargers}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 mb-1">DC Fast</p>
                      <p className="text-xl font-bold text-blue-600">{station.fastChargers}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Available</p>
                      <p className="text-xl font-bold text-green-600">{station.availableChargers}</p>
                    </div>
                  </div>

                  {/* Pricing Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Level 2 Rate</p>
                        <p className="font-semibold text-gray-900">${station.level2Rate}/kWh</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">DC Fast Rate</p>
                        <p className="font-semibold text-gray-900">${station.dcFastRate}/kWh</p>
                      </div>
                      {station.peakPricing && (
                        <div>
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                            Peak Pricing
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Usage Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Usage</span>
                      <span className="text-sm font-semibold text-gray-900">{getUsagePercentage(station)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          getUsagePercentage(station) > 80 ? 'bg-red-500' :
                          getUsagePercentage(station) > 60 ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${getUsagePercentage(station)}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Level 2</p>
                      <p className="text-sm font-semibold text-gray-900">{station.slowChargers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">DC Fast</p>
                      <p className="text-sm font-semibold text-gray-900">{station.fastChargers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-semibold text-gray-900">{station.location || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                  <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View Details</button>
                  <button className="text-sm text-gray-600 font-medium hover:text-gray-700">Edit Station</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stations Found</h3>
            <p className="text-sm text-gray-500 mb-4">Get started by adding your first charging station</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Your First Station
            </button>
          </div>
        )}

        {/* Add Station Placeholder */}
        {stations.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-12 text-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Station</h3>
            <p className="text-sm text-gray-500">Click to add a new charging station to your network</p>
          </div>
        )}
      </div>
    </div>
  );
}