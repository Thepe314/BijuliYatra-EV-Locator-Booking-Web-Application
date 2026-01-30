import React, { useState } from 'react';
import { MapPin, Navigation, Filter, Search, Zap, Clock, DollarSign, Star } from 'lucide-react';

export default function ChargingStationsMap() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const stations = [
    { 
      id: 1, 
      name: 'Downtown Hub', 
      address: '123 Main St, City Center',
      distance: '0.5 km',
      type: 'Fast',
      available: 8,
      total: 10,
      price: '$0.45/kWh',
      rating: 4.8,
      lat: 40.7128,
      lng: -74.0060
    },
    { 
      id: 2, 
      name: 'Mall Plaza Station', 
      address: '456 Shopping Blvd',
      distance: '1.2 km',
      type: 'Standard',
      available: 5,
      total: 8,
      price: '$0.35/kWh',
      rating: 4.6,
      lat: 40.7580,
      lng: -73.9855
    },
    { 
      id: 3, 
      name: 'Airport Charging Hub', 
      address: '789 Terminal Rd',
      distance: '5.8 km',
      type: 'Fast',
      available: 12,
      total: 15,
      price: '$0.50/kWh',
      rating: 4.9,
      lat: 40.7489,
      lng: -73.9680
    },
    { 
      id: 4, 
      name: 'Tech Park Station', 
      address: '321 Innovation Ave',
      distance: '2.3 km',
      type: 'Ultra Fast',
      available: 4,
      total: 12,
      price: '$0.60/kWh',
      rating: 4.7,
      lat: 40.7282,
      lng: -74.0776
    },
    { 
      id: 5, 
      name: 'Residential Complex', 
      address: '654 Sunset Dr',
      distance: '3.1 km',
      type: 'Standard',
      available: 0,
      total: 6,
      price: '$0.30/kWh',
      rating: 4.3,
      lat: 40.7589,
      lng: -73.9851
    },
  ];

  const filteredStations = stations.filter(station => {
    const matchesType = filterType === 'all' || station.type.toLowerCase().includes(filterType);
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         station.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Find Charging Stations</h1>
          <p className="text-sm text-gray-500 mt-1">Locate nearby EV charging points</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stations by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="standard">Standard</option>
                <option value="fast">Fast</option>
                <option value="ultra">Ultra Fast</option>
              </select>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Nearby
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stations List */}
          <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            {filteredStations.map((station) => (
              <div
                key={station.id}
                onClick={() => setSelectedStation(station)}
                className={`bg-white rounded-xl shadow-sm p-5 cursor-pointer transition-all hover:shadow-md ${
                  selectedStation?.id === station.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{station.name}</h3>
                    <p className="text-sm text-gray-600">{station.address}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    station.type === 'Ultra Fast' ? 'bg-purple-100 text-purple-700' :
                    station.type === 'Fast' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {station.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{station.distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-gray-600">{station.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{station.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{station.available}/{station.total} Available</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Book Now
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Directions
                  </button>
                </div>

                {station.available === 0 && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 font-medium text-center">Currently Full</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-250px)]">
              <div className="relative w-full h-full bg-gradient-to-br from-blue-100 via-green-50 to-blue-50 flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Map</h3>
                  <p className="text-gray-600 mb-4">Map visualization would display here</p>
                  {selectedStation && (
                    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm mx-auto text-left">
                      <h4 className="font-bold text-gray-900 mb-2">{selectedStation.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{selectedStation.address}</p>
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                          Get Directions
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Map Pins */}
                <div className="absolute top-20 left-20 animate-bounce">
                  <MapPin className="w-8 h-8 text-blue-600 fill-blue-600" />
                </div>
                <div className="absolute bottom-32 right-28">
                  <MapPin className="w-8 h-8 text-green-600 fill-green-600" />
                </div>
                <div className="absolute top-40 right-20">
                  <MapPin className="w-8 h-8 text-purple-600 fill-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}