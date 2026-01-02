package com.ev.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;

public class CreateStationRequestDTO {


    @JsonProperty("operatorId")
    private Long operatorId;

    @NotBlank(message = "Station name is required")
    @Size(min = 2, max = 100, message = "Station name must be between 2 and 100 characters")
    private String name;

    @Size(max = 100, message = "Location description must be at most 100 characters")
    private String location;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude cannot be less than -90.0")
    @DecimalMax(value = "90.0", message = "Latitude cannot be more than 90.0")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude cannot be less than -180.0")
    @DecimalMax(value = "180.0", message = "Longitude cannot be more than 180.0")
    private Double longitude;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 200, message = "Address must be between 5 and 200 characters")
    private String address;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 50, message = "City must be between 2 and 50 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 50, message = "State must be between 2 and 50 characters")
    private String state;

    @NotBlank(message = "ZIP code is required")
    @Pattern(regexp = "\\d{5}", message = "ZIP code must be exactly 5 digits")
    private String zipCode;

    @NotNull(message = "Level 2 chargers count is required")
    @Min(value = 0, message = "Level 2 chargers cannot be negative")
    private Integer level2Chargers;

    @NotNull(message = "DC Fast chargers count is required")
    @Min(value = 0, message = "DC Fast chargers cannot be negative")
    private Integer dcFastChargers;

    @NotNull(message = "Level 2 rate is required")
    @DecimalMin(value = "0.01", message = "Level 2 rate must be at least $0.01")
    @DecimalMax(value = "10.00", message = "Level 2 rate cannot exceed $10.00")
    private Double level2Rate;

    @NotNull(message = "DC Fast rate is required")
    @DecimalMin(value = "0.01", message = "DC Fast rate must be at least $0.01")
    @DecimalMax(value = "10.00", message = "DC Fast rate cannot exceed $10.00")
    private Double dcFastRate;

    @NotNull(message = "Peak pricing setting is required")
    private Boolean peakPricing;

    @DecimalMin(value = "1.01", message = "Peak multiplier must be greater than 1.0 (e.g. 1.5 = 50% higher)")
    @DecimalMax(value = "5.0", message = "Peak multiplier cannot exceed 5.0")
    private Double peakMultiplier;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    // Custom validation: peakMultiplier required only if peakPricing = true
    @AssertTrue(message = "Peak multiplier must be greater than 1.0 when peak pricing is enabled")
    private boolean isPeakMultiplierValid() {
        return !Boolean.TRUE.equals(peakPricing) || 
               (peakMultiplier != null && peakMultiplier > 1.0);
    }

    // At least one charger must be present
    @AssertTrue(message = "At least one Level 2 or DC Fast charger is required")
    private boolean isAtLeastOneChargerPresent() {
        int l2 = level2Chargers != null ? level2Chargers : 0;
        int dc = dcFastChargers != null ? dcFastChargers : 0;
        return (l2 + dc) > 0;
    }
    

    // === Getters and Setters ===

    public Long getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(Long operatorId) {
        this.operatorId = operatorId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public Integer getLevel2Chargers() {
        return level2Chargers;
    }

    public void setLevel2Chargers(Integer level2Chargers) {
        this.level2Chargers = level2Chargers;
    }

    public Integer getDcFastChargers() {
        return dcFastChargers;
    }

    public void setDcFastChargers(Integer dcFastChargers) {
        this.dcFastChargers = dcFastChargers;
    }

    public Double getLevel2Rate() {
        return level2Rate;
    }

    public void setLevel2Rate(Double level2Rate) {
        this.level2Rate = level2Rate;
    }

    public Double getDcFastRate() {
        return dcFastRate;
    }

    public void setDcFastRate(Double dcFastRate) {
        this.dcFastRate = dcFastRate;
    }

    public Boolean getPeakPricing() {
        return peakPricing;
    }

    public void setPeakPricing(Boolean peakPricing) {
        this.peakPricing = peakPricing;
    }

    public Double getPeakMultiplier() {
        return peakMultiplier;
    }

    public void setPeakMultiplier(Double peakMultiplier) {
        this.peakMultiplier = peakMultiplier;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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