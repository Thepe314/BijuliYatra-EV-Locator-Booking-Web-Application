import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('month');

  const revenueData = [
    { month: 'Jan', revenue: 42000, bookings: 1240 },
    { month: 'Feb', revenue: 38000, bookings: 1180 },
    { month: 'Mar', revenue: 45000, bookings: 1350 },
    { month: 'Apr', revenue: 52000, bookings: 1520 },
    { month: 'May', revenue: 48000, bookings: 1440 },
    { month: 'Jun', revenue: 55000, bookings: 1680 },
    { month: 'Jul', revenue: 62000, bookings: 1850 },
    { month: 'Aug', revenue: 58000, bookings: 1720 },
    { month: 'Sep', revenue: 64000, bookings: 1920 },
    { month: 'Oct', revenue: 68000, bookings: 2040 },
  ];

  const stationRevenueData = [
    { name: 'Downtown Hub', value: 12450 },
    { name: 'Airport Station', value: 18340 },
    { name: 'Mall Plaza', value: 8920 },
    { name: 'Tech Park', value: 9870 },
    { name: 'City Center', value: 6540 },
  ];

  const chargerTypeData = [
    { name: 'Fast Charge', value: 65, revenue: '$42,580' },
    { name: 'Standard', value: 35, revenue: '$23,420' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Revenue & Analytics</h1>
              <p className="text-sm text-gray-500 mt-1">Financial insights and performance metrics</p>
            </div>
            <div className="flex gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-semibold">
                <ArrowUp className="w-4 h-4 mr-1" />
                23%
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">$68,392</p>
            <p className="text-xs text-gray-500 mt-2">vs last month: $55,620</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="flex items-center text-blue-600 text-sm font-semibold">
                <ArrowUp className="w-4 h-4 mr-1" />
                15%
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-1">Avg Transaction</p>
            <p className="text-3xl font-bold text-gray-900">$33.52</p>
            <p className="text-xs text-gray-500 mt-2">vs last month: $29.14</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <span className="flex items-center text-purple-600 text-sm font-semibold">
                <ArrowUp className="w-4 h-4 mr-1" />
                18%
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">2,040</p>
            <p className="text-xs text-gray-500 mt-2">vs last month: 1,728</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-semibold">
                <ArrowUp className="w-4 h-4 mr-1" />
                12%
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-1">Revenue/Station</p>
            <p className="text-3xl font-bold text-gray-900">$438</p>
            <p className="text-xs text-gray-500 mt-2">Average per station</p>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Bookings</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis yAxisId="left" stroke="#9CA3AF" />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Stations by Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Top Stations by Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stationRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Charger Type */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue by Charger Type</h2>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chargerTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chargerTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {chargerTypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Station Performance Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Station</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Avg Transaction</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stationRevenueData.map((station, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{station.name}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">${station.value.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{Math.floor(station.value / 30)}</td>
                    <td className="px-6 py-4 text-gray-600">${(station.value / Math.floor(station.value / 30)).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center text-green-600 font-semibold">
                        <ArrowUp className="w-4 h-4 mr-1" />
                        {Math.floor(Math.random() * 20 + 10)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}