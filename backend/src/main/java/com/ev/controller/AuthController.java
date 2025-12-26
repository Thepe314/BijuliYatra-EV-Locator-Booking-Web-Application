package com.ev.controller;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ev.dto.EvOwnerSignupRequest;
import com.ev.dto.LoginRequest;
import com.ev.dto.OperatorSignupRequest;
import com.ev.model.Admin;
import com.ev.model.ChargerOperator;
import com.ev.model.EvOwner;
import com.ev.model.RefreshToken;
import com.ev.model.Role;
import com.ev.model.RoleType;
import com.ev.model.User;
import com.ev.repository.RefreshTokenRepo;
import com.ev.repository.RoleRepository;
import com.ev.repository.UserRepository;
import com.ev.configuration.jwtUtil;


@RestController
@RequestMapping("/auth") 
public class AuthController {
	
	@Autowired
	private jwtUtil jwtUtil;
	
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;
	
	@Autowired
	 private RefreshTokenRepo refreshTokenRepo;
	
	
	@Autowired
	 private UserRepository uRepo;
	
	@Autowired
	 private RoleRepository roleRepo;
	
	
	// --------- EV Owner Signup ---------
    @PostMapping("/signup/ev-owner")
    public ResponseEntity<?> signupEvOwner(@RequestBody @Validated EvOwnerSignupRequest request) {
        if (uRepo.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Email already registered"));
        }

        EvOwner user = new EvOwner();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setFullname(request.getFullname());
        user.setRegion(request.getRegion());
        user.setCity(request.getCity());
        user.setDistrict(request.getDistrict());
        user.setAddress(request.getAddress());
        user.setVehicleBrand(request.getVehicleBrand());
        user.setVehicleModel(request.getVehicleModel());
        user.setVehicleYear(request.getVehicleYear());
        user.setVehileRegistrationModel(request.getVehicleRegistrationNumber());
        user.setChargingType(request.getChargingType());
        user.setJoinDate(LocalDateTime.now());
        user.setStatus("active");

        assignRole(user, RoleType.ROLE_EV_OWNER);

        User savedUser = uRepo.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "EV Owner registration successful",
            "userId", savedUser.getUser_id(),
            "email", savedUser.getEmail(),
            "status", savedUser.getStatus()
        ));
    }

    // --------- Charger Operator Signup ---------
    @PostMapping("/signup/operator")
    public ResponseEntity<?> signupOperator(@RequestBody @Validated OperatorSignupRequest request) {
        if (uRepo.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Email already registered"));
        }

        ChargerOperator user = new ChargerOperator();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setFullname(request.getFullname());
        user.setAddress(request.getAddress());
        user.setJoinDate(LocalDateTime.now());
        user.setStatus("pending"); // needs approval

        assignRole(user, RoleType.ROLE_CHARGER_OPERATOR);

        User savedUser = uRepo.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Charger Operator registration successful. Pending approval.",
            "userId", savedUser.getUser_id(),
            "email", savedUser.getEmail(),
            "status", savedUser.getStatus()
            
        ));
    }

    
    // ---------- Helper to assign role ----------
    private void assignRole(User user, RoleType roleType) {
        Role role = roleRepo.findByName(roleType)
            .orElseThrow(() -> new RuntimeException("Role not found: " + roleType));
        user.setRoles(Set.of(role));
    }

	//Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Validated LoginRequest loginRequest) {
        try {
            // Find user by email
            User existingUser = uRepo.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Validate password
            if (!passwordEncoder.matches(loginRequest.getPassword(), existingUser.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
            }

            // Extract roles
            String roleString = existingUser.getRoleString(); // e.g., "ROLE_ADMIN,ROLE_USER"
            String primaryRole = existingUser.getPrimaryRole(); // e.g., "ROLE_ADMIN"

            // Generate JWT access token
            String accessToken = jwtUtil.generateToken(
                existingUser.getEmail(),
                roleString,
                existingUser.getUser_id()
            );

            // Determine redirect URL based on primary role
            String redirectUrl = getRedirectUrl(primaryRole);
            
            System.out.println("=== LOGIN SUCCESS ===");
            System.out.println("Email: " + existingUser.getEmail());
            System.out.println("Primary Role: " + primaryRole);
            System.out.println("Redirect URL: " + redirectUrl);
            System.out.println("====================");

            // Refresh token handling
            refreshTokenRepo.deleteByUserUser_id(existingUser.getUser_id());

            String sessionId = UUID.randomUUID().toString();
            String jti = jwtUtil.getJti(accessToken);

            RefreshToken rt = new RefreshToken();
            rt.setUser(existingUser);
            rt.setToken(UUID.randomUUID().toString());
            rt.setSessionId(sessionId);
            rt.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
            rt.setJti(jti);
            refreshTokenRepo.save(rt);
            
            System.out.println("LOGIN DEBUG user = " + existingUser.getEmail()
            + ", status = " + existingUser.getStatus());

            // Return response
            return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "token", accessToken,
                "refreshToken", rt.getToken(),
                "role", primaryRole,
                "roles", roleString,
                "sessionId", sessionId,
                "redirect", redirectUrl,
                "userId", existingUser.getUser_id(),
                "status", existingUser.getStatus() 
                
            ));

        } catch (RuntimeException e) {
            System.out.println("=== LOGIN FAILED ===");
            System.out.println("Error: " + e.getMessage());
            System.out.println("====================");
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.out.println("=== LOGIN ERROR ===");
            e.printStackTrace();
            System.out.println("====================");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    /**
     * Helper method to determine redirect URL based on role
     */
    private String getRedirectUrl(String primaryRole) {
        if (primaryRole == null || primaryRole.isEmpty()) {
            return "/";
        }

        // Remove "ROLE_" prefix and convert to lowercase for comparison
        String normalizedRole = primaryRole
            .replace("ROLE_", "")
            .toLowerCase()
            .trim();

        return switch (normalizedRole) {
            case "admin" -> "/admin/dashboard";
            case "charger_operator" -> "/operator/dashboard";
            case "ev_owner" -> "/ev-owner/dashboard";
            default -> {
                System.out.println("WARNING: Unknown role '" + normalizedRole + "', redirecting to /");
                yield "/";
            }
        };
    }
}
