import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Zap, Star, Car, CreditCard, Bell, User, ChevronRight, Filter } from 'lucide-react';

export default function EVUserDashboard() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedVehicle, setSelectedVehicle] = useState('all');

  const upcomingBookings = [
    {
      id: 1,
      station: 'ChargePoint Downtown',
      address: '123 Main St, Patan',
      date: '2025-10-16',
      time: '14:00 - 15:30',
      connector: 'CCS Type 2',
      power: '150 kW',
      price: 'Rs. 450',
      status: 'confirmed',
      vehicle: 'Tesla Model 3'
    },
    {
      id: 2,
      station: 'EV Station Durbar Square',
      address: '456 Heritage Rd, Patan',
      date: '2025-10-18',
      time: '10:00 - 11:00',
      connector: 'CHAdeMO',
      power: '50 kW',
      price: 'Rs. 280',
      status: 'confirmed',
      vehicle: 'Nissan Leaf'
    }
  ];

  const pastBookings = [
    {
      id: 3,
      station: 'Fast Charge Lagankhel',
      address: '789 Ring Rd, Lalitpur',
      date: '2025-10-10',
      time: '16:00 - 17:00',
      connector: 'CCS Type 2',
      power: '100 kW',
      price: 'Rs. 350',
      status: 'completed',
      vehicle: 'Tesla Model 3'
    },
    {
      id: 4,
      station: 'Green Energy Station',
      address: '321 Eco Park, Patan',
      date: '2025-10-05',
      time: '09:00 - 10:30',
      connector: 'Type 2',
      power: '22 kW',
      price: 'Rs. 180',
      status: 'completed',
      vehicle: 'Nissan Leaf'
    }
  ];

  const favoriteStations = [
    {
      id: 1,
      name: 'ChargePoint Downtown',
      address: '123 Main St, Patan',
      rating: 4.8,
      distance: '2.3 km',
      available: 3,
      total: 4
    },
    {
      id: 2,
      name: 'Fast Charge Lagankhel',
      address: '789 Ring Rd, Lalitpur',
      rating: 4.5,
      distance: '3.1 km',
      available: 2,
      total: 3
    }
  ];

  const vehicles = [
    { id: 1, name: 'Tesla Model 3', type: 'Sedan', battery: '75 kWh', connector: 'CCS Type 2' },
    { id: 2, name: 'Nissan Leaf', type: 'Hatchback', battery: '40 kWh', connector: 'CHAdeMO' }
  ];

  const stats = [
    { label: 'Total Bookings', value: '24', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Total Charging', value: '36.5 hrs', icon: Clock, color: 'bg-green-500' },
    { label: 'Amount Spent', value: 'Rs. 8,450', icon: CreditCard, color: 'bg-purple-500' },
    { label: 'Favorites', value: '5', icon: Star, color: 'bg-yellow-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, Rajesh!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <User className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bookings Section */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
                  <select 
                    className="px-3 py-2 border rounded-lg text-sm"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                  >
                    <option value="all">All Vehicles</option>
                    <option value="tesla">Tesla Model 3</option>
                    <option value="nissan">Nissan Leaf</option>
                  </select>
                </div>
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'upcoming'
                        ? 'bg-green-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Upcoming ({upcomingBookings.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'past'
                        ? 'bg-green-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Past ({pastBookings.length})
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 hover:border-green-500 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{booking.station}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.address}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">{booking.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-medium text-gray-900">{booking.time}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Connector</p>
                        <p className="font-medium text-gray-900">{booking.connector}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Power</p>
                        <p className="font-medium text-gray-900">{booking.power}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{booking.vehicle}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-gray-900">{booking.price}</span>
                        {activeTab === 'upcoming' ? (
                          <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                            Cancel
                          </button>
                        ) : (
                          <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Favorite Stations */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">Favorite Stations</h2>
              </div>
              <div className="p-6 space-y-4">
                {favoriteStations.map((station) => (
                  <div key={station.id} className="border rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{station.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{station.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {station.address} • {station.distance}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">{station.available} available</span>
                        <span className="text-gray-500"> / {station.total} total</span>
                      </div>
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Vehicles */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">My Vehicles</h2>
                <button className="text-green-500 text-sm font-medium hover:text-green-600">+ Add</button>
              </div>
              <div className="p-6 space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border rounded-lg p-4 hover:border-green-500 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Car className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                          <p className="text-sm text-gray-500">{vehicle.type}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Battery:</span>
                        <span className="font-medium text-gray-900">{vehicle.battery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Connector:</span>
                        <span className="font-medium text-gray-900">{vehicle.connector}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-2">
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Find Stations</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Payment Methods</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Profile Settings</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}