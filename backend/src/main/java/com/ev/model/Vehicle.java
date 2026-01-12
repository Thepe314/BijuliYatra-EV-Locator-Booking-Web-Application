package com.ev.model;


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
    private EvOwner owner;

    @Column(nullable = false)
    private String vehicleBrand;      // e.g. "Tata", "Tesla"

    @Column(nullable = false)
    private String vehicleModel;      // e.g. "Nexon EV", "Model 3"

    @Column(nullable = true)
    private String vehicleYear;       // keep String to match your EvOwner field

    @Column(nullable = true)
    private String vehicleRegistrationNumber; // your vehileRegistrationModel

    @Column(nullable = true)
    private String chargingType;      // e.g. "CCS2", "Type 2"

    @Column(nullable = true)
    private String batteryCapacity;   // e.g. "30.2 kWh"

    @Column(nullable = false)
    private boolean primaryVehicle = false;

    // ===== Getters and setters =====

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
}

