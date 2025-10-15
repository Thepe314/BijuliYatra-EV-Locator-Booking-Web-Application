import React, { useState } from 'react';
import { Search, Filter, Calendar, Clock, MapPin, Battery, User, DollarSign, Eye, XCircle, CheckCircle } from 'lucide-react';

export default function BookingManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  const bookings = [
    { 
      id: 'BK0001', 
      user: 'John Doe', 
      userEmail: 'john@example.com',
      station: 'Downtown Hub', 
      chargerType: 'Fast Charge',
      startTime: '10:30 AM', 
      endTime: '11:45 AM',
      duration: '1h 15m',
      status: 'Completed',
      energyDelivered: '45 kWh',
      amount: '$25.50',
      date: '2024-10-13'
    },
    { 
      id: 'BK0002', 
      user: 'Sarah Smith', 
      userEmail: 'sarah@example.com',
      station: 'Mall Plaza', 
      chargerType: 'Standard',
      startTime: '2:15 PM', 
      endTime: '4:30 PM',
      duration: '2h 15m',
      status: 'In Progress',
      energyDelivered: '32 kWh',
      amount: '$18.00',
      date: '2024-10-13'
    },
    { 
      id: 'BK0003', 
      user: 'Mike Johnson', 
      userEmail: 'mike@example.com',
      station: 'Airport Station', 
      chargerType: 'Fast Charge',
      startTime: '8:00 AM', 
      endTime: '9:30 AM',
      duration: '1h 30m',
      status: 'Completed',
      energyDelivered: '58 kWh',
      amount: '$42.00',
      date: '2024-10-13'
    },
    { 
      id: 'BK0004', 
      user: 'Emma Wilson', 
      userEmail: 'emma@example.com',
      station: 'City Center', 
      chargerType: 'Standard',
      startTime: '3:00 PM', 
      endTime: '-',
      duration: '-',
      status: 'Cancelled',
      energyDelivered: '-',
      amount: '$0.00',
      date: '2024-10-13'
    },
    { 
      id: 'BK0005', 
      user: 'David Lee', 
      userEmail: 'david@example.com',
      station: 'Tech Park', 
      chargerType: 'Fast Charge',
      startTime: '11:00 AM', 
      endTime: '12:20 PM',
      duration: '1h 20m',
      status: 'Completed',
      energyDelivered: '42 kWh',
      amount: '$31.00',
      date: '2024-10-12'
    },
    { 
      id: 'BK0006', 
      user: 'Lisa Anderson', 
      userEmail: 'lisa@example.com',
      station: 'Downtown Hub', 
      chargerType: 'Standard',
      startTime: '4:45 PM', 
      endTime: '-',
      duration: '-',
      status: 'Scheduled',
      energyDelivered: '-',
      amount: '$15.00',
      date: '2024-10-14'
    },
  ];

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.station.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      case 'Scheduled': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-sm text-gray-500 mt-1">Track and manage all charging bookings</p>
            </div>
            <div className="flex gap-3">
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">1,247</p>
            <p className="text-green-600 text-sm mt-2">+15% today</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">892</p>
            <p className="text-gray-600 text-sm mt-2">71.5%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">234</p>
            <p className="text-gray-600 text-sm mt-2">18.8%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm mb-1">Cancelled</p>
            <p className="text-3xl font-bold text-red-600">87</p>
            <p className="text-gray-600 text-sm mt-2">7.0%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm mb-1">Revenue</p>
            <p className="text-3xl font-bold text-purple-600">$24.5K</p>
            <p className="text-green-600 text-sm mt-2">+23%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by booking ID, user, or station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in progress">In Progress</option>
              <option value="cancelled">Cancelled</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Station</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Energy</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{booking.id}</p>
                      <p className="text-xs text-gray-500">{booking.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                          {booking.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{booking.user}</p>
                          <p className="text-xs text-gray-500">{booking.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <p className="font-medium">{booking.station}</p>
                          <p className="text-xs text-gray-500">{booking.chargerType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">{booking.startTime}</p>
                        <p className="text-gray-500 text-xs">{booking.endTime}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {booking.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <Battery className="w-4 h-4 mr-2 text-green-500" />
                        {booking.energyDelivered}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{booking.amount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {booking.status === 'Scheduled' && (
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Cancel">
                            <XCircle className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing {filteredBookings.length} of {bookings.length} bookings</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Previous</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">3</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}