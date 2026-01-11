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
    region: "",
    city: "",
    district: "",
    address: "",
    
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
      if (!formData.region.trim()) newErrors.region = "Region is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.district.trim()) newErrors.district = "District is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
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
      // Match backend DTO fields exactly
      const userData = {
        fullname: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: "EV_OWNER",
        region: formData.region,
        city: formData.city,
        district: formData.district,
        address: formData.address,
        vehicleBrand: formData.vehicleBrand,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear,
        vehicleRegistrationNumber: formData.registrationNumber,
        chargingType: formData.chargingType,
        batteryCapacity: formData.batteryCapacity || null
      };

      const response = await authService.signupEvOwner(userData);
      console.log("Signup successful:", response);

      // Toastify success message
      notify.success("Signup successful! Please log in to continue.");

      await new Promise((resolve) => setTimeout(resolve, 300));
      navigate("/login");
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="grid md:grid-cols-2">
          {/* LEFT: brand / marketing panel */}
          <div className="relative bg-gradient-to-b from-slate-950 to-slate-900 px-10 py-10 flex flex-col justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-slate-950" />
              </div>
              <span className="text-base font-semibold text-white">BijuliYatra</span>
            </div>

            {/* Hero text */}
            <div>
              <h1 className="text-3xl font-semibold text-white mb-4 leading-snug">
                Power Your Journey{" "}
                <br className="hidden sm:block" />
                with Smart EV Charging
              </h1>
              <p className="text-sm text-slate-300 max-w-md mb-8">
                Connect to thousands of charging stations across India. Monitor your
                charging sessions, manage your stations, and drive the electric revolution.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-8 text-emerald-400 text-sm font-semibold">
                <div>
                  <div className="text-lg">5,000+</div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-300">
                    Charging Stations
                  </div>
                </div>
                <div>
                  <div className="text-lg">50K+</div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-300">
                    Active Users
                  </div>
                </div>
                <div>
                  <div className="text-lg">24/7</div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-300">
                    Support
                  </div>
                </div>
              </div>
            </div>

            {/* Footer copy */}
            <p className="mt-10 text-[11px] text-slate-500">
              © {new Date().getFullYear()} BijuliYatra. All rights reserved.
            </p>
          </div>

          {/* RIGHT: signup form panel */}
          <div className="bg-slate-950 px-10 py-10 flex flex-col justify-center border-l border-slate-800">
            <div className="w-full max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-white mb-1">Create Account</h2>
              <p className="text-xs text-slate-400 mb-6">
                Join the electric revolution today.
              </p>

              {/* Role pills */}
              <div className="flex items-center gap-2 mb-7">
                <span className="text-[11px] text-slate-400">I am an</span>
                <div className="flex gap-2 flex-1">
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-emerald-500 text-xs font-medium text-white py-2"
                  >
                    EV Owner
                  </button>
                  <Link
                    to="/signup/operator"
                    className="flex-1 rounded-full bg-slate-800 text-xs font-medium text-slate-200 py-2 text-center hover:bg-slate-700 transition"
                  >
                    Station Owner / Operator
                  </Link>
                </div>
              </div>

              {/* Step progress */}
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 text-[11px] ${
                          currentStep > step.number
                            ? "bg-emerald-500 text-white"
                            : currentStep === step.number
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/60"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-medium ${
                          currentStep >= step.number
                            ? "text-slate-100"
                            : "text-slate-500"
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
                            : "bg-slate-700"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {apiError && (
                <div className="mb-4 p-2.5 bg-red-900/30 border border-red-500/40 text-red-200 rounded-md text-[11px]">
                  {apiError}
                </div>
              )}

              {/* FORM STEPS – keep all your existing fields, only classNames changed to dark theme */}

              <div className="space-y-4">
                {currentStep === 1 && (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.fullName ? "border-red-400" : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.email ? "border-red-400" : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="you@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.phoneNumber ? "border-red-400" : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="+977 1234567890"
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.password ? "border-red-400" : "border-slate-700"
                          } rounded-md pl-9 pr-9 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.confirmPassword ? "border-red-400" : "border-slate-700"
                          } rounded-md pl-9 pr-9 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    {/* Region */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Region
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="text"
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.region ? "border-red-400" : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="Bagmati"
                        />
                      </div>
                      {errors.region && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.region}
                        </p>
                      )}
                    </div>

                    {/* City + District */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.city ? "border-red-400" : "border-slate-700"
                          } rounded-md px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="Lalitpur"
                        />
                        {errors.city && (
                          <p className="text-red-400 text-[11px] mt-1">
                            {errors.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          District
                        </label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.district ? "border-red-400" : "border-slate-700"
                          } rounded-md px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="Jhamsikhel"
                        />
                        {errors.district && (
                          <p className="text-red-400 text-[11px] mt-1">
                            {errors.district}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full bg-slate-900 border ${
                          errors.address ? "border-red-400" : "border-slate-700"
                        } rounded-md px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="House no./building/street/area"
                      />
                      {errors.address && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    {/* Vehicle brand + model */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          Vehicle Brand
                        </label>
                        <div className="relative">
                          <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                          <input
                            type="text"
                            name="vehicleBrand"
                            value={formData.vehicleBrand}
                            onChange={handleInputChange}
                            className={`w-full bg-slate-900 border ${
                              errors.vehicleBrand
                                ? "border-red-400"
                                : "border-slate-700"
                            } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                            placeholder="Tesla"
                          />
                        </div>
                        {errors.vehicleBrand && (
                          <p className="text-red-400 text-[11px] mt-1">
                            {errors.vehicleBrand}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          Vehicle Model
                        </label>
                        <input
                          type="text"
                          name="vehicleModel"
                          value={formData.vehicleModel}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.vehicleModel
                              ? "border-red-400"
                              : "border-slate-700"
                          } rounded-md px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="Model 3"
                        />
                        {errors.vehicleModel && (
                          <p className="text-red-400 text-[11px] mt-1">
                            {errors.vehicleModel}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Year + registration */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          Year
                        </label>
                        <input
                          type="text"
                          name="vehicleYear"
                          value={formData.vehicleYear}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.vehicleYear
                              ? "border-red-400"
                              : "border-slate-700"
                          } rounded-md px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="2024"
                        />
                        {errors.vehicleYear && (
                          <p className="text-red-400 text-[11px] mt-1">
                            {errors.vehicleYear}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.registrationNumber
                              ? "border-red-400"
                              : "border-slate-700"
                          } rounded-md px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="ABC-1234"
                        />
                        {errors.registrationNumber && (
                          <p className="text-red-400 text-[11px] mt-1">
                            {errors.registrationNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Charging type */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Charging Type
                      </label>
                      <select
                        name="chargingType"
                        value={formData.chargingType}
                        onChange={handleInputChange}
                        className={`w-full bg-slate-900 border ${
                          errors.chargingType
                            ? "border-red-400"
                            : "border-slate-700"
                        } rounded-md px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      >
                        <option value="">Select charging type</option>
                        <option value="AC">AC Charging (Type 1/Type 2)</option>
                        <option value="DC">DC Fast Charging (CCS/CHAdeMO)</option>
                        <option value="Both">Both AC and DC</option>
                      </select>
                      {errors.chargingType && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.chargingType}
                        </p>
                      )}
                    </div>

                    {/* Battery capacity */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Battery Capacity (Optional)
                      </label>
                      <div className="relative">
                        <Battery className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="text"
                          name="batteryCapacity"
                          value={formData.batteryCapacity}
                          onChange={handleInputChange}
                          className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="75 kWh"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-700 rounded-md text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-600 transition"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-md bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-1 text-center text-[11px] text-slate-400">
                <p>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Sign in
                  </Link>
                </p>
                <p>
                  Signup as Charging Operator?{" "}
                  <Link
                    to="/signup/operator"
                    className="text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
