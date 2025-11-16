package com.ev.dto;

import java.time.LocalDateTime;

import com.ev.model.ChargingStations;

public class StationResponseDTO {
    
    private Long id;
    private String name;
    private String location;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private Integer level2Chargers;
    private Integer dcFastChargers;
    private Integer totalChargers;
    private Double level2Rate;
    private Double dcFastRate;
    private Boolean peakPricing;
    private Double peakMultiplier;
    private String notes;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long operatorId;
    
    // Constructor
    public StationResponseDTO(ChargingStations station) {
        this.id = station.getId();
        this.name = station.getName();
        this.location = station.getLocation();
        this.address = station.getAddress();
        this.city = station.getCity();
        this.state = station.getState();
        this.zipCode = station.getZipCode();
        this.level2Chargers = station.getLevel2Chargers();
        this.dcFastChargers = station.getDcFastChargers();
        this.totalChargers = station.getLevel2Chargers() + station.getDcFastChargers();
        this.level2Rate = station.getLevel2Rate();
        this.dcFastRate = station.getDcFastRate();
        this.peakPricing = station.getPeakPricing();
        this.peakMultiplier = station.getPeakMultiplier();
        this.notes = station.getNotes();
        this.status = station.getStatus();
        this.createdAt = station.getCreatedAt();
        this.updatedAt = station.getUpdatedAt();
        this.operatorId = station.getOperatorId();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
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
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Long getOperatorId() { return operatorId; }
    public void setOperatorId(Long operatorId) { this.operatorId = operatorId; }
}
