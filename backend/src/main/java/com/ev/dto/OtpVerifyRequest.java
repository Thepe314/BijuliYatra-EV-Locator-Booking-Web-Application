package com.ev.dto;

import java.time.LocalDateTime;

public class OtpVerifyRequest {
	 private String email;
	 private String otpCode;
	 private LocalDateTime otpExpiry;
	 public String getEmail() {
		 return email;
	 }
	 public void setEmail(String email) {
		 this.email = email;
	 }
	 public String getOtpCode() {
		 return otpCode;
	 }
	 public void setOtpCode(String otpCode) {
		 this.otpCode = otpCode;
	 }
	 public LocalDateTime getOtpExpiry() {
		 return otpExpiry;
	 }
	 public void setOtpExpiry(LocalDateTime otpExpiry) {
		 this.otpExpiry = otpExpiry;
	 }
	 
	 
}
