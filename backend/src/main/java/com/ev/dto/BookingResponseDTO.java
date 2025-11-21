package com.ev.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ev.model.Booking;

public class BookingResponseDTO {
    private Long id;
    private Long stationId;
    private String stationName;
    private String address;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String connectorType;
    private Double totalAmount;
    private String status;
    private String vehicleName;

    // Constructors
    public BookingResponseDTO() {}
    
    public BookingResponseDTO(Booking booking) {
        this.id = booking.getId();
        this.stationId = booking.getStation().getId();
        this.stationName = booking.getStation().getName();
        this.address = booking.getStation().getAddress();
        this.startTime = booking.getStartTime();
        this.endTime = booking.getEndTime();
        this.connectorType = booking.getConnectorType();
        this.totalAmount = booking.getTotalAmount();
        this.status = booking.getStatus().name();
        // Optional: get vehicle name from user if needed
        
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getStationId() {
		return stationId;
	}

	public void setStationId(Long stationId) {
		this.stationId = stationId;
	}

	public String getStationName() {
		return stationName;
	}

	public void setStationName(String stationName) {
		this.stationName = stationName;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public LocalDateTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalDateTime startTime) {
		this.startTime = startTime;
	}

	public LocalDateTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalDateTime endTime) {
		this.endTime = endTime;
	}

	public String getConnectorType() {
		return connectorType;
	}

	public void setConnectorType(String connectorType) {
		this.connectorType = connectorType;
	}

	public Double getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(Double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getVehicleName() {
		return vehicleName;
	}

	public void setVehicleName(String vehicleName) {
		this.vehicleName = vehicleName;
	}
}