import React, { useState, useEffect } from 'react';
import { stationService, authService } from '../../Services/api';
import { 
  Zap, Settings, Plus, Edit, Trash2, CheckCircle, MapPin, 
  RefreshCw, LayoutDashboard, Building2, Users, LogOut, 
  Menu, X, ChevronDown, AlertCircle, Loader 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StationManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    totalChargers: 0
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const stationsData = await stationService.listStationAdmin();

      const transformedStations = stationsData.map(station => {
        const level2 = station.level2Chargers || 0;
        const dcFast = station.dcFastChargers || 0;
        const totalChargers = level2 + dcFast;
        const inUse = Math.floor(totalChargers * 0.3);
        const available = totalChargers - inUse;

        const statusMap = {
          operational: 'Active',
          active: 'Active',
          maintenance: 'Maintenance'
        };
        const status = statusMap[station.status?.toLowerCase()] || 'Inactive';

        return {
          id: station.id,
          name: station.name,
          address: `${station.address}, ${station.city}, ${station.state}`,
          location: station.location || 'N/A',
          status,
          totalChargers,
          availableChargers: available,
          fastChargers: dcFast,
          slowChargers: level2,
          level2Rate: station.level2Rate || 0.25,
          dcFastRate: station.dcFastRate || 0.49,
          peakPricing: station.peakPricing || false,
         operatorName: station.operatorName || null,
        };
      });

      setStations(transformedStations);

      const active = transformedStations.filter(s => s.status === 'Active').length;
      const maintenance = transformedStations.filter(s => s.status === 'Maintenance').length;
      const totalChargers = transformedStations.reduce((sum, s) => sum + s.totalChargers, 0);

      setStats({
        total: transformedStations.length,
        active,
        maintenance,
        totalChargers
      });

    } catch (err) {
      console.error('Error fetching stations:', err);
      setError(
        err.response?.status === 401
          ? 'Session expired. Please log in again.'
          : err.response?.data?.message || 'Failed to load stations. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => fetchStations(true);

  const goToAdd = () => {
    navigate("/admin/addstation");
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate('/login');
    }
  };

  const handleDelete = async (stationId) => {
    if (!window.confirm('Are you sure you want to delete this station? This cannot be undone.')) return;

    try {
      await stationService.deleteStation(stationId);
      alert('Station deleted successfully!');
      fetchStations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete station.');
    }
  };

  const getUsagePercentage = (station) => {
    if (station.totalChargers === 0) return 0;
    return Math.round(((station.totalChargers - station.availableChargers) / station.totalChargers) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading stations...</p>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Station Management', icon: Building2, path: '/stationmanagement', current: true },
    { name: 'User Management', icon: Users, path: '/usermanagement' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen sticky top-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">BijuliYatra</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="mx-auto p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation */}
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

        {/* User Menu */}
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
                    <p className="font-medium text-gray-900">Admin User</p>
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
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Station Management</h1>
              <p className="text-gray-500 mt-1">Manage and monitor all charging stations</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
             <button 
                onClick={goToAdd} 
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Station
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">

            {/* Error Alert */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-red-800 text-sm flex-1">{error}</p>
                <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-600 text-sm">Total Stations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-gray-600 text-sm">In Maintenance</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.maintenance}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-gray-600 text-sm">Total Chargers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalChargers}</p>
              </div>
            </div>

            {/* Stations List */}
            {stations.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-16 text-center border-2 border-dashed border-gray-300">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No stations yet</h3>
                <p className="text-gray-500 mb-8">Start by adding your first charging station</p>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Your First Station
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stations.map((station) => (
                  <div key={station.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">{station.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              station.status === 'Active' ? 'bg-green-100 text-green-700' :
                              station.status === 'Maintenance' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {station.status}
                            </span>
                          </div>

                          {/* Operator name displayed here */}
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {station.operatorName || 'Platform Station'}
                        </p>
                        

                          <div className="flex items-center text-gray-600 text-sm mt-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {station.address}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Edit className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(station.id)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-2xl font-bold text-gray-900">{station.totalChargers}</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                          <p className="text-xs text-blue-600 font-medium">DC Fast</p>
                          <p className="text-2xl font-bold text-blue-600">{station.fastChargers}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                          <p className="text-xs text-green-600 font-medium">Available</p>
                          <p className="text-2xl font-bold text-green-600">{station.availableChargers}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Charger Usage</span>
                          <span className="font-semibold">{getUsagePercentage(station)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              getUsagePercentage(station) > 80 ? 'bg-red-500' :
                              getUsagePercentage(station) > 60 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${getUsagePercentage(station)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-gray-500">Level 2 Rate</p>
                          <p className="font-semibold">${station.level2Rate}/kWh</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">DC Fast Rate</p>
                          <p className="font-semibold">${station.dcFastRate}/kWh</p>
                        </div>
                        {station.peakPricing && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            Peak Pricing
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-between text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-700">View Details</button>
                      <button className="text-gray-600 hover:text-gray-800">Edit Station</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Station Card */}
            {stations.length > 0 && (
              <div className="mt-8">
                <div
                  className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={goToAdd}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Add New Charging Station</h3>
                  <p className="text-gray-500 mt-2">Expand your network with a new location</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}