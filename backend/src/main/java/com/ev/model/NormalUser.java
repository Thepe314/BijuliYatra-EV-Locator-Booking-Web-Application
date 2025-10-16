package com.ev.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "normal_users")
@DiscriminatorValue("USER")
public class NormalUser extends User {
    
}