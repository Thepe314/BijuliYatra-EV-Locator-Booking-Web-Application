package com.ev.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.JoinColumn;


@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type")
@Table(name = "users")
public abstract class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long user_id;

    private String password;

    private String phoneNumber;

    private String fullname;
    
    private String address;

    private String vehicleBrand;  

    private String vechicleModel; 

    private String vechileRegistrationModel; 
    
    private String chargingType; 
    
    private LocalDateTime joinDate;
    
    private String status;
    
    private String otpCode;
    
    private LocalDateTime otpExpiry;
    
    // Composition: roles
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    
   
    @Column(unique = true, nullable = false)
    private String email;


	public Long getUser_id() {
		return user_id;
	}


	public void setUser_id(Long user_id) {
		this.user_id = user_id;
	}


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


	public String getFullname() {
		return fullname;
	}


	public void setFullname(String fullname) {
		this.fullname = fullname;
	}


	

	public String getAddress() {
		return address;
	}


	public void setAddress(String address) {
		this.address = address;
	}


	public String getVehicleBrand() {
		return vehicleBrand;
	}


	public void setVehicleBrand(String vehicleBrand) {
		this.vehicleBrand = vehicleBrand;
	}


	public String getVechicleModel() {
		return vechicleModel;
	}


	public void setVechicleModel(String vechicleModel) {
		this.vechicleModel = vechicleModel;
	}


	public String getVechileRegistrationModel() {
		return vechileRegistrationModel;
	}


	public void setVechileRegistrationModel(String vechileRegistrationModel) {
		this.vechileRegistrationModel = vechileRegistrationModel;
	}


	public String getChargingType() {
		return chargingType;
	}


	public void setChargingType(String chargingType) {
		this.chargingType = chargingType;
	}


	public LocalDateTime getJoinDate() {
		return joinDate;
	}


	public void setJoinDate(LocalDateTime joinDate) {
		this.joinDate = joinDate;
	}


	public String getStatus() {
		return status;
	}


	public void setStatus(String status) {
		this.status = status;
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


	public Set<Role> getRoles() {
		return roles;
	}


	public void setRoles(Set<Role> roles) {
		this.roles = roles;
	}


	public String getEmail() {
		return email;
	}


	public void setEmail(String email) {
		this.email = email;
	}

    
    
    

}
