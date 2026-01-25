import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  
} from "recharts";
import {
  Zap,
  TrendingUp,
  AlertCircle,
  Activity,
  MapPin,
  Users,
  Download,
  Loader,
  RefreshCw,
  Edit,
  Trash2,
  LogOut,
  Settings as SettingsIcon,
  User as UserIcon,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { stationService, authService, bookingService } from "../../Services/api";
import { toast, ToastContainer } from "react-toastify";
import notify from "../../Utils/notify";
import { api } from "../../Services/api";

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationData, setStationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [operatorStats, setOperatorStats] = useState({ totalRevenue: 0, paymentMethods: [] });
  const monthlySessions = operatorStats.monthlySessions || [];

  const [revenueData, setRevenueData] = useState([]);
  // profile dropdown state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);


  const utilizationData = [
    { hour: "00:00", usage: 12 },
    { hour: "04:00", usage: 8 },
    { hour: "08:00", usage: 45 },
    { hour: "12:00", usage: 68 },
    { hour: "16:00", usage: 82 },
    { hour: "20:00", usage: 56 },
  ];

  const alerts = [
    {
      id: 1,
      type: "maintenance",
      station: "Charger requires maintenance",
      message: "Regular maintenance check needed",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "warning",
      station: "High demand detected",
      message: "Consider adding more chargers",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "info",
      station: "Peak hours approaching",
      message: "Prepare for increased usage",
      time: "1 day ago",
    },
  ];

  // Initial fetch
  useEffect(() => {
    fetchStations();

    api.get('/operator/stats').then(res => setOperatorStats(res.data));
}, []);
 



  const fetchStations = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await stationService.listStationOperator();
      console.log("Fetched stations:", data);

      const transformedStations = (Array.isArray(data) ? data : []).map(
  (station) => {
    const level2 = station.level2Chargers || 0;
    const dcFast = station.dcFastChargers || 0;
    const totalChargers = level2 + dcFast;
    const activeChargers = Math.floor(totalChargers * 0.3);
    const utilization =
      totalChargers > 0
        ? Math.round((activeChargers / totalChargers) * 100)
        : 0;

    const normalizedStatus =
      station.status?.toLowerCase() === 'operational' ||
      station.status?.toLowerCase() === 'active'
        ? 'operational'
        : 'maintenance';

    return {
      id: station.id,
      name: station.name,
      location: station.location || station.address,
      chargers: totalChargers,
      active: activeChargers,
      revenue: 0,
      utilization,
      status: normalizedStatus,
      level2Chargers: level2,
      dcFastChargers: dcFast,
      level2Rate: station.level2Rate || 0,
      dcFastRate: station.dcFastRate || 0,
      city: station.city,
      state: station.state,
      address: station.address,
      zipCode: station.zipCode,
      peakPricing: station.peakPricing,
      notes: station.notes,
      createdAt: station.createdAt,
       imageUrl: station.imageUrl
    }
    });

    

setStationData(transformedStations);
    } catch (err) {
      console.error("Error fetching stations:", err);

      if (err.response?.status === 404) {
        setError("Stations endpoint not found. Please check backend.");
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Authentication failed. Please log in again.");
      } else if (!err.response) {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError(err.response?.data?.message || "Failed to load stations.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  

  const handleViewDetails = (id) => {
    navigate(`/stationdetails/${id}`);
  };

  const handleAddStation = () => {
    navigate("/operator/addstation");
  };

  const handleEditStation = (stationId) => {
    navigate(`/operator/editstation/${stationId}`);
  };

  const handleDeleteStation = async (stationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this station? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await stationService.deleteStation(stationId);

      setStationData((prev) => prev.filter((s) => s.id !== stationId));

      toast.success("Station deleted successfully!", {
        icon: "✅",
        style: { background: "#10b981", color: "white" },
      });
    } catch (err) {
      console.error("Error deleting station:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to delete station. Please try again.";

      toast.error(msg, {
        icon: "⚠️",
      });
    }
  };

  const handleLogout = async () => {
  try {
    await authService.logout();

    // use notify.logout helper
    notify.logout('You have been logged out.', {
      icon: '🔒',
    });

    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 800);
  } catch (err) {
    console.error('Logout failed:', err);
    notify.error('Logout failed. Please close the browser tab.', {
      icon: '⚠️',
    });
    navigate('/login', { replace: true });
  }
};

  // Aggregated metrics
  const totalRevenue = stationData.reduce(
    (sum, station) => sum + (station.revenue || 0),
    0
  );
  const totalSessions = revenueData.reduce(
    (sum, item) => sum + item.sessions,
    0
  );
  const activeChargers = stationData.reduce(
    (sum, station) => sum + (station.active || 0),
    0
  );
  const totalChargers = stationData.reduce(
    (sum, station) => sum + (station.chargers || 0),
    0
  );
  const operationalStations = stationData.filter(
    (s) => s.status === "operational"
  ).length;

  const totalLevel2 = stationData.reduce(
    (sum, station) => sum + (station.level2Chargers || 0),
    0
  );
  const totalDCFast = stationData.reduce(
    (sum, station) => sum + (station.dcFastChargers || 0),
    0
  );

  const chargerTypes = [
    { name: "Level 2 (AC)", value: totalLevel2, color: "#3b82f6" },
    { name: "DC Fast", value: totalDCFast, color: "#10b981" },
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  const totalStationRevenue = operatorStats.totalRevenue;  

  // close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Fetch bookings when Bookings tab opened first time
  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError(null);
      const data = await bookingService.listBookings(); // /bookings, role-based
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookingsError(
        err.response?.data?.message || "Failed to load bookings."
      );
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "bookings" && bookings.length === 0 && !bookingsLoading) {
      fetchBookings();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render helpers

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stationData.length}
              </p>
              <p className="text-sm text-green-600 mt-2">
                {operationalStations} operational
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Chargers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {activeChargers}/{totalChargers}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {totalChargers > 0
                  ? Math.round((activeChargers / totalChargers) * 100)
                  : 0}
                % utilization
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

         <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                NPR {totalStationRevenue?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-600 mt-2">
                +12.5% from last month
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>


        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
             <p className="text-3xl font-bold text-gray-900 mt-2">{operatorStats.totalSessions}</p>
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

       
        {/* <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {alerts.length}
              </p>
              <p className="text-sm text-orange-600 mt-2">
                Requires attention
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div> */}
      </div>
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={operatorStats.paymentMethods} 
                dataKey="count" 
                nameKey="method" 
                cx="50%" cy="50%" 
                outerRadius={80}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                fill="#8884d8">
              {operatorStats.paymentMethods.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
        

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Utilization Pattern
          </h3>
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
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Alerts
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start p-4 bg-gray-50 rounded-lg"
            >
              <AlertCircle
                className={`w-5 h-5 mr-3 mt-0.5 ${
                  alert.type === "maintenance"
                    ? "text-red-600"
                    : alert.type === "warning"
                    ? "text-orange-600"
                    : "text-blue-600"
                }`}
              />
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
      <div className="flex gap-3">
        <button
          onClick={() => fetchStations(true)}
          disabled={refreshing}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        <button
         className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          onClick={handleAddStation}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Add New Station
        </button>
      </div>
    </div>

    {error && (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-xs mt-2"
          >
            Dismiss
          </button>
        </div>
      </div>
    )}

    {loading ? (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <p className="text-gray-600">Loading stations...</p>
      </div>
    ) : stationData.length === 0 ? (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Stations Found
        </h3>
        <p className="text-gray-600 mb-4">
          Get started by adding your first charging station.
        </p>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          onClick={handleAddStation}
        >
          <MapPin className="w-4 h-4" />
          Create First Station
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stationData.map((station) => {
          const imgSrc =
            station.imageUrl || '/assets/fallback-station.jpg';

          return (
            <div
              key={station.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image banner */}
              <div className="h-32 w-full overflow-hidden">
                <img
                  src={imgSrc}
                  alt={station.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {station.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {station.location}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {station.city}, {station.state} {station.zipCode}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      station.status === 'operational'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {station.status === 'operational'
                      ? 'Operational'
                      : 'Maintenance'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Chargers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {station.active}/{station.chargers}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      L2 {station.level2Chargers} • DC {station.dcFastChargers}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Utilization</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {station.utilization}%
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          station.utilization >= 80
                            ? 'bg-red-500'
                            : station.utilization >= 60
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${station.utilization}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-gray-600">L2 Rate</p>
                    <p className="font-semibold text-gray-900">
                      {station.level2Rate}/kWh
                    </p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-gray-600">DC Rate</p>
                    <p className="font-semibold text-gray-900">
                      {station.dcFastRate}/kWh
                    </p>
                  </div>
                </div>

                {station.peakPricing && (
                  <div className="mb-2">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                      Peak Pricing Enabled
                    </span>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t border-gray-200">
                <button
                  onClick={() => handleViewDetails(station.id)}
                  className="text-sm text-blue-600 font-medium hover:text-blue-800"
                >
                  View Details
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditStation(station.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteStation(station.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
        <button
          onClick={fetchBookings}
          disabled={bookingsLoading}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${bookingsLoading ? "animate-spin" : ""}`}
          />
          {bookingsLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {bookingsError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 text-sm">{bookingsError}</p>
          </div>
          <button
            onClick={() => setBookingsError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {bookingsLoading && bookings.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600">
            Bookings made by EV owners for your stations will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Station
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EV Owner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connector
                  </th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    kWh (est)
                  </th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 text-gray-700">#{b.id}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {b.stationName || b.station?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {b.evOwnerName || b.evOwnerEmail || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="flex flex-col">
                        <span>
                          {b.startTime
                            ? b.startTime.replace("T", " ").slice(0, 16)
                            : "—"}{" "}
                          →{" "}
                          {b.endTime
                            ? b.endTime.replace("T", " ").slice(0, 16)
                            : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {b.connectorType}
                    </td>
                    {/* <td className="px-4 py-3 text-gray-700">
                      {b.estimatedKwh?.toFixed
                        ? b.estimatedKwh.toFixed(1)
                        : b.estimatedKwh}
                    </td> */}
                    <td className="px-4 py-3 text-gray-700">
                      NPR
                      {b.totalAmount?.toFixed
                        ? b.totalAmount.toFixed(2)
                        : b.totalAmount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          b.status === "CONFIRMED" ||
                          b.status === "IN_PROGRESS"
                            ? "bg-green-100 text-green-700"
                            : b.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

 const renderAnalytics = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Charger Distribution - 1/3 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Charger Distribution
        </h3>
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
          {chargerTypes.map((type) => (
            <div
              key={type.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-sm text-gray-600">{type.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {type.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Analytics - 2/3 */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Booking Analytics
          </h3>
          <div className="text-sm text-gray-500">
            {operatorStats.totalSessions || 0} total sessions
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlySessions} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#f8fafc"/>
            <XAxis 
              dataKey="month" 
              fontSize={12}
              tick={{ fill: '#64748b' }}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="sessions" 
              fill="url(#sessionsGradient)"
              radius={[4, 4, 0, 0]}
              stroke="#7c3aed"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center text-xs">
          <div className="flex items-center mr-6">
            <div className="w-3 h-3 bg-gradient-to-b from-[#8b5cf6] to-[#a78bfa] rounded mr-2"></div>
            <span className="text-gray-700 font-medium">Bookings</span>
          </div>
          <div className="text-sm text-gray-500">
            {monthlySessions.reduce((sum, m) => sum + m.sessions, 0)} Bookings this year
          </div>
        </div>
      </div>

      {/* Generate Reports*/}
      <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-4 lg:p-6 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Generate Reports</h3>
          <div className="flex gap-2 w-full lg:w-auto">
            <select className="flex-1 lg:flex-none border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm whitespace-nowrap">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 px-2 lg:px-0">
          <div className="group p-6 border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
            <p className="text-sm text-gray-600 mb-2 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-blue-600" />
              Total Stations
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stationData.length}</p>
            <p className="text-xs text-emerald-600 font-medium">{stationData.length > 0 ? '+2 this month' : 'Get started'}</p>
          </div>

          <div className="group p-6 border border-gray-100 rounded-xl hover:shadow-lg hover:border-green-200 transition-all bg-gradient-to-br from-green-50/50 to-emerald-50/50">
            <p className="text-sm text-gray-600 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-green-600" />
              Total Chargers
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{totalChargers}</p>
            <p className="text-xs text-emerald-600 font-medium">Avg {Math.round(totalChargers / (stationData.length || 1))} per station</p>
          </div>

          <div className="group p-6 border border-gray-100 rounded-xl hover:shadow-lg hover:border-orange-200 transition-all bg-gradient-to-br from-orange-50/50 to-amber-50/50">
            <p className="text-sm text-gray-600 mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-orange-600" />
              Avg Utilization
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stationData.length > 0 
                ? Math.round(stationData.reduce((sum, s) => sum + s.utilization, 0) / stationData.length)
                : 0}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="h-2 rounded-full transition-all bg-gradient-to-r from-green-500 to-blue-500"
                style={{ 
                  width: `${Math.min(100, (stationData.reduce((sum, s) => sum + s.utilization, 0) / stationData.length) || 0)}%`
                }}
              />
            </div>
          </div>

          <div className="group p-6 border border-gray-100 rounded-xl hover:shadow-lg hover:border-purple-200 transition-all bg-gradient-to-br from-purple-50/50 to-violet-50/50">
            <p className="text-sm text-gray-600 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
              Revenue (NPR)
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{operatorStats.totalRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-emerald-600 font-medium">+12.5% vs last month</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Default Pricing Configuration
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level 2 Rate (per kWh)
              </label>
              <input
                type="number"
                defaultValue="0.35"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DC Fast Rate (per kWh)
              </label>
              <input
                type="number"
                defaultValue="0.45"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="peak" className="mr-2" />
            <label htmlFor="peak" className="text-sm text-gray-700">
              Enable peak hour pricing by default
            </label>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Save Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notification Preferences
        </h3>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Integration & API
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value="sk_live_••••••••••••••••"
                readOnly
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    // Wrapper
<div className="min-h-screen bg-slate-50 flex">
  <ToastContainer position="top-right" autoClose={3000} theme="colored" />

  {/* LEFT SIDEBAR */}
  <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
  {/* Brand */}
  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
    <div className="h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
            <Zap className="w-6 h-6 text-white" />
          </div>
    <div>
      <p className="text-base font-semibold text-slate-900">BijuliYatra</p>
      <p className="text-xs text-slate-500">Operator Portal</p>
    </div>
  </div>

  {/* Scrollable nav */}
  <nav className="flex-1 px-3 py-4 space-y-1 text-base overflow-y-auto">
    <button
      onClick={() => setActiveTab("overview")}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
        activeTab === "overview"
          ? "bg-emerald-50 text-emerald-700 font-medium"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Activity className="w-5 h-5" />
      Dashboard
    </button>

    <button
      onClick={() => setActiveTab("stations")}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
        activeTab === "stations"
          ? "bg-emerald-50 text-emerald-700 font-medium"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Building2 className="w-5 h-5" />
      Stations
    </button>

    <button
      onClick={() => setActiveTab("bookings")}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
        activeTab === "bookings"
          ? "bg-emerald-50 text-emerald-700 font-medium"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Users className="w-5 h-5" />
      Bookings
    </button>

    <button
      onClick={() => setActiveTab("analytics")}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
        activeTab === "analytics"
          ? "bg-emerald-50 text-emerald-700 font-medium"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <TrendingUp className="w-5 h-5" />
      Analytics
    </button>

    <button
      onClick={() => setActiveTab("settings")}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
        activeTab === "settings"
          ? "bg-emerald-50 text-emerald-700 font-medium"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <SettingsIcon className="w-5 h-5" />
      Settings
    </button>
  </nav>

  {/* Logout */}
  <div className="px-3 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50"
    >
      <LogOut className="w-5 h-5" />
      Logout
    </button>
  </div>
</aside>

      {/* RIGHT MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Operator Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                Monitor your stations, utilization and bookings.
              </p>
            </div>

            <div className="flex items-center gap-3" ref={profileMenuRef}>
              <button
                onClick={() => fetchStations(true)}
                disabled={refreshing}
                className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                title="Refresh stations"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-500 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>

              <button
                onClick={() => setIsProfileMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-slate-50"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
                  OP
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-900">
                    Operator
                  </p>
                  <p className="text-[11px] text-slate-500">
                    operator@bijuliyatra.com
                  </p>
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-6 top-14 w-56 bg-white rounded-xl shadow-lg border border-slate-100 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">
                      Operator
                    </p>
                    <p className="text-[11px] text-slate-500">
                      operator@bijuliyatra.com
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <UserIcon className="w-4 h-4 mr-2 text-slate-400" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setActiveTab('settings');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <SettingsIcon className="w-4 h-4 mr-2 text-slate-400" />
                    Settings
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* TAB BUTTONS ROW */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex gap-2 text-xs">
            {['overview', 'stations', 'bookings', 'analytics', 'settings'].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full font-medium ${
                    activeTab === tab
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
        

        {/* MAIN CONTENT*/}
        <main className="flex-1 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="w-8 h-8 animate-spin text-emerald-500 mr-3" />
                <p className="text-sm text-slate-600">
                  Loading stations…
                </p>
              </div>
            ) : error ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
                {error}
              </div>
            ) : activeTab === "overview" ? (
              renderOverview()
            ) : activeTab === "stations" ? (
              renderStations()
            ) : activeTab === "bookings" ? (
              renderBookings()
            ) : activeTab === "analytics" ? (
              renderAnalytics()
            ) : (
              renderSettings()
            )}
          </div>
        </main>
      </div>
    </div>
   
  );
}