package com.ev.dto;

import java.math.BigDecimal;

public class PaymentDTO {
    private Long id;
    private String type;    
    private String title;    
    private String datetime;  
    private BigDecimal amount;    
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
	public BigDecimal getAmount() {
		return amount;
	}
	public void setAmount(BigDecimal bigDecimal) {
		this.amount = bigDecimal;
	}
	public String getPaymentMethod() {
		return PaymentMethod;
	}
	public void setPaymentMethod(String paymentMethod) {
		PaymentMethod = paymentMethod;
	}


    
}