  import React, { useState } from 'react';
  import { Zap, Mail, Lock, User, Eye, EyeOff, Phone, MapPin, Car, Battery, ArrowRight, ArrowLeft, Check } from 'lucide-react';
  import { Link, useNavigate } from 'react-router-dom';
  import { authService } from '../../Services/api';
  import evChargerImg from "../Assets/stations/ev-charger.jpg";
  import { notify } from "../../Utils/notify";
  import StationLocationPicker from '../../Services/StationLocationPicker';

  export default function EVOwnerSignUp() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    const [formData, setFormData] = useState({
    // Step 1
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",

    // Step 2
    region: "",
    city: "",
    district: "",
    address: "",
    latitude: null,
    longitude: null,

    // Step 3
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    registrationNumber: "",
    chargingType: "",
    batteryCapacity: "",
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
        // if (!formData.vehicleBrand.trim()) newErrors.vehicleBrand = "Vehicle brand is required";
        // if (!formData.vehicleModel.trim()) newErrors.vehicleModel = "Vehicle model is required";
        // if (!formData.vehicleYear.trim()) newErrors.vehicleYear = "Vehicle year is required";
        // if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
        // if (!formData.chargingType) newErrors.chargingType = "Charging type is required";
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
    region: formData.region,
    city: formData.city,
    district: formData.district,
    address: formData.address,
    vehicleBrand: formData.vehicleBrand,
    vehicleModel: formData.vehicleModel,
    vehicleYear: formData.vehicleYear,
    vehicleRegistrationNumber: formData.registrationNumber,
    chargingType: formData.chargingType,
    batteryCapacity: formData.batteryCapacity || null,
    latitude: formData.latitude,
    longitude: formData.longitude,
  };

      const response = await authService.signupEvOwner(userData);
      console.log("Signup successful:", response);

      // Toast success
      notify.success("Signup successful! Please log in to continue.");

      await new Promise((resolve) => setTimeout(resolve, 300));
      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);

      let msg = "Signup failed. Please try again later.";
      if (error.response) {
        if (error.response.status === 409) {
          msg = "An account with this email already exists.";
        } else if (error.response.data && error.response.data.message) {
          msg = error.response.data.message;
        } else {
          msg = "Signup failed. Please try again later.";
        }
      } else {
        msg = "Unable to connect to the server. Please try again later.";
      }

      setApiError(msg);
      notify.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationChange = async ({ lat, lng }) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const addr = data.address || {};

      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        region: addr.state || prev.region,
        city: addr.city || addr.town || addr.village || prev.city,
        district: addr.county || addr.suburb || prev.district,
        address: data.display_name || prev.address,
      }));
    } catch (e) {
      console.error("Reverse geocode failed", e);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      notify.error("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address || {};

          setFormData((prev) => ({
            ...prev,
            region: addr.state || prev.region,
            city:
              addr.city ||
              addr.town ||
              addr.village ||
              prev.city,
            district:
              addr.county ||
              addr.suburb ||
              prev.district,
            address: data.display_name || prev.address,
          }));

          notify.info("Location detected and address filled from map.");
        } catch (e) {
          console.error("Reverse geocode failed", e);
          notify.error("Could not fetch address from your location.");
        }
      },
      (err) => {
        console.error("Geolocation error", err);
        notify.error("Failed to get your location. Please allow location access.");
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
  <div className="grid md:grid-cols-2">

    <div className="relative flex flex-col justify-between overflow-hidden">
      {/* EV charging background image */}
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

    
        <div>
          <h1 className="text-4xl font-semibold text-slate-900 mb-4 leading-snug">
            Power Your Journey{" "}
            <br className="hidden sm:block" />
            with Smart EV Charging
          </h1>
          <p className="text-sm text-slate-700 max-w-md mb-8">
            Connect to thousands of charging stations across India. Monitor
            your charging sessions, manage your stations, and drive the
            electric revolution.
          </p>

          <div className="flex flex-wrap gap-8 text-emerald-500 text-sm font-semibold">
            <div>
              <div className="text-xl">5,000+</div>
              <div className="text-xs uppercase tracking-wide text-slate-600">
                Charging Stations
              </div>
            </div>
            <div>
              <div className="text-xl">50K+</div>
              <div className="text-xs uppercase tracking-wide text-slate-600">
                Active Users
              </div>
            </div>
            <div>
              <div className="text-xl">24/7</div>
              <div className="text-xs uppercase tracking-wide text-slate-600">
                Support
              </div>
            </div>
          </div>
        </div>

      
        <p className="mt-10 text-xs text-slate-500">
          © {new Date().getFullYear()} BijuliYatra. All rights reserved.
        </p>
      </div>
    </div>

        
          <div className="bg-white px-10 py-10 flex flex-col justify-center border-l border-slate-200">
            <div className="w-full max-w-md mx-auto">
              <h2 className="text-4xl font-semibold text-slate-900 mb-1">
                Create Account
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Join the electric revolution today.
              </p>

              {/* Role pills */}
              <div className="flex items-center gap-2 mb-7">
                <span className="text-xs text-slate-500">I am an</span>
                <div className="flex gap-2 flex-1">
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-emerald-500 text-sm font-medium text-white py-2"
                  >
                    EV Owner
                  </button>
                  <Link
                    to="/signup/operator"
                    className="flex-1 rounded-full bg-slate-100 text-sm font-medium text-slate-700 py-2 text-center hover:bg-slate-200 transition"
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
                        className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 text-xs ${
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
                        className={`text-xs font-medium ${
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
                <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">
                  {apiError}
                </div>
              )}

              {/* FORM STEPS */}
              <div className="space-y-4">
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
                            errors.fullName ? "border-red-400" : "border-slate-300"
                          } rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1">
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
                          placeholder="you@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
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
                        <p className="text-red-500 text-xs mt-1">
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
                        <p className="text-red-500 text-xs mt-1">
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
                        <p className="text-red-500 text-xs mt-1">
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
                            errors.region ? "border-red-400" : "border-slate-300"
                          } rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="Bagmati"
                        />
                      </div>
                      {errors.region && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.region}
                        </p>
                      )}
                    </div>

                    {/* City + District */}
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
                          } rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="Lalitpur"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1">
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
                          } rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="Jhamsikhel"
                        />
                        {errors.district && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.district}
                          </p>
                        )}
                      </div>
                    </div>

                {/* Address */}
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
                          errors.address ? "border-red-400" : "border-slate-300"
                        } rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="House no./building/street/area"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.address}
                        </p>
                      )}

                    
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Use my current location to fill address
                      </button>
                    </div>

                  
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Home Location (click on map)
                      </label>
                      <div className="h-56 rounded-xl overflow-hidden border border-slate-200">
                        <StationLocationPicker
                          value={
                            formData.latitude != null && formData.longitude != null
                              ? { lat: formData.latitude, lng: formData.longitude }
                              : { lat: 27.7172, lng: 85.324 } // default center (Kathmandu)
                          }
                          onChange={handleLocationChange}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Click on the map to set your location; region, city, district and
                        address will auto‑fill.
                      </p>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    {/* Vehicle brand + model */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Vehicle Brand
                        </label>
                        <div className="relative">
                          <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="text"
                            name="vehicleBrand"
                            value={formData.vehicleBrand}
                            onChange={handleInputChange}
                            className={`w-full bg-white border ${
                              errors.vehicleBrand
                                ? "border-red-400"
                                : "border-slate-300"
                            } rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                            placeholder="Tesla"
                          />
                        </div>
                        {errors.vehicleBrand && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.vehicleBrand}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Vehicle Model
                        </label>
                        <input
                          type="text"
                          name="vehicleModel"
                          value={formData.vehicleModel}
                          onChange={handleInputChange}
                          className={`w-full bg-white border ${
                            errors.vehicleModel
                              ? "border-red-400"
                              : "border-slate-300"
                          } rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="Model 3"
                        />
                        {errors.vehicleModel && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.vehicleModel}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Year + registration */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Year
                        </label>
                        <input
                          type="text"
                          name="vehicleYear"
                          value={formData.vehicleYear}
                          onChange={handleInputChange}
                          className={`w-full bg-white border ${
                            errors.vehicleYear
                              ? "border-red-400"
                              : "border-slate-300"
                          } rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="2024"
                        />
                        {errors.vehicleYear && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.vehicleYear}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleInputChange}
                          className={`w-full bg-white border ${
                            errors.registrationNumber
                              ? "border-red-400"
                              : "border-slate-300"
                          } rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          placeholder="ABC-1234"
                        />
                        {errors.registrationNumber && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.registrationNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Charging type */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Charging Type
                      </label>
                      <select
                        name="chargingType"
                        value={formData.chargingType}
                        onChange={handleInputChange}
                        className={`w-full bg-white border ${
                          errors.chargingType
                            ? "border-red-400"
                            : "border-slate-300"
                        } rounded-md px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      >
                        <option value="">Select charging type</option>
                        <option value="AC">AC Charging (Type 1/Type 2)</option>
                        <option value="DC">
                          DC Fast Charging (CCS/CHAdeMO)
                        </option>
                        <option value="Both">Both AC and DC</option>
                      </select>
                      {errors.chargingType && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.chargingType}
                        </p>
                      )}
                    </div>

                    {/* Battery capacity */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Battery Capacity (Optional)
                      </label>
                      <div className="relative">
                        <Battery className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          name="batteryCapacity"
                          value={formData.batteryCapacity}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-1 text-center text-xs text-slate-500">
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
                  Signup as Charging Operator?{" "}
                  <Link
                    to="/signup/operator"
                    className="text-emerald-500 hover:text-emerald-600 font-medium"
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