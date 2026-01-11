import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Clock, Battery, Eye, XCircle,Users,Settings } from 'lucide-react';
import { bookingService } from '../../Services/api';
import { useNavigate } from "react-router-dom";

export default function BookingManagement() {
    const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load bookings from backend
  useEffect(() => {
    let mounted = true;

    const loadBookings = async () => {
      setLoading(true);
      try {
        const data = await bookingService.listBookings();

        if (!mounted) return;

        // Map BookingResponseDTO -> UI fields
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
          duration: b.duration || '-', // or compute from start/end
          status: b.status || 'UNKNOWN',
          actualKwh: b.actualKwh ?? null,
          totalAmount: b.totalAmount ?? null,
          energyDelivered:
            b.actualKwh != null ? `${b.actualKwh.toFixed(1)} kWh` : '-',
          amount:
            b.totalAmount != null ? `₹${b.totalAmount.toFixed(2)}` : '-',
          date: b.startTime
            ? new Date(b.startTime).toISOString().slice(0, 10)
            : '',
        }));

        setBookings(mapped);
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

  

  // Derived stats from bookings
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
    const matchesSearch =
      booking.user.toLowerCase().includes(q) ||
      booking.id.toLowerCase().includes(q) ||
      booking.station.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      booking.status.toLowerCase() === statusFilter.toLowerCase();

    // Optionally apply dateFilter using booking.date here
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0">
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/90 p-2 rounded-lg shadow-md shadow-emerald-500/40">
              <Battery className="w-6 h-6 text-slate-950" />
            </div>
            <span className="font-semibold text-sm text-slate-50">
              BijuliYatra
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-slate-800/70"
        >
          <MapPin className="w-5 h-5 text-slate-400" />
          <span>Dashboard</span>
        </button>

      
        <button
          onClick={() => navigate("/admin/stationmanagement")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-slate-800/70"
        >
          <MapPin className="w-5 h-5 text-slate-400" />
          <span>Stations</span>
        </button>

        <button
          onClick={() => navigate("/admin/usermanagement")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-slate-800/70"
        >
          <Users className="w-5 h-5 text-slate-400" />
          <span>Users</span>
        </button>


        <button
          onClick={() => navigate("/admin/bookingmanagement")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]"
        >
          <Clock className="w-5 h-5 text-emerald-400" />
          <span>Bookings</span>
        </button>

        <button
          onClick={() => navigate("/admin/settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-slate-800/70"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          <span>Settings</span>
        </button>
      </nav>

        {/* User */}
        <div className="border-t border-slate-800 p-4 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800/80 transition-all">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-slate-950 font-bold text-sm">
              AU
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-50">Admin User</p>
              <p className="text-[11px] text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-950/90 border-b border-slate-800 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-slate-50">
              Bookings Management
            </h1>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 w-64">
                <Search className="w-4 h-4 text-slate-500 mr-2" />
                <input
                  placeholder="Search..."
                  className="bg-transparent outline-none text-slate-100 placeholder:text-slate-500 w-full"
                />
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Stats row 4 cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40">
                <p className="text-[11px] text-slate-400 mb-1">
                  Total bookings
                </p>
                <p className="text-2xl font-bold text-slate-50">
                  {stats.total}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">All time</p>
              </div>
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40">
                <p className="text-[11px] text-slate-400 mb-1">
                  Completion rate
                </p>
                <p className="text-2xl font-bold text-emerald-300">
                  {stats.completedPct}%
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {stats.completed} completed
                </p>
              </div>
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40">
                <p className="text-[11px] text-slate-400 mb-1">
                  In progress
                </p>
                <p className="text-2xl font-bold text-sky-300">
                  {stats.inProgress}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {stats.inProgressPct}% of total
                </p>
              </div>
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40">
                <p className="text-[11px] text-slate-400 mb-1">
                  Revenue (all time)
                </p>
                <p className="text-2xl font-bold text-emerald-300">
                  ₹{stats.revenue.toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Gross</p>
              </div>
            </div>

            {/* Filters row like design */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 mb-5">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by booking ID, user or station..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-[11px] text-slate-500 hidden md:block" />
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-[11px] text-slate-500 hidden md:block" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in progress">In Progress</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="confirmed">Comfirmed</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg shadow-black/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                        EV Owner
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                        Station
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                        Energy
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider">
                        Price
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
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-slate-900/70 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-50 text-sm">
                            {booking.id}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {booking.date}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-9 h-9 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-200 font-semibold mr-3 text-xs">
                              {booking.user
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-50 text-sm">
                                {booking.user}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {booking.userEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-slate-50">
                            <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                            <div>
                              <p className="font-medium text-[13px]">
                                {booking.station}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {booking.chargerType}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-slate-50 font-medium">
                              {booking.startTime}
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              {booking.endTime}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-slate-50">
                            <Clock className="w-4 h-4 mr-2 text-slate-500" />
                            {booking.duration}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm font-medium text-slate-50">
                            <Battery className="w-4 h-4 mr-2 text-emerald-400" />
                            {booking.energyDelivered}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-emerald-300">
                            {booking.amount}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-slate-200" />
                            </button>
                            {booking.status === 'Scheduled' && (
                              <button
                                className="p-2 hover:bg-rose-600/10 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <XCircle className="w-4 h-4 text-rose-400" />
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
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                <p className="text-[11px] text-slate-500">
                  Showing {filteredBookings.length} of {bookings.length} bookings
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 border border-slate-700 rounded-lg text-[11px] text-slate-200 hover:bg-slate-800">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-[11px] font-semibold hover:bg-emerald-400">
                    1
                  </button>
                  <button className="px-3 py-1.5 border border-slate-700 rounded-lg text-[11px] text-slate-200 hover:bg-slate-800">
                    2
                  </button>
                  <button className="px-3 py-1.5 border border-slate-700 rounded-lg text-[11px] text-slate-200 hover:bg-slate-800">
                    3
                  </button>
                  <button className="px-3 py-1.5 border border-slate-700 rounded-lg text-[11px] text-slate-200 hover:bg-slate-800">
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