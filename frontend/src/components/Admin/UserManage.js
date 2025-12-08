import React, { useState, useEffect } from 'react';
import { 
  Search, Mail, Phone, Edit, Trash2, Loader, CheckCircle,
  Settings, LogOut, ChevronDown, Menu, X, Zap, Users, 
  LayoutDashboard, Building2 
} from 'lucide-react';
import { userService, authService } from '../../Services/api';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer} from 'react-toastify';

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
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const navigate = useNavigate();

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

      const mappedUsers = data.map(user => {
        const userTypeMap = {
          'EV_OWNER': 'EV Owner',
          'CHARGER_OPERATOR': 'Charger Operator',
          'ADMIN': 'Admin'
        };

        return {
          id: user.user_id,
          name: user.fullname || 'Unknown User',
          email: user.email,
          phone: user.phoneNumber || 'N/A',
          status: user.status === 'ACTIVE' ? 'Active' : 'Inactive',
          rawStatus: user.status,
          joinDate: new Date(user.joinDate).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric' 
          }),
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

  const changeUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'INACTIVE' : 'ACTIVE';
    const newDisplay = newStatus === 'ACTIVE' ? 'Active' : 'Inactive';

    setUpdatingStatus(userId);
    try {
      await userService.changeUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newDisplay, rawStatus: newStatus } : u
      ));
      setSuccessMessage(`User status updated to ${newDisplay}`);
    } catch (err) {
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
      await userService.deleteUser(userId); 

      // Remove from UI
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
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status.toLowerCase() === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const activeUsers = users.filter(u => u.status === 'Active').length;
  const evOwners = users.filter(u => u.role === 'EV_OWNER').length;
  const chargerOps = users.filter(u => u.role === 'CHARGER_OPERATOR').length;

  const handleLogout = async () => {
    try { await authService.logout(); } catch (err) {}
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Station Management', icon: Building2, path: '/stationmanagement' },
    { name: 'User Management', icon: Users, path: '/usermanagement', current: true },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Full Height */}
        <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        style={{ zIndex: 9999 }}
      />
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen sticky top-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">BijuliYatra</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="mx-auto p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.current 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.current ? 'text-blue-700' : 'text-gray-500'}`} />
              {sidebarOpen && <span className="text-sm">{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all ${!sidebarOpen && 'justify-center'}`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">admin@bijuliyatra.com</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                <button className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-3">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500 mt-1">Manage and monitor all user accounts</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2">
              Add New User
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">

            {/* Success Message */}
            {successMessage && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-red-600">Error</div>
                  <p className="text-red-800">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-600 text-sm">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeUsers}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-gray-600 text-sm">EV Owners</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{evOwners}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-gray-600 text-sm">Charger Operators</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{chargerOps}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="EV_OWNER">EV Owner</option>
                  <option value="CHARGER_OPERATOR">Charger Operator</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              {loading ? (
                <div className="p-16 text-center">
                  <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-16 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No users found</p>
                  <p className="text-gray-400 mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center">
                              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                {user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">ID: {user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                {user.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                {user.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'EV_OWNER' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {user.userType}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <button
                              onClick={() => changeUserStatus(user.id, user.status)}
                              disabled={updatingStatus === user.id}
                              className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-medium transition-all ${
                                user.status === 'Active'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              } disabled:opacity-50`}
                            >
                              {updatingStatus === user.id ? (
                                <>Updating...</>
                              ) : (
                                user.status
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-600">
                            {user.city}{user.district ? `, ${user.district}` : ''}
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-600">
                            {user.joinDate}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                                <Edit className="w-4.5 h-4.5 text-gray-600" />
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                disabled={deleting}
                                className="p-2.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4.5 h-4.5 text-red-600" />
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
    </div>
  );
}