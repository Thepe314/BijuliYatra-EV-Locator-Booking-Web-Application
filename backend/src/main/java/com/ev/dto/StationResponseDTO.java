// StationResponseDTO.java
package com.ev.dto;

import com.ev.model.ChargingStations;
import com.ev.model.ChargerOperator;
import com.ev.model.User;

public class StationResponseDTO {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String location;
    private Integer level2Chargers;
    private Integer dcFastChargers;
    private Integer totalChargers;
    private Double level2Rate;
    private Double dcFastRate;
    private Boolean peakPricing;
    private Double peakMultiplier;
    private String notes;
    private String status;
    private String createdAt;
    private String updatedAt;
    private Long operatorId;
    private String imageKey;
    private Double latitude;
    private Double longitude;
    private String operatorName;

    // Constructors
    public StationResponseDTO() {}

    public StationResponseDTO(ChargingStations station) {
        this.id = station.getId();
        this.name = station.getName();
        this.address = station.getAddress();
        this.city = station.getCity();
        this.state = station.getState();
        this.zipCode = station.getZipCode();
        this.location = station.getLocation();
        this.level2Chargers = station.getLevel2Chargers();
        this.dcFastChargers = station.getDcFastChargers();
        this.totalChargers = level2Chargers + dcFastChargers;
        this.level2Rate = station.getLevel2Rate();
        this.dcFastRate = station.getDcFastRate();
        this.peakPricing = station.getPeakPricing();
        this.peakMultiplier = station.getPeakMultiplier();
        this.notes = station.getNotes();
        this.status = station.getStatus();
        this.createdAt = station.getCreatedAt().toString();
        this.updatedAt = station.getUpdatedAt().toString();
        this.operatorId = station.getOperatorId();
        this.imageKey = station.getImageKey();
        this.latitude = station.getLatitude();
        this.longitude = station.getLongitude();
        

        // Extract company name safely
        User operator = station.getOperator();
        if (operator instanceof ChargerOperator chargerOp && chargerOp.getCompanyName() != null) {
            this.operatorName = chargerOp.getCompanyName();
        } else if (operator != null) {
            this.operatorName = operator.getFullname(); // fallback to owner name
        } else {
            this.operatorName = null; // will show "Platform Station" in frontend
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getLevel2Chargers() { return level2Chargers; }
    public void setLevel2Chargers(Integer level2Chargers) { this.level2Chargers = level2Chargers; }
    public Integer getDcFastChargers() { return dcFastChargers; }
    public void setDcFastChargers(Integer dcFastChargers) { this.dcFastChargers = dcFastChargers; }
    public Integer getTotalChargers() { return totalChargers; }
    public void setTotalChargers(Integer totalChargers) { this.totalChargers = totalChargers; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    public Long getOperatorId() { return operatorId; }
    public void setOperatorId(Long operatorId) { this.operatorId = operatorId; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

	public String getImageKey() {
		return imageKey;
	}

	public void setImageKey(String imageKey) {
		this.imageKey = imageKey;
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