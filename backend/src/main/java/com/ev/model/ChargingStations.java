package com.ev.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "charging_stations")
public class ChargingStations {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
   
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private String address;
    
    @Column(nullable = false)
    private String city;
    
    @Column(nullable = false)
    private String state;
    
    @Column(nullable = false)
    private String zipCode;
    
    @Column(nullable = false)
    private Integer level2Chargers;
    
    @Column(nullable = false)
    private Integer dcFastChargers;
    
    @Column(nullable = false)
    private Double level2Rate;
    
    @Column(nullable = false)
    private Double dcFastRate;
    
    @Column(nullable = false)
    private Boolean peakPricing = false;
    
    @Column(nullable = false)
    private Double peakMultiplier = 1.25;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(nullable = false)
    private String status = "operational";
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // ✅ Keep only this - it handles both the relationship AND the foreign key
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "operator_id", nullable = false)
    private User operator;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    @Column(name = "total_slots", nullable = false)
    private Integer totalSlots = 4;

    @Column(name = "available_slots", nullable = false)
    private Integer availableSlots = 4;
    
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

    public User getOperator() { return operator; }
    public void setOperator(User operator) { this.operator = operator; }
    
    // ✅ Convenience method to get operator ID from the relationship
    public Long getOperatorId() {
        return operator != null ? operator.getUser_id() : null;
    }

    public Integer getTotalSlots() { return totalSlots; }
    public void setTotalSlots(Integer totalSlots) { this.totalSlots = totalSlots; }

    public Integer getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(Integer availableSlots) { this.availableSlots = availableSlots; }
    
    
    
    
}