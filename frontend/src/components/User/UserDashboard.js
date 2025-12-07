// src/pages/EVUserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Zap, Star, Car, CreditCard, 
  Bell, User, ChevronRight, AlertCircle 
} from 'lucide-react';
import { toast, ToastContainer} from 'react-toastify';

// Import your services
import { bookingService } from '../../Services/api';
// import { vehicleService } from '../../Services/api';
// import { favoriteService } from '../../Services/api';

export default function EVUserDashboard() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [loading, setLoading] = useState(true);

  // Data from API
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [favoriteStations, setFavoriteStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalHours: 0,
    amountSpent: 0,
    favorites: 0
  });


 

  const navigate = useNavigate();

  useEffect(() => {
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Only load bookings — the rest are optional
      const bookingsRes = await bookingService.listBookings();

      const allBookings = bookingsRes.data || bookingsRes || [];
      const now = new Date();

      const upcoming = allBookings.filter(b => 
        new Date(b.endTime) > now && b.status !== 'cancelled' && b.status !== 'completed'
      );
      const past = allBookings.filter(b => 
        new Date(b.endTime) <= now || b.status === 'completed'
      );

      setUpcomingBookings(upcoming);
      setPastBookings(past);

      // Mock empty data for vehicles & favorites (prevents 404 crash)
      setVehicles([]);
      setFavoriteStations([]);

      // Calculate stats from bookings only
      const totalHours = allBookings.reduce((sum, b) => {
        const mins = (new Date(b.endTime) - new Date(b.startTime)) / 60000;
        return sum + (mins / 60);
      }, 0);

      const totalSpent = allBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      setStats({
        totalBookings: allBookings.length,
        totalHours: totalHours.toFixed(1),
        amountSpent: totalSpent,
        favorites: 0
      });

      toast.success("Dashboard loaded");
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      toast.error("Could not load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  loadDashboardData();
}, []);

  

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (start, end) => {
    const s = new Date(start).toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' });
    const e = new Date(end).toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' });
    return `${s} - ${e}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await bookingService.cancelBooking(bookingId);
      
      setUpcomingBookings(prev => prev.filter(b => b.id !== bookingId));

      // SUCCESS TOAST
      toast.success("Booking cancelled successfully!", {
        icon: "Cancelled",
      });
    } catch (err) {
      const msg = err.response?.data || "Cannot cancel this booking";
      // ERROR TOAST
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  theme="colored"
  style={{ zIndex: 9999 }}
/>
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
                <p className="text-sm text-gray-500">Namaste! Welcome back</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-gray-600" />
                {upcomingBookings.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button onClick={() => navigate('/profile')} className="p-2 hover:bg-gray-100 rounded-lg">
                <User className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Charging</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours} hrs</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount Spent</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {stats.amountSpent.toLocaleString()}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Favorite Stations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.favorites}</p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bookings */}
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
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'upcoming' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Upcoming ({upcomingBookings.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'past' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Past ({pastBookings.length})
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No {activeTab} bookings</p>
                  </div>
                ) : (
                  (activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {booking.station?.name || 'Unknown Station'}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            {booking.station?.address || 'Location not available'}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' || booking.status === 'upcoming'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium text-gray-900">{formatDate(booking.startTime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Time</p>
                          <p className="font-medium text-gray-900">{formatTime(booking.startTime, booking.endTime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Connector</p>
                          <p className="font-medium text-gray-900">{booking.connectorType || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Power</p>
                          <p className="font-medium text-gray-900">{booking.power} kW</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Car className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {booking.vehicle?.name || 'Unknown Vehicle'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-gray-900">
                            Rs. {booking.totalAmount?.toLocaleString() || '0'}
                          </span>
                          {activeTab === 'upcoming' && (
                            <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all flex items-center gap-2"
                          >
                            Cancel Booking
                          </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Favorite Stations */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">Favorite Stations</h2>
              </div>
              <div className="p-6 space-y-4">
                {favoriteStations.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No favorite stations yet</p>
                ) : (
                  favoriteStations.map((station) => (
                    <div key={station.id} className="border rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer"
                      onClick={() => navigate(`/station/${station.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{station.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{station.rating || '4.6'}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {station.address}
                      </div>
                      <button className="w-full py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">
                        Book Again
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Vehicles */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">My Vehicles</h2>
                <button 
                  onClick={() => navigate('/vehicles/add')}
                  className="text-green-500 text-sm font-medium hover:text-green-600"
                >
                  + Add
                </button>
              </div>
              <div className="p-6 space-y-4">
                {vehicles.length === 0 ? (
                  <p className="text-center text-gray-500">No vehicles added</p>
                ) : (
                  vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="border rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Car className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                          <p className="text-sm text-gray-500">{vehicle.model}</p>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Battery:</span>
                          <span className="font-medium">{vehicle.batteryCapacity} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Connector:</span>
                          <span className="font-medium">{vehicle.connectorType}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-2">
                <button 
                  onClick={() => navigate('/ev-owner/station')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
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
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
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