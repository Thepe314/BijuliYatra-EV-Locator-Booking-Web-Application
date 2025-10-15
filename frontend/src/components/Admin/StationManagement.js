import React, { useState } from 'react';
import { MapPin, Zap, Settings, Plus, Edit, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function StationManagement() {
  const [selectedStation, setSelectedStation] = useState(null);

  const stations = [
    { 
      id: 1, 
      name: 'Downtown Hub', 
      address: '123 Main St, Downtown', 
      status: 'Active', 
      totalChargers: 10, 
      availableChargers: 2, 
      fastChargers: 4, 
      slowChargers: 6,
      revenue: '$12,450',
      dailyUsers: 145,
      rating: 4.8
    },
    { 
      id: 2, 
      name: 'Mall Plaza', 
      address: '456 Shopping Blvd', 
      status: 'Active', 
      totalChargers: 8, 
      availableChargers: 3, 
      fastChargers: 3, 
      slowChargers: 5,
      revenue: '$8,920',
      dailyUsers: 98,
      rating: 4.6
    },
    { 
      id: 3, 
      name: 'Airport Station', 
      address: '789 Airport Rd', 
      status: 'Active', 
      totalChargers: 15, 
      availableChargers: 3, 
      fastChargers: 8, 
      slowChargers: 7,
      revenue: '$18,340',
      dailyUsers: 234,
      rating: 4.9
    },
    { 
      id: 4, 
      name: 'City Center', 
      address: '321 Urban Ave', 
      status: 'Maintenance', 
      totalChargers: 6, 
      availableChargers: 0, 
      fastChargers: 2, 
      slowChargers: 4,
      revenue: '$0',
      dailyUsers: 0,
      rating: 4.5
    },
    { 
      id: 5, 
      name: 'Tech Park', 
      address: '654 Innovation Dr', 
      status: 'Active', 
      totalChargers: 12, 
      availableChargers: 8, 
      fastChargers: 6, 
      slowChargers: 6,
      revenue: '$9,870',
      dailyUsers: 87,
      rating: 4.7
    },
  ];

  const getUsagePercentage = (station) => {
    return ((station.totalChargers - station.availableChargers) / station.totalChargers * 100).toFixed(0);
  };

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
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Station
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">Total Stations</p>
            <p className="text-3xl font-bold text-gray-900">156</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">Active Stations</p>
            <p className="text-3xl font-bold text-gray-900">148</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">Maintenance</p>
            <p className="text-3xl font-bold text-gray-900">8</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">Total Chargers</p>
            <p className="text-3xl font-bold text-gray-900">892</p>
          </div>
        </div>

        {/* Stations Grid */}
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
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Settings className="w-5 h-5 text-gray-600" />
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
                    <p className="text-xs text-blue-600 mb-1">Fast</p>
                    <p className="text-xl font-bold text-blue-600">{station.fastChargers}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 mb-1">Available</p>
                    <p className="text-xl font-bold text-green-600">{station.availableChargers}</p>
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
                    <p className="text-xs text-gray-500">Daily Users</p>
                    <p className="text-sm font-semibold text-gray-900">{station.dailyUsers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-sm font-semibold text-gray-900">{station.revenue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-sm font-semibold text-gray-900">⭐ {station.rating}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View Details</button>
                <button className="text-sm text-gray-600 font-medium hover:text-gray-700">View Reports</button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Station Placeholder */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-12 text-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Station</h3>
          <p className="text-sm text-gray-500">Click to add a new charging station to your network</p>
        </div>
      </div>
    </div>
  );
}