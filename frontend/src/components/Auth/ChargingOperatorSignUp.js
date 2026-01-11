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
    region: "",
    city: "",
    district: "",
    address: "",
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
      if (!formData.region.trim()) newErrors.region = "Region is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.district.trim()) newErrors.district = "District is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
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
      // Match backend OperatorSignupRequest DTO fields exactly
      const userData = {
        fullname: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: "CHARGING_OPERATOR",
        region: formData.region,
        city: formData.city,
        district: formData.district,
        address: formData.address,
        companyName: formData.companyName,
        companyType: formData.companyType,
        companyRegistrationNo: formData.companyRegistrationNo,
        companyPan: formData.companyPan,
        companyLicenseNo: formData.companyLicenseNo,
        stationCount: formData.stationCount,
        chargingType: formData.chargingType.join(", "),
        openingHours: formData.openingHours,
        closingHours: formData.closingHours,
        chargePerKwh: parseFloat(formData.chargePerKwh)
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

          {/* RIGHT: registration form panel */}
          <div className="bg-slate-950 px-10 py-10 flex flex-col justify-center border-l border-slate-800">
            <div className="w-full max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-white mb-1">
                Register as Station Owner / Operator
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Start your journey as a charging station partner.
              </p>

              {/* Info banner */}
              <div className="mb-6 rounded-lg bg-slate-900 border border-amber-500/40 px-4 py-3 flex gap-3 items-start">
                <div className="mt-0.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-amber-300">
                    Account approval required
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Your account will be reviewed by our admin team within 24–48 hours.
                    You&apos;ll receive a confirmation email once approved.
                  </p>
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
                            ? "bg-amber-500 text-slate-900"
                            : currentStep === step.number
                            ? "bg-amber-500/20 text-amber-300 border border-amber-400/60"
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
                          currentStep > step.number ? "bg-amber-500" : "bg-slate-700"
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

              {/* FORM STEPS */}
              <div className="space-y-4">
                {/* Step 1 */}
                {currentStep === 1 && (
                  <>
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
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-red-400 text-[11px] mt-1">{errors.fullName}</p>
                      )}
                    </div>

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
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="you@company.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>
                      )}
                    </div>

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
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="+977 1234567890"
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

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
                          } rounded-md pl-9 pr-9 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
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
                            errors.confirmPassword
                              ? "border-red-400"
                              : "border-slate-700"
                          } rounded-md pl-9 pr-9 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
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

                {/* Step 2 */}
                {currentStep === 2 && (
                  <>
                    {/* reuse your company fields, just dark styles */}
                    {/* Company Name */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.companyName ? "border-red-400" : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="PowerGrid Charging Solutions"
                        />
                      </div>
                      {errors.companyName && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Company Type
                      </label>
                      <select
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleInputChange}
                        className={`w-full bg-slate-900 border ${
                          errors.companyType ? "border-red-400" : "border-slate-700"
                        } rounded-md px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      >
                        <option value="">Select company type</option>
                        <option value="individual">Individual Operator</option>
                        <option value="private">Private Limited</option>
                        <option value="public">Public Limited</option>
                        <option value="cooperative">Cooperative</option>
                        <option value="government">Government</option>
                      </select>
                      {errors.companyType && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.companyType}
                        </p>
                      )}
                    </div>

               <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Company Registration Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="text"
                          name="companyRegistrationNo"
                          value={formData.companyRegistrationNo}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.companyRegistrationNo
                              ? "border-red-400"
                              : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="REG-2024-001234"
                        />
                      </div>
                      {errors.companyRegistrationNo && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.companyRegistrationNo}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        PAN Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="text"
                          name="companyPan"
                          value={formData.companyPan}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.companyPan ? "border-red-400" : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="PAN123456789"
                        />
                      </div>
                      {errors.companyPan && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.companyPan}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Company License Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="text"
                          name="companyLicenseNo"
                          value={formData.companyLicenseNo}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.companyLicenseNo
                              ? "border-red-400"
                              : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="LIC-2024-567890"
                        />
                      </div>
                      {errors.companyLicenseNo && (
                        <p className="text-red-400 text-[11px] mt-1">
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
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="Bagmati"
                        />
                      </div>
                      {errors.region && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.region}
                        </p>
                      )}
                    </div>

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
                          } rounded-md px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="Kathmandu"
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
                          } rounded-md px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="Kathmandu District"
                        />
                        {errors.district && (
                          <p className="text-red-400 text-[11px] mt-1">
                            {errors.district}
                          </p>
                        )}
                      </div>
                    </div>

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
                        } rounded-md px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                        placeholder="123 Charging Avenue, Industrial Zone"
                      />
                      {errors.address && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Number of Charging Stations
                      </label>
                      <div className="relative">
                        <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="number"
                          name="stationCount"
                          value={formData.stationCount}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.stationCount
                              ? "border-red-400"
                              : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="15"
                        />
                      </div>
                      {errors.stationCount && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.stationCount}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Step 4 – pricing */}
                {currentStep === 4 && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-3">
                        Charging Types Supported
                      </label>
                      <div className="space-y-2">
                        {["AC_Type1", "AC_Type2", "DC_CCS", "DC_CHAdeMO"].map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              name="chargingType"
                              value={type}
                              checked={formData.chargingType.includes(type)}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-amber-500 rounded bg-slate-900 border-slate-700 focus:ring-amber-500 focus:outline-none cursor-pointer"
                            />
                            <span className="ml-3 text-xs text-slate-200">
                              {type === "AC_Type1" && "AC Type 1 (J1772)"}
                              {type === "AC_Type2" && "AC Type 2 (Mennekes)"}
                              {type === "DC_CCS" && "DC CCS (Combined Charging System)"}
                              {type === "DC_CHAdeMO" && "DC CHAdeMO"}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors.chargingType && (
                        <p className="text-red-400 text-[11px] mt-2">
                          {errors.chargingType}
                        </p>
                      )}
                    </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Opening Hours */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Opening Hours
                      </label>
                      <div
                        className="relative cursor-text"
                        onClick={() => document.getElementById("openingHours")?.focus()}
                      >
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          id="openingHours"
                          type="time"
                          name="openingHours"
                          value={formData.openingHours}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.openingHours ? "border-red-400" : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                        />
                      </div>
                      {errors.openingHours && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.openingHours}
                        </p>
                      )}
                    </div>

                    {/* Closing Hours */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Closing Hours
                      </label>
                      <div
                        className="relative cursor-text"
                        onClick={() => document.getElementById("closingHours")?.focus()}
                      >
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          id="closingHours"
                          type="time"
                          name="closingHours"
                          value={formData.closingHours}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.closingHours ? "border-red-400" : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                        />
                      </div>
                      {errors.closingHours && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.closingHours}
                        </p>
                      )}
                    </div>
                  </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Charge Per kWh (NPR)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="number"
                          step="0.01"
                          name="chargePerKwh"
                          value={formData.chargePerKwh}
                          onChange={handleInputChange}
                          className={`w-full bg-slate-900 border ${
                            errors.chargePerKwh
                              ? "border-red-400"
                              : "border-slate-700"
                          } rounded-md pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          placeholder="25.50"
                        />
                      </div>
                      {errors.chargePerKwh && (
                        <p className="text-red-400 text-[11px] mt-1">
                          {errors.chargePerKwh}
                        </p>
                      )}
                    </div>
                  </>
                )}

              {/* Navigation buttons */}
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

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-amber-500 text-xs font-semibold text-slate-900 hover:bg-amber-600 transition"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-md bg-amber-500 text-xs font-semibold text-slate-900 hover:bg-amber-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : "Submit Application for Review"}
                  </button>
                )}
              </div>

              <p className="mt-5 text-center text-[11px] text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-amber-400 hover:text-amber-300 font-medium"
                >
                  Sign in
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