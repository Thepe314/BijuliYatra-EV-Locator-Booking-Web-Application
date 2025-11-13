import React, { useState, useEffect } from 'react';
import { Battery, MapPin, Users, DollarSign, TrendingUp, Calendar, Search, Filter, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { userService,stationService} from '../../Services/api';
 
export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const navigate = useNavigate();
  
  // State management for data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', change: '+0%', icon: Users, color: 'bg-blue-500', key: 'users' },
    { label: 'Active Stations', value: '0', change: '+0', icon: MapPin, color: 'bg-green-500', key: 'stations' },
    { label: 'Revenue', value: '$0', change: '+0%', icon: DollarSign, color: 'bg-purple-500', key: 'revenue' },
    { label: 'Energy Delivered', value: '0 kWh', change: '+0%', icon: Battery, color: 'bg-orange-500', key: 'energy' },
  ]);
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [stations, setStations] = useState([]);

  // Fetch data from database
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch users count
      const usersData = await userService.listUsers();
      const activeUsers = usersData?.length || 0;

      // Fetch stations
      const stationsData = await stationService.listStation();
      const activeStations = stationsData?.filter(s => s.status === 'Active')?.length || 0;

      // Update stats
      setStats(prevStats => 
        prevStats.map(stat => {
          if (stat.key === 'users') return { ...stat, value: activeUsers.toLocaleString(), change: '+12%' };
          if (stat.key === 'stations') return { ...stat, value: activeStations.toString(), change: '+5' };
          if (stat.key === 'revenue') return { ...stat, value: '$48,392', change: '+23%' }; // Calculate from bookings if available
          if (stat.key === 'energy') return { ...stat, value: '12,456 kWh', change: '+18%' }; // Get from backend
          return stat;
        })
      );

      // Set stations data
      setStations(stationsData || []);

      // Fetch recent bookings (if bookings API exists)
      // const bookingsData = await bookingService.listRecentBookings(timeRange);
      // setRecentBookings(bookingsData || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManage = () => {
    navigate('/stationmangement');
  };

  const handleUsers = () => {
    navigate('/usermanagement');
  };

  // Mock bookings - replace with actual API call when available
  const mockRecentBookings = [
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, Admin</p>
            </div>
            <div className="flex gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={stat.key === 'users' ? handleUsers : undefined}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-600 text-sm font-semibold flex items-center">
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
              {mockRecentBookings.map((booking) => (
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
              ))}
            </div>
          </div>

          {/* Station Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Station Status</h2>
              <button
                onClick={handleManage}
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                Manage
              </button>
            </div>
            <div className="space-y-4">
              {stations.length > 0 ? (
                stations.map((station, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{station.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Chargers: {station.chargers?.available || 0}/{station.chargers?.total || 0}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        station.status === 'Active' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {station.status}
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
                    <p className="text-xs text-gray-500 mt-2">{station.usage || 0}% Capacity</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No stations available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}