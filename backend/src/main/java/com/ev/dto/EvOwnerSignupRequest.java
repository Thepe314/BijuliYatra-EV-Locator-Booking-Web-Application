package com.ev.dto;

public class EvOwnerSignupRequest extends SignupRequestBase {

    private String vehicleBrand;

    private String vehicleModel;

    private String vehicleYear;
    
  
    private String vehicleRegistrationNumber;

   
    private String chargingType;
    
    private String batteryCapacity;


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


	public String getBatteryCapacity() {
		return batteryCapacity;
	}


	public void setBatteryCapacity(String batteryCapacity) {
		this.batteryCapacity = batteryCapacity;
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

  
}
