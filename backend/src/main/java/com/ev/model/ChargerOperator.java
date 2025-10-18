package com.ev.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "charger_operator")
@DiscriminatorValue("CHARGER_OPERATOR")
public class ChargerOperator extends User {
	

}
