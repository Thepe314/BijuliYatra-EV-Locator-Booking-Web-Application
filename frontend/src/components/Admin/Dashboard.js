import React, { useState, useEffect } from 'react';
import { 
  Battery, MapPin, Users, DollarSign, TrendingUp, Calendar, 
  AlertCircle, Loader, RefreshCw, LayoutDashboard, Building2, 
  Settings, LogOut, Menu, X, ChevronDown, Bell, Zap, 
  Book
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

  const [pendingOperators, setPendingOperators] = useState([]);

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', current: true },
    { name: 'Stations', icon: Building2, path: '/admin/stationmanagement' },
    { name: 'Users', icon: Users, path: '/admin/usermanagement' },
    { name: 'Bookings', icon: Book, path: '/admin/bookingmanagement' },
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

      // Pending operators: CHARGER_OPERATOR + status pending
      const pending = (usersData || []).filter((u) => {
        const userType = u.userType;
        const status = (u.status || '').toString();
        return userType === 'CHARGER_OPERATOR' && status.toLowerCase() === 'pending';
      });
      setPendingOperators(pending);

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
  const handleManage = () => navigate('/admin/stationmanagement');
  const handleUsers = () => navigate('/admin/usermanagement');

  const handleOperatorDecision = async (operatorId, decision) => {
    const newStatus = decision === 'accept' ? 'active' : 'cancelled';
    await userService.updateUserStatus(operatorId, newStatus);
    setPendingOperators((prev) => prev.filter((op) => op.user_id !== operatorId));
  };

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col h-screen sticky top-0`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/90 p-2 rounded-lg shadow-md shadow-emerald-500/40">
                  <Zap className="w-6 h-6 text-slate-950" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-slate-50">
                    EVCharge
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Admin Console
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-800/70 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="mx-auto p-2 hover:bg-slate-800/70 rounded-lg"
            >
              <Menu className="w-6 h-6 text-slate-200" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                item.current
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]"
                  : "text-slate-300 hover:bg-slate-800/70"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  item.current ? "text-emerald-400" : "text-slate-400"
                }`}
              />
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* User menu */}
        <div className="border-t border-slate-800 p-4 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/80 transition-all ${
                !sidebarOpen && "justify-center"
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-slate-950 font-bold">
                A
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-50 text-sm">Admin</p>
                    <p className="text-[11px] text-slate-400">
                      admin@bijuliyatra.com
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                <button className="w-full px-4 py-3 text-left text-xs hover:bg-slate-800 flex items-center gap-3 text-slate-200">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-xs hover:bg-red-600/10 text-red-400 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-slate-950/90 border-b border-slate-800 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-slate-50">
                Admin Overview
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Monitor users, stations, and performance at a glance.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400">
                <span className="mr-2 text-slate-500">
                  <LayoutDashboard className="w-4 h-4" />
                </span>
                <input
                  placeholder="Search..."
                  className="bg-transparent outline-none text-slate-100 placeholder:text-slate-500 w-40"
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-200 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
              <button className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl relative hover:bg-slate-800">
                <Bell className="w-4 h-4 text-slate-200" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-rose-950/40 border border-rose-600/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <p className="text-sm text-rose-100">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-rose-300 hover:text-rose-100 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  onClick={() =>
                    stat.key === "users"
                      ? handleUsers()
                      : stat.key === "stations"
                      ? handleManage()
                      : null
                  }
                  className={`bg-slate-900 rounded-2xl border border-slate-800/80 p-5 shadow-lg shadow-black/40 hover:shadow-xl hover:border-emerald-500/40 transition-all ${
                    stat.key === "users" || stat.key === "stations"
                      ? "cursor-pointer"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${stat.color} p-2.5 rounded-xl`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span
                      className={`text-xs font-semibold flex items-center ${
                        stat.change.startsWith("+")
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      <TrendingUp
                        className={`w-4 h-4 mr-1 ${
                          stat.change.startsWith("+") ? "" : "rotate-180"
                        }`}
                      />
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-50 mt-1">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Middle grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent bookings */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg shadow-black/40">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="text-sm font-semibold text-slate-50">
                    Bookings Last 30 Days
                  </h2>
                  <button
                    onClick={() => navigate("/admin/bookingmanagement")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    View all →
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  {recentBookings.length === 0 ? (
                    <div className="text-center py-10">
                      <Calendar className="w-14 h-14 text-slate-700 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">
                        No recent bookings found
                      </p>
                    </div>
                  ) : (
                    recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-slate-50">
                              {booking.user}
                            </p>
                            <span className="text-[11px] text-slate-500">
                              • {booking.id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {booking.station}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {booking.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-50 text-sm">
                            {booking.amount}
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-medium mt-1 ${
                              booking.status === "Completed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : booking.status === "In Progress" ||
                                  booking.status === "Active"
                                ? "bg-blue-500/20 text-blue-300"
                                : booking.status === "Cancelled"
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-slate-700 text-slate-200"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Station status */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg shadow-black/40">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="text-sm font-semibold text-slate-50">
                    Station Status
                  </h2>
                  <button
                    onClick={handleManage}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Manage stations →
                  </button>
                </div>
                <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
                  {stations.length === 0 ? (
                    <div className="text-center py-10">
                      <MapPin className="w-14 h-14 text-slate-700 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">
                        No stations available
                      </p>
                    </div>
                  ) : (
                    stations.slice(0, 5).map((station) => (
                      <div
                        key={station.id}
                        className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-sm text-slate-50">
                              {station.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {station.location}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1.5 rounded-full text-[11px] font-medium ${
                              station.status === "Active"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : station.status === "Maintenance"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-slate-700 text-slate-200"
                            }`}
                          >
                            {station.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[11px] mb-3">
                          <div>
                            <p className="text-slate-400">Total chargers</p>
                            <p className="font-semibold text-slate-50 text-sm">
                              {station.chargers.total}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Available</p>
                            <p className="font-semibold text-emerald-300 text-sm">
                              {station.chargers.available}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-400">Usage</span>
                            <span className="font-semibold text-slate-50">
                              {station.usage}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                station.usage > 80
                                  ? "bg-rose-500"
                                  : station.usage > 50
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
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

            {/* Requests */}
            <div className="mt-7 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg shadow-black/40">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-semibold text-slate-50">
                    Requests
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pending operator signup requests
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
                {pendingOperators.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">
                      No pending operator requests
                    </p>
                  </div>
                ) : (
                  pendingOperators.map((op) => (
                    <div
                      key={op.user_id}
                      className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-sm text-slate-50">
                          {op.fullname || "Operator"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {op.email || "No email"} •{" "}
                          {op.phoneNumber || "No phone"}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Status:{" "}
                          <span className="font-medium text-amber-300">
                            Pending
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleOperatorDecision(op.user_id, "decline")
                          }
                          className="px-4 py-2 text-[11px] font-medium rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() =>
                            handleOperatorDecision(op.user_id, "accept")
                          }
                          className="px-4 py-2 text-[11px] font-medium rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
