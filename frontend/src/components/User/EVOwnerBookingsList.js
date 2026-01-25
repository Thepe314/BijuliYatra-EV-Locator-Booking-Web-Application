import React, { useEffect, useState } from 'react';
import { MapPin, Zap, Search, CreditCard } from 'lucide-react';
import { bookingService } from '../../Services/api';
import { useNavigate } from 'react-router-dom';
import notify from '../../Utils/notify';

export default function EVOwnerBookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('LATEST'); // EARLIEST or LATEST
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await bookingService.listBookingsEv();
         console.log('Loaded bookings:', data);
        setBookings(data || []);
      } catch (e) {
        console.error('Failed to load bookings', e);
        notify.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCancelBooking = async (bookingId) => {
  console.log('Cancelling booking from UI, id =', bookingId);
  try {
    await bookingService.cancelBooking(bookingId);
    notify.success('Booking cancelled successfully');
    
    // Refresh list
    const data = await bookingService.listBookingsEv();
    setBookings(data || []);
  } catch (error) {
    console.error('Cancel error details:', error.response?.data || error.message);
    
    // Handle backend 400 errors with exact message
    if (error.response?.status === 400) {
      const errorMsg = error.response.data || 'Cannot cancel this booking';
      notify.error(errorMsg);  // Shows "Cannot cancel < 30 mins before" etc.
    } else if (error.response?.status === 403) {
      notify.error('Not authorized to cancel this booking');
    } else {
      notify.error('Failed to cancel booking. Please try again.');
    }
  }
};

  // 1) filter by status + search
  const filtered = bookings
    .filter((b) => {
      if (statusFilter === 'ALL') return true;
      return b.status === statusFilter;
    })
    .filter((b) => {
      const key = `${b.stationName || ''} ${b.id || ''}`.toLowerCase();
      return key.includes(search.toLowerCase());
    });

  // 2) sort by bookedAt based on sortOrder
  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.bookedAt);
    const db = new Date(b.bookedAt);
    return sortOrder === 'EARLIEST' ? da - db : db - da;
  });

  const total = bookings.length;
  const upcoming = bookings.filter((b) => b.status === 'UPCOMING').length;
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto my-6 bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Top nav bar */}
        <header className="border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
            <span className="font-semibold text-slate-900">BijuliYatra</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <button onClick={() => navigate('/ev-owner/dashboard')}>Home</button>
            <button onClick={() => navigate('/ev-owner/station')}>Find stations</button>
            <button className="text-emerald-600 font-medium">My bookings</button>
                 <button onClick={() => navigate('/ev-owner/vehicles')}>My Vehicles</button>
            <button onClick={() => navigate('/ev-owner/wallet')}>Wallet/Payments</button>
            <button onClick={() => navigate('/profile')}>Profile</button>
          </nav>
        </header>

        {/* Content */}
        <main className="bg-slate-50 px-6 py-6">
          <h1 className="text-3xl font-semibold text-slate-900 mb-3">
            My Bookings
          </h1>
          <p className="text-sm text-slate-500 mb-5">
            Manage and track all your charging sessions
          </p>

          {/* Search + filters + summary cards */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4">
            {/* Search */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by station name or booking ID"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Dropdown filters */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs items-center">
              {/* Status dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-slate-600 text-[11px]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 bg-slate-50 rounded-lg px-2 py-1 text-[11px]"
                >
                  <option value="ALL">All</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Time sort dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-slate-600 text-[11px]">
                  Sort by booked at:
                </span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border border-slate-200 bg-slate-50 rounded-lg px-2 py-1 text-[11px]"
                >
                    <option value="LATEST">Latest first</option>
                  <option value="EARLIEST">Earliest first</option>
                  
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <SummaryCard label="Total Bookings" value={total} />
              <SummaryCard label="Upcoming" value={upcoming} highlight />
              <SummaryCard label="Confirmed" value={confirmed} />
              <SummaryCard label="Cancelled" value={cancelled} />
            </div>
          </div>

          {/* Bookings list */}
          <div className="space-y-3">
            {loading && (
              <p className="text-xs text-slate-500 px-1 py-4">
                Loading bookings…
              </p>
            )}

            {!loading && filtered.length === 0 && (
              <p className="text-xs text-slate-500 px-1 py-4">
                No bookings found for your search.
              </p>
            )}

            {!loading &&
              sorted.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onViewDetails={() => setSelectedBooking(b)}
                  onCancel={() => handleCancelBooking(b.id)}
                />
              ))}
          </div>
        </main>
      </div>

      {/* Details popup */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl border px-4 py-4 ${
        highlight
          ? 'border-emerald-200 bg-emerald-50/60 text-emerald-700'
          : 'border-slate-200 bg-slate-50 text-slate-700'
      }`}
    >
      <p className="text-xs">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function statusBadgeClasses(status) {
  if (status === 'UPCOMING') return 'bg-emerald-50 text-emerald-700';
  if (status === 'IN_PROGRESS') return 'bg-sky-50 text-sky-700';
  if (status === 'COMPLETED') return 'bg-slate-100 text-slate-700';
  if (status === 'CANCELLED') return 'bg-rose-50 text-rose-700';
  if (status === 'CONFIRMED') return 'bg-emerald-100 text-emerald-800';
  return 'bg-slate-100 text-slate-600';
}

function BookingCard({ booking, onViewDetails, onCancel }) {
  const {
    stationName,
    address,
    connectorType,
    totalAmount,
    startTime,
    status,
    id,
    evOwnerName,
    paymentMethod,
  } = booking;

  const date = new Date(startTime);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm">
      {/* Top row: title + status */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-slate-900">
            {stationName}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {address}
          </p>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Booked by {evOwnerName || 'Unknown'}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={
              'px-3 py-1 rounded-full text-xs font-medium ' +
              statusBadgeClasses(status)
            }
          >
            {status || 'Pending'}
          </span>
          <p className="text-[11px] text-slate-400">Booking ID {id}</p>
        </div>
      </div>

      {/* Middle row: details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm text-slate-500 mb-4">
        <div>
          <p className="mb-1">Date &amp; Time</p>
          <p className="font-medium text-slate-900 text-sm md:text-base">
            {date.toLocaleDateString()} <br />
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div>
          <p className="mb-1">Connector</p>
          <p className="font-medium text-slate-900 text-sm md:text-base">
            {connectorType || '–'}
          </p>
        </div>

        <div>
          <p className="mb-1">Total Amount</p>
          <p className="font-medium text-emerald-700 text-sm md:text-base">
            NPR{totalAmount != null ? totalAmount.toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Bottom row: actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs md:text-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <CreditCard className="w-3 h-3" />
          <span>Paid via {paymentMethod || 'KHALTI'}</span>
        </div>

        <div className="flex items-center gap-3">
          {status === 'CONFIRMED' && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs md:text-sm font-medium border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50"
            >
              Cancel booking
            </button>
          )}
          <button
            className="px-3 py-1.5 text-xs md:text-sm font-medium border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50"
            type="button"
            onClick={onViewDetails}
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingDetailsModal({ booking, onClose }) {
  const {
    stationName,
    address,
    connectorType,
    totalAmount,
    startTime,
    endTime,
    status,
    id,
    evOwnerName,
    evOwnerEmail,
    evOwnerPhone,
    paymentMethod,
  } = booking;

  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : null;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
      <button
        type="button"
        className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 text-2xl"
        onClick={onClose}
      >
        ×
      </button>

      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Booking Details
      </h2>
      <p className="text-sm text-slate-500 mb-5">Booking ID {id}</p>

      <div className="space-y-4 text-sm md:text-base">
        <div>
          <p className="text-xs md:text-sm text-slate-500 mb-1">Station</p>
          <p className="font-semibold text-slate-900">{stationName}</p>
          <p className="text-xs md:text-sm text-slate-500">{address}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs md:text-sm text-slate-500 mb-1">Start Time</p>
            <p className="font-medium text-slate-900">
              {start.toLocaleDateString()} <br />
              {start.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {end && (
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">End Time</p>
              <p className="font-medium text-slate-900">
                {end.toLocaleDateString()} <br />
                {end.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs md:text-sm text-slate-500 mb-1">Connector</p>
            <p className="font-medium text-slate-900">
              {connectorType || '–'}
            </p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-500 mb-1">Status</p>
            <span
              className={
                'inline-flex px-3 py-1 rounded-full text-xs font-medium ' +
                statusBadgeClasses(status)
              }
            >
              {status}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs md:text-sm text-slate-500 mb-1">Booked By</p>
          <p className="font-medium text-slate-900">
            {evOwnerName || 'Unknown'}
          </p>
          <p className="text-xs md:text-sm text-slate-500">
            {evOwnerEmail}
            {evOwnerPhone && ` • ${evOwnerPhone}`}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-slate-500 mb-1">Payment</p>
            <p className="font-medium text-slate-900">
              Paid via {paymentMethod || 'KHALTI'}
            </p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-500 mb-1">
              Total Amount
            </p>
            <p className="font-semibold text-emerald-700 text-base md:text-lg">
              NPR{totalAmount != null ? totalAmount.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);
}