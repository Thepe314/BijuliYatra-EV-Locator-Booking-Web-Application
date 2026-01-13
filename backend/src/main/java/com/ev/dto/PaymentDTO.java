package com.ev.dto;

public class PaymentDTO {
    private Long id;
    private String type;      // "credit" or "debit"
    private String title;     // e.g. "Charging Session - PowerHub CP"
    private String datetime;  // formatted for UI
    private Double amount;    // signed value
    private String PaymentMethod;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getDatetime() {
		return datetime;
	}
	public void setDatetime(String datetime) {
		this.datetime = datetime;
	}
	public Double getAmount() {
		return amount;
	}
	public void setAmount(Double amount) {
		this.amount = amount;
	}
	public String getPaymentMethod() {
		return PaymentMethod;
	}
	public void setPaymentMethod(String paymentMethod) {
		PaymentMethod = paymentMethod;
	}


    
}