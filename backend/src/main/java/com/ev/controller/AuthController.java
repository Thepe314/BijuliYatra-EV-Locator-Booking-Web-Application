package com.ev.controller;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import com.ev.dto.OtpVerifyRequest;
import com.ev.dto.ResetPasswordRequestDTO;
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
import com.ev.service.EmailService;

@RestController
@RequestMapping("/auth") 
public class AuthController {
	
	@Value("${app.otp.enabled:true}")
	private boolean otpEnabled;
	
	@Autowired
	private jwtUtil jwtUtil;
	
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;
	
	@Autowired
	 private RefreshTokenRepo refreshTokenRepo;
	
	
	@Autowired
	 private UserRepository uRepo;
	
	
	@Autowired
	 private EmailService emailService;
	
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
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        
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
        user.setStatus("pending");
        user.setDistrict(request.getDistrict());
        user.setCity(request.getCity());
        user.setRegion(request.getRegion());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());

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
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Validated LoginRequest loginRequest) {
        try {
            User existingUser = uRepo.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (!passwordEncoder.matches(loginRequest.getPassword(), existingUser.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
            }

            // ===== CASE A: OTP DISABLED (direct login) =====
            if (!otpEnabled) {
                String roleString = existingUser.getRoleString();
                String primaryRole = existingUser.getPrimaryRole();
                String accessToken = jwtUtil.generateToken(
                    existingUser.getEmail(),
                    roleString,
                    existingUser.getUser_id()
                );
                String redirectUrl = getRedirectUrl(primaryRole);

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

                Map<String, Object> body = new HashMap<>();
                body.put("message", "Login successful (OTP disabled)");
                body.put("token", accessToken);
                body.put("refreshToken", rt.getToken());
                body.put("role", primaryRole);
                body.put("roles", roleString);
                body.put("sessionId", sessionId);
                body.put("redirect", redirectUrl);
                body.put("userId", existingUser.getUser_id());
                body.put("status", existingUser.getStatus());

                return ResponseEntity.ok(body);
            }

            // ===== CASE B: OTP ENABLED (your existing flow) =====

            String otp = String.valueOf((int)(Math.random() * 900000) + 100000);
            existingUser.setOtpCode(otp);
            existingUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
            uRepo.save(existingUser);

            try {
                emailService.sendSimpleMail(
                    existingUser.getEmail(),
                    "Login OTP Code",
                    "Your OTP is: " + otp + " (valid for 5 minutes)"
                );
            } catch (Exception mailEx) {
                System.err.println("Failed to send OTP email: " + mailEx.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "message", "OTP sent to email",
                "email", existingUser.getEmail()
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/login/verify-otp")
    public ResponseEntity<?> verifyLoginOtp(@RequestBody @Validated OtpVerifyRequest request) {

        User existingUser = uRepo.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (existingUser.getOtpCode() == null || existingUser.getOtpExpiry() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "No OTP requested"));
        }

        if (existingUser.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "OTP expired"));
        }

        if (!existingUser.getOtpCode().equals(request.getOtpCode())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid OTP"));
        }

        // Clear OTP after successful use
        existingUser.setOtpCode(null);
        existingUser.setOtpExpiry(null);
        uRepo.save(existingUser);

        // === existing token + refresh logic ===
        String roleString = existingUser.getRoleString();
        String primaryRole = existingUser.getPrimaryRole();
        String accessToken = jwtUtil.generateToken(
            existingUser.getEmail(),
            roleString,
            existingUser.getUser_id()
        );
        String redirectUrl = getRedirectUrl(primaryRole);

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

        // use HashMap instead of Map.of to allow null values safely
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Login successful");
        body.put("token", accessToken);
        body.put("refreshToken", rt.getToken());
        body.put("role", primaryRole);
        body.put("roles", roleString);
        body.put("sessionId", sessionId);
        body.put("redirect", redirectUrl);
        body.put("userId", existingUser.getUser_id());
        body.put("status", existingUser.getStatus());
        
        System.out.println("otpEnabled = " + otpEnabled);

        return ResponseEntity.ok(body);
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        User user = uRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // ===== CASE A: OTP DISABLED =====
        if (!otpEnabled) {
            // You can either:
            // - allow direct reset, or
            // - return a special message your frontend understands
            return ResponseEntity.ok(Map.of(
                "message", "OTP disabled; you can reset password directly",
                "email", user.getEmail()
            ));
        }

        // ===== CASE B: OTP ENABLED =====
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        uRepo.save(user);

        emailService.sendSimpleMail(
            user.getEmail(),
            "Password Reset Code",
            "Your password reset code is: " + otp + " (valid for 10 minutes)"
        );

        return ResponseEntity.ok(Map.of(
            "message", "Password reset code sent to email",
            "email", user.getEmail()
        ));
    }
    
    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyForgotPasswordOtp(@RequestBody @Validated OtpVerifyRequest request) {

        User user = uRepo.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtpCode() == null || user.getOtpExpiry() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "No OTP requested"));
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "OTP expired"));
        }

        if (!user.getOtpCode().equals(request.getOtpCode())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid OTP"));
        }

        // Option 1: keep OTP until password is changed
        // Option 2: clear here and rely on an immediate reset
        // For safety, clear now and require a fresh OTP if user delays
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        uRepo.save(user);

        return ResponseEntity.ok(Map.of(
            "message", "OTP verified. You can now reset your password."
        ));
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Validated ResetPasswordRequestDTO request) {
        User user = uRepo.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // At this point you already verified OTP in /forgot-password/verify-otp
        // so just update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        uRepo.save(user);

        return ResponseEntity.ok(Map.of(
            "message", "Password reset successful"
        ));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
   
        return ResponseEntity.ok(Map.of(
            "message", "Logged out successfully"
        ));
    }

}
