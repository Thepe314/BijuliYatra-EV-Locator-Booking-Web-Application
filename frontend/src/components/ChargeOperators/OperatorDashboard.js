import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Zap, TrendingUp, AlertCircle, DollarSign, Activity, MapPin, Settings, Users, Calendar, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OperatorDashboard() {
   const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStation, setSelectedStation] = useState(null);

const handleAddStation= () => {
     navigate('/operator/addstation');
  };

  // Mock data
  const stationData = [
    { id: 1, name: 'Downtown Hub', location: 'Main St', chargers: 8, active: 6, revenue: 2340, utilization: 75, status: 'operational' },
    { id: 2, name: 'Mall Plaza', location: 'Shopping District', chargers: 12, active: 10, revenue: 3120, utilization: 83, status: 'operational' },
    { id: 3, name: 'Airport Station', location: 'Terminal 2', chargers: 6, active: 5, revenue: 1890, utilization: 67, status: 'maintenance' },
    { id: 4, name: 'Tech Park', location: 'Innovation Drive', chargers: 10, active: 9, revenue: 2680, utilization: 90, status: 'operational' },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12400, sessions: 340 },
    { month: 'Feb', revenue: 14200, sessions: 380 },
    { month: 'Mar', revenue: 16800, sessions: 425 },
    { month: 'Apr', revenue: 15600, sessions: 390 },
    { month: 'May', revenue: 18900, sessions: 468 },
    { month: 'Jun', revenue: 21300, sessions: 512 },
  ];

  const utilizationData = [
    { hour: '00:00', usage: 12 },
    { hour: '04:00', usage: 8 },
    { hour: '08:00', usage: 45 },
    { hour: '12:00', usage: 68 },
    { hour: '16:00', usage: 82 },
    { hour: '20:00', usage: 56 },
  ];

  const chargerTypes = [
    { name: 'Level 2 (AC)', value: 24, color: '#3b82f6' },
    { name: 'DC Fast', value: 12, color: '#10b981' },
  ];

  const alerts = [
    { id: 1, type: 'maintenance', station: 'Airport Station', message: 'Charger 3 requires maintenance', time: '2 hours ago' },
    { id: 2, type: 'warning', station: 'Downtown Hub', message: 'High demand detected', time: '4 hours ago' },
    { id: 3, type: 'info', station: 'Mall Plaza', message: 'Peak hours approaching', time: '1 day ago' },
  ];

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalSessions = revenueData.reduce((sum, item) => sum + item.sessions, 0);
  const activeChargers = stationData.reduce((sum, station) => sum + station.active, 0);
  const totalChargers = stationData.reduce((sum, station) => sum + station.chargers, 0);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${(totalRevenue / 1000).toFixed(1)}k</p>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Chargers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeChargers}/{totalChargers}</p>
              <p className="text-sm text-gray-600 mt-2">{((activeChargers/totalChargers)*100).toFixed(0)}% utilization</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalSessions}</p>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.3% from last month
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{alerts.length}</p>
              <p className="text-sm text-orange-600 mt-2">Requires attention</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Utilization Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
        </div>
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
              <AlertCircle className={`w-5 h-5 mr-3 mt-0.5 ${
                alert.type === 'maintenance' ? 'text-red-600' :
                alert.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
              }`} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{alert.station}</p>
                <p className="text-sm text-gray-600">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Station Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center" onClick={handleAddStation}>
          <MapPin className="w-4 h-4 mr-2" />
          Add New Station
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stationData.map(station => (
          <div key={station.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{station.name}</h3>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {station.location}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                station.status === 'operational' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {station.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Active Chargers</p>
                <p className="text-2xl font-bold text-gray-900">{station.active}/{station.chargers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{station.utilization}%</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Monthly Revenue</span>
                <span className="font-medium text-gray-900">${station.revenue}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${station.utilization}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedStation(station)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                View Details
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Charger Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chargerTypes}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {chargerTypes.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {chargerTypes.map(type => (
              <div key={type.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: type.color }} />
                  <span className="text-sm text-gray-600">{type.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{type.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Analytics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Generate Reports</h3>
          <div className="flex gap-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Average Session Duration</p>
            <p className="text-2xl font-bold text-gray-900">42 min</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Average Energy Delivered</p>
            <p className="text-2xl font-bold text-gray-900">28.5 kWh</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Average Revenue/Session</p>
            <p className="text-2xl font-bold text-gray-900">$8.45</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Configuration</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level 2 Rate (per kWh)</label>
              <input type="number" defaultValue="0.35" step="0.01" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DC Fast Rate (per kWh)</label>
              <input type="number" defaultValue="0.45" step="0.01" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="peak" className="mr-2" />
            <label htmlFor="peak" className="text-sm text-gray-700">Enable peak hour pricing</label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Maintenance alerts</label>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Revenue reports</label>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">System updates</label>
            <input type="checkbox" className="toggle" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration & API</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="flex gap-2">
              <input type="text" value="sk_live_••••••••••••••••" readOnly className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-gray-50" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Regenerate</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CPO Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Calendar className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Users className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                OP
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('stations')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'stations' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Stations
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'stations' && renderStations()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
}