import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Zap,
  Bell, User
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authService, bookingService, stationService } from '../../Services/api';
import notify from '../../Utils/notify';

import {
  MapContainer,
  TileLayer,
  Marker,
} from 'react-leaflet';
import L from 'leaflet';

import useUserLocation from '../../Services/useLocationUser';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function NearbyStationsMap({ userLat, userLng, stations }) {
  if (!userLat || !userLng) return null;

  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors, © CARTO"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {/* User location */}
      <Marker position={[userLat, userLng]} icon={markerIcon} />
      {/* Nearby stations */}
      {stations.map((st) =>
        st.latitude && st.longitude ? (
          <Marker
            key={st.id}
            position={[st.latitude, st.longitude]}
            icon={markerIcon}
          />
        ) : null
      )}
    </MapContainer>
  );
}

export default function EVUserDashboard() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Data from API
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [favoriteStations, setFavoriteStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalHours: 0,
    amountSpent: 0,
    favorites: 0,
  });

  const [latestBooking, setLatestBooking] = useState(null);
  const userLocation = useUserLocation();   // shared origin

  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // 1) read from localStorage
        const storedUserRaw = localStorage.getItem('user');
        const storedUser = JSON.parse(storedUserRaw || 'null');

        console.log('storedUser parsed =', storedUser);

        let profile = null;

        // 2) if we have userId, fetch full profile
        if (storedUser?.userId && authService.getUserByIdE) {
          profile = await authService.getUserByIdE(storedUser.userId);
          localStorage.setItem('user', JSON.stringify(profile));
          setUser(profile);
        } else {
          setUser(storedUser);
          profile = storedUser;
        }

        // 3) bookings
        const bookingsRes = await bookingService.listBookings();
        const allBookings = bookingsRes.data || bookingsRes || [];

        // latest by id
        let latest = null;
        if (allBookings.length > 0) {
          latest = allBookings.reduce((acc, b) =>
            !acc || (b.id ?? 0) > (acc.id ?? 0) ? b : acc
          );
        }
        setLatestBooking(latest);

        // upcoming bookings
        const now = new Date();
        const upcoming = allBookings.filter(
          (b) =>
            new Date(b.endTime) > now &&
            b.status !== 'cancelled' &&
            b.status !== 'completed'
        );
        setUpcomingBookings(upcoming);

        // past bookings: everything except latest
        const past = allBookings
          .filter((b) => !latest || b.id !== latest.id)
          .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setPastBookings(past);

        setVehicles([]);
        setFavoriteStations([]);

        const totalHours = allBookings.reduce((sum, b) => {
          const mins =
            (new Date(b.endTime) - new Date(b.startTime)) / 60000;
          return sum + mins / 60;
        }, 0);

        const totalSpent = allBookings.reduce(
          (sum, b) => sum + (b.totalAmount || 0),
          0
        );

        setStats({
          totalBookings: allBookings.length,
          totalHours: totalHours.toFixed(1),
          amountSpent: totalSpent,
          favorites: 0,
        });

        // 4) nearby stations: use geolocation if present, else profile/default
        const lat = userLocation.lat ?? profile?.latitude ?? 27.7172;
        const lng = userLocation.lng ?? profile?.longitude ?? 85.3240;

        try {
          const stationsRes = await stationService.listNearbyStations({
            lat,
            lng,
          });
          const stations = stationsRes.data || stationsRes || [];
          setNearbyStations(stations.slice(0, 2));
        } catch (e) {
          console.error('Failed to load nearby stations', e);
          setNearbyStations([]);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userLocation.lat, userLocation.lng]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (start, end) => {
    const s = new Date(start).toLocaleTimeString('en-NP', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const e = new Date(end).toLocaleTimeString('en-NP', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${s} - ${e}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.cancelBooking(bookingId);
      setUpcomingBookings((prev) => prev.filter((b) => b.id !== bookingId));

      toast.success('Booking cancelled successfully!', {
        icon: 'Cancelled',
      });
    } catch (err) {
      const msg = err.response?.data || 'Cannot cancel this booking';
      toast.error(msg);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {}
    notify.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto my-6 border border-emerald-100 rounded-2xl bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <header className="border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900">BijuliYatra</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <button className="text-emerald-600 font-medium">Home</button>
            <button onClick={() => navigate('/ev-owner/station')}>
              Find stations
            </button>
            <button onClick={() => navigate('/ev-owner/bookings')}>
              My bookings
            </button>
            <button onClick={() => navigate('/ev-owner/wallet')}>
              Wallet/Payments
            </button>
            <button onClick={() => navigate('/profile')}>Profile</button>
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
              {upcomingBookings.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-red-500 hover:text-red-600 border border-red-100 px-3 py-1 rounded-lg"
            >
              Logout
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="bg-slate-50">
          {/* Green hero */}
          <section className="px-6 pt-6">
            <div className="bg-emerald-500 rounded-2xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-emerald-100 text-xs uppercase tracking-wide">
                  EV Owner Dashboard
                </p>
                <h1 className="text-2xl md:text-3xl font-semibold text-white">
                  Welcome back, {user?.fullname || user?.fullName || user?.username || 'EV Driver'}!
                </h1>
                <p className="text-emerald-100 text-sm mt-1">
                  Ready to charge your EV?
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/ev-owner/station')}
                  className="inline-flex items-center gap-2 bg-white text-emerald-600 px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-emerald-50"
                >
                  <MapPin className="w-4 h-4" />
                  Find nearby station
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className="inline-flex items-center gap-2 border border-emerald-100 bg-emerald-600/10 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-600/20"
                >
                  <Calendar className="w-4 h-4" />
                  View upcoming booking
                </button>
              </div>
            </div>
          </section>

          {/* Top row: Latest booking + Nearby stations */}
          <section className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Latest booking */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Latest Booking
                </h2>
                {latestBooking && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    {latestBooking.status || 'Confirmed'}
                  </span>
                )}
              </div>

              {latestBooking ? (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="mt-1">
                      <Zap className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {latestBooking.stationName || 'Unknown Station'}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {latestBooking.address || 'Location not available'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
                    <div>
                      <p className="text-slate-500">Date & time</p>
                      <p className="font-medium text-slate-900">
                        {formatDate(latestBooking.startTime)} •{' '}
                        {formatTime(
                          latestBooking.startTime,
                          latestBooking.endTime
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Connector Type</p>
                      <p className="font-medium text-slate-900">
                        {latestBooking.connectorType || '—'} •{' '}
                        {latestBooking.power} kW
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Estimated Cost</p>
                      <p className="font-medium text-slate-900">
                        Rs. {latestBooking.totalAmount?.toLocaleString() || '—'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/ev-owner/bookings')}
                    className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
                  >
                    Manage booking
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-500">No bookings yet.</p>
              )}
            </div>

            {/* Nearby stations */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-900">
                  Nearby Stations
                </h2>
                <button
                  className="text-xs font-medium text-emerald-600"
                  onClick={() => navigate('/ev-owner/station')}
                >
                  View map
                </button>
              </div>

              <div className="mb-4 h-28 rounded-xl overflow-hidden">
                <NearbyStationsMap
                  userLat={userLocation.lat ?? 27.7172}
                  userLng={userLocation.lng ?? 85.3240}
                  stations={nearbyStations}
                />
              </div>

              <div className="space-y-3 text-sm">
                {nearbyStations.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{st.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {st.address || st.city || 'Unknown location'}
                      </p>
                    </div>
                    <button
                      className="text-xs font-medium text-emerald-600"
                      onClick={() => navigate(`/ev-owner/book/${st.id}`)}
                    >
                      Book now
                    </button>
                  </div>
                ))}

                {nearbyStations.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No nearby stations found.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Past bookings */}
          <section className="px-6 pb-6">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h2 className="text-base font-semibold text-slate-900">
                  Past Bookings
                </h2>
                <button
                  onClick={() => navigate('/ev-owner/bookings')}
                  className="text-xs font-medium text-emerald-600"
                >
                  View all
                </button>
              </div>
              <div className="divide-y">
                {pastBookings.slice(0, 4).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between px-5 py-4 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {booking.station?.name ||
                          booking.stationName ||
                          'Unknown Station'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(booking.startTime)} •{' '}
                        {formatTime(booking.startTime, booking.endTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        Rs. {booking.totalAmount?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.power} kWh
                      </p>
                    </div>
                  </div>
                ))}
                {pastBookings.length === 0 && (
                  <p className="px-5 py-6 text-sm text-slate-500">
                    No past bookings.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Usage summary strip */}
          <section className="px-6 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs text-emerald-700">Total kWh Charged</p>
              <p className="text-xl font-semibold text-emerald-900">
                {stats.totalHours} kWh
              </p>
              <p className="text-[11px] text-emerald-700 mt-1">
                ↑ 12% vs last month
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 px-4 py-3">
              <p className="text-xs text-blue-700">Money Spent</p>
              <p className="text-xl font-semibold text-blue-900">
                Rs. {stats.amountSpent.toLocaleString()}
              </p>
              <p className="text-[11px] text-blue-700 mt-1">
                ↑ 4.5% vs last month
              </p>
            </div>
            <div className="rounded-2xl bg-violet-50 px-4 py-3">
              <p className="text-xs text-violet-700">Sessions</p>
              <p className="text-xl font-semibold text-violet-900">
                {stats.totalBookings}
              </p>
              <p className="text-[11px] text-violet-700 mt-1">
                Avg. 1.7 h/session
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-700">Avg Cost/kWh</p>
              <p className="text-xl font-semibold text-amber-900">
                Rs. 15.40
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                Below market avg
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}




