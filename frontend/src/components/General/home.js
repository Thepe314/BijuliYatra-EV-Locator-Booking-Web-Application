import React, { useState } from 'react';
import { Zap, Search, MapPin, Navigation, Battery, Clock, DollarSign, Star, Menu, X, User, Bell, Settings } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const chargingStations = [
    { id: 1, name: 'Tesla Supercharger', address: '123 Main St, Downtown', distance: '0.5 km', available: 4, total: 8, price: '₹12/kWh', rating: 4.8, speed: 'Fast', lat: 27.7172, lng: 85.3240 },
    { id: 2, name: 'ChargePoint Station', address: '456 Park Ave, City Center', distance: '1.2 km', available: 2, total: 6, price: '₹10/kWh', rating: 4.5, speed: 'Fast', lat: 27.7100, lng: 85.3200 },
    { id: 3, name: 'EVgo Charging Hub', address: '789 Commerce Blvd, Business District', distance: '2.1 km', available: 6, total: 10, price: '₹15/kWh', rating: 4.9, speed: 'Ultra Fast', lat: 27.7250, lng: 85.3300 },
    { id: 4, name: 'GreenCharge Station', address: '321 Eco Lane, Green Valley', distance: '3.5 km', available: 0, total: 4, price: '₹8/kWh', rating: 4.2, speed: 'Standard', lat: 27.7050, lng: 85.3150 },
    { id: 5, name: 'PowerUp Center', address: '654 Energy St, Tech Park', distance: '4.2 km', available: 3, total: 5, price: '₹11/kWh', rating: 4.6, speed: 'Fast', lat: 27.7300, lng: 85.3350 },
  ];

  const filteredStations = chargingStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 p-2 rounded-xl">
                <Zap className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <span className="text-xl font-bold text-slate-900">BijuliYatra</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium transition-colors">Home</a>
              <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium transition-colors">Stations</a>
              <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium transition-colors">Bookings</a>
              <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium transition-colors">Pricing</a>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
              <button className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-700 transition-all">
                <User className="w-4 h-4" />
                <span className="font-medium">Profile</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-4">
                <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium">Home</a>
                <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium">Stations</a>
                <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium">Bookings</a>
                <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium">Pricing</a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Find Charging Stations</h1>
          <p className="text-slate-600">Locate nearby EV charging points and book your spot instantly</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location, station name..."
              className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-lg"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-700 transition-all flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Near Me
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stations List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Available Stations ({filteredStations.length})</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredStations.map((station) => (
                <div
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedStation?.id === station.id ? 'border-emerald-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{station.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{station.address}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                        <Navigation className="w-4 h-4" />
                        <span>{station.distance} away</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold text-amber-700">{station.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-xs text-slate-500">Available</p>
                        <p className={`text-sm font-semibold ${station.available > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {station.available}/{station.total}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-600" />
                      <div>
                        <p className="text-xs text-slate-500">Price</p>
                        <p className="text-sm font-semibold text-slate-900">{station.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <div>
                        <p className="text-xs text-slate-500">Speed</p>
                        <p className="text-sm font-semibold text-slate-900">{station.speed}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={station.available === 0}
                    className={`w-full py-2 rounded-lg font-medium transition-all ${
                      station.available > 0
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white hover:from-emerald-600 hover:to-cyan-700'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {station.available > 0 ? 'Book Now' : 'No Slots Available'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Map View */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
            <div className="relative h-[600px] bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center">
              {/* Simplified Map Visualization */}
              <div className="relative w-full h-full">
                {filteredStations.map((station, index) => (
                  <div
                    key={station.id}
                    onClick={() => setSelectedStation(station)}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
                    style={{
                      left: `${30 + index * 15}%`,
                      top: `${20 + index * 12}%`,
                    }}
                  >
                    <div className={`relative ${selectedStation?.id === station.id ? 'z-10' : ''}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                        station.available > 0
                          ? 'bg-gradient-to-br from-emerald-500 to-cyan-600'
                          : 'bg-slate-400'
                      }`}>
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      {selectedStation?.id === station.id && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl p-3 w-48 z-20">
                          <p className="font-semibold text-sm text-slate-900 mb-1">{station.name}</p>
                          <p className="text-xs text-slate-600 mb-2">{station.distance} away</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-emerald-600 font-medium">{station.available} available</span>
                            <span className="text-slate-700 font-medium">{station.price}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Legend</p>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600"></div>
                    <span className="text-xs text-slate-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    <span className="text-xs text-slate-600">Full</span>
                  </div>
                </div>

                {/* Current Location Indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-bold text-slate-900">24</span>
            </div>
            <p className="text-slate-600 text-sm">Total Stations</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Battery className="w-8 h-8 text-cyan-600" />
              <span className="text-2xl font-bold text-slate-900">15</span>
            </div>
            <p className="text-slate-600 text-sm">Available Now</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-slate-900">32</span>
            </div>
            <p className="text-slate-600 text-sm">Your Bookings</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-amber-500" />
              <span className="text-2xl font-bold text-slate-900">4.7</span>
            </div>
            <p className="text-slate-600 text-sm">Avg Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}