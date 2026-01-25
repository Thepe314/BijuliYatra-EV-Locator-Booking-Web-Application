import React, { useState, useEffect } from 'react';
import { stationService, authService } from '../../Services/api';
import {
  Zap,
  Settings,
  Plus,
  Edit,
  Trash2,
  MapPin,
  RefreshCw,
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  AlertCircle,
  Loader,
  Book
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notify from '../../Utils/notify';

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
    totalChargers: 0,
  });

  // filters (same idea as user page)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('all');

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const stationsData = await stationService.listStationAdmin();

      const transformedStations = stationsData.map((station) => {
        const level2 = station.level2Chargers || 0;
        const dcFast = station.dcFastChargers || 0;
        const totalChargers = level2 + dcFast;
        const inUse = Math.floor(totalChargers * 0.3);
        const available = totalChargers - inUse;

        const statusMap = {
          operational: 'Active',
          active: 'Active',
          maintenance: 'Maintenance',
        };
        const status = statusMap[station.status?.toLowerCase()] || 'Inactive';

        return {
          id: station.id,
          name: station.name,
          address: `${station.address}, ${station.city}, ${station.state}`,
          rawCity: station.city || '',
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

      const active = transformedStations.filter((s) => s.status === 'Active').length;
      const maintenance = transformedStations.filter((s) => s.status === 'Maintenance').length;
      const totalChargers = transformedStations.reduce(
        (sum, s) => sum + s.totalChargers,
        0
      );

      setStats({
        total: transformedStations.length,
        active,
        maintenance,
        totalChargers,
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
    navigate('/admin/addstation');
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/stationdetails/${id}`);
  };

   const handleLogout = async () => {
   try {
     await authService.logout();
   } catch (err) {}
   notify.logout();
   navigate("/login");
 };


  const handleDelete = async (stationId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this station? This cannot be undone.'
      )
    )
      return;

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
    return Math.round(
      ((station.totalChargers - station.availableChargers) / station.totalChargers) * 100
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-sm">Loading stations...</p>
        </div>
      </div>
    );
  }

   const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', current: true },
    { name: 'Stations', icon: Building2, path: '/admin/stationmanagement' },
    { name: 'Users', icon: Users, path: '/admin/usermanagement' },
    { name: 'Bookings', icon: Book, path: '/admin/bookingmanagement' },
     { name: "Requests", icon: Users, path: "/admin/requestmanagement" },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];


  const handleEdit = (stationId) => {
    navigate(`/admin/editStation/${stationId}`);
  };

  // filters
  const filteredStations = stations.filter((s) => {
    const text = `${s.name} ${s.address}`.toLowerCase();
    const matchesSearch = text.includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;

    const cityFromAddress = s.rawCity || s.address.split(',')[1]?.trim() || '';
    const matchesCity = filterCity === 'all' || cityFromAddress === filterCity;

    return matchesSearch && matchesStatus && matchesCity;
  });

  const uniqueCities = Array.from(
    new Set(stations.map((s) => s.rawCity).filter(Boolean))
  );

   return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col h-screen sticky top-0`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 flex-shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                 <div className="h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
            <Zap className="w-6 h-6 text-white" />
          </div>
                <span className="font-semibold text-sm text-slate-900">
                  BijuliYatra
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="mx-auto p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isCurrent = item.path === '/admin/stationmanagement';
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isCurrent
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isCurrent ? 'text-emerald-500' : 'text-slate-500'
                  }`}
                />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-slate-200 p-4 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-all ${
                !sidebarOpen && 'justify-center'
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                AU
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-900 text-sm">
                      Admin User
                    </p>
                    <p className="text-[11px] text-slate-500">
                      admin@bijuliyatra.com
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </>
              )}
            </button>

            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                <button className="w-full px-4 py-3 text-left text-xs hover:bg-slate-50 flex items-center gap-3 text-slate-700">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-xs hover:bg-rose-50 text-rose-600 flex items-center gap-3"
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
        {/* Header */}
        <header className="bg-white/90 border-b border-slate-200 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-slate-900">
              Stations Management
            </h1>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 w-60">
                <input
                  placeholder="Search..."
                  className="bg-transparent outline-none text-slate-900 placeholder:text-slate-400 w-full"
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-2 hover:bg-slate-100 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-700 ${
                    refreshing ? 'animate-spin' : ''
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5" />
                <p className="text-sm text-rose-800 flex-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-rose-500 hover:text-rose-700 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by station name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Cities</option>
                  {uniqueCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {filteredStations.length === 0 ? (
                <div className="p-16 text-center">
                  <Loader className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
                  <p className="text-sm text-slate-500">
                    No stations found. Try adjusting filters or adding a new station.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          Station
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          City
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          Connectors
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right font-semibold text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredStations.map((station) => {
                        const usage = getUsagePercentage(station);
                        const [addrCity] = station.address
                          .split(',')
                          .map((s) => s.trim());
                        const connectorLabel = `${station.totalChargers} connectors`;
                        const typesLabel =
                          station.fastChargers > 0 && station.slowChargers > 0
                            ? 'DC Fast, Type 2'
                            : station.fastChargers > 0
                            ? 'DC Fast'
                            : station.slowChargers > 0
                            ? 'Type 2'
                            : '—';

                        return (
                          <tr
                            key={station.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            {/* Station */}
                            <td className="px-6 py-4">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mt-0.5">
                                  <MapPin className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {station.name}
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-1">
                                    {station.address}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* City */}
                            <td className="px-6 py-4 text-[11px] text-slate-700 align-top">
                              {addrCity || '-'}
                            </td>

                            {/* Owner */}
                            <td className="px-6 py-4 text-[11px] text-slate-700 align-top">
                              {station.operatorName || 'Platform Station'}
                            </td>

                            {/* Connectors */}
                            <td className="px-6 py-4 text-[11px] text-slate-700 align-top">
                              <p className="text-sm font-semibold text-slate-900">
                                {connectorLabel}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-1">
                                {typesLabel}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 align-top">
                              <span
                                className={`inline-flex px-3 py-1 rounded-full text-[11px] font-medium ${
                                  station.status === 'Active'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : station.status === 'Maintenance'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {station.status === 'Active'
                                  ? 'Online'
                                  : station.status === 'Maintenance'
                                  ? 'Maintenance'
                                  : 'Offline'}
                              </span>
                              <p className="text-[11px] text-slate-500 mt-1">
                                {usage}% usage
                              </p>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-right align-top">
                              <div className="inline-flex gap-1.5">
                                <button
                                  onClick={() => handleViewDetails(station.id)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-[11px] text-slate-800 hover:bg-slate-200"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleEdit(station.id)}
                                  className="p-2 rounded-lg hover:bg-slate-100"
                                >
                                  <Edit className="w-4 h-4 text-slate-700" />
                                </button>
                                <button
                                  onClick={() => handleDelete(station.id)}
                                  className="p-2 rounded-lg hover:bg-rose-50"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );

}
