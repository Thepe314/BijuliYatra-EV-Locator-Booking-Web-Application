// src/pages/admin/RequestManagement.jsx
import React, { useEffect, useState } from "react";
import {
  Zap,
  Settings,
  Users,
  LayoutDashboard,
  Building2,
  Book,
  LogOut,
  Menu,
  X,
  ChevronDown,
  AlertCircle,
  Loader,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService, authService } from "../../Services/api";
import { notify } from "../../Utils/notify";

export default function RequestManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [pendingOperators, setPendingOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [updatingId, setUpdatingId] = useState(null);

  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Stations", icon: Building2, path: "/admin/stationmanagement" },
    { name: "Users", icon: Users, path: "/admin/usermanagement" },
    { name: "Bookings", icon: Book, path: "/admin/bookingmanagement" },
    { name: "Requests", icon: Users, path: "/admin/requestmanagement" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const fetchRequests = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const users = await userService.listUsers();
      const filtered = (users || []).filter((u) => {
        const typeOk = u.userType === "CHARGER_OPERATOR";
        const status = (u.status || "").toLowerCase();
        return typeOk && ["pending", "active", "cancelled"].includes(status);
      });
      setPendingOperators(filtered);
    } catch (err) {
      console.error("Error fetching operator requests:", err);
      setError("Failed to load operator requests. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {}
    notify.logout();
    navigate("/login");
  };

  const handleDecision = async (userId, decision) => {
    const newStatus = decision === "accept" ? "active" : "cancelled";
    try {
      setUpdatingId(userId);
      await userService.updateUserStatus(userId, newStatus);
      notify.success(
        decision === "accept"
          ? "Operator approved successfully."
          : "Operator request declined."
      );
      setPendingOperators((prev) =>
        prev.map((op) =>
          op.user_id === userId ? { ...op, status: newStatus } : op
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      notify.error("Failed to update operator status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // apply filters
  const filteredRequests = pendingOperators.filter((op) => {
    const text = `${op.fullname || ""} ${op.email || ""} ${
      op.phoneNumber || ""
    } ${op.companyName || ""}`.toLowerCase();
    const matchesSearch = text.includes(searchTerm.toLowerCase());

    const status = (op.status || "").toLowerCase();
    const matchesStatus =
      statusFilter === "all" || status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
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
                <div className="bg-emerald-500/90 p-2 rounded-lg shadow-md shadow-emerald-500/40">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-sm text-slate-900">
                  BijuliYatra
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg"
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
          {navigationItems.map((item) => {
            const isCurrent = item.path === "/admin/requestmanagement";
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isCurrent
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isCurrent ? "text-emerald-500" : "text-slate-500"
                  }`}
                />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
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
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
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
        <header className="bg-white/90 border-b border-slate-200 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Operator Requests
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Review and approve new charger operator signups.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchRequests(true)}
                disabled={refreshing}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-2 hover:bg-slate-100 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-700 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5" />
                <p className="text-sm text-rose-800 flex-1">{error}</p>
                <button
                  onClick={() => setError("")}
                  className="text-rose-500 hover:text-rose-700 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pending">Pending only</option>
                  <option value="all">All (pending, active, cancelled)</option>
                  <option value="active">Approved</option>
                  <option value="cancelled">Declined</option>
                </select>
              </div>
            </div>

            {/* Requests list */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-900">
                  Pending operator signup requests
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Approve or decline requests to become charging station
                  operators.
                </p>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <Users className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-sm">No matching requests.</p>
                </div>
              ) : (
                <div className="p-5 space-y-4 max-h-[520px] overflow-y-auto">
                  {filteredRequests.map((op) => {
                    const status = (op.status || "").toLowerCase();
                    const statusColor =
                      status === "active"
                        ? "text-emerald-600"
                        : status === "cancelled"
                        ? "text-rose-600"
                        : "text-amber-600";
                    const statusLabel =
                      status === "active"
                        ? "Approved"
                        : status === "cancelled"
                        ? "Declined"
                        : "Pending";

                    return (
                      <div
                        key={op.user_id}
                        className="flex items-center justify-between px-4 py-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-base text-slate-900">
                            {op.fullname || "Operator"}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {op.companyName || "Individual operator"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {op.email || "No email"} •{" "}
                            {op.phoneNumber || "No phone"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Status:{" "}
                            <span className={`font-semibold ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleDecision(op.user_id, "decline")
                            }
                            disabled={
                              updatingId === op.user_id || status !== "pending"
                            }
                            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-4 h-4" />
                            Decline
                          </button>
                          <button
                            onClick={() =>
                              handleDecision(op.user_id, "accept")
                            }
                            disabled={
                              updatingId === op.user_id || status !== "pending"
                            }
                            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
