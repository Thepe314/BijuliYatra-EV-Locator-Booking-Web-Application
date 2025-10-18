import React, { useState } from 'react';
import { Zap, Mail, Lock, User, Eye, EyeOff, Phone, MapPin, Building2, DollarSign, Zap as ZapIcon, FileText, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../Services/api';

export default function ChargingOperatorSignUp() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    
    // Step 2: Business Information
    businessName: "",
    businessType: "",
    businessRegistrationNumber: "",
    businessLicense: "",
    
    // Step 3: Location & Infrastructure
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    numberOfChargingStations: "",
    
    // Step 4: Charging Details
    chargingTypes: [],
    operatingHours: "",
    dailyCapacity: "",
    bankAccountDetails: ""
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Business Info", icon: Building2 },
    { number: 3, title: "Location", icon: MapPin },
    { number: 4, title: "Charging Details", icon: ZapIcon }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        chargingTypes: checked
          ? [...prev.chargingTypes, value]
          : prev.chargingTypes.filter(ct => ct !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    if (step === 2) {
      if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
      if (!formData.businessType) newErrors.businessType = "Business type is required";
      if (!formData.businessRegistrationNumber.trim()) newErrors.businessRegistrationNumber = "Registration number is required";
      if (!formData.businessLicense.trim()) newErrors.businessLicense = "Business license number is required";
    }
    
    if (step === 3) {
      if (!formData.street.trim()) newErrors.street = "Street address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
      if (!formData.country.trim()) newErrors.country = "Country is required";
      if (!formData.numberOfChargingStations.trim()) newErrors.numberOfChargingStations = "Number of stations is required";
    }
    
    if (step === 4) {
      if (formData.chargingTypes.length === 0) newErrors.chargingTypes = "Select at least one charging type";
      if (!formData.operatingHours.trim()) newErrors.operatingHours = "Operating hours are required";
      if (!formData.dailyCapacity.trim()) newErrors.dailyCapacity = "Daily capacity is required";
      if (!formData.bankAccountDetails.trim()) newErrors.bankAccountDetails = "Bank account details are required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setApiError("");
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setApiError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    setApiError("");

    try {
      const userData = {
        fullname: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: "CHARGING_OPERATOR",
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessRegistrationNumber: formData.businessRegistrationNumber,
        businessLicense: formData.businessLicense,
        address: `${formData.street}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`,
        numberOfChargingStations: formData.numberOfChargingStations,
        chargingTypes: formData.chargingTypes,
        operatingHours: formData.operatingHours,
        dailyCapacity: formData.dailyCapacity,
        bankAccountDetails: formData.bankAccountDetails
      };

      const response = await authService.signup(userData);
      console.log("Signup successful:", response);
      
      await new Promise((resolve) => setTimeout(resolve, 300));
      alert("Signup successful! Please login to continue.");
      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);
      if (error.response) {
        if (error.response.status === 409) {
          setApiError("An account with this email already exists.");
        } else if (error.response.data && error.response.data.message) {
          setApiError(error.response.data.message);
        } else {
          setApiError("Signup failed. Please try again later.");
        }
      } else {
        setApiError("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl">
            <Zap className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">Charging Operator Registration</h1>
        <p className="text-center text-slate-600 mb-8">Join BijuliYatra and expand your charging network</p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  currentStep > step.number 
                    ? 'bg-amber-500 text-white' 
                    : currentStep === step.number 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-xs font-medium ${currentStep >= step.number ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 mb-8 rounded transition-all ${
                  currentStep > step.number ? 'bg-amber-500' : 'bg-slate-200'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {apiError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {apiError}
          </div>
        )}

        <div className="space-y-5">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.fullName ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.email ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="you@company.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.phoneNumber ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3 border-2 ${errors.password ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3 border-2 ${errors.confirmPassword ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </>
          )}

          {/* Step 2: Business Information */}
          {currentStep === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.businessName ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="PowerGrid Charging Solutions"
                  />
                </div>
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Type</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 ${errors.businessType ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                >
                  <option value="">Select business type</option>
                  <option value="individual">Individual Operator</option>
                  <option value="private_company">Private Company</option>
                  <option value="public_company">Public Company</option>
                  <option value="non_profit">Non-Profit Organization</option>
                  <option value="government">Government Agency</option>
                </select>
                {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Registration Number</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="businessRegistrationNumber"
                    value={formData.businessRegistrationNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.businessRegistrationNumber ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="REG-2024-001234"
                  />
                </div>
                {errors.businessRegistrationNumber && <p className="text-red-500 text-xs mt-1">{errors.businessRegistrationNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business License Number</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="businessLicense"
                    value={formData.businessLicense}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.businessLicense ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="LIC-2024-567890"
                  />
                </div>
                {errors.businessLicense && <p className="text-red-500 text-xs mt-1">{errors.businessLicense}</p>}
              </div>
            </>
          )}

          {/* Step 3: Location & Infrastructure */}
          {currentStep === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.street ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="456 Industrial Avenue"
                  />
                </div>
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 ${errors.city ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="Denver"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 ${errors.state ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="Colorado"
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ZIP/Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 ${errors.zipCode ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="80202"
                  />
                  {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 ${errors.country ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="United States"
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Number of Charging Stations</label>
                <div className="relative">
                  <ZapIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    name="numberOfChargingStations"
                    value={formData.numberOfChargingStations}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.numberOfChargingStations ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="15"
                  />
                </div>
                {errors.numberOfChargingStations && <p className="text-red-500 text-xs mt-1">{errors.numberOfChargingStations}</p>}
              </div>
            </>
          )}

          {/* Step 4: Charging Details */}
          {currentStep === 4 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Charging Types Supported</label>
                <div className="space-y-2">
                  {['AC_Type1', 'AC_Type2', 'DC_CCS', 'DC_CHAdeMO'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        name="chargingTypes"
                        value={type}
                        checked={formData.chargingTypes.includes(type)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 focus:outline-none cursor-pointer"
                      />
                      <span className="ml-3 text-sm text-slate-700">
                        {type === 'AC_Type1' && 'AC Type 1 (J1772)'}
                        {type === 'AC_Type2' && 'AC Type 2 (Mennekes)'}
                        {type === 'DC_CCS' && 'DC CCS (Combined Charging System)'}
                        {type === 'DC_CHAdeMO' && 'DC CHAdeMO'}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.chargingTypes && <p className="text-red-500 text-xs mt-2">{errors.chargingTypes}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Operating Hours</label>
                <input
                  type="text"
                  name="operatingHours"
                  value={formData.operatingHours}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 ${errors.operatingHours ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                  placeholder="24/7 or 6:00 AM - 10:00 PM"
                />
                {errors.operatingHours && <p className="text-red-500 text-xs mt-1">{errors.operatingHours}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Daily Capacity (kWh)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="dailyCapacity"
                    value={formData.dailyCapacity}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.dailyCapacity ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="5000"
                  />
                </div>
                {errors.dailyCapacity && <p className="text-red-500 text-xs mt-1">{errors.dailyCapacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bank Account Details</label>
                <textarea
                  name="bankAccountDetails"
                  value={formData.bankAccountDetails}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 ${errors.bankAccountDetails ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors resize-none`}
                  rows="3"
                  placeholder="Bank name, Account number, SWIFT code, etc."
                />
                {errors.bankAccountDetails && <p className="text-red-500 text-xs mt-1">{errors.bankAccountDetails}</p>}
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold text-slate-700"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
              </button>
            )}
          </div>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}