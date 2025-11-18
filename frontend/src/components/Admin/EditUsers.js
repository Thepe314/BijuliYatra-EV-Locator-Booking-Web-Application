// EditUserPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Briefcase, Calendar,
  Save, X, ArrowLeft, CheckCircle, AlertCircle, Camera
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
    company: '',
    department: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    bio: '',
    joinDate: null,
    // EV Owner specific fields
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleRegistrationNumber: '',
    chargingType: '',
    batteryCapacity: '',
    // Charger Operator specific fields
    companyRegistrationNo: '',
    companyPan: '',
    companyLicenseNo: '',
    companyType: '',
    stationCount: '',
    openingHours: '',
    closingHours: '',
    chargePerKwh: '',
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Map API response to formData shape
  const mapApiToForm = (apiUser) => {
    // Example apiUser fields your logs show: user_id, fullname, email, phoneNumber, ...
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
      role: apiUser.role || '',
      status: apiUser.status || 'Active',
      company: apiUser.company || apiUser.companyName || '',
      department: apiUser.department || '',
      address: apiUser.address || '',
      city: apiUser.city || '',
      state: apiUser.state || apiUser.region || '',
      zipCode: apiUser.zipCode || apiUser.postal || '',
      country: apiUser.country || 'United States',
      bio: apiUser.bio || '',
      joinDate: apiUser.joinDate || apiUser.createdAt || null,

      vehicleBrand: apiUser.vehicleBrand || '',
      vehicleModel: apiUser.vehicleModel || '',
      vehicleYear: apiUser.vehicleYear || '',
      vehicleRegistrationNumber: apiUser.vehicleRegistrationNumber || '',
      chargingType: apiUser.chargingType || '',
      batteryCapacity: apiUser.batteryCapacity || '',

      companyRegistrationNo: apiUser.companyRegistrationNo || '',
      companyPan: apiUser.companyPan || '',
      companyLicenseNo: apiUser.companyLicenseNo || '',
      companyType: apiUser.companyType || '',
      stationCount: apiUser.stationCount || '',
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
        const data = await userService.getUserById(userId);
        if (!mounted) return;
        setFormData(prev => ({ ...prev, ...mapApiToForm(data) }));

        // adapt to whichever key your backend returns for avatar
        if (data.avatarUrl || data.avatar || data.profileImage) {
          setProfileImage(data.avatarUrl || data.avatar || data.profileImage);
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
    return () => { mounted = false; };
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!validateForm()) {
      setNotification({ type: 'error', message: 'Please fix the errors before submitting' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setSaving(true);
    try {
      // Build payload using the backend-friendly keys your service expects
      const payload = {
        fullname: (formData.fullname && formData.fullname.trim()) || `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phoneNumber: formData.phone,
        role: formData.role,
        status: formData.status,
        company: formData.company,
        department: formData.department,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        bio: formData.bio,
        // EV fields
        vehicleBrand: formData.vehicleBrand,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear,
        vehicleRegistrationNumber: formData.vehicleRegistrationNumber,
        chargingType: formData.chargingType,
        batteryCapacity: formData.batteryCapacity,
        // Charger operator fields
        companyRegistrationNo: formData.companyRegistrationNo,
        companyPan: formData.companyPan,
        companyLicenseNo: formData.companyLicenseNo,
        companyType: formData.companyType,
        stationCount: formData.stationCount,
        openingHours: formData.openingHours,
        closingHours: formData.closingHours,
        chargePerKwh: formData.chargePerKwh,
      };

      // Use the service you provided
      await userService.updateUser(userId, payload);

      setNotification({ type: 'success', message: 'User updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
      // optionally navigate back
      // navigate('/admin/users');
    } catch (err) {
      console.error('Update failed:', err);
      setNotification({ type: 'error', message: 'Failed to update user' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);

    // NOTE: avatar upload to server is not implemented here.
    // If you want to upload the file immediately, call an endpoint with FormData
    // or attach the image to the payload (not recommended for large images).
  };

  const initials = `${(formData.firstName || '').charAt(0) || ''}${(formData.lastName || '').charAt(0) || ''}` || 'U';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading user...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Edit User</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Update user information</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => navigate(-1)} className="p-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
              <button onClick={handleSubmit} disabled={saving} className="p-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p className={`text-xs sm:text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{formData.firstName} {formData.lastName}</h3>
              <p className="text-xs sm:text-sm text-gray-600 break-all">{formData.email}</p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${
                  formData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>{formData.status}</span>

                <span className="px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {formData.role}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 text-left">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="truncate">{formData.company}</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formData.joinDate ? new Date(formData.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{formData.city}, {formData.state}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form className="bg-white rounded-lg shadow" onSubmit={handleSubmit}>
              {/* Personal Info */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">First Name *</label>
                    <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Last Name *</label>
                    <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
                  </div>

                  <div className="sm:col-span-2 md:col-span-1">
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" /></div>
                      <input id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                        className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                    </div>
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div className="sm:col-span-2 md:col-span-1">
                    <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" /></div>
                      <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange}
                        className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                    </div>
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Account Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="role" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Role *</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-none transition ${errors.role ? 'border-red-500' : 'border-gray-300'}`}>
                      <option value="">Select Role</option>
                      <option value="Admin">Admin</option>
                      <option value="Operator">Operator</option>
                      <option value="Technician">Technician</option>
                      <option value="Manager">Manager</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Company</label>
                    <input id="company" name="company" value={formData.company} onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition" />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Department</label>
                    <input id="department" name="department" value={formData.department} onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Address Information</h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Street Address</label>
                    <input id="address" name="address" value={formData.address} onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="city" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">City</label>
                      <input id="city" name="city" value={formData.city} onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition" />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">State</label>
                      <input id="state" name="state" value={formData.state} onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition" />
                    </div>

                    <div>
                      <label htmlFor="zipCode" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">ZIP</label>
                      <input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Country</label>
                    <select id="country" name="country" value={formData.country} onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition">
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>Australia</option>
                      <option>Germany</option>
                      <option>France</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Bio</h3>
                <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange}
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none transition resize-none"
                  placeholder="Tell us about yourself..." />
                <p className="text-xs text-gray-500 mt-1">Brief description about the user</p>
              </div>

              {/* Bottom buttons */}
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto px-6 py-3 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base">Cancel</button>
                <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
