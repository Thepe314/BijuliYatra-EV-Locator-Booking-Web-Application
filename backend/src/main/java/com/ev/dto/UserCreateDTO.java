package com.ev.dto;

import java.math.BigDecimal;

public class UserCreateDTO {
    
    private String fullname;
    private String email;
    private String password;
    private String phoneNumber;
    private String region;
    private String city;
    private String district;
    private String address;
    private String userType; // EV_OWNER, CHARGER_OPERATOR, ADMIN
    private String status;
    private Double latitude;
    private Double longitude;
    
    // EV Owner specific fields
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleYear;
    private String vehicleRegistrationNumber;
    private String batteryCapacity;
    private String chargingType;
    
    // Charger Operator specific fields
    private String companyName;
    private String companyRegistrationNo;
    private String companyPan;
    private String companyLicenseNo;
    private String companyType;
    private String openingHours;
    private String closingHours;

    
    // Getters and Setters
    public String getFullname() {
        return fullname;
    }
    
    public void setFullname(String fullname) {
        this.fullname = fullname;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getRegion() {
        return region;
    }
    
    public void setRegion(String region) {
        this.region = region;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getDistrict() {
        return district;
    }
    
    public void setDistrict(String district) {
        this.district = district;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getUserType() {
        return userType;
    }
    
    public void setUserType(String userType) {
        this.userType = userType;
    }
    
    public String getVehicleBrand() {
        return vehicleBrand;
    }
    
    public void setVehicleBrand(String vehicleBrand) {
        this.vehicleBrand = vehicleBrand;
    }
    
    public String getVehicleModel() {
        return vehicleModel;
    }
    
    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }
    
    public String getVehicleYear() {
        return vehicleYear;
    }
    
    public void setVehicleYear(String vehicleYear) {
        this.vehicleYear = vehicleYear;
    }
    
    public String getVehicleRegistrationNumber() {
        return vehicleRegistrationNumber;
    }
    
    public void setVehicleRegistrationNumber(String vehicleRegistrationNumber) {
        this.vehicleRegistrationNumber = vehicleRegistrationNumber;
    }
    
    public String getBatteryCapacity() {
        return batteryCapacity;
    }
    
    public void setBatteryCapacity(String batteryCapacity) {
        this.batteryCapacity = batteryCapacity;
    }
    
    public String getChargingType() {
        return chargingType;
    }
    
    public void setChargingType(String chargingType) {
        this.chargingType = chargingType;
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public String getCompanyRegistrationNo() {
        return companyRegistrationNo;
    }
    
    public void setCompanyRegistrationNo(String companyRegistrationNo) {
        this.companyRegistrationNo = companyRegistrationNo;
    }
    
    public String getCompanyPan() {
        return companyPan;
    }
    
    public void setCompanyPan(String companyPan) {
        this.companyPan = companyPan;
    }
    
    public String getCompanyLicenseNo() {
        return companyLicenseNo;
    }
    
    public void setCompanyLicenseNo(String companyLicenseNo) {
        this.companyLicenseNo = companyLicenseNo;
    }
    
    public String getCompanyType() {
        return companyType;
    }
    
    public void setCompanyType(String companyType) {
        this.companyType = companyType;
    }
    
    
    public String getOpeningHours() {
        return openingHours;
    }
    
    public void setOpeningHours(String openingHours) {
        this.openingHours = openingHours;
    }
    
    public String getClosingHours() {
        return closingHours;
    }
    
    public void setClosingHours(String closingHours) {
        this.closingHours = closingHours;
    }
    
    
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Double getLatitude() {
		return latitude;
	}

	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	public Double getLongitude() {
		return longitude;
	}

	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}
    
    
}