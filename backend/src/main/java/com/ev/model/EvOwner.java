package com.ev.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "ev_owner")
@DiscriminatorValue("EV_OWNER")
public class EvOwner extends User {
	
	  private String vehicleBrand;  

	    private String vehicleModel; 
	    
	    private String vehicleYear;

	    private String vehileRegistrationModel; 
	    
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

		public void setVehicleModel(String vechicleModel) {
			this.vehicleModel = vechicleModel;
		}

		public String getVehileRegistrationModel() {
			return vehileRegistrationModel;
		}

		public void setVehileRegistrationModel(String vechileRegistrationModel) {
			this.vehileRegistrationModel = vechileRegistrationModel;
		}

		public String getChargingType() {
			return chargingType;
		}

		public void setChargingType(String chargingType) {
			this.chargingType = chargingType;
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
	    
		
	    
    
}