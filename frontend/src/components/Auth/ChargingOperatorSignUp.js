import React, { useState } from 'react';
import {Zap, Mail, Lock, User, Eye, EyeOff, Phone, MapPin, Building2, FileText, ArrowRight, ArrowLeft, Check, Clock } from 'lucide-react';
import { authService } from '../../Services/api';
import { Link, useNavigate } from 'react-router-dom';
import evChargerImg from "../Assets/stations/ev-charger.jpg";
import StationLocationPicker from '../../Services/StationLocationPicker';
import notify from '../../Utils/notify';


export default function ChargingOperatorSignUp() {
   const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

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
  region: "",
  city: "",
  district: "",
  address: "",
  openingHours: "",
  closingHours: "",
   latitude: null,
  longitude: null,
});

  const [errors, setErrors] = useState({});

  const steps = [
  { number: 1, title: "Personal Info", icon: User },
  { number: 2, title: "Company Info", icon: Building2 },
  { number: 3, title: "Location", icon: MapPin }
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
      if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
      if (!formData.companyType) newErrors.companyType = "Company type is required";
      if (!formData.companyRegistrationNo.trim()) newErrors.companyRegistrationNo = "Registration number is required";
      if (!formData.companyPan.trim()) newErrors.companyPan = "PAN number is required";
      if (!formData.companyLicenseNo.trim()) newErrors.companyLicenseNo = "License number is required";
    }
    
    if (step === 3) {
      if (!formData.region.trim()) newErrors.region = "Region is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.district.trim()) newErrors.district = "District is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.openingHours.trim()) newErrors.openingHours = "Opening hours are required";
      if (!formData.closingHours.trim()) newErrors.closingHours = "Closing hours are required";
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
  role: "CHARGER_OPERATOR",
  region: formData.region,
  city: formData.city,
  district: formData.district,
  address: formData.address,
  companyName: formData.companyName,
  companyType: formData.companyType,
  companyRegistrationNo: formData.companyRegistrationNo,
  companyPan: formData.companyPan,
  companyLicenseNo: formData.companyLicenseNo,
  openingHours: formData.openingHours,
  closingHours: formData.closingHours,
  latitude: formData.latitude,
  longitude: formData.longitude,
};

    const response = await authService.signupOperator(userData);
  console.log("Signup successful:", response);

  notify.success("Signup successful! Please login to continue.");

  await new Promise((resolve) => setTimeout(resolve, 300));
  navigate("/login");
} catch (error) {
  console.error("Signup failed:", error);

  if (error.response) {
    if (error.response.status === 409) {
      setApiError("An account with this email already exists.");
      notify.error("An account with this email already exists.");
    } else if (error.response.data && error.response.data.message) {
      setApiError(error.response.data.message);
      notify.error(error.response.data.message);
    } else {
      setApiError("Signup failed. Please try again later.");
      notify.error("Signup failed. Please try again later.");
    }
  } else {
    setApiError("Unable to connect to the server. Please try again later.");
    notify.error("Unable to connect to the server. Please try again later.");
  }
} finally {
  setIsSubmitting(false);
}
  }

  const handleLocationChange = async ({ lat, lng }) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    const addr = data.address || {};

    setFormData(prev => ({
      ...prev,
      region: addr.state || prev.region,
      city: addr.city || addr.town || addr.village || prev.city,
      district: addr.county || addr.suburb || prev.district,
      address: data.display_name || prev.address,
    }));
  } catch (e) {
    console.error("Reverse geocode failed", e);
  }
};

 return (
  <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      <div className="grid md:grid-cols-2">
        {/* LEFT: hero with EV image */}
        <div className="relative flex flex-col justify-between overflow-hidden">
          <img
            src={evChargerImg}
            alt="EV charging point"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-white/65" />

          <div className="relative z-10 px-10 py-10 flex flex-col justify-between h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-semibold text-slate-900">
                BijuliYatra
              </span>
            </div>

            {/* Hero copy */}
            <div>
              <h1 className="text-4xl font-semibold text-slate-900 mb-4 leading-snug">
                Grow Your Charging{" "}
                <br className="hidden sm:block" />
                Business With Us
              </h1>
              <p className="text-sm text-slate-700 max-w-md mb-8">
                Onboard your charging stations to reach thousands of EV drivers,
                manage pricing and availability, and monitor performance in one
                place.
              </p>

              <div className="flex flex-wrap gap-8 text-emerald-500 text-sm font-semibold">
                <div>
                  <div className="text-xl">5,000+</div>
                  <div className="text-sm uppercase tracking-wide text-slate-600">
                    Charging Stations
                  </div>
                </div>
                <div>
                  <div className="text-xl">50K+</div>
                  <div className="text-sm uppercase tracking-wide text-slate-600">
                    Active Users
                  </div>
                </div>
                <div>
                  <div className="text-xl">24/7</div>
                  <div className="text-sm uppercase tracking-wide text-slate-600">
                    Support
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-10 text-sm text-slate-500">
              © {new Date().getFullYear()} BijuliYatra. All rights reserved.
            </p>
          </div>
        </div>

        {/* RIGHT: registration form panel */}
        <div className="bg-white px-10 py-10 flex flex-col justify-center border-l border-slate-200">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-3xl font-semibold text-slate-900 mb-1">
              Register as Station Owner / Operator
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Start your journey as a charging station partner.
            </p>

            {/* Info banner */}
            <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 flex gap-3 items-start">
              <div className="mt-0.5">
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Account approval required
                </p>
                <p className="text-sm text-slate-700">
                  Your account will be reviewed by our admin team within
                  24–48 hours. You&apos;ll receive a confirmation email once
                  approved.
                </p>
              </div>
            </div>

            {/* Step progress */}
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 text-sm ${
                        currentStep > step.number
                          ? "bg-emerald-500 text-white"
                          : currentStep === step.number
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-400/70"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        currentStep >= step.number
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] mx-1 rounded ${
                        currentStep > step.number
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {apiError && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {apiError}
              </div>
            )}

            {/* FORM STEPS */}
            <div className="space-y-4">
              {/* Step 1 */}
              {currentStep === 1 && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full bg-white border ${
                          errors.fullName
                            ? "border-red-400"
                            : "border-slate-300"
                        } rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full bg-white border ${
                          errors.email ? "border-red-400" : "border-slate-300"
                        } rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="you@company.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`w-full bg-white border ${
                          errors.phoneNumber
                            ? "border-red-400"
                            : "border-slate-300"
                        } rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="+977 1234567890"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full bg-white border ${
                          errors.password
                            ? "border-red-400"
                            : "border-slate-300"
                        } rounded-md pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full bg-white border ${
                          errors.confirmPassword
                            ? "border-red-400"
                            : "border-slate-300"
                        } rounded-md pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </>
              )}
                {/* Step 2 */}
                {currentStep === 2 && (
                  <>
                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className={`w-full bg-white border ${
                            errors.companyName
                              ? "border-red-400"
                              : "border-slate-300"
                          } rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="PowerGrid Charging Solutions"
                        />
                      </div>
                      {errors.companyName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Type
                      </label>
                      <select
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleInputChange}
                        className={`w-full bg-white border ${
                          errors.companyType
                            ? "border-red-400"
                            : "border-slate-300"
                        } rounded-md px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      >
                        <option value="">Select company type</option>
                        <option value="individual">Individual Operator</option>
                        <option value="private">Private Limited</option>
                        <option value="public">Public Limited</option>
                        <option value="cooperative">Cooperative</option>
                        <option value="government">Government</option>
                      </select>
                      {errors.companyType && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.companyType}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Registration Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          name="companyRegistrationNo"
                          value={formData.companyRegistrationNo}
                          onChange={handleInputChange}
                          className={`w-full bg-white border ${
                            errors.companyRegistrationNo
                              ? "border-red-400"
                              : "border-slate-300"
                          } rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="REG-2024-001234"
                        />
                      </div>
                      {errors.companyRegistrationNo && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.companyRegistrationNo}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        PAN Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          name="companyPan"
                          value={formData.companyPan}
                          onChange={handleInputChange}
                          className={`w-full bg-white border ${
                            errors.companyPan
                              ? "border-red-400"
                              : "border-slate-300"
                          } rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="PAN123456789"
                        />
                      </div>
                      {errors.companyPan && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.companyPan}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company License Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          name="companyLicenseNo"
                          value={formData.companyLicenseNo}
                          onChange={handleInputChange}
                          className={`w-full bg-white border ${
                            errors.companyLicenseNo
                              ? "border-red-400"
                              : "border-slate-300"
                          } rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="LIC-2024-567890"
                        />
                      </div>
                      {errors.companyLicenseNo && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.companyLicenseNo}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Step 3 – location */}
                {currentStep === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Region
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          className={`w-full bg-white border ${
                            errors.region
                              ? "border-red-400"
                              : "border-slate-300"
                          } rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="Bagmati"
                        />
                      </div>
                      {errors.region && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.region}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full bg-white border ${
                            errors.city ? "border-red-400" : "border-slate-300"
                          } rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="Lalitpur"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          District
                        </label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className={`w-full bg-white border ${
                            errors.district
                              ? "border-red-400"
                              : "border-slate-300"
                          } rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="Jhamsikhel"
                        />
                        {errors.district && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.district}
                          </p>
                        )}
                      </div>
                    </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`w-full bg-white border ${
                            errors.address
                              ? "border-red-400"
                              : "border-slate-300"
                          } rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="House no./building/street/area"
                        />
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.address}
                          </p>
                        )}
                      </div>
                    <div className="mt-4">

                <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Location (click on map)
                </label>
                <div className="h-56 rounded-xl overflow-hidden border border-slate-200">
                  <StationLocationPicker
                    value={
                      formData.latitude != null && formData.longitude != null
                        ? { lat: formData.latitude, lng: formData.longitude }
                        : { lat: 27.7172, lng: 85.324 } 
                    }
                    onChange={handleLocationChange}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Click on the map to set location; region, city, district and address will auto-fill.
                </p>
              </div>
              </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Opening Hours
                </label>
                <input
                  type="time"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                  className={`w-full bg-white border ${
                    errors.openingHours ? "border-red-400" : "border-slate-300"
                  } rounded-md px-3 py-2.5 text-sm text-slate-900`}
                />
                {errors.openingHours && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.openingHours}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Closing Hours
                </label>
                <input
                  type="time"
                  name="closingHours"
                  value={formData.closingHours}
                  onChange={handleInputChange}
                  className={`w-full bg-white border ${
                    errors.closingHours ? "border-red-400" : "border-slate-300"
                  } rounded-md px-3 py-2.5 text-sm text-slate-900`}
                />
                {errors.closingHours && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.closingHours}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
             {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 transition"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-md bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit for Review"}
              </button>
            )}
            </div>

            <div className="mt-5 space-y-1 text-center text-sm text-slate-500">
              <p>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-500 hover:text-emerald-600 font-medium"
                >
                  Sign in
                </Link>
              </p>
              <p>
                Want to sign up as EV Owner?{" "}
                <Link
                  to="/signup/ev-owner"
                  className="text-emerald-500 hover:text-emerald-600 font-medium"
                >
                  Sign up as EV Owner
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
   </div>

);
}
