package com.ev.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import com.ev.model.Role;
import com.ev.model.RoleType;
import com.ev.repository.RoleRepository;

import jakarta.annotation.PostConstruct;

@Configuration
public class RoleInitializer {
	
	
	    @Autowired
	    private RoleRepository roleRepo;

	    @PostConstruct
	    public void initRoles() {
	        // Check and create roles if they don't exist
	        createRoleIfNotExists(RoleType.ROLE_EV_OWNER);
	        createRoleIfNotExists(RoleType.ROLE_CHARGER_OPERATOR);
	        createRoleIfNotExists(RoleType.ROLE_ADMIN);
	    }

	    private void createRoleIfNotExists(RoleType roleType) {
	        if (roleRepo.findByName(roleType).isEmpty()) {
	            Role role = new Role();
	            role.setName(roleType);
	            roleRepo.save(role);
	            System.out.println("Created role: " + roleType);
	        }
	    }
	}

