import React, { useState } from 'react';
import { User, Car, CreditCard, Bell, Lock, Mail, Phone, MapPin, Save, Edit2 } from 'lucide-react';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);

  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, New York, NY 10001',
  });

  const [vehicles, setVehicles] = useState([
    { id: 1, make: 'Tesla', model: 'Model 3', year: 2022, battery: '75 kWh', primary: true },
    { id: 2, make: 'Nissan', model: 'Leaf', year: 2021, battery: '62 kWh', primary: false },
  ]);

  const [notifications, setNotifications] = useState({
    bookingReminders: true,
    chargingComplete: true,
    promotions: false,
    maintenance: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'vehicles', label: 'My Vehicles', icon: Car },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      {editMode ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  <div className="flex items-center gap-6 mb-8 pb-8 border-b">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{profileData.name}</h3>
                      <p className="text-gray-600">Member since January 2024</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!editMode}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!editMode}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!editMode}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Address
                      </label>
                      <textarea
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        disabled={!editMode}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {editMode && (
                      <button className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <Save className="w-5 h-5" />
                        Save Changes
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Vehicles Tab */}
              {activeTab === 'vehicles' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">My Vehicles</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      + Add Vehicle
                    </button>
                  </div>

                  <div className="space-y-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{vehicle.make} {vehicle.model}</h3>
                            <p className="text-sm text-gray-600">Year: {vehicle.year}</p>
                          </div>
                          {vehicle.primary && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Battery Capacity</p>
                            <p className="font-medium text-gray-900">{vehicle.battery}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Charging Port</p>
                            <p className="font-medium text-gray-900">Type 2 / CCS</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                            Edit
                          </button>
                          <button className="flex-1 px-4 py-2 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Tab */}
              {activeTab === 'payment' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Methods</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="border-2 border-blue-500 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                          <div>
                            <p className="font-bold text-gray-900">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-600">Expires 12/25</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Default
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                          Edit
                        </button>
                        <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <button className="w-full px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors">
                    + Add Payment Method
                  </button>

                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-4">Billing History</h3>
                    <div className="space-y-3">
                      {[
                        { date: 'Oct 10, 2024', amount: '$25.00', status: 'Paid' },
                        { date: 'Oct 5, 2024', amount: '$42.00', status: 'Paid' },
                        { date: 'Sep 28, 2024', amount: '$18.50', status: 'Paid' },
                      ].map((bill, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2">
                          <div>
                            <p className="font-medium text-gray-900">{bill.amount}</p>
                            <p className="text-sm text-gray-600">{bill.date}</p>
                          </div>
                          <span className="text-sm text-green-600 font-medium">{bill.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </p>
                          <p className="text-sm text-gray-600">
                            {key === 'bookingReminders' && 'Get reminded about your upcoming bookings'}
                            {key === 'chargingComplete' && 'Notification when charging is complete'}
                            {key === 'promotions' && 'Receive special offers and promotions'}
                            {key === 'maintenance' && 'System maintenance and updates'}
                          </p>
                        </div>
                        <button
                          onClick={() => setNotifications({...notifications, [key]: !value})}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <input
                          type="password"
                          placeholder="Current Password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <h3 className="font-bold text-gray-900 mb-4">Two-Factor Authentication</h3>
                      <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
                      <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                        Enable 2FA
                      </button>
                    </div>

                    <div className="pt-6 border-t">
                      <h3 className="font-bold text-gray-900 mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">Current Device</p>
                            <p className="text-sm text-gray-600">Last active: Now</p>
                          </div>
                          <span className="text-green-600 text-sm font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}