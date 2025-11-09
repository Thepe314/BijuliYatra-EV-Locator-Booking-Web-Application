package com.ev.controller;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.ev.model.User;
import com.ev.model.EvOwner;
import com.ev.model.RoleType;
import com.ev.model.ChargerOperator;
import com.ev.model.Admin;
import com.ev.repository.UserRepository;
import com.ev.dto.UserResponseDTO;
import com.ev.dto.UserCreateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/admin/users")

public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all users
     * @return List of all users
     */
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<UserResponseDTO> userDTOs = users.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get user by ID
     * @param userId User ID
     * @return User details
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                UserResponseDTO dto = convertToResponseDTO(userOpt.get());
                return ResponseEntity.ok(dto);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get users by role type
     * @param roleType Role type (EV_OWNER, CHARGER_OPERATOR, ADMIN)
     * @return List of users with specified role
     */
    @GetMapping("/role/{roleType}")
    public ResponseEntity<List<UserResponseDTO>> getUsersByRole(@PathVariable String roleType) {
        try {
            RoleType role = RoleType.valueOf(roleType.toUpperCase());
            List<User> users = userRepository.findByRoles(Arrays.asList(role));
            List<UserResponseDTO> userDTOs = users.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userDTOs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Count users by role type
     * @param roleType Role type (EV_OWNER, CHARGER_OPERATOR, ADMIN)
     * @return Count of users with specified role
     */
    @GetMapping("/count/role/{roleType}")
    public ResponseEntity<Long> countUsersByRole(@PathVariable String roleType) {
        try {
            RoleType role = RoleType.valueOf(roleType.toUpperCase());
            long count = userRepository.countByRoles(Arrays.asList(role));
            return ResponseEntity.ok(count);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Create new user
     * @param dto User data
     * @return Created user
     */
    @PostMapping("/new")
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody UserCreateDTO dto) {
        try {
            User user;
            String userType = dto.getUserType();

            if (userType == null || userType.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            switch (userType.toUpperCase()) {
                case "EV_OWNER":
                    EvOwner evOwner = new EvOwner();
                    evOwner.setVehicleBrand(dto.getVehicleBrand());
                    evOwner.setVehicleModel(dto.getVehicleModel());
                    evOwner.setVehicleYear(dto.getVehicleYear());
                    evOwner.setVehileRegistrationModel(dto.getVehicleRegistrationNumber());
                    evOwner.setChargingType(dto.getChargingType());
                    evOwner.setBatteryCapacity(dto.getBatteryCapacity());
                    user = evOwner;
                    break;

                case "CHARGER_OPERATOR":
                    ChargerOperator operator = new ChargerOperator();
                    operator.setCompanyName(dto.getCompanyName());
                    operator.setCompanyRegistrationNo(dto.getCompanyRegistrationNo());
                    operator.setCompanyPan(dto.getCompanyPan());
                    operator.setCompanyLicenseNo(dto.getCompanyLicenseNo());
                    operator.setCompanyType(dto.getCompanyType());
                    operator.setStationCount(dto.getStationCount());
                    operator.setChargingType(dto.getChargingType());
                    operator.setOpeningHours(dto.getOpeningHours());
                    operator.setClosingHours(dto.getClosingHours());
                    operator.setChargePerKwh(dto.getChargePerKwh());
                    user = operator;
                    break;

                case "ADMIN":
                    user = new Admin();
                    break;

                default:
                    return ResponseEntity.badRequest().build();
            }

            // Set common fields
            user.setEmail(dto.getEmail());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setPhoneNumber(dto.getPhoneNumber());
            user.setFullname(dto.getFullname());
            user.setRegion(dto.getRegion());
            user.setCity(dto.getCity());
            user.setDistrict(dto.getDistrict());
            user.setAddress(dto.getAddress());
            user.setJoinDate(LocalDateTime.now());
            user.setStatus("ACTIVE");

            User savedUser = userRepository.save(user);
            UserResponseDTO responseDTO = convertToResponseDTO(savedUser);

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Update user by ID
     * @param userId User ID
     * @param dto Updated user data
     * @return Updated user
     */
    @PutMapping("/edit/{userId}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long userId, @RequestBody UserCreateDTO dto) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();

            // Update common fields
            user.setFullname(dto.getFullname());
            user.setEmail(dto.getEmail());
            user.setPhoneNumber(dto.getPhoneNumber());
            user.setRegion(dto.getRegion());
            user.setCity(dto.getCity());
            user.setDistrict(dto.getDistrict());
            user.setAddress(dto.getAddress());
            user.setStatus(dto.getStatus());

            // Update password only if provided
            if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(dto.getPassword()));
            }

            // Update role-specific fields
            if (user instanceof EvOwner) {
                EvOwner evOwner = (EvOwner) user;
                if (dto.getVehicleBrand() != null) evOwner.setVehicleBrand(dto.getVehicleBrand());
                if (dto.getVehicleModel() != null) evOwner.setVehicleModel(dto.getVehicleModel());
                if (dto.getVehicleYear() != null) evOwner.setVehicleYear(dto.getVehicleYear());
                if (dto.getVehicleRegistrationNumber() != null) evOwner.setVehileRegistrationModel(dto.getVehicleRegistrationNumber());
                if (dto.getChargingType() != null) evOwner.setChargingType(dto.getChargingType());
                if (dto.getBatteryCapacity() != null) evOwner.setBatteryCapacity(dto.getBatteryCapacity());
            } else if (user instanceof ChargerOperator) {
                ChargerOperator operator = (ChargerOperator) user;
                if (dto.getCompanyName() != null) operator.setCompanyName(dto.getCompanyName());
                if (dto.getCompanyRegistrationNo() != null) operator.setCompanyRegistrationNo(dto.getCompanyRegistrationNo());
                if (dto.getCompanyPan() != null) operator.setCompanyPan(dto.getCompanyPan());
                if (dto.getCompanyLicenseNo() != null) operator.setCompanyLicenseNo(dto.getCompanyLicenseNo());
                if (dto.getCompanyType() != null) operator.setCompanyType(dto.getCompanyType());
                if (dto.getStationCount() != null) operator.setStationCount(dto.getStationCount());
                if (dto.getChargingType() != null) operator.setChargingType(dto.getChargingType());
                if (dto.getOpeningHours() != null) operator.setOpeningHours(dto.getOpeningHours());
                if (dto.getClosingHours() != null) operator.setClosingHours(dto.getClosingHours());
                if (dto.getChargePerKwh() != null) operator.setChargePerKwh(dto.getChargePerKwh());
            }

            User updatedUser = userRepository.save(user);
            UserResponseDTO responseDTO = convertToResponseDTO(updatedUser);

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Delete user by ID
     * @param userId User ID
     * @return No content response
     */
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        try {
            if (userRepository.existsById(userId)) {
                userRepository.deleteById(userId);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Convert User entity to UserResponseDTO
     * @param user User entity
     * @return UserResponseDTO
     */
    private UserResponseDTO convertToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUser_id(user.getUser_id());
        dto.setFullname(user.getFullname());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRegion(user.getRegion());
        dto.setCity(user.getCity());
        dto.setDistrict(user.getDistrict());
        dto.setAddress(user.getAddress());
        dto.setJoinDate(user.getJoinDate());
        dto.setStatus(user.getStatus());

        // Determine user type and map specific fields
        if (user instanceof EvOwner) {
            dto.setUserType("EV_OWNER");
            EvOwner evOwner = (EvOwner) user;
            dto.setVehicleBrand(evOwner.getVehicleBrand());
            dto.setVehicleModel(evOwner.getVehicleModel());
            dto.setVehicleYear(evOwner.getVehicleYear());
            dto.setVehicleRegistrationNumber(evOwner.getVehileRegistrationModel());
            dto.setChargingType(evOwner.getChargingType());
            dto.setBatteryCapacity(evOwner.getBatteryCapacity());
        } else if (user instanceof ChargerOperator) {
            dto.setUserType("CHARGER_OPERATOR");
            ChargerOperator operator = (ChargerOperator) user;
            dto.setCompanyName(operator.getCompanyName());
            dto.setCompanyRegistrationNo(operator.getCompanyRegistrationNo());
            dto.setCompanyPan(operator.getCompanyPan());
            dto.setCompanyLicenseNo(operator.getCompanyLicenseNo());
            dto.setCompanyType(operator.getCompanyType());
            dto.setStationCount(operator.getStationCount());
            dto.setChargingType(operator.getChargingType());
            dto.setOpeningHours(operator.getOpeningHours());
            dto.setClosingHours(operator.getClosingHours());
            dto.setChargePerKwh(operator.getChargePerKwh());
        } else if (user instanceof Admin) {
            dto.setUserType("ADMIN");
        }

        return dto;
    }
}