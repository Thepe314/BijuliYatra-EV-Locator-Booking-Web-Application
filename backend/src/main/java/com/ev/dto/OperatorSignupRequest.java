package com.ev.dto;

import java.math.BigDecimal;

public class OperatorSignupRequest extends SignupRequestBase {


    private String companyName;

    private String companyRegistrationNo; 
    
    private String companyPan;
    
    private String companyLicenseNo;
    
    private String companyType;
    
    private String stationCount;
    
    private String chargingType;
    
    private String openingHours;
    
    private String closingHours;
    
    private BigDecimal chargePerKwh;

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

	public String getStationCount() {
		return stationCount;
	}

	public void setStationCount(String stationCount) {
		this.stationCount = stationCount;
	}

	public String getChargingType() {
		return chargingType;
	}

	public void setChargingType(String chargingType) {
		this.chargingType = chargingType;
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

	public BigDecimal getChargePerKwh() {
		return chargePerKwh;
	}

	public void setChargePerKwh(BigDecimal chargePerKwh) {
		this.chargePerKwh = chargePerKwh;
	}
    
    
    
}
