import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Calendar,
  Save, X, ArrowLeft, CheckCircle, AlertCircle, Camera,
  Car, Zap, Building2
} from 'lucide-react';
import { userService } from '../../Services/api';

export default function EditUserPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    status: 'Active',
    address: '',
    city: '',
    region: '',
    district: '',
    joinDate: null,
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleRegistrationNumber: '',
    chargingType: '',
    batteryCapacity: '',
    companyName: '',
    companyRegistrationNo: '',
    companyPan: '',
    companyLicenseNo: '',
    companyType: '',
    stationCount: '',
    operatorChargingType: '',
    openingHours: '',
    closingHours: '',
    chargePerKwh: '',
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getUserType = (role) => {
    if (!role) return null;
    const roleLower = role.toLowerCase();
    if (roleLower.includes('ev') || roleLower.includes('owner')) return 'EV_OWNER';
    if (roleLower.includes('operator') || roleLower.includes('charger')) return 'CHARGER_OPERATOR';
    return 'ADMIN';
  };

  const mapApiToForm = (apiUser) => {
    const fullname = apiUser.fullname || apiUser.name || '';
    const nameParts = (fullname || '').trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      fullname,
      firstName,
      lastName,
      email: apiUser.email || '',
      phone: apiUser.phoneNumber || apiUser.phone || '',
      role: apiUser.role || apiUser.primaryRole || '',
      status: apiUser.status || 'Active',
      address: apiUser.address || '',
      city: apiUser.city || '',
      region: apiUser.region || '',
      district: apiUser.district || '',
      joinDate: apiUser.joinDate || apiUser.createdAt || null,
      vehicleBrand: apiUser.vehicleBrand || '',
      vehicleModel: apiUser.vehicleModel || '',
      vehicleYear: apiUser.vehicleYear || '',
      vehicleRegistrationNumber:
        apiUser.vehicleRegistrationNumber || apiUser.vehileRegistrationModel || '',
      chargingType: apiUser.chargingType || '',
      batteryCapacity: apiUser.batteryCapacity || '',
      companyName: apiUser.companyName || '',
      companyRegistrationNo: apiUser.companyRegistrationNo || '',
      companyPan: apiUser.companyPan || '',
      companyLicenseNo: apiUser.companyLicenseNo || '',
      companyType: apiUser.companyType || '',
      stationCount: apiUser.stationCount || '',
      operatorChargingType: apiUser.operatorChargingType || apiUser.chargingType || '',
      openingHours: apiUser.openingHours || '',
      closingHours: apiUser.closingHours || '',
      chargePerKwh: apiUser.chargePerKwh || '',
    };
  };

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setLoading(true);
      try {
        const apiUser = await userService.getUserById(userId);
        if (!mounted) return;

        setFormData((prev) => ({
          ...prev,
          ...mapApiToForm(apiUser),
        }));

        if (apiUser.avatarUrl || apiUser.avatar || apiUser.profileImage) {
          setProfileImage(apiUser.avatarUrl || apiUser.avatar || apiUser.profileImage);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        setNotification({ type: 'error', message: 'Unable to load user details.' });
        setTimeout(() => setNotification(null), 3000);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (userId) loadUser();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const userType = getUserType(formData.role);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';

    const phoneRegex = /^\+?[\d\s()-]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) newErrors.phone = 'Invalid phone format';

    if (!formData.role) newErrors.role = 'Role is required';

    if (userType === 'EV_OWNER') {
      if (!formData.vehicleBrand.trim()) newErrors.vehicleBrand = 'Vehicle brand is required';
      if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'Vehicle model is required';
    }

    if (userType === 'CHARGER_OPERATOR') {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.companyRegistrationNo.trim())
        newErrors.companyRegistrationNo = 'Registration number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      setNotification({ type: 'error', message: 'Please fix the errors before submitting' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setSaving(true);
    try {
      const basePayload = {
        fullname:
          (formData.fullname && formData.fullname.trim()) ||
          `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phoneNumber: formData.phone,
        role: formData.role,
        status: formData.status,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        district: formData.district,
      };

      let payload = { ...basePayload };

      if (userType === 'EV_OWNER') {
        payload = {
          ...payload,
          vehicleBrand: formData.vehicleBrand,
          vehicleModel: formData.vehicleModel,
          vehicleYear: formData.vehicleYear,
          vehicleRegistrationNumber: formData.vehicleRegistrationNumber,
          chargingType: formData.chargingType,
          batteryCapacity: formData.batteryCapacity,
        };
      } else if (userType === 'CHARGER_OPERATOR') {
        payload = {
          ...payload,
          companyName: formData.companyName,
          companyRegistrationNo: formData.companyRegistrationNo,
          companyPan: formData.companyPan,
          companyLicenseNo: formData.companyLicenseNo,
          companyType: formData.companyType,
          stationCount: formData.stationCount,
          chargingType: formData.operatorChargingType,
          openingHours: formData.openingHours,
          closingHours: formData.closingHours,
          chargePerKwh: formData.chargePerKwh,
        };
      }

      await userService.updateUser(userId, payload);
      setNotification({ type: 'success', message: 'User updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Update failed:', err);
      setNotification({ type: 'error', message: 'Failed to update user' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const initials =
    `${(formData.firstName || '').charAt(0) || ''}${(formData.lastName || '').charAt(0) || ''}` || 'U';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading user...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Edit User</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  {userType === 'EV_OWNER'
                    ? 'EV Owner Profile'
                    : userType === 'CHARGER_OPERATOR'
                    ? 'Charger Operator Profile'
                    : 'User Profile'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="p-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p
              className={`text-xs sm:text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {notification.message}
            </p>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 break-all">{formData.email}</p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${
                    formData.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {formData.status}
                </span>

                <span className="px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {formData.role}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 text-left">
                {userType === 'CHARGER_OPERATOR' && formData.companyName && (
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">{formData.companyName}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{' '}
                    {formData.joinDate
                      ? new Date(formData.joinDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {formData.city || 'N/A'}, {formData.region || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form className="bg-white rounded-lg shadow" onSubmit={handleSubmit}>
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 md:col-span-1">
                    <label
                      htmlFor="email"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 md:col-span-1">
                    <label
                      htmlFor="phone"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Account Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                        errors.role ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Role</option>
                      <option value="Admin">Admin</option>
                      <option value="EV Owner">EV Owner</option>
                      <option value="Charger Operator">Charger Operator</option>
                      <option value="Manager">Manager</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    {errors.role && (
                      <p className="text-xs text-red-600 mt-1">{errors.role}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {userType === 'EV_OWNER' && (
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Car className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Vehicle Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label
                        htmlFor="vehicleBrand"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Vehicle Brand *
                      </label>
                      <input
                        id="vehicleBrand"
                        name="vehicleBrand"
                        value={formData.vehicleBrand}
                        onChange={handleChange}
                        className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                          errors.vehicleBrand ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Tesla, Nissan"
                      />
                      {errors.vehicleBrand && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.vehicleBrand}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="vehicleModel"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Vehicle Model *
                      </label>
                      <input
                        id="vehicleModel"
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleChange}
                        className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                          errors.vehicleModel ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Model 3, Leaf"
                      />
                      {errors.vehicleModel && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.vehicleModel}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="vehicleYear"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Vehicle Year
                      </label>
                      <input
                        id="vehicleYear"
                        name="vehicleYear"
                        value={formData.vehicleYear}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                        placeholder="e.g., 2023"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="vehicleRegistrationNumber"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Registration Number
                      </label>
                      <input
                        id="vehicleRegistrationNumber"
                        name="vehicleRegistrationNumber"
                        value={formData.vehicleRegistrationNumber}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                        placeholder="e.g., ABC-123"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="chargingType"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Charging Type
                      </label>
                      <select
                        id="chargingType"
                        name="chargingType"
                        value={formData.chargingType}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                      >
                        <option value="">Select Type</option>
                        <option value="AC">AC Charging</option>
                        <option value="DC">DC Fast Charging</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="batteryCapacity"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Battery Capacity
                      </label>
                      <input
                        id="batteryCapacity"
                        name="batteryCapacity"
                        value={formData.batteryCapacity}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                        placeholder="e.g., 75 kWh"
                      />
                    </div>
                  </div>
                </div>
              )}

              {userType === 'CHARGER_OPERATOR' && (
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Operator Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="companyName"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Company Name *
                      </label>
                      <input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                          errors.companyName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Company name"
                      />
                      {errors.companyName && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="companyRegistrationNo"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Registration No *
                      </label>
                      <input
                        id="companyRegistrationNo"
                        name="companyRegistrationNo"
                        value={formData.companyRegistrationNo}
                        onChange={handleChange}
                        className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                          errors.companyRegistrationNo
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Registration number"
                      />
                      {errors.companyRegistrationNo && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.companyRegistrationNo}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="companyPan"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Company PAN
                      </label>
                      <input
                        id="companyPan"
                        name="companyPan"
                        value={formData.companyPan}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                        placeholder="Company PAN"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="companyLicenseNo"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Company License No
                      </label>
                      <input
                        id="companyLicenseNo"
                        name="companyLicenseNo"
                        value={formData.companyLicenseNo}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                        placeholder="Company License Number"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="companyType"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Company Type
                      </label>
                      <input
                        id="companyType"
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                        placeholder="Company Type"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="stationCount"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Station Count
                      </label>
                      <input
                        id="stationCount"
                        name="stationCount"
                        type="number"
                        min="0"
                        value={formData.stationCount}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                        placeholder="Number of Stations"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="operatorChargingType"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Charging Type
                      </label>
                      <select
                        id="operatorChargingType"
                        name="operatorChargingType"
                        value={formData.operatorChargingType}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                      >
                        <option value="">Select Type</option>
                        <option value="AC">AC Charging</option>
                        <option value="DC">DC Fast Charging</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="openingHours"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Opening Hours
                      </label>
                      <input
                        id="openingHours"
                        name="openingHours"
                        type="time"
                        value={formData.openingHours}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="closingHours"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Closing Hours
                      </label>
                      <input
                        id="closingHours"
                        name="closingHours"
                        type="time"
                        value={formData.closingHours}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="chargePerKwh"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Charge Per kWh
                      </label>
                      <input
                        id="chargePerKwh"
                        name="chargePerKwh"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.chargePerKwh}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition"
                        placeholder="Charge per kWh"
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
