package com.ev.dto;

import jakarta.persistence.Column;

public class LoginRequest {

	 private String password;

	    private String phoneNumber;


	    @Column(unique = true, nullable = false)
	    private String email;

	    
	    private String fullname;
	    
	    
	    

		public String getPassword() {
			return password;
		}


		public void setPassword(String password) {
			this.password = password;
		}


		public String getPhoneNumber() {
			return phoneNumber;
		}


		public void setPhoneNumber(String phoneNumber) {
			this.phoneNumber = phoneNumber;
		}


		public String getEmail() {
			return email;
		}


		public void setEmail(String email) {
			this.email = email;
		}


		public String getFullname() {
			return fullname;
		}


		public void setFullname(String fullname) {
			this.fullname = fullname;
		}

	    
	    
}


