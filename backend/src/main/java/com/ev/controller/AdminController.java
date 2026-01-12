package com.ev.controller;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.ev.model.User;
import com.ev.model.EvOwner;
import com.ev.model.RoleType;
import com.ev.model.ChargerOperator;
import com.ev.model.ChargingStations;
import com.ev.model.Admin;
import com.ev.model.Booking;
import com.ev.repository.BookingRepository;
import com.ev.repository.ChargingStationRepository;
import com.ev.repository.RefreshTokenRepo;
import com.ev.repository.UserRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import com.ev.dto.UserResponseDTO;
import com.ev.dto.BookingResponseDTO;
import com.ev.dto.CreateStationRequestDTO;
import com.ev.dto.StationResponseDTO;
import com.ev.dto.UserCreateDTO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;


@RestController
@RequestMapping("/admin")

public class AdminController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ChargingStationRepository chargingStationRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private RefreshTokenRepo refreshTokenRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Logger log = LoggerFactory.getLogger(com.ev.controller.AdminController.class);
    
    //list of booking
    
    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "bookedAt,desc") String sort) {

        try {
            // Parse sort parameter: "createdAt,desc" → Sort.Direction.DESC, "createdAt"
            String[] sortParts = sort.split(",");
            String sortBy = sortParts[0];
            Sort.Direction direction = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                    ? Sort.Direction.ASC : Sort.Direction.DESC;

            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            Page<Booking> bookingPage = bookingRepository.findAll(pageable);

            // Convert to DTOs (you must have BookingResponseDTO)
            List<BookingResponseDTO> dtos = bookingPage.getContent().stream()
                    .map(BookingResponseDTO::new)
                    .toList();

            Map<String, Object> response = Map.of(
                    "content", dtos,
                    "totalItems", bookingPage.getTotalElements(),
                    "totalPages", bookingPage.getTotalPages(),
                    "currentPage", bookingPage.getNumber(),
                    "pageSize", bookingPage.getSize()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch bookings: " + e.getMessage()));
        }
    }
    
    @PostMapping("/bookings/active-counts")
    public ResponseEntity<Map<Long, Long>> getActiveBookingsCount(@RequestBody List<Long> stationIds) {
        LocalDateTime now = LocalDateTime.now();
        
        Map<Long, Long> counts = stationIds.stream()
            .collect(Collectors.toMap(
                id -> id,
                id -> {
                    ChargingStations station = new ChargingStations();
                    station.setId(id);
                    return bookingRepository.countActiveBookingsAtStation(station, now);
                }
            ));
        
        return ResponseEntity.ok(counts);
    }


  //List of all stations
    @GetMapping("/stations")
    public ResponseEntity<List<StationResponseDTO>> getAllStations() {
       
        List<ChargingStations> stations = chargingStationRepository.findAll();

        List<StationResponseDTO> dtos = stations.stream()
                .map(StationResponseDTO::new)
                .toList();

        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/stations/{stationId}")
    public ResponseEntity<StationResponseDTO> getStationById(@PathVariable Long stationId) {
        Optional<ChargingStations> opt = chargingStationRepository.findById(stationId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new StationResponseDTO(opt.get()));
    }
    
    
    @PostMapping("/stations")
    public ResponseEntity<StationResponseDTO> createStation(@Valid @RequestBody CreateStationRequestDTO request) {

        // Admin MUST send operatorId
        User operator = userRepository.findById(request.getOperatorId())
                .orElseThrow(() -> new RuntimeException("Operator not found"));

        ChargingStations station = new ChargingStations();
        station.setName(request.getName());
        station.setLocation(request.getLocation());
        station.setAddress(request.getAddress());
        station.setCity(request.getCity());
        station.setState(request.getState());
        station.setZipCode(request.getZipCode());
        station.setLevel2Chargers(request.getLevel2Chargers());
        station.setDcFastChargers(request.getDcFastChargers());
        station.setLevel2Rate(request.getLevel2Rate());
        station.setDcFastRate(request.getDcFastRate());
        station.setPeakPricing(request.getPeakPricing());
        station.setPeakMultiplier(request.getPeakMultiplier() != null ? request.getPeakMultiplier() : 1.25);
        station.setNotes(request.getNotes());
        station.setStatus("operational");
        station.setOperator(operator);      
        station.setTotalSlots(request.getLevel2Chargers() + request.getDcFastChargers());
        station.setAvailableSlots(station.getTotalSlots());

        ChargingStations saved = chargingStationRepository.save(station);
        return new ResponseEntity<>(new StationResponseDTO(saved), HttpStatus.CREATED);
    }
    
    @DeleteMapping("/stations/{stationId}")
    public ResponseEntity<?> deleteStation(@PathVariable Long stationId) {
        try {
            boolean exists = chargingStationRepository.existsById(stationId);
            
            if (!exists) {
                log.warn("Station with id {} not found", stationId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Station not found with id: " + stationId));
            }
            
            chargingStationRepository.deleteById(stationId);
            log.info("Station {} deleted by admin", stationId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting station", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete station: " + e.getMessage()));
        }
    }
    @PutMapping("/stations/edit/{stationId}")
    public ResponseEntity<StationResponseDTO> updateStation(
            @PathVariable Long stationId,
            @Valid @RequestBody CreateStationRequestDTO request) {

        Optional<ChargingStations> opt = chargingStationRepository.findById(stationId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ChargingStations station = opt.get();

        // operator
        User operator = userRepository.findById(request.getOperatorId())
                .orElseThrow(() -> new RuntimeException("Operator not found"));
        station.setOperator(operator);

        // basic fields
        station.setName(request.getName());
        station.setLocation(request.getLocation());
        station.setAddress(request.getAddress());
        station.setCity(request.getCity());
        station.setState(request.getState());
        station.setZipCode(request.getZipCode());

        // chargers & rates
        station.setLevel2Chargers(request.getLevel2Chargers());
        station.setDcFastChargers(request.getDcFastChargers());
        station.setLevel2Rate(request.getLevel2Rate());
        station.setDcFastRate(request.getDcFastRate());

        // peak pricing
        station.setPeakPricing(request.getPeakPricing());
        station.setPeakMultiplier(
                request.getPeakMultiplier() != null
                        ? request.getPeakMultiplier()
                        : 1.25
        );

        // notes
        station.setNotes(request.getNotes());

        // total / available slots
        int totalSlots = request.getLevel2Chargers() + request.getDcFastChargers();
        station.setTotalSlots(totalSlots);
        // simple rule: clamp availableSlots to totalSlots, keep existing if already lower
        if (station.getAvailableSlots() == null || station.getAvailableSlots() > totalSlots) {
            station.setAvailableSlots(totalSlots);
        }

        ChargingStations updated = chargingStationRepository.save(station);
        return ResponseEntity.ok(new StationResponseDTO(updated));
    }
     //List of all users
     
    @GetMapping("/users")
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
    @GetMapping("/users/{userId}") 
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
            user.setLatitude(dto.getLatitude());
            user.setLongitude(dto.getLongitude());

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
            if (dto.getLatitude() != null) {
                user.setLatitude(dto.getLatitude());
            }
            if (dto.getLongitude() != null) {
                user.setLongitude(dto.getLongitude());
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

            }

            User updatedUser = userRepository.save(user);
            UserResponseDTO responseDTO = convertToResponseDTO(updatedUser);

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/delete/{userId}")
    @Transactional
    public ResponseEntity<?> forceDeleteUser(@PathVariable Long userId) {
        log.warn("ADMIN FORCE DELETING USER ID: {} — NUKING EVERYTHING", userId);

        try {
            // 1. Delete refresh tokens FIRST (this was the missing step!)
            refreshTokenRepo.deleteByUserUser_id(userId);

            // 2. Delete ALL bookings
            bookingRepository.deleteByEvOwnerUser_id(userId);

            // 3. Delete ALL stations (if ChargerOperator)
            chargingStationRepository.deleteByOperatorUserId(userId);

            // 4. Finally delete the user itself
            userRepository.deleteById(userId);

            log.warn("USER {} AND ALL DATA SUCCESSFULLY NUKED", userId);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            log.error("Force delete failed for user {}", userId, e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Force delete failed: " + e.getMessage()));
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
        dto.setLatitude(user.getLatitude());
        dto.setLongitude(user.getLongitude());

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
            dto.setOpeningHours(operator.getOpeningHours());
            dto.setClosingHours(operator.getClosingHours());
          
        } else if (user instanceof Admin) {
            dto.setUserType("ADMIN");
        }

        return dto;
    }
    
    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<UserResponseDTO> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        return userRepository.findById(userId)
                .map(user -> {
                    user.setStatus(status.toLowerCase()); // "active" / "cancelled"
                    User saved = userRepository.save(user);
                    return ResponseEntity.ok(convertToResponseDTO(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}