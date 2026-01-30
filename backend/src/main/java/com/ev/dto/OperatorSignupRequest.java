package com.ev.dto;

import java.math.BigDecimal;

public class OperatorSignupRequest extends SignupRequestBase {


    private String companyName;

    private String companyRegistrationNo; 
    
    private String companyPan;
    
    private String companyLicenseNo;
    
    private String companyType;
    
    private String openingHours;
    
    private String closingHours;
    
    
    private Double latitude;
    private Double longitude;

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
