package com.ev.model;


import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Owner of this vehicle (EvOwner extends User)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore 
    private EvOwner owner;

    @Column(nullable = false)
    private String vehicleBrand;      

    @Column(nullable = false)
    private String vehicleModel;      

    @Column(nullable = true)
    private String vehicleYear;      

    @Column(nullable = true)
    private String vehicleRegistrationNumber; 

    @Column(nullable = true)
    private String chargingType;      

    @Column(nullable = true)
    private String batteryCapacity;  

    @Column(nullable = false)
    private boolean primaryVehicle = false;
    
    @Column(name = "image_url", length = 1000, nullable = true) 
    private String imageUrl;

    @Column(nullable = true)
    private String colour;  


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EvOwner getOwner() {
        return owner;
    }

    public void setOwner(EvOwner owner) {
        this.owner = owner;
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

    public String getChargingType() {
        return chargingType;
    }

    public void setChargingType(String chargingType) {
        this.chargingType = chargingType;
    }

    public String getBatteryCapacity() {
        return batteryCapacity;
    }

    public void setBatteryCapacity(String batteryCapacity) {
        this.batteryCapacity = batteryCapacity;
    }

    public boolean isPrimaryVehicle() {
        return primaryVehicle;
    }

    public void setPrimaryVehicle(boolean primaryVehicle) {
        this.primaryVehicle = primaryVehicle;
    }

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public String getColour() {
		return colour;
	}

	public void setColour(String colour) {
		this.colour = colour;
	}
    
	
    
}

