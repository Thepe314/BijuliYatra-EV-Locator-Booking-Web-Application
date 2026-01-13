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
    private LocalDateTime bookedAt;
    
    private String evOwnerName;
    private String evOwnerPhone;
    private String evOwnerEmail;
    private String paymentMethod;  
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
        this.evOwnerName = booking.getEvOwner().getFullname();
        this.evOwnerPhone = booking.getEvOwner().getPhoneNumber();
        this.evOwnerEmail = booking.getEvOwner().getEmail();
        this.bookedAt = booking.getBookedAt();
        this.paymentMethod = booking.getPaymentMethod() != null
                ? booking.getPaymentMethod().name()  // e.g. "CARD", "KHALTI", "ESEWA"
                : null;
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

	public String getEvOwnerName() {
		return evOwnerName;
	}

	public void setEvOwnerName(String evOwnerName) {
		this.evOwnerName = evOwnerName;
	}

	public String getEvOwnerPhone() {
		return evOwnerPhone;
	}

	public void setEvOwnerPhone(String evOwnerPhone) {
		this.evOwnerPhone = evOwnerPhone;
	}

	public String getEvOwnerEmail() {
		return evOwnerEmail;
	}

	public void setEvOwnerEmail(String evOwnerEmail) {
		this.evOwnerEmail = evOwnerEmail;
	}

	public LocalDateTime getBookedAt() {
		return bookedAt;
	}

	public void setBookedAt(LocalDateTime bookedAt) {
		this.bookedAt = bookedAt;
	}

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	
	
	
}