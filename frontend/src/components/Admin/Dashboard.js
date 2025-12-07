import React, { useState, useEffect } from 'react';
import { 
  Battery, MapPin, Users, DollarSign, TrendingUp, Calendar, 
  AlertCircle, Loader, RefreshCw, LayoutDashboard, Building2, 
  Settings, LogOut, Menu, X, ChevronDown, Bell, Zap 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService, stationService, authService, bookingService } from '../../Services/api';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', change: '+0%', icon: Users, color: 'bg-blue-500', key: 'users' },
    { label: 'Active Stations', value: '0', change: '+0', icon: MapPin, color: 'bg-green-500', key: 'stations' },
    { label: 'Revenue', value: '$0', change: '+0%', icon: DollarSign, color: 'bg-purple-500', key: 'revenue' },
    { label: 'Energy Delivered', value: '0 kWh', change: '+0%', icon: Battery, color: 'bg-orange-500', key: 'energy' },
  ]);

  const [recentBookings, setRecentBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [previousStats, setPreviousStats] = useState({});

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', current: true },
    { name: 'Station Management', icon: Building2, path: '/stationmanagement' },
    { name: 'User Management', icon: Users, path: '/usermanagement' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  // Helper: Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    const now = new Date();
    const past = new Date(dateString);
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  // Helper: Capitalize status
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [usersData, stationsData] = await Promise.all([
        userService.listUsers(),
        stationService.listStationAdmin()
      ]);

      const totalUsers = usersData?.length || 0;
      const activeStations = stationsData?.filter(s => 
        ['active', 'operational'].includes(s.status?.toLowerCase())
      ).length || 0;

      // Mock realistic calculations (replace with real revenue/bookings API later)
      const totalRevenue = stationsData?.reduce((sum, s) => sum + 2850, 0) || 0;
      const totalEnergy = stationsData?.reduce((sum, s) => {
        const chargers = (s.level2Chargers || 0) + (s.dcFastChargers || 0);
        return sum + (chargers * 420);
      }, 0) || 0;

      const userGrowth = previousStats.users ? Math.round(((totalUsers - previousStats.users) / previousStats.users) * 100) : 18;
      const stationGrowth = previousStats.stations ? activeStations - previousStats.stations : 7;
      const revenueGrowth = previousStats.revenue ? Math.round(((totalRevenue - previousStats.revenue) / previousStats.revenue) * 100) : 29;
      const energyGrowth = previousStats.energy ? Math.round(((totalEnergy - previousStats.energy) / previousStats.energy) * 100) : 22;

      setStats([
        { label: 'Total Users', value: totalUsers.toLocaleString(), change: `${userGrowth >= 0 ? '+' : ''}${userGrowth}%`, icon: Users, color: 'bg-blue-500', key: 'users' },
        { label: 'Active Stations', value: activeStations.toString(), change: `${stationGrowth >= 0 ? '+' : ''}${stationGrowth}`, icon: MapPin, color: 'bg-green-500', key: 'stations' },
        { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, change: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`, icon: DollarSign, color: 'bg-purple-500', key: 'revenue' },
        { label: 'Energy Delivered', value: `${totalEnergy.toLocaleString()} kWh`, change: `${energyGrowth >= 0 ? '+' : ''}${energyGrowth}%`, icon: Battery, color: 'bg-orange-500', key: 'energy' },
      ]);

      setPreviousStats({ users: totalUsers, stations: activeStations, revenue: totalRevenue, energy: totalEnergy });

     const stationIds = stationsData.map(s => s.id);
let activeCounts = {};
try {
  activeCounts = await bookingService.getActiveBookingsCount(stationIds);
} catch (err) {
  console.warn("Failed to load real-time availability", err);
}

const enhancedStations = (stationsData || []).map(station => {
  const level2 = station.level2Chargers || 0;
  const dcFast = station.dcFastChargers || 0;
  const total = level2 + dcFast;

  const activeCount = activeCounts[station.id] || 0;
  const available = Math.max(0, total - activeCount);
  const usage = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  const status = ['active', 'operational'].includes(station.status?.toLowerCase()) 
    ? 'Active' 
    : station.status?.toLowerCase() === 'maintenance' 
      ? 'Maintenance' 
      : 'Inactive';

  return {
    id: station.id,
    name: station.name,
    location: station.location || `${station.city || ''}, ${station.state || ''}`,
    chargers: { total, available, level2, dcFast },
    usage,
    status
  };
});

      setStations(enhancedStations);

      // Fetch REAL Bookings
      let bookingsData = [];
      try {
        const response = await bookingService.listBookingsAdmin({
          limit: 10,
          sort: 'bookedAt,desc'
        });
        bookingsData = Array.isArray(response) ? response : response.content || response.data || [];
      } catch (err) {
        console.warn("Failed to fetch recent bookings:", err);
        bookingsData = [];
      }

      const transformedBookings = bookingsData.map(booking => ({
        id: booking.id || '#N/A',
        user: booking.evOwnerName || 'Unknown User',
        station: booking.stationName || 'Unknown Station',
        time: formatTimeAgo(booking.bookedAt || booking.startTime),
        status: formatStatus(booking.status),
        amount: booking.totalAmount != null 
          ? `$${Number(booking.totalAmount).toFixed(2)}` 
          : '$0.00'
        }));

      setRecentBookings(transformedBookings.length > 0 ? transformedBookings : []);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => fetchDashboardData(true);
  const handleManage = () => navigate('/stationmanagement');
  const handleUsers = () => navigate('/usermanagement');

  const handleLogout = async () => {
    try { await authService.logout(); } catch (err) {}
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen sticky top-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">BijuliYatra</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="mx-auto p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.current 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.current ? 'text-blue-700' : 'text-gray-500'}`} />
              {sidebarOpen && <span className="text-sm">{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all ${!sidebarOpen && 'justify-center'}`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">admin@bijuliyatra.com</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                <button className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-3">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-xl relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-5 py-3 pr-10 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">

            {/* Error */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  onClick={() => stat.key === 'users' ? handleUsers() : stat.key === 'stations' ? handleManage() : null}
                  className={`bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all ${
                    (stat.key === 'users' || stat.key === 'stations') ? 'cursor-pointer hover:border-blue-300' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className={`text-sm font-bold flex items-center ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className={`w-4 h-4 mr-1 ${stat.change.startsWith('+') ? '' : 'rotate-180'}`} />
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
                    <button 
                      onClick={() => navigate('/admin/bookings')}
                      className="text-blue-600 font-medium hover:text-blue-700"
                    >
                      View All →
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {recentBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No recent bookings found</p>
                    </div>
                  ) : (
                    recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{booking.user}</p>
                            <span className="text-xs text-gray-500">• {booking.id}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{booking.station}</p>
                          <p className="text-xs text-gray-500 mt-1">{booking.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">{booking.amount}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                            booking.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'In Progress' || booking.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Station Status */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Station Status</h2>
                    <button onClick={handleManage} className="text-blue-600 font-medium hover:text-blue-700">
                      Manage Stations →
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  {stations.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No stations available</p>
                    </div>
                  ) : (
                    stations.slice(0, 5).map((station) => (
                      <div key={station.id} className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-gray-900">{station.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{station.location}</p>
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            station.status === 'Active' ? 'bg-green-100 text-green-700' :
                            station.status === 'Maintenance' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {station.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-500">Total Chargers</p>
                            <p className="font-bold text-gray-900">{station.chargers.total}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Available</p>
                            <p className="font-bold text-green-600">{station.chargers.available}</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Usage</span>
                            <span className="font-semibold">{station.usage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                station.usage > 80 ? 'bg-red-500' :
                                station.usage > 50 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${station.usage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}