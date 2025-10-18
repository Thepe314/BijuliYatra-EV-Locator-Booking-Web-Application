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

import com.ev.dto.LoginRequest;
import com.ev.dto.SignupRequest;
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
	
	
	//Signup 
	@PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Validated SignupRequest signupRequest) {
        try {
            // Check if email already exists
            if (uRepo.findByEmail(signupRequest.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already registered"));
            }

            // Create user based on role
            User user;
            RoleType roleType;
            
            switch (signupRequest.getRole().toUpperCase()) {
                case "ADMIN":
                    user = new Admin();
                    roleType = RoleType.ROLE_ADMIN;
                    break;
                case "CHARGER_OPERATOR":
                    user = new ChargerOperator();
                    roleType = RoleType.ROLE_CHARGER_OPERATOR;
                    break;
                case "EV_OWNER":
                    user = new EvOwner();
                    roleType = RoleType.ROLE_EV_OWNER;
                    break;
                default:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid role. Must be EV_OWNER, CHARGER_OPERATOR, or ADMIN"));
            }

            // Set common user fields
            user.setEmail(signupRequest.getEmail());
            user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
            user.setPhoneNumber(signupRequest.getPhoneNumber());
            user.setFullname(signupRequest.getFullname());
            user.setAddress(signupRequest.getAddress());
            user.setVehicleBrand(signupRequest.getVehicleBrand());
            user.setVechicleModel(signupRequest.getVehicleModel());
            user.setVechileRegistrationModel(signupRequest.getVehicleRegistrationNumber());
            user.setChargingType(signupRequest.getChargingType());
            user.setJoinDate(LocalDateTime.now());
            
            // Set status based on role
            if (roleType == RoleType.ROLE_CHARGER_OPERATOR) {
                user.setStatus("pending"); // Operators need approval
            } else {
                user.setStatus("active");
            }

            // Assign role
            Role role = roleRepo.findByName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleType));
            
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);

            // Save user
            User savedUser = uRepo.save(user);

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                    "message", roleType == RoleType.ROLE_CHARGER_OPERATOR 
                        ? "Registration successful. Your account is pending approval." 
                        : "Registration successful",
                    "userId", savedUser.getUser_id(),
                    "email", savedUser.getEmail(),
                    "status", savedUser.getStatus()
                ));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
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
	                .body(Map.of("message", "Invalid username or password"));
	        }

	        // Extract roles
	        String roleString = existingUser.getRoleString();      // e.g., "ROLE_ADMIN,ROLE_USER"
	        String primaryRole = existingUser.getPrimaryRole();    // e.g., "ROLE_ADMIN"

	        // Generate JWT access token
	        String accessToken = jwtUtil.generateToken(
	            existingUser.getEmail(),
	            roleString,
	            existingUser.getUser_id()
	        );

	        // Determine redirect URL based on primary role
	        String redirectUrl = switch (primaryRole.replace("ROLE_", "").toLowerCase()) {
	            case "admin" -> "/admin/dashboard";
	            case "charger_operator" -> "/partner/dashboard";
	            case "user" -> "/home";
	            default -> "/";
	        };

	        // Refresh token handling
	        refreshTokenRepo.deleteById(existingUser.getUser_id());

	        String sessionId = UUID.randomUUID().toString();
	        String jti = jwtUtil.getJti(accessToken);

	        RefreshToken rt = new RefreshToken();
	        rt.setUser(existingUser);
	        rt.setToken(UUID.randomUUID().toString());
	        rt.setSessionId(sessionId);
	        rt.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
	        rt.setJti(jti);
	        refreshTokenRepo.save(rt);

	        // Return response
	        return ResponseEntity.ok(Map.of(
	            "message", "Login successful",
	            "token", accessToken,
	            "refreshToken", rt.getToken(),
	            "role", primaryRole,
	            "roles", roleString,
	            "sessionId", sessionId,
	            "redirect", redirectUrl,
	            "userId", existingUser.getUser_id()
	        ));

	    } catch (RuntimeException e) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	            .body(Map.of("message", e.getMessage()));
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(Map.of("message", "Login failed: " + e.getMessage()));
	    }
	}

}
