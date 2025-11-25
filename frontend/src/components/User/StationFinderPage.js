// src/pages/StationFinderPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Search, MapPin, Navigation, BatteryCharging, Clock, DollarSign, 
  Star, Menu, X, User, Bell, AlertCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { stationService } from '../../Services/api';

export default function StationFinderPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await stationService.listStationsForOwner();
        const stationList = response?.data || response || [];

        // Ensure every station has totalSlots & availableSlots
        const enrichedStations = stationList.map(station => {
          const level2 = station.level2Chargers || 0;
          const dcFast = station.dcFastChargers || 0;
          const total = station.totalSlots || (level2 + dcFast);
          const available = station.availableSlots !== undefined 
            ? station.availableSlots 
            : total; // default: fully available

          return {
            ...station,
            totalSlots: total,
            availableSlots: available,
            pricePerKwh: station.dcFastRate || station.level2Rate || 40,
            maxPower: dcFast > 0 ? '150 kW' : '22 kW',
            rating: station.rating || '4.6'
          };
        });

        setStations(enrichedStations);
        setFilteredStations(enrichedStations);
        toast.success(`Loaded ${enrichedStations.length} stations across Nepal`);
      } catch (err) {
        console.error("Failed to load stations:", err);
        const msg = err.response?.status === 401 || err.response?.status === 403
          ? "Please log in to continue"
          : "No stations found or server error";
        setError(msg);
        toast.error(msg);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, [navigate]);

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStations(stations);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = stations.filter(s =>
      s.name?.toLowerCase().includes(query) ||
      s.address?.toLowerCase().includes(query) ||
      s.city?.toLowerCase().includes(query) ||
      s.location?.toLowerCase().includes(query)
    );
    setFilteredStations(filtered);
  }, [searchQuery, stations]);

  const handleBookNow = (e, station) => {
    // Prevent card click event from firing
    e.stopPropagation();
    
    console.log("=== BOOKING DEBUG ===");
    console.log("Station data:", station);
    console.log("Station ID:", station.id);
    console.log("Available slots:", station.availableSlots);
    console.log("====================");

    if (station.availableSlots <= 0) {
      toast.error("No slots available right now!");
      return;
    }

    const bookingPath = `/book/station/${station.id}`;
    console.log("Navigating to:", bookingPath);
    navigate(bookingPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 p-2.5 rounded-xl shadow-md">
                <Zap className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                BijuliYatra
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-10">
              <a href="/ev-owner/dashboard" className="text-slate-700 hover:text-emerald-600 font-medium transition">Dashboard</a>
              <a 
                onClick={(e) => { e.preventDefault(); navigate('/ev-owner/station'); }} 
                href="/ev-owner/station"
                className="text-emerald-600 font-bold text-lg hover:underline transition cursor-pointer"
              >
                Find Stations
              </a>
              <a href="/bookings" className="text-slate-700 hover:text-emerald-600 font-medium transition">My Bookings</a>
            </nav>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                <User className="w-4 h-4" />
                My Account
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
                {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-slate-900 mb-3">
            Charge Anywhere in Nepal
          </h1>
          <p className="text-xl text-slate-600">Real-time availability • Kathmandu • Pokhara • Chitwan • Biratnagar</p>
        </div>

        {/* Search */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location: Thamel, Lakeside, Narayanghat..."
              className="w-full pl-14 pr-48 py-5 text-lg border-2 border-slate-300 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all">
              <Navigation className="w-5 h-5" />
              Near Me
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-emerald-500 border-t-transparent mb-6"></div>
            <p className="text-xl text-slate-600">Finding charging stations across Nepal...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Station List */}
            <div className="space-y-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  {filteredStations.length} Stations Available
                </h2>
                <span className="text-sm text-slate-500">Real-time data</span>
              </div>

              {filteredStations.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center shadow-lg">
                  <MapPin className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg text-slate-500">No stations match your search</p>
                  <p className="text-sm text-slate-400 mt-2">Try "Kathmandu" or "Pokhara"</p>
                </div>
              ) : (
                filteredStations.map((station) => (
                  <div
                    key={station.id}
                    onClick={() => setSelectedStation(station)}
                    className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border-3 ${
                      selectedStation?.id === station.id 
                        ? 'border-emerald-500 ring-4 ring-emerald-100' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{station.name}</h3>
                        <p className="text-slate-600 flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          {station.address || station.location}, {station.city}
                        </p>
                      </div>
                      <div className="bg-amber-50 px-4 py-2 rounded-full flex items-center gap-1">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-amber-700">{station.rating}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <BatteryCharging className={`w-8 h-8 mx-auto mb-1 ${station.availableSlots > 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                        <p className="text-xs text-slate-500">Available</p>
                        <p className={`text-2xl font-bold ${station.availableSlots > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {station.availableSlots}/{station.totalSlots}
                        </p>
                      </div>
                      <div className="text-center">
                        <DollarSign className="w-8 h-8 mx-auto mb-1 text-slate-600" />
                        <p className="text-xs text-slate-500">Price</p>
                        <p className="text-2xl font-bold text-emerald-600">Rs. {station.pricePerKwh}</p>
                      </div>
                      <div className="text-center">
                        <Zap className="w-8 h-8 mx-auto mb-1 text-cyan-600" />
                        <p className="text-xs text-slate-500">Max Power</p>
                        <p className="text-xl font-bold">{station.maxPower}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleBookNow(e, station)}
                      disabled={station.availableSlots === 0}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                        station.availableSlots > 0
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white hover:from-emerald-600 hover:to-cyan-700 shadow-lg transform hover:scale-105'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {station.availableSlots > 0 ? 'Book Now →' : 'Fully Booked'}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Map Placeholder */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-3xl shadow-xl overflow-hidden sticky top-24 h-[700px] flex flex-col items-center justify-center p-10">
              <MapPin className="w-32 h-32 text-emerald-600 mb-6 animate-pulse" />
              <h3 className="text-3xl font-bold text-slate-800 mb-3">Interactive Map Coming Soon</h3>
              <p className="text-center text-slate-600 max-w-md text-lg">
                GPS-powered map with live station pins across all 7 provinces of Nepal
              </p>
              <div className="mt-8 bg-white/20 backdrop-blur px-6 py-3 rounded-full">
                <p className="text-slate-700 font-medium">Powered by Leaflet + OpenStreetMap</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}