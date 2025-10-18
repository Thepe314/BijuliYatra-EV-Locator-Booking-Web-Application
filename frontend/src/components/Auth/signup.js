import React, { useState } from 'react';
import { Zap, Mail, Lock, User, Eye, EyeOff, Phone, MapPin, Car, Battery, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../Services/api';

export default function EVOwnerSignUp() {
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
    
    // Step 2: Address Information
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    
    // Step 3: Vehicle Details
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    registrationNumber: "",
    chargingType: "",
    batteryCapacity: ""
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Address", icon: MapPin },
    { number: 3, title: "Vehicle Details", icon: Car }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      if (!formData.street.trim()) newErrors.street = "Street address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
      if (!formData.country.trim()) newErrors.country = "Country is required";
    }
    
    if (step === 3) {
      if (!formData.vehicleBrand.trim()) newErrors.vehicleBrand = "Vehicle brand is required";
      if (!formData.vehicleModel.trim()) newErrors.vehicleModel = "Vehicle model is required";
      if (!formData.vehicleYear.trim()) newErrors.vehicleYear = "Vehicle year is required";
      if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
      if (!formData.chargingType) newErrors.chargingType = "Charging type is required";
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
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    setApiError("");

    try {
      const userData = {
        fullname: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: "EV_OWNER",
        address: `${formData.street}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`,
        vehicleBrand: formData.vehicleBrand,
        vehicleModel: formData.vehicleModel,
        vehicleRegistrationNumber: formData.registrationNumber,
        chargingType: formData.chargingType
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 p-4 rounded-2xl">
            <Zap className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">EV Owner Registration</h1>
        <p className="text-center text-slate-600 mb-8">Join BijuliYatra and start charging smarter</p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  currentStep > step.number 
                    ? 'bg-emerald-500 text-white' 
                    : currentStep === step.number 
                    ? 'bg-gradient-to-br from-emerald-500 to-cyan-600 text-white' 
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
                  currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-200'
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
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.fullName ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
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
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.email ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="you@example.com"
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
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.phoneNumber ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
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
                    className={`w-full pl-12 pr-12 py-3 border-2 ${errors.password ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
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
                    className={`w-full pl-12 pr-12 py-3 border-2 ${errors.confirmPassword ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
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

          {/* Step 2: Address Information */}
          {currentStep === 2 && (
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
                    className={`w-full pl-12 pr-4 py-3 border-2 ${errors.street ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="123 Main Street"
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
                    className={`w-full px-4 py-3 border-2 ${errors.city ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="San Francisco"
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
                    className={`w-full px-4 py-3 border-2 ${errors.state ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="California"
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
                    className={`w-full px-4 py-3 border-2 ${errors.zipCode ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="94102"
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
                    className={`w-full px-4 py-3 border-2 ${errors.country ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="United States"
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Vehicle Details */}
          {currentStep === 3 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Brand</label>
                  <div className="relative">
                    <Car className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      name="vehicleBrand"
                      value={formData.vehicleBrand}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 ${errors.vehicleBrand ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
                      placeholder="Tesla"
                    />
                  </div>
                  {errors.vehicleBrand && <p className="text-red-500 text-xs mt-1">{errors.vehicleBrand}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Model</label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 ${errors.vehicleModel ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="Model 3"
                  />
                  {errors.vehicleModel && <p className="text-red-500 text-xs mt-1">{errors.vehicleModel}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                  <input
                    type="text"
                    name="vehicleYear"
                    value={formData.vehicleYear}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 ${errors.vehicleYear ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="2024"
                  />
                  {errors.vehicleYear && <p className="text-red-500 text-xs mt-1">{errors.vehicleYear}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Registration Number</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 ${errors.registrationNumber ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
                    placeholder="ABC-1234"
                  />
                  {errors.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.registrationNumber}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Charging Type</label>
                <select
                  name="chargingType"
                  value={formData.chargingType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 ${errors.chargingType ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:border-emerald-500 focus:outline-none transition-colors`}
                >
                  <option value="">Select charging type</option>
                  <option value="AC">AC Charging (Type 1/Type 2)</option>
                  <option value="DC">DC Fast Charging (CCS/CHAdeMO)</option>
                  <option value="Both">Both AC and DC</option>
                </select>
                {errors.chargingType && <p className="text-red-500 text-xs mt-1">{errors.chargingType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Battery Capacity (Optional)</label>
                <div className="relative">
                  <Battery className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="batteryCapacity"
                    value={formData.batteryCapacity}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="75 kWh"
                  />
                </div>
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
            
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-700 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-700 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
              </button>
            )}
          </div>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{''}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign In
            </Link>
          </p>
          <p className="text-center text-sm text-slate-600 mt-6">
            Signup as an Charging Operator?{''}
            <Link to="/COsignup" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}