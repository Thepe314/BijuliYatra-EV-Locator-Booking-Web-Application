package com.ev.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateStationRequestDTO {
	    
	    @NotBlank(message = "Station name is required")
	    @Size(min = 2, max = 100, message = "Station name must be between 2 and 100 characters")
	    private String name;
	    
	    @NotBlank(message = "Location is required")
	    @Size(min = 2, max = 100, message = "Location must be between 2 and 100 characters")
	    private String location;
	    
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
	    @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid ZIP code format")
	    private String zipCode;
	    
	    @NotNull(message = "Level 2 chargers count is required")
	    @Min(value = 0, message = "Level 2 chargers cannot be negative")
	    private Integer level2Chargers;
	    
	    @NotNull(message = "DC Fast chargers count is required")
	    @Min(value = 0, message = "DC Fast chargers cannot be negative")
	    private Integer dcFastChargers;
	    
	    @NotNull(message = "Level 2 rate is required")
	    @DecimalMin(value = "0.01", message = "Level 2 rate must be greater than 0")
	    @DecimalMax(value = "10.00", message = "Level 2 rate cannot exceed $10.00")
	    private Double level2Rate;
	    
	    @NotNull(message = "DC Fast rate is required")
	    @DecimalMin(value = "0.01", message = "DC Fast rate must be greater than 0")
	    @DecimalMax(value = "10.00", message = "DC Fast rate cannot exceed $10.00")
	    private Double dcFastRate;
	    
	    @NotNull(message = "Peak pricing setting is required")
	    private Boolean peakPricing;
	    
	    @DecimalMin(value = "1.0", message = "Peak multiplier must be at least 1.0")
	    @DecimalMax(value = "5.0", message = "Peak multiplier cannot exceed 5.0")
	    private Double peakMultiplier;
	    
	    @Size(max = 500, message = "Notes cannot exceed 500 characters")
	    private String notes;
	    
	    // Getters and Setters
	    public String getName() { return name; }
	    public void setName(String name) { this.name = name; }
	    
	    public String getLocation() { return location; }
	    public void setLocation(String location) { this.location = location; }
	    
	    public String getAddress() { return address; }
	    public void setAddress(String address) { this.address = address; }
	    
	    public String getCity() { return city; }
	    public void setCity(String city) { this.city = city; }
	    
	    public String getState() { return state; }
	    public void setState(String state) { this.state = state; }
	    
	    public String getZipCode() { return zipCode; }
	    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
	    
	    public Integer getLevel2Chargers() { return level2Chargers; }
	    public void setLevel2Chargers(Integer level2Chargers) { this.level2Chargers = level2Chargers; }
	    
	    public Integer getDcFastChargers() { return dcFastChargers; }
	    public void setDcFastChargers(Integer dcFastChargers) { this.dcFastChargers = dcFastChargers; }
	    
	    public Double getLevel2Rate() { return level2Rate; }
	    public void setLevel2Rate(Double level2Rate) { this.level2Rate = level2Rate; }
	    
	    public Double getDcFastRate() { return dcFastRate; }
	    public void setDcFastRate(Double dcFastRate) { this.dcFastRate = dcFastRate; }
	    
	    public Boolean getPeakPricing() { return peakPricing; }
	    public void setPeakPricing(Boolean peakPricing) { this.peakPricing = peakPricing; }
	    
	    public Double getPeakMultiplier() { return peakMultiplier; }
	    public void setPeakMultiplier(Double peakMultiplier) { this.peakMultiplier = peakMultiplier; }
	    
	    public String getNotes() { return notes; }
	    public void setNotes(String notes) { this.notes = notes; }
	}


