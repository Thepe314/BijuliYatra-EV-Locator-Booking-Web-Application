import React, { useState } from 'react';
import { Zap, Mail, Lock, User, Eye, EyeOff, Phone, MapPin, Building2, DollarSign, FileText, ArrowRight, ArrowLeft, Check, Clock } from 'lucide-react';
import { authService } from '../../Services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function ChargingOperatorSignUp() {
   const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");


  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyType: "",
    companyRegistrationNo: "",
    companyPan: "",
    companyLicenseNo: "",
    address: "",
    city: "",
    district: "",
    stationCount: "",
    chargingType: [],
    openingHours: "",
    closingHours: "",
    chargePerKwh: ""
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Company Info", icon: Building2 },
    { number: 3, title: "Location", icon: MapPin },
    { number: 4, title: "Pricing", icon: DollarSign }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        chargingType: checked
          ? [...prev.chargingType, value]
          : prev.chargingType.filter(ct => ct !== value)
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
      if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
      if (!formData.companyType) newErrors.companyType = "Company type is required";
      if (!formData.companyRegistrationNo.trim()) newErrors.companyRegistrationNo = "Registration number is required";
      if (!formData.companyPan.trim()) newErrors.companyPan = "PAN number is required";
      if (!formData.companyLicenseNo.trim()) newErrors.companyLicenseNo = "License number is required";
    }
    
    if (step === 3) {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.stationCount.trim()) newErrors.stationCount = "Number of stations is required";
    }
    
    if (step === 4) {
      if (formData.chargingType.length === 0) newErrors.chargingType = "Select at least one charging type";
      if (!formData.openingHours.trim()) newErrors.openingHours = "Opening hours are required";
      if (!formData.closingHours.trim()) newErrors.closingHours = "Closing hours are required";
      if (!formData.chargePerKwh.trim()) newErrors.chargePerKwh = "Charge per kWh is required";
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
        companyName: formData.companyName,
        companyType: formData.companyType,
        companyRegistrationNo: formData.companyRegistrationNo,
        companyPan: formData.companyPan,
        companyLicenseNo: formData.companyLicenseNo,
        address: formData.address,
        city: formData.city,
        stationCount: formData.stationCount,
        chargingType: formData.chargingType.join(", "),
        openingHours: formData.openingHours,
        closingHours: formData.closingHours,
        chargePerKwh: formData.chargePerKwh
      };

     const response = await authService.signupOperator(userData);
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
                    placeholder="+977 1234567890"
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

          {currentStep === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.companyName ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="PowerGrid Charging Solutions"
                  />
                </div>
                {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Type</label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 ${errors.companyType ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                >
                  <option value="">Select company type</option>
                  <option value="individual">Individual Operator</option>
                  <option value="private">Private Limited</option>
                  <option value="public">Public Limited</option>
                  <option value="cooperative">Cooperative</option>
                  <option value="government">Government</option>
                </select>
                {errors.companyType && <p className="text-red-500 text-xs mt-1">{errors.companyType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Registration Number</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="companyRegistrationNo"
                    value={formData.companyRegistrationNo}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.companyRegistrationNo ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="REG-2024-001234"
                  />
                </div>
                {errors.companyRegistrationNo && <p className="text-red-500 text-xs mt-1">{errors.companyRegistrationNo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">PAN Number</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="companyPan"
                    value={formData.companyPan}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.companyPan ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="PAN123456789"
                  />
                </div>
                {errors.companyPan && <p className="text-red-500 text-xs mt-1">{errors.companyPan}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company License Number</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="companyLicenseNo"
                    value={formData.companyLicenseNo}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.companyLicenseNo ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="LIC-2024-567890"
                  />
                </div>
                {errors.companyLicenseNo && <p className="text-red-500 text-xs mt-1">{errors.companyLicenseNo}</p>}
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.address ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="123 Charging Avenue, Industrial Zone"
                  />
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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
                    placeholder="Kathmandu"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 ${errors.district ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="Kathmandu District"
                  />
                  {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Number of Charging Stations</label>
                <div className="relative">
                  <Zap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    name="stationCount"
                    value={formData.stationCount}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.stationCount ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="15"
                  />
                </div>
                {errors.stationCount && <p className="text-red-500 text-xs mt-1">{errors.stationCount}</p>}
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Charging Types Supported</label>
                <div className="space-y-2">
                  {['AC_Type1', 'AC_Type2', 'DC_CCS', 'DC_CHAdeMO'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        name="chargingType"
                        value={type}
                        checked={formData.chargingType.includes(type)}
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
                {errors.chargingType && <p className="text-red-500 text-xs mt-2">{errors.chargingType}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Opening Hours</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="time"
                      name="openingHours"
                      value={formData.openingHours}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 ${errors.openingHours ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    />
                  </div>
                  {errors.openingHours && <p className="text-red-500 text-xs mt-1">{errors.openingHours}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Closing Hours</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="time"
                      name="closingHours"
                      value={formData.closingHours}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 ${errors.closingHours ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    />
                  </div>
                  {errors.closingHours && <p className="text-red-500 text-xs mt-1">{errors.closingHours}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Charge Per kWh (NPR)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    name="chargePerKwh"
                    value={formData.chargePerKwh}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.chargePerKwh ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-amber-500 focus:outline-none transition-colors`}
                    placeholder="25.50"
                  />
                </div>
                {errors.chargePerKwh && <p className="text-red-500 text-xs mt-1">{errors.chargePerKwh}</p>}
              </div>
            </>
          )}

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
            Already have an account? <a href="#login" className="text-amber-600 hover:text-amber-700 font-semibold">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
}