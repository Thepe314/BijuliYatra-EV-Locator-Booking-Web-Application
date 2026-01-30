package com.ev.dto;

import com.ev.model.Vehicle;

public class VehicleResponseDTO {
    private Long id;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleYear;
    private String vehicleRegistrationNumber;
    private String chargingType;
    private String batteryCapacity;
    private boolean primaryVehicle;
    private String imageUrl;  
    private String colour;

    public VehicleResponseDTO() {}

    public VehicleResponseDTO(Vehicle vehicle) {
        this.id = vehicle.getId();
        this.vehicleBrand = vehicle.getVehicleBrand();
        this.vehicleModel = vehicle.getVehicleModel();
        this.vehicleYear = vehicle.getVehicleYear();
        this.vehicleRegistrationNumber = vehicle.getVehicleRegistrationNumber();
        this.chargingType = vehicle.getChargingType();
        this.batteryCapacity = vehicle.getBatteryCapacity();
        this.primaryVehicle = vehicle.isPrimaryVehicle();
        this.colour = vehicle.getColour();
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

 
    
    
}
