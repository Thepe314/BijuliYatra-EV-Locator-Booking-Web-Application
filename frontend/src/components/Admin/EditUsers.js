import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  X,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Camera,
  Car,
  Zap,
  Building2,
} from 'lucide-react';
import { userService } from '../../Services/api';
import StationLocationPicker from '../../Services/StationLocationPicker';

export default function EditUserPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    role: '',
    status: 'Active',
    address: '',
    city: '',
    region: '',
    district: '',
    joinDate: null,

    // EV owner fields
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleRegistrationNumber: '',
    chargingType: '',
    batteryCapacity: '',

    // Operator fields
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

    // Location
    latitude: null,
    longitude: null,
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [reverseLoading, setReverseLoading] = useState(false);
  const [reverseError, setReverseError] = useState('');

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

   

    return {
      fullname,
      email: apiUser.email || '',
      phone: apiUser.phoneNumber || apiUser.phone || '',
      role: apiUser.userType || apiUser.role || apiUser.primaryRole || '',
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

      latitude: apiUser.latitude ?? null,
      longitude: apiUser.longitude ?? null,
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
          setProfileImage(
            apiUser.avatarUrl || apiUser.avatar || apiUser.profileImage
          );
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        setNotification({
          type: 'error',
          message: 'Unable to load user details.',
        });
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

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.fullname.trim()) newErrors.fullname = 'Full name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email))
      newErrors.email = 'Invalid email format';

    const phoneRegex = /^\+?[\d\s()-]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone))
      newErrors.phone = 'Invalid phone format';

    if (!formData.role) newErrors.role = 'Role is required';

    if (userType === 'EV_OWNER') {
      if (!formData.vehicleBrand.trim())
        newErrors.vehicleBrand = 'Vehicle brand is required';
      if (!formData.vehicleModel.trim())
        newErrors.vehicleModel = 'Vehicle model is required';
    }

    if (userType === 'CHARGER_OPERATOR') {
      if (!formData.companyName.trim())
        newErrors.companyName = 'Company name is required';
      if (!formData.companyRegistrationNo.trim())
        newErrors.companyRegistrationNo = 'Registration number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, userType]);

  const reverseGeocode = async (lat, lng) => {
    setReverseLoading(true);
    setReverseError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent':
              'BijuliYatra-Admin-Panel/1.0 (your-email@example.com)',
          },
        }
      );

      if (!res.ok) throw new Error('Failed to reverse geocode');
      const data = await res.json();

      const addr = data.address || {};
      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.suburb ||
        '';
      const district =
        addr.state_district ||
        addr.county ||
        addr.state ||
        '';
      const region =
        addr.state ||
        addr.region ||
        addr.province ||
        '';
      const fullAddress = data.display_name || '';

      setFormData((prev) => ({
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
      setReverseError('Could not fetch address for this location.');
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    } finally {
      setReverseLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fix the errors before submitting',
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setSaving(true);
    try {
      const basePayload = {
        fullname:
        (formData.fullname && formData.fullname.trim()),
        email: formData.email,
        phoneNumber: formData.phone,
        role: formData.role,
        status: formData.status,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        district: formData.district,
        latitude: formData.latitude,
        longitude: formData.longitude,
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
      setNotification({
        type: 'success',
        message: 'User updated successfully!',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Update failed:', err);
      setNotification({
        type: 'error',
        message: 'Failed to update user',
      });
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
    `${(formData.fullname || '').charAt(0) || ''}
    }` || 'U';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-600">Loading user...</div>
      </div>
    );
  }
return (
  <div className="min-h-screen bg-slate-50">
    {/* Header */}
    <div className="bg-white/95 border-b border-slate-200 sticky top-0 z-10 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-100 transition flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-semibold text-slate-900 truncate">
                Edit User
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
                {userType === "EV_OWNER"
                  ? "EV owner profile"
                  : userType === "CHARGER_OPERATOR"
                  ? "Charger operator profile"
                  : "Admin user profile"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 sm:px-4 sm:py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 text-xs sm:text-sm text-slate-700"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>

            {/* Better UX: submit the form from header without calling handleSubmit manually */}
            <button
              type="submit"
              form="edit-user-form"
              disabled={saving}
              className="p-2 sm:px-4 sm:py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">
                {saving ? "Saving..." : "Save changes"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification (kept inside header area so it’s visible immediately) */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
          <div
            className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-rose-50 border-rose-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}

            <p
              className={`text-xs sm:text-sm font-medium ${
                notification.type === "success"
                  ? "text-emerald-800"
                  : "text-rose-800"
              }`}
            >
              {notification.message}
            </p>
          </div>
        </div>
      )}
    </div>

    {/* Content */}
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left profile card */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-semibold overflow-hidden">
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

              <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition shadow-sm">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
              {formData.fullname || "—"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 break-all">
              {formData.email || "—"}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span
                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full border ${
                  formData.status === "Active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                {formData.status || "—"}
              </span>

              {formData.role && (
                <span className="px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {formData.role}
                </span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-left">
              {userType === "CHARGER_OPERATOR" && formData.companyName && (
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span className="truncate">{formData.companyName}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Joined{" "}
                  {formData.joinDate
                    ? new Date(formData.joinDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="truncate">
                  {formData.city || "N/A"}, {formData.region || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right form */}
        <section className="lg:col-span-2">
          <form
            id="edit-user-form"
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            onSubmit={handleSubmit}
          >
            {/* Personal info */}
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  Personal Information
                </h3>
                <span className="text-[11px] text-slate-400">Fields marked * are required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="fullname"
                    className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                      errors.fullname
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-400"
                        : "border-slate-300 focus:ring-1 focus:ring-emerald-400"
                    }`}
                  />
                  {errors.fullname && (
                    <p className="text-xs text-rose-600 mt-1">{errors.fullname}</p>
                  )}
                </div>

                <div className="sm:col-span-2 md:col-span-1">
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                        errors.email
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-400"
                          : "border-slate-300 focus:ring-1 focus:ring-emerald-400"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="sm:col-span-2 md:col-span-1">
                  <label
                    htmlFor="phone"
                    className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                        errors.phone
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-400"
                          : "border-slate-300 focus:ring-1 focus:ring-emerald-400"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account settings */}
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
                Account Settings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                    User Role *
                  </label>

                  <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                    {["EV Owner", "Charger Operator", "Admin"].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() =>
                          handleChange({
                            target: { name: "role", value: label },
                          })
                        }
                        className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2 transition ${
                          formData.role === label
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                        }`}
                      >
                        {label === "EV Owner" && <Car className="w-4 h-4" />}
                        {label === "Charger Operator" && <Zap className="w-4 h-4" />}
                        {label === "Admin" && <Building2 className="w-4 h-4" />}
                        <span className="whitespace-nowrap">{label}</span>
                      </button>
                    ))}
                  </div>

                  {errors.role && (
                    <p className="text-xs text-rose-600 mt-1">{errors.role}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location & Address */}
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
                Location & Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                    Region
                  </label>
                  <input
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                    City
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                    District
                  </label>
                  <input
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                    Address
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Location (click on map)
                </label>

                <div className="h-56 w-full overflow-hidden rounded-xl border border-slate-200">
                  <StationLocationPicker
                    value={
                      formData.latitude && formData.longitude
                        ? { lat: formData.latitude, lng: formData.longitude }
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
                    : formData.address
                    ? `Selected: ${formData.address}`
                    : "Click on the map to select a location and auto-fill address."}
                </p>

                {reverseError && (
                  <p className="text-[11px] text-rose-500">{reverseError}</p>
                )}
              </div>
            </div>

            {/* EV Owner Details */}
            {userType === "EV_OWNER" && (
              <div className="p-4 sm:p-6 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
                  EV Owner Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Vehicle Brand *
                    </label>
                    <input
                      name="vehicleBrand"
                      value={formData.vehicleBrand}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                        errors.vehicleBrand
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-400"
                          : "border-slate-300 focus:ring-1 focus:ring-emerald-400"
                      }`}
                    />
                    {errors.vehicleBrand && (
                      <p className="text-xs text-rose-600 mt-1">
                        {errors.vehicleBrand}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Vehicle Model *
                    </label>
                    <input
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                        errors.vehicleModel
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-400"
                          : "border-slate-300 focus:ring-1 focus:ring-emerald-400"
                      }`}
                    />
                    {errors.vehicleModel && (
                      <p className="text-xs text-rose-600 mt-1">
                        {errors.vehicleModel}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Vehicle Year
                    </label>
                    <input
                      name="vehicleYear"
                      value={formData.vehicleYear}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Registration Number
                    </label>
                    <input
                      name="vehicleRegistrationNumber"
                      value={formData.vehicleRegistrationNumber}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Charging Type
                    </label>
                    <input
                      name="chargingType"
                      value={formData.chargingType}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Battery Capacity
                    </label>
                    <input
                      name="batteryCapacity"
                      value={formData.batteryCapacity}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Operator Details */}
            {userType === "CHARGER_OPERATOR" && (
              <div className="p-4 sm:p-6 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
                  Operator Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Company Name *
                    </label>
                    <input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                        errors.companyName
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-400"
                          : "border-slate-300 focus:ring-1 focus:ring-emerald-400"
                      }`}
                    />
                    {errors.companyName && (
                      <p className="text-xs text-rose-600 mt-1">
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Registration No *
                    </label>
                    <input
                      name="companyRegistrationNo"
                      value={formData.companyRegistrationNo}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${
                        errors.companyRegistrationNo
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-400"
                          : "border-slate-300 focus:ring-1 focus:ring-emerald-400"
                      }`}
                    />
                    {errors.companyRegistrationNo && (
                      <p className="text-xs text-rose-600 mt-1">
                        {errors.companyRegistrationNo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      PAN
                    </label>
                    <input
                      name="companyPan"
                      value={formData.companyPan}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      License No
                    </label>
                    <input
                      name="companyLicenseNo"
                      value={formData.companyLicenseNo}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Company Type
                    </label>
                    <input
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Opening Hours
                    </label>
                    <input
                      name="openingHours"
                      value={formData.openingHours}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Closing Hours
                    </label>
                    <input
                      name="closingHours"
                      value={formData.closingHours}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                      Charge per kWh
                    </label>
                    <input
                      name="chargePerKwh"
                      value={formData.chargePerKwh}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-slate-300 focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer buttons (mobile) */}
            <div className="p-4 sm:p-6 border-t border-slate-100 flex justify-end gap-2 sm:hidden bg-white">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-xs rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  </div>
);
}