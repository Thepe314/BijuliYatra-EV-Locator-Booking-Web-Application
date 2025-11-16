import React, { useState, useEffect } from 'react';
import { Battery, MapPin, Users, DollarSign, TrendingUp, Calendar, Search, Filter, AlertCircle, Loader, RefreshCw, LayoutDashboard, Building2, UserCog, LogOut, Menu, X, ChevronDown, Settings, Bell, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService, stationService, authService } from '../../Services/api';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // State management for data
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

  // Navigation items
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', current: true },
    { name: 'Station Management', icon: Building2, path: '/stationmangement', current: false },
    { name: 'User Management', icon: Users, path: '/usermanagement', current: false },
    { name: 'Settings', icon: Settings, path: '/admin/settings', current: false },
  ];

  // Fetch data from database
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const usersData = await userService.listUsers();
      const totalUsers = usersData?.length || 0;
      
      const userGrowth = previousStats.users 
        ? Math.round(((totalUsers - previousStats.users) / previousStats.users) * 100)
        : 12;

      const stationsData = await stationService.listStationAdmin();
      
      const activeStations = stationsData?.filter(s => {
        const status = s.status?.toLowerCase();
        return status === 'active' || status === 'operational';
      })?.length || 0;
      
      const stationGrowth = previousStats.stations 
        ? activeStations - previousStats.stations
        : 5;

      const totalRevenue = stationsData?.reduce((sum, station) => sum + 2000, 0) || 0;
      const totalEnergy = stationsData?.reduce((sum, station) => {
        const totalChargers = (station.level2Chargers || 0) + (station.dcFastChargers || 0);
        return sum + (totalChargers * 500);
      }, 0) || 0;

      const revenueGrowth = previousStats.revenue 
        ? Math.round(((totalRevenue - previousStats.revenue) / previousStats.revenue) * 100)
        : 23;
      
      const energyGrowth = previousStats.energy 
        ? Math.round(((totalEnergy - previousStats.energy) / previousStats.energy) * 100)
        : 18;

      setStats([
        { label: 'Total Users', value: totalUsers.toLocaleString(), change: `${userGrowth >= 0 ? '+' : ''}${userGrowth}%`, icon: Users, color: 'bg-blue-500', key: 'users' },
        { label: 'Active Stations', value: activeStations.toString(), change: `${stationGrowth >= 0 ? '+' : ''}${stationGrowth}`, icon: MapPin, color: 'bg-green-500', key: 'stations' },
        { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, change: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`, icon: DollarSign, color: 'bg-purple-500', key: 'revenue' },
        { label: 'Energy Delivered', value: `${totalEnergy.toLocaleString()} kWh`, change: `${energyGrowth >= 0 ? '+' : ''}${energyGrowth}%`, icon: Battery, color: 'bg-orange-500', key: 'energy' },
      ]);

      setPreviousStats({ users: totalUsers, stations: activeStations, revenue: totalRevenue, energy: totalEnergy });

      const enhancedStations = stationsData?.map(station => {
        const level2 = station.level2Chargers || 0;
        const dcFast = station.dcFastChargers || 0;
        const totalChargers = level2 + dcFast;
        const inUseChargers = Math.floor(totalChargers * 0.3);
        const availableChargers = totalChargers - inUseChargers;
        const usage = totalChargers > 0 ? Math.round((inUseChargers / totalChargers) * 100) : 0;
        
        const normalizedStatus = station.status?.toLowerCase() === 'operational' ? 'Active' : 
                                 station.status?.toLowerCase() === 'active' ? 'Active' :
                                 station.status?.toLowerCase() === 'maintenance' ? 'Maintenance' : 'Inactive';
        
        return {
          ...station,
          chargers: { total: totalChargers, available: availableChargers, inUse: inUseChargers, level2: level2, dcFast: dcFast },
          usage,
          status: normalizedStatus
        };
      }) || [];

      setStations(enhancedStations);
      setRecentBookings(getMockBookings());

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 404) {
        setError('API endpoint not found. Please ensure the backend server is running.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication failed. Please log in again.');
      } else if (!err.response) {
        setError('Cannot connect to server. Please check your connection.');
      } else {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleManage = () => {
    navigate('/stationmangement');
  };

  const handleUsers = () => {
    navigate('/usermanagement');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  const getMockBookings = () => [
    { id: 'BK001', user: 'John Doe', station: 'Downtown Hub', time: '2h ago', status: 'Completed', amount: '$25' },
    { id: 'BK002', user: 'Sarah Smith', station: 'Mall Plaza', time: '4h ago', status: 'In Progress', amount: '$18' },
    { id: 'BK003', user: 'Mike Johnson', station: 'Airport Station', time: '5h ago', status: 'Completed', amount: '$42' },
    { id: 'BK004', user: 'Emma Wilson', station: 'City Center', time: '6h ago', status: 'Cancelled', amount: '$0' },
    { id: 'BK005', user: 'David Lee', station: 'Tech Park', time: '7h ago', status: 'Completed', amount: '$31' },
  ];

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
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg">BijuliYatra</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-gray-100 rounded mx-auto">
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                item.current
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${item.current ? 'text-blue-700' : 'text-gray-500'}`} />
              {sidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-3">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors ${
                sidebarOpen ? '' : 'justify-center'
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">admin@gmail.com</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">Welcome back, Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 text-xl leading-none">×</button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow ${
                    (stat.key === 'users' || stat.key === 'stations') ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    if (stat.key === 'users') handleUsers();
                    if (stat.key === 'stations') handleManage();
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-semibold flex items-center ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
                </div>
                <div className="space-y-4">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{booking.user}</p>
                            <span className="text-xs text-gray-500">{booking.id}</span>
                          </div>
                          <p className="text-sm text-gray-600">{booking.station}</p>
                          <p className="text-xs text-gray-500 mt-1">{booking.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 mb-1">{booking.amount}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">No recent bookings</p>
                  )}
                </div>
              </div>

              {/* Station Status */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Station Status</h2>
                  <button onClick={handleManage} className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    Manage
                  </button>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {stations.length > 0 ? (
                    stations.slice(0, 5).map((station, idx) => (
                      <div key={station.id || idx} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{station.name || 'Unknown Station'}</p>
                            <p className="text-xs text-gray-500 mt-1">{station.location || station.city || ''}</p>
                            <p className="text-sm text-gray-600 mt-2">
                              Total: {station.chargers?.total || 0} | Available: {station.chargers?.available || 0}
                            </p>
                            <div className="flex gap-3 mt-1">
                              <span className="text-xs text-gray-500">L2: {station.chargers?.level2 || 0}</span>
                              <span className="text-xs text-gray-500">DC: {station.chargers?.dcFast || 0}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            station.status === 'Active' ? 'bg-green-100 text-green-700' :
                            station.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {station.status || 'Unknown'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              (station.usage || 0) > 70 ? 'bg-orange-500' :
                              (station.usage || 0) > 40 ? 'bg-blue-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${station.usage || 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{station.usage || 0}% Usage</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No charging stations found</p>
                    </div>
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