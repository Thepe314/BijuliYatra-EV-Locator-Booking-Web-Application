import React, { useEffect, useState } from 'react';
import {
  User,
  Car,
  CreditCard,
  Bell,
  Lock,
  Mail,
  Phone,
  MapPin,
  Save,
  Edit2,
  Zap,
} from 'lucide-react';
import { userService } from '../../Services/api';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '', // ROLE_EV_OWNER | ROLE_CHARGER_OPERATOR | ROLE_ADMIN
  });

  const [notifications, setNotifications] = useState({
    bookingReminders: true,
    chargingComplete: true,
    promotions: false,
    maintenance: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getCurrentProfile();
        setProfileData({
          name: data.fullName,
          email: data.email,
          phone: data.phoneNumber,
          address: data.address,
          role: data.role, // ROLE_EV_OWNER / ROLE_CHARGER_OPERATOR / ROLE_ADMIN
        });
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading profile…</p>
      </div>
    );
  }

  const initials =
    profileData.name && profileData.name.trim().length > 0
      ? profileData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : '?';

  const roleLabel =
    profileData.role === 'ROLE_EV_OWNER'
      ? 'EV Owner'
      : profileData.role === 'ROLE_CHARGER_OPERATOR'
      ? 'Charging Station Operator'
      : profileData.role === 'ROLE_ADMIN'
      ? 'Admin'
      : 'User';


    const handleSave = async () => {
  try {
    const updated = await userService.updateCurrentProfile({
      fullName: profileData.name,
      email: profileData.email,
      phoneNumber: profileData.phone,
      address: profileData.address,
      role: profileData.role, // optional
    });
    // sync state with backend response
    setProfileData({
      name: updated.fullName,
      email: updated.email,
      phone: updated.phoneNumber,
      address: updated.address,
      role: updated.role,
    });
    setEditMode(false);
  } catch (e) {
    console.error('Failed to update profile', e);
  }
};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar similar to app header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900">BijuliYatra</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900">My Profile</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left column: main profile content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal information card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Personal Information
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage your account and preferences
                  </p>
                </div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 px-4 py-2 text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-50 text-xs font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {profileData.name}
                  </h3>
                  <p className="text-xs text-slate-500">{roleLabel}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    <User className="w-3 h-3 inline mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    <Phone className="w-3 h-3 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    <Mail className="w-3 h-3 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    Address
                  </label>
                  <textarea
                    rows={2}
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>
              </div>
                {editMode && (
                  <div className="mt-5">
                    <button
                      onClick={handleSave}
                      className="w-full md:w-auto px-5 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                )}
            </div>

            {/* Tabs (no vehicles/stats for now) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                {activeTab === 'profile' && (
                  <p className="text-xs text-slate-500">
                    Use the personal information card above to update your
                    details.
                  </p>
                )}

                {activeTab === 'payment' && <PaymentSection />}

                {activeTab === 'notifications' && (
                  <NotificationsSection
                    notifications={notifications}
                    setNotifications={setNotifications}
                  />
                )}

                {activeTab === 'security' && <SecuritySection />}
              </div>
            </div>
          </div>

          {/* Right column: for now just quick actions */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2 text-xs">
                <button className="w-full py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                  Download Invoices
                </button>
                <button className="w-full py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                  Refer &amp; Earn
                </button>
                <button className="w-full py-2 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Simple subsections --- */

function PaymentSection() {
  return (
    <p className="text-xs text-slate-500">
      Payment methods and billing history will appear here.
    </p>
  );
}

function NotificationsSection({ notifications, setNotifications }) {
  return (
    <div className="space-y-3">
      {Object.entries(notifications).map(([key, value]) => (
        <div
          key={key}
          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
        >
          <div>
            <p className="text-xs font-medium text-slate-900">
              {key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())}
            </p>
          </div>
          <button
            onClick={() =>
              setNotifications({ ...notifications, [key]: !value })
            }
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              value ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

function SecuritySection() {
  return (
    <p className="text-xs text-slate-500">
      Security options such as password and 2FA configuration will appear here.
    </p>
  );
}
