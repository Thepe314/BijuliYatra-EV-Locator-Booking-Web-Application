// import React, { useState } from 'react';
// import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, X, ArrowLeft, CheckCircle, AlertCircle, Upload, Camera } from 'lucide-react';

// export default function EditUserPage() {
//   const [formData, setFormData] = useState({
//     firstName: 'John',
//     lastName: 'Doe',
//     email: 'john.doe@example.com',
//     phone: '+1 (555) 123-4567',
//     role: 'Admin',
//     status: 'Active',
//     address: '123 Main Street',
//     city: 'San Francisco',
//     state: 'CA',
//     zipCode: '94102',
//     country: 'United States',
//     company: 'Tech Solutions Inc',
//     department: 'Operations',
//     joinDate: '2024-01-15',
//     bio: 'Experienced charging station operator with 5+ years in EV infrastructure management.',
//   });

//   const [errors, setErrors] = useState({});
//   const [notification, setNotification] = useState(null);
//   const [profileImage, setProfileImage] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     // Clear error for this field when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.firstName.trim()) {
//       newErrors.firstName = 'First name is required';
//     }

//     if (!formData.lastName.trim()) {
//       newErrors.lastName = 'Last name is required';
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!emailRegex.test(formData.email)) {
//       newErrors.email = 'Invalid email format';
//     }

//     const phoneRegex = /^\+?[\d\s()-]+$/;
//     if (formData.phone && !phoneRegex.test(formData.phone)) {
//       newErrors.phone = 'Invalid phone format';
//     }

//     if (!formData.role) {
//       newErrors.role = 'Role is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (validateForm()) {
//       // Simulate API call
//       setNotification({ type: 'success', message: 'User updated successfully!' });
//       setTimeout(() => {
//         setNotification(null);
//       }, 3000);
//     } else {
//       setNotification({ type: 'error', message: 'Please fix the errors before submitting' });
//       setTimeout(() => {
//         setNotification(null);
//       }, 3000);
//     }
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setProfileImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button className="p-2 hover:bg-gray-100 rounded-lg transition">
//                 <ArrowLeft className="w-5 h-5 text-gray-600" />
//               </button>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
//                 <p className="text-sm text-gray-600">Update user information and settings</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => window.history.back()}
//                 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
//               >
//                 <X className="w-4 h-4" />
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
//               >
//                 <Save className="w-4 h-4" />
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Notification */}
//       {notification && (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
//           <div className={`flex items-center gap-3 p-4 rounded-lg ${
//             notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
//           }`}>
//             {notification.type === 'success' ? (
//               <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
//             ) : (
//               <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
//             )}
//             <p className={`text-sm font-medium ${
//               notification.type === 'success' ? 'text-green-800' : 'text-red-800'
//             }`}>
//               {notification.message}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Profile Card */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="text-center">
//                 <div className="relative inline-block mb-4">
//                   <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
//                     {profileImage ? (
//                       <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
//                     ) : (
//                       `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`
//                     )}
//                   </div>
//                   <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
//                     <Camera className="w-4 h-4" />
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageUpload}
//                       className="hidden"
//                     />
//                   </label>
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900">{formData.firstName} {formData.lastName}</h3>
//                 <p className="text-sm text-gray-600">{formData.email}</p>
//                 <div className="mt-4 flex items-center justify-center gap-2">
//                   <span className={`px-3 py-1 text-xs font-medium rounded-full ${
//                     formData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                   }`}>
//                     {formData.status}
//                   </span>
//                   <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
//                     {formData.role}
//                   </span>
//                 </div>
//               </div>

