package com.ev.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "ev_owner")
@DiscriminatorValue("EV_OWNER")
public class EvOwner extends User {
    
}