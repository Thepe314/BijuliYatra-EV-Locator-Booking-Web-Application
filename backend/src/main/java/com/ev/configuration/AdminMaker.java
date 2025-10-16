package com.ev.configuration;


import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.ev.model.Admin;
import com.ev.model.Role;
import com.ev.model.RoleType;
import com.ev.model.User;
import com.ev.repository.RoleRepository;
import com.ev.repository.UserRepository;

@Configuration
public class AdminMaker {

    @Autowired
    private UserRepository uRepo;

    @Autowired
    private RoleRepository roleRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PlatformTransactionManager txManager;

    @Bean
    public CommandLineRunner createDefaultAdmin() {
        return args -> {
            new TransactionTemplate(txManager).execute(status -> {

                String adminEmail = "admin@gmail.com";
                String adminPassword = "admin123";

                Optional<User> admin = uRepo.findByEmail(adminEmail);
                if (admin.isEmpty()) {

                    Admin newAdmin = new Admin();
                    newAdmin.setEmail(adminEmail);
                    newAdmin.setPassword(passwordEncoder.encode(adminPassword));
                    newAdmin.setFullname("admin");
   

                    Role adminRole = roleRepo.findByName(RoleType.ROLE_ADMIN)
                            .orElseGet(() -> {
                                Role r = new Role();
                                r.setName(RoleType.ROLE_ADMIN);
                                return roleRepo.save(r);
                            });

                    // assign role to user
                    newAdmin.getRoles().add(adminRole);

                    uRepo.save(newAdmin);
                    System.out.println("Default admin user created.");
                } else {
                    System.out.println("Admin user already exists.");
                }

                return null;
            });
        };
    }
}