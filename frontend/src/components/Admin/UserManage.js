import React, { useState, useEffect } from 'react';
import {
  Search, Mail, Phone, Edit, Trash2, Loader, CheckCircle,
  Settings, LogOut, ChevronDown, Menu, X, Zap, Users,
  LayoutDashboard, Building2, Book
} from 'lucide-react';
import { userService, authService } from '../../Services/api';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import notify from '../../Utils/notify';
import StationLocationPicker from '../../Services/StationLocationPicker';

export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    userType: "EV_OWNER",
    status: "ACTIVE",
    companyName: "",
    panVat: "",
    city: "",
    district: "",
      tempPassword: "",
    region: "",
    address: "",
    latitude: null,
    longitude: null,
  });

  const [reverseLoading, setReverseLoading] = useState(false);
  const [reverseError, setReverseError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.listUsers();

      const userTypeMap = {
        EV_OWNER: 'EV Owner',
        CHARGER_OPERATOR: 'Charger Operator',
        ADMIN: 'Admin'
      };

      const mappedUsers = data.map(user => {
        const apiStatus = (user.status || '').toString().toUpperCase();

        return {
          id: user.user_id,
          name: user.fullname || 'Unknown User',
          email: user.email,
          phone: user.phoneNumber || 'N/A',
          rawStatus: apiStatus,
          status: apiStatus === 'ACTIVE' ? 'Active' : 'Inactive',
          joinDate: user.joinDate
            ? new Date(user.joinDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              })
            : '—',
          userType: userTypeMap[user.userType] || user.userType,
          role: user.userType,
          city: user.city || '—',
          district: user.district || '',
          address: user.address || '',
        };
      });

      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const changeUserStatus = async (userId, currentRawStatus) => {
    const newStatus = currentRawStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const newDisplay = newStatus === 'ACTIVE' ? 'Active' : 'Inactive';

    setUpdatingStatus(userId);
    try {
      await userService.changeUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, status: newDisplay, rawStatus: newStatus }
          : u
      ));
      setSuccessMessage(`User status updated to ${newDisplay}`);
    } catch (err) {
      console.error('Failed to update status', err);
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await userService.deleteUser(userId);

      setUsers(prev => prev.filter(u => u.id !== userId));

      toast.success("Users deleted successfully!", {
        icon: "Deleted",
      });
    } catch (err) {
      console.error('Delete User failed:', err);

      let message = "Failed to delete User";
      if (err.response?.status === 400) {
        message = err.response?.data || "Cannot delete: User has bookings";
      } else if (err.response?.status === 403) {
        message = "Not authorized to delete this User";
      } else if (err.response?.status === 404) {
        message = "User not found";
      }

      toast.error(message, {
        icon: "Failed",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/admin/editUser/${userId}`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || user.rawStatus === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const activeUsers = users.filter(u => u.rawStatus === 'ACTIVE').length;
  const evOwners = users.filter(u => u.role === 'EV_OWNER').length;
  const chargerOps = users.filter(u => u.role === 'CHARGER_OPERATOR').length;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {}
    notify.logout();
    navigate("/login");
  };

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Stations', icon: Building2, path: '/admin/stationmanagement' },
    { name: 'Users', icon: Users, path: '/admin/usermanagement', current: true },
    { name: 'Bookings', icon: Book, path: '/admin/bookingmanagement' },
    { name: "Requests", icon: Users, path: "/admin/requestmanagement" },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        fullname: newUser.fullname,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        userType: newUser.userType,
        password: "Temp@1234",
        region: newUser.region || "N/A",
        city: newUser.city || null,
        district: newUser.district || null,
        address: newUser.address || null,
        latitude: newUser.latitude,
        longitude: newUser.longitude,
          password: newUser.tempPassword,
        // EV owner specific
        vehicleBrand: null,
        vehicleModel: null,
        vehicleYear: null,
        vehicleRegistrationNumber: null,
        chargingType: null,
        batteryCapacity: null,

        // Charger operator specific
        companyName:
          newUser.userType === "CHARGER_OPERATOR" ? newUser.companyName : null,
        companyRegistrationNo: null,
        companyPan:
          newUser.userType === "CHARGER_OPERATOR" ? newUser.panVat : null,
        companyLicenseNo: null,
        companyType: null,
        stationCount: null,
        openingHours: null,
        closingHours: null,
        chargePerKwh: null,
      };

      const created = await userService.createUser(payload);

      const apiStatus = (created.status || "").toString().toUpperCase();
      const userTypeMap = {
        EV_OWNER: "EV Owner",
        CHARGER_OPERATOR: "Charger Operator",
        ADMIN: "Admin",
      };

      const mapped = {
        id: created.user_id,
        name: created.fullname,
        email: created.email,
        phone: created.phoneNumber || "N/A",
        rawStatus: apiStatus,
        status: apiStatus === "ACTIVE" ? "Active" : "Inactive",
        joinDate: created.joinDate
          ? new Date(created.joinDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—",
        userType: userTypeMap[created.userType] || created.userType,
        role: created.userType,
        city: created.city || "—",
        district: created.district || "",
        address: created.address || "",
      };

      setUsers((prev) => [mapped, ...prev]);
      toast.success("User created and invite sent!");
      setShowAddModal(false);
      setNewUser({
        fullname: "",
        email: "",
        phoneNumber: "",
        userType: "EV_OWNER",
        status: "ACTIVE",
        city: "",
        district: "",
        region: "",
        address: "",
        companyName: "",
        panVat: "",
        latitude: null,
        longitude: null,
        tempPassword:"",
      });
    } catch (err) {
      console.error("Create user failed:", err);
      toast.error(err.response?.data || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  // reverse geocoding with Nominatim
  const reverseGeocode = async (lat, lng) => {
    setReverseLoading(true);
    setReverseError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "BijuliYatra-Admin-Panel/1.0 (your-email@example.com)",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to reverse geocode");
      const data = await res.json();

      const addr = data.address || {};

      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.suburb ||
        "";

      const district =
        addr.state_district ||
        addr.county ||
        addr.state ||
        "";

      const region =
        addr.state ||
        addr.region ||
        addr.province ||
        "";

      const fullAddress = data.display_name || "";

      setNewUser(prev => ({
        ...prev,
        city,
        district,
        region,
        address: fullAddress,
        latitude: lat,
        longitude: lng,
      }));
    } catch (e) {
      console.error(e);
      setReverseError("Could not fetch address for this location.");
      setNewUser(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    } finally {
      setReverseLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
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
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-slate-900">
                    BijuliYatra
                  </span>
                  
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
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
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                item.current
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  item.current ? "text-emerald-500" : "text-slate-400"
                }`}
              />
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* User menu */}
        <div className="border-t border-slate-200 p-4 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-all ${
                !sidebarOpen && "justify-center"
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-900 text-sm">Admin</p>
                    <p className="text-[11px] text-slate-500">
                      admin@bijuliyatra.com
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
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
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                User Management
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage and monitor all user accounts.
              </p>
            </div>
            <button
              className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-600 shadow-sm shadow-emerald-200 flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              Add New User
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Success */}
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-800 font-medium">
                  {successMessage}
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-rose-700">
                    Error
                  </span>
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-rose-600 hover:text-rose-800 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="bg-sky-100 w-11 h-11 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-sky-500" />
                </div>
                <p className="text-[11px] text-slate-500">Total Users</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {users.length}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="bg-emerald-100 w-11 h-11 rounded-xl flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-500">Active Users</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {activeUsers}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="bg-indigo-100 w-11 h-11 rounded-xl flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-[11px] text-slate-500">EV Owners</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {evOwners}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="bg-amber-100 w-11 h-11 rounded-xl flex items-center justify-center mb-3">
                  <Building2 className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-[11px] text-slate-500">Charger Operators</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {chargerOps}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-7 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Roles</option>
                  <option value="EV_OWNER">EV Owner</option>
                  <option value="CHARGER_OPERATOR">Charger Operator</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {/* Users table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-16 text-center">
                  <Loader className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
                  <p className="text-sm text-slate-500">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-16 text-center">
                  <Users className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm text-slate-600">No users found</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Try adjusting your filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">
                                  {user.name}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  ID: {user.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-[11px] text-slate-700">
                                <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                {user.email}
                              </div>
                              <div className="flex items-center text-[11px] text-slate-700">
                                <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                {user.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-3 py-1.5 rounded-full text-[11px] font-medium border ${
                                user.role === "ADMIN"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : user.role === "EV_OWNER"
                                  ? "bg-sky-50 text-sky-700 border-sky-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {user.userType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                changeUserStatus(user.id, user.rawStatus)
                              }
                              disabled={updatingStatus === user.id}
                              className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-medium transition-all border ${
                                user.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                              } disabled:opacity-50`}
                            >
                              {updatingStatus === user.id
                                ? "Updating..."
                                : user.status}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-[11px] text-slate-700">
                            {user.city}
                            {user.district ? `, ${user.district}` : ""}
                          </td>
                          <td className="px-6 py-4 text-[11px] text-slate-700">
                            {user.joinDate}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(user.id)}
                                disabled={editing}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-slate-600" />
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                disabled={deleting}
                                className="p-2 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
              <h2 className="text-sm font-semibold text-slate-900">
                Add New User
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ×
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <form className="px-6 py-5 space-y-4" onSubmit={handleCreateUser}>
                {/* Full name */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.fullname}
                    onChange={(e) =>
                      setNewUser({ ...newUser, fullname: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Temporary Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.tempPassword}
                      onChange={(e) =>
                        setNewUser({ ...newUser, tempPassword: e.target.value })
                      }
                      placeholder="e.g. Abc@1234 (share with user)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      User must change this password after first login.
                    </p>
                  </div>
                                  {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newUser.phoneNumber}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phoneNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Role & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={newUser.userType}
                      onChange={(e) =>
                        setNewUser({ ...newUser, userType: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="EV_OWNER">EV Owner</option>
                      <option value="CHARGER_OPERATOR">Charger Operator</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={newUser.status}
                      onChange={(e) =>
                        setNewUser({ ...newUser, status: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Extra fields for operator / owner */}
                {(newUser.userType === "EV_OWNER" ||
                  newUser.userType === "CHARGER_OPERATOR") && (
                  <>
                    {newUser.userType === "CHARGER_OPERATOR" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Company Name
                          </label>
                          <input
                            type="text"
                            value={newUser.companyName}
                            onChange={(e) =>
                              setNewUser({
                                ...newUser,
                                companyName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            PAN / VAT
                          </label>
                          <input
                            type="text"
                            value={newUser.panVat}
                            onChange={(e) =>
                              setNewUser({ ...newUser, panVat: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Region / City / District */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Region
                        </label>
                        <input
                          type="text"
                          value={newUser.region}
                          onChange={(e) =>
                            setNewUser({ ...newUser, region: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={newUser.city}
                          onChange={(e) =>
                            setNewUser({ ...newUser, city: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          District
                        </label>
                        <input
                          type="text"
                          value={newUser.district}
                          onChange={(e) =>
                            setNewUser({ ...newUser, district: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={newUser.address}
                        onChange={(e) =>
                          setNewUser({ ...newUser, address: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Location picker */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Location (click on map)
                      </label>
                      <div className="h-56 w-full overflow-hidden rounded-lg border border-slate-200">
                        <StationLocationPicker
                          value={
                            newUser.latitude && newUser.longitude
                              ? { lat: newUser.latitude, lng: newUser.longitude }
                              : null
                          }
                          onChange={({ lat, lng }) => {
                            reverseGeocode(lat, lng);
                          }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-500">
                        {reverseLoading
                          ? "Detecting address from map location..."
                          : newUser.address
                          ? `Selected: ${newUser.address}`
                          : "Click on the map to select a location and auto-fill address."}
                      </p>
                      {reverseError && (
                        <p className="text-[11px] text-red-500">
                          {reverseError}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  Note: The user will receive an email with login credentials and
                  setup instructions.
                </p>

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pt-2 pb-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 text-xs rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {creating ? "Creating..." : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
