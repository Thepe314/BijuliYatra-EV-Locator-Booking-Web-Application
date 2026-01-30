import React, { useEffect, useMemo, useState } from 'react';
import {
  Zap, Search, MapPin, Clock, Battery, Eye, XCircle, Users, Settings, LogOut, Book, Building2, LayoutDashboard
} from 'lucide-react';
import { bookingService } from '../../Services/api';
import { useNavigate } from "react-router-dom";
import { authService } from '../../Services/api';
import notify from '../../Utils/notify';

export default function BookingManagement() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);


  const [earnings, setEarnings] = useState({
    totalPlatformEarnings: 0,
    totalStationEarnings: 0,
    totalBookings: 0,
    commissionRate: "7%"
  });


  useEffect(() => {
    let mounted = true;

    const loadBookings = async () => {
      setLoading(true);
      try {
     
        const [data, earningsData] = await Promise.all([
          bookingService.listBookings(),
          bookingService.listAdminEarnings()
        ]);

        if (!mounted) return;


        const mapped = data.map((b) => ({
          id: b.id || `BK-${b.bookingId || ''}`,
          user: b.evOwnerName || b.userName || 'Unknown',
          userEmail: b.evOwnerEmail || b.userEmail || '',
          station: b.stationName || (b.station && b.station.name) || '—',
          chargerType: b.connectorType || b.chargerType || '—',
          startTime: b.startTime
            ? new Date(b.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-',
          endTime: b.endTime
            ? new Date(b.endTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-',
          duration: b.duration || '-', 
          status: b.status || 'UNKNOWN',
          actualKwh: b.actualKwh ?? null,
          totalAmount: b.totalAmount ?? null,
          energyDelivered:
            b.actualKwh != null ? `${b.actualKwh.toFixed(1)} kWh` : '-',
          amount:
            b.totalAmount != null ? `${b.totalAmount.toFixed(2)}` : '-',
          date: b.startTime
            ? new Date(b.startTime).toISOString().slice(0, 10)
            : '',
        }));

        setBookings(mapped);

   
        setEarnings({
          totalPlatformEarnings: Number(earningsData?.totalPlatformEarnings || 0),
          totalStationEarnings: Number(earningsData?.totalStationEarnings || 0),
          totalBookings: Number(earningsData?.totalBookings || 0),
          commissionRate: earningsData?.commissionRate || "7%"
        });

      } catch (err) {
        console.error('Failed to load bookings', err);
        setError('Unable to load bookings');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBookings();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {}
    notify.logout();
    navigate("/login");
  };


  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter(
      (b) => b.status === 'COMPLETED' || b.status === 'Completed'
    ).length;
    const inProgress = bookings.filter(
      (b) =>
        b.status === 'IN_PROGRESS' ||
        b.status === 'In Progress' ||
        b.status === 'CONFIRMED'
    ).length;
    const cancelled = bookings.filter(
      (b) => b.status === 'CANCELLED' || b.status === 'Cancelled'
    ).length;

    const revenue = bookings.reduce((sum, b) => {
      return sum + (typeof b.totalAmount === 'number' ? b.totalAmount : 0);
    }, 0);

    const completedPct = total ? ((completed / total) * 100).toFixed(1) : '0.0';
    const inProgressPct = total
      ? ((inProgress / total) * 100).toFixed(1)
      : '0.0';
    const cancelledPct = total
      ? ((cancelled / total) * 100).toFixed(1)
      : '0.0';

    return {
      total,
      completed,
      inProgress,
      cancelled,
      revenue,
      completedPct,
      inProgressPct,
      cancelledPct,
    };
  }, [bookings]);

  const filteredBookings = bookings.filter((booking) => {
    const q = searchTerm.toLowerCase();

    const user = (booking.user || '').toString().toLowerCase();
    const id = (booking.id ?? '').toString().toLowerCase();
    const station = (booking.station || '').toString().toLowerCase();

    const matchesSearch =
      user.includes(q) ||
      id.includes(q) ||
      station.includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (booking.status || '').toString().toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS':
      case 'In Progress':
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      case 'SCHEDULED':
      case 'Scheduled':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
            <span className="font-semibold text-sm text-slate-900">
              BijuliYatra
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-100"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-500" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/admin/stationmanagement")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-100"
          >
            <Building2 className="w-5 h-5 text-slate-500" />
            <span>Stations</span>
          </button>

          <button
            onClick={() => navigate("/admin/usermanagement")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-100"
          >
            <Users className="w-5 h-5 text-slate-500" />
            <span>Users</span>
          </button>

          <button
            onClick={() => navigate("/admin/bookingmanagement")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
          >
            <Book className="w-5 h-5 text-emerald-500" />
            <span>Bookings</span>
          </button>

          <button
            onClick={() => navigate("/admin/requestmanagement")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-100"
          >
            <Users className="w-5 h-5 text-emerald-500" />
            <span>Requests</span>
          </button>

          <button
            onClick={() => navigate("/admin/settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-100"
          >
            <Settings className="w-5 h-5 text-slate-500" />
            <span>Settings</span>
          </button>
        </nav>

        {/* User */}
        <div className="border-t border-slate-200 p-4 flex-shrink-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((open) => !open)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-all"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                AU
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-900">Admin User</p>
                <p className="text-[11px] text-slate-500">Administrator</p>
              </div>

              <span className="text-slate-400 text-xs">▴▾</span>
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/admin/settings");
                  }}
                  className="w-full px-4 py-3 text-left text-xs hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-xs hover:bg-rose-50 text-rose-600 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
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
              Bookings Management
            </h1>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 w-64">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  placeholder="Search..."
                  className="bg-transparent outline-none text-slate-900 placeholder:text-slate-400 w-full"
                />
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[11px] text-slate-500 mb-1">Total bookings</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-[11px] text-slate-400 mt-1">All time</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[11px] text-slate-500 mb-1">Completion rate</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.completedPct}%</p>
                <p className="text-[11px] text-slate-400 mt-1">{stats.completed} completed</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[11px] text-slate-500 mb-1">In progress</p>
                <p className="text-2xl font-bold text-sky-600">{stats.inProgress}</p>
                <p className="text-[11px] text-slate-400 mt-1">{stats.inProgressPct}% of total</p>
              </div>

          
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[11px] text-slate-500 mb-1">Platform revenue (all time)</p>
                <p className="text-2xl font-bold text-emerald-600">
                  NPR {Number(earnings.totalPlatformEarnings || 0).toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Commission {earnings.commissionRate || "7%"} • Total bookings {Number(earnings.totalBookings || 0)}
                </p>
              </div>
            </div>

            {/* Filters row */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
              <div className="flex flex-col md:flex-row gap-3 items-stretch">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by booking ID, user or station..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="w-full md:w-40">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in progress">In Progress</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">Booking ID</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">EV Owner</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">Station</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">Start Time</th>
                      {/* <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">Duration</th> */}
                      {/* <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">Energy</th> */}
                      <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 text-sm">{booking.id}</p>
                          <p className="text-[11px] text-slate-500">{booking.date}</p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 font-semibold mr-3 text-xs">
                              {booking.user
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{booking.user}</p>
                              <p className="text-[11px] text-slate-500">{booking.userEmail}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-slate-900">
                            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                            <div>
                              <p className="font-medium text-[13px]">{booking.station}</p>
                              <p className="text-[11px] text-slate-500">{booking.chargerType}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-slate-900 font-medium">{booking.startTime}</p>
                            <p className="text-slate-500 text-[11px]">{booking.endTime}</p>
                          </div>
                        </td>

                        {/* <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-slate-900">
                            <Clock className="w-4 h-4 mr-2 text-slate-400" />
                            {booking.duration}
                          </div>
                        </td> */}

                        {/* <td className="px-6 py-4">
                          <div className="flex items-center text-sm font-medium text-slate-900">
                            <Battery className="w-4 h-4 mr-2 text-emerald-500" />
                            {booking.energyDelivered}
                          </div>
                        </td> */}

                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-emerald-600">
                            {booking.amount === '-' ? booking.amount : `NPR ${booking.amount}`}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium ${getStatusColor(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-slate-700" />
                            </button>
                            {booking.status === 'Scheduled' && (
                              <button
                                className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <XCircle className="w-4 h-4 text-rose-500" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer / pagination */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-[11px] text-slate-500">
                  Showing {filteredBookings.length} of {bookings.length} bookings
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] text-slate-700 hover:bg-slate-100">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[11px] font-semibold hover:bg-emerald-400">
                    1
                  </button>
                  <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] text-slate-700 hover:bg-slate-100">
                    2
                  </button>
                  <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] text-slate-700 hover:bg-slate-100">
                    3
                  </button>
                  <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] text-slate-700 hover:bg-slate-100">
                    Next
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
