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
    navigate(`/stationdetails/${id}`);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col h-screen sticky top-0`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/90 p-2 rounded-lg shadow-md shadow-emerald-500/40">
                  <Zap className="w-6 h-6 text-slate-950" />
                </div>
                <span className="font-semibold text-sm text-slate-50">
                  BijuliYatra
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-800/70 rounded-lg"
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
          {navigationItems.map((item) => {
            const isCurrent = item.path === '/admin/stationmanagement';
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]'
                    : 'text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isCurrent ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-slate-800 p-4 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/80 transition-all ${
                !sidebarOpen && 'justify-center'
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-slate-950 font-bold">
                AU
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-50 text-sm">
                      Admin User
                    </p>
                    <p className="text-[11px] text-slate-400">
                      admin@bijuliyatra.com
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
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
                  className="w-full px-4 py-3 text-left text-xs hover:bg-rose-600/10 text-rose-400 flex items-center gap-3"
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
        <header className="bg-slate-950/90 border-b border-slate-800 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-slate-50">
              Stations Management
            </h1>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 w-60">
                <input
                  placeholder="Search..."
                  className="bg-transparent outline-none text-slate-100 placeholder:text-slate-500 w-full"
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-100 ${
                    refreshing ? 'animate-spin' : ''
                  }`}
                />
                Refresh
              </button>
              {/* <button
                onClick={goToAdd}
                className="bg-emerald-500 text-slate-950 px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-emerald-400 shadow-md shadow-emerald-500/30"
              >
                <Plus className="w-4 h-4" />
                Add Station Manually
              </button> */}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-rose-950/40 border border-rose-600/60 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-300 mt-0.5" />
                <p className="text-sm text-rose-100 flex-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-rose-300 hover:text-rose-100 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* Filters (user-style) */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 mb-6 shadow-lg shadow-black/40">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by station name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg shadow-black/40 overflow-hidden">
              {filteredStations.length === 0 ? (
                <div className="p-16 text-center">
                  <Loader className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
                  <p className="text-sm text-slate-400">
                    No stations found. Try adjusting filters or adding a new station.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                          Station
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                          City
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                          Connectors
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right font-semibold text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
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
                            className="hover:bg-slate-900/70 transition-colors"
                          >
                            {/* Station */}
                            <td className="px-6 py-4">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center mt-0.5">
                                  <MapPin className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-50">
                                    {station.name}
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-1">
                                    {station.address}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* City */}
                            <td className="px-6 py-4 text-[11px] text-slate-300 align-top">
                              {addrCity || '-'}
                            </td>

                            {/* Owner */}
                            <td className="px-6 py-4 text-[11px] text-slate-300 align-top">
                              {station.operatorName || 'Platform Station'}
                            </td>

                            {/* Connectors */}
                            <td className="px-6 py-4 text-[11px] text-slate-300 align-top">
                              <p className="text-sm font-semibold text-slate-50">
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
                                    ? 'bg-emerald-500/20 text-emerald-200'
                                    : station.status === 'Maintenance'
                                    ? 'bg-amber-500/20 text-amber-200'
                                    : 'bg-slate-700 text-slate-200'
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
                                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-[11px] text-slate-100 hover:bg-slate-700"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleEdit(station.id)}
                                  className="p-2 rounded-lg hover:bg-slate-800"
                                >
                                  <Edit className="w-4 h-4 text-slate-200" />
                                </button>
                                <button
                                  onClick={() => handleDelete(station.id)}
                                  className="p-2 rounded-lg hover:bg-rose-600/10"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-400" />
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