//               <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
//                 <div className="flex items-center gap-3 text-sm text-gray-600">
//                   <Briefcase className="w-4 h-4" />
//                   <span>{formData.company}</span>
//                 </div>
//                 <div className="flex items-center gap-3 text-sm text-gray-600">
//                   <Calendar className="w-4 h-4" />
//                   <span>Joined {new Date(formData.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
//                 </div>
//                 <div className="flex items-center gap-3 text-sm text-gray-600">
//                   <MapPin className="w-4 h-4" />
//                   <span>{formData.city}, {formData.state}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Form */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow">
//               {/* Personal Information */}
//               <div className="p-6 border-b border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
//                       First Name *
//                     </label>
//                     <input
//                       type="text"
//                       id="firstName"
//                       name="firstName"
//                       value={formData.firstName}
//                       onChange={handleChange}
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${
//                         errors.firstName ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     />
//                     {errors.firstName && (
//                       <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
//                       Last Name *
//                     </label>
//                     <input
//                       type="text"
//                       id="lastName"
//                       name="lastName"
//                       value={formData.lastName}
//                       onChange={handleChange}
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${
//                         errors.lastName ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     />
//                     {errors.lastName && (
//                       <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                       Email Address *
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <Mail className="w-5 h-5 text-gray-400" />
//                       </div>
//                       <input
//                         type="email"
//                         id="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                         className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${
//                           errors.email ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                     </div>
//                     {errors.email && (
//                       <p className="text-xs text-red-600 mt-1">{errors.email}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
//                       Phone Number
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <Phone className="w-5 h-5 text-gray-400" />
//                       </div>
//                       <input
//                         type="tel"
//                         id="phone"
//                         name="phone"
//                         value={formData.phone}
//                         onChange={handleChange}
//                         className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${
//                           errors.phone ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                     </div>
//                     {errors.phone && (
//                       <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Account Settings */}
//               <div className="p-6 border-b border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
//                       Role *
//                     </label>
//                     <select
//                       id="role"
//                       name="role"
//                       value={formData.role}
//                       onChange={handleChange}
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${
//                         errors.role ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     >
//                       <option value="">Select Role</option>
//                       <option value="Admin">Admin</option>
//                       <option value="Operator">Operator</option>
//                       <option value="Technician">Technician</option>
//                       <option value="Manager">Manager</option>
//                       <option value="Viewer">Viewer</option>
//                     </select>
//                     {errors.role && (
//                       <p className="text-xs text-red-600 mt-1">{errors.role}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
//                       Status
//                     </label>
//                     <select
//                       id="status"
//                       name="status"
//                       value={formData.status}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
//                     >
//                       <option value="Active">Active</option>
//                       <option value="Inactive">Inactive</option>
//                       <option value="Suspended">Suspended</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
//                       Company
//                     </label>
//                     <input
//                       type="text"
//                       id="company"
//                       name="company"
//                       value={formData.company}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
//                       Department
//                     </label>
//                     <input
//                       type="text"
//                       id="department"
//                       name="department"
//                       value={formData.department}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Address Information */}
//               <div className="p-6 border-b border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
//                 <div className="grid grid-cols-1 gap-4">
//                   <div>
//                     <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
//                       Street Address
//                     </label>
//                     <input
//                       type="text"
//                       id="address"
//                       name="address"
//                       value={formData.address}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="col-span-2">
//                       <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
//                         City
//                       </label>
//                       <input
//                         type="text"
//                         id="city"
//                         name="city"
//                         value={formData.city}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
//                         State
//                       </label>
//                       <input
//                         type="text"
//                         id="state"
//                         name="state"
//                         value={formData.state}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
//                         ZIP Code
//                       </label>
//                       <input
//                         type="text"
//                         id="zipCode"
//                         name="zipCode"
//                         value={formData.zipCode}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
//                       Country
//                     </label>
//                     <select
//                       id="country"
//                       name="country"
//                       value={formData.country}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
//                     >
//                       <option value="United States">United States</option>
//                       <option value="Canada">Canada</option>
//                       <option value="United Kingdom">United Kingdom</option>
//                       <option value="Australia">Australia</option>
//                       <option value="Germany">Germany</option>
//                       <option value="France">France</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Bio */}
//               <div className="p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
//                 <textarea
//                   id="bio"
//                   name="bio"
//                   value={formData.bio}
//                   onChange={handleChange}
//                   rows="4"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition resize-none"
//                   placeholder="Tell us about yourself..."
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Brief description about the user</p>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="mt-6 flex justify-end gap-3">
//               <button
//                 onClick={() => window.history.back()}
//                 className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
//               >
//                 <Save className="w-4 h-4" />
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, X, ArrowLeft, CheckCircle, AlertCircle, Upload, Camera, Menu } from 'lucide-react';

export default function EditUserPage() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Admin',
    status: 'Active',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States',
    company: 'Tech Solutions Inc',
    department: 'Operations',
    joinDate: '2024-01-15',
    bio: 'Experienced charging station operator with 5+ years in EV infrastructure management.',
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const phoneRegex = /^\+?[\d\s()-]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Simulate API call with cookies
      try {
        const response = await fetch('/api/users/123', {
          method: 'PUT',
          credentials: 'include', // Sends cookies automatically
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          setNotification({ type: 'success', message: 'User updated successfully!' });
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        } else {
          setNotification({ type: 'error', message: 'Failed to update user' });
        }
      } catch (error) {
        setNotification({ type: 'error', message: 'Network error occurred' });
      }
    } else {
      setNotification({ type: 'error', message: 'Please fix the errors before submitting' });
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Edit User</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Update user information</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => window.history.back()}
                className="p-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
              <button
                onClick={handleSubmit}
                className="p-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Notification */}
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

      {/* Main Content - Mobile Responsive */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card - Full width on mobile */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`
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
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{formData.firstName} {formData.lastName}</h3>
                <p className="text-xs sm:text-sm text-gray-600 break-all">{formData.email}</p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${
                    formData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.status}
                  </span>
                  <span className="px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {formData.role}
                  </span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{formData.company}</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Joined {new Date(formData.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{formData.city}, {formData.state}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form - Full width on mobile */}
          <div className="lg:col-span-2 order-2 lg:order-2">
            <div className="bg-white rounded-lg shadow">
              {/* Personal Information */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 md:col-span-1">
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 md:col-span-1">
                    <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${
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

              {/* Account Settings */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Account Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="role" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${
                        errors.role ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Role</option>
                      <option value="Admin">Admin</option>
                      <option value="Operator">Operator</option>
                      <option value="Technician">Technician</option>
                      <option value="Manager">Manager</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    {errors.role && (
                      <p className="text-xs text-red-600 mt-1">{errors.role}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Address Information</h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="city" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="zipCode" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        ZIP
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Bio</h3>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition resize-none"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1">Brief description about the user</p>
              </div>
            </div>

            {/* Mobile Fixed Bottom Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => window.history.back()}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}