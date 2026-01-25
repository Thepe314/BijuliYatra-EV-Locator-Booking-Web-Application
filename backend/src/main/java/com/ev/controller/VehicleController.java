package com.ev.controller;

import com.ev.model.EvOwner;
import com.ev.model.User;
import com.ev.model.Vehicle;
import com.ev.repository.UserRepository;
import com.ev.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/ev-owner/vehicles")
@CrossOrigin(origins = "http://localhost:3000")
public class VehicleController {

    @Autowired
    private VehicleRepository vehicleRepo;

    @Autowired
    private UserRepository userRepo;

    //  List vehicles for current EV owner
    @GetMapping
    public ResponseEntity<List<Vehicle>> getVehicles(Authentication auth) {
        String email = (String) auth.getPrincipal();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"ROLE_EV_OWNER".equals(getUserRole(auth))) {
            return ResponseEntity.status(403).build();
        }

        EvOwner evOwner = (EvOwner) user;  
        List<Vehicle> vehicles = vehicleRepo.findByOwner(evOwner);
        return ResponseEntity.ok(vehicles);
    }

    //Create Vehicles
    @PostMapping
    public ResponseEntity<?> createVehicle(@RequestBody Map<String, Object> data, Authentication auth) {
        try {
            String email = auth.getName();
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!"ROLE_EV_OWNER".equals(getUserRole(auth))) {
                return ResponseEntity.status(403).body("EV Owner role required");
            }

          
            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleBrand((String) data.get("vehicleBrand"));
            vehicle.setVehicleModel((String) data.get("vehicleModel"));
            vehicle.setVehicleYear((String) data.get("vehicleYear"));
            vehicle.setBatteryCapacity((String) data.get("batteryCapacity"));
            vehicle.setVehicleRegistrationNumber((String) data.get("vehicleRegistrationNumber"));
            vehicle.setChargingType((String) data.get("chargingType"));
            vehicle.setImageUrl((String) data.get("imageUrl"));
            vehicle.setColour((String) data.get("colour"));
            vehicle.setPrimaryVehicle((Boolean) data.getOrDefault("primaryVehicle", false));
            vehicle.setOwner((EvOwner) user);

            Vehicle saved = vehicleRepo.save(vehicle);
            return ResponseEntity.ok(Map.of("id", saved.getId(), "message", "Success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // update 
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(
            @PathVariable Long id, 
            @RequestBody Vehicle vehicle, 
            Authentication auth
    ) {
        try {
            String email = (String) auth.getPrincipal();
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!"ROLE_EV_OWNER".equals(getUserRole(auth))) {
                return ResponseEntity.status(403).body("Only EV owners can edit vehicles");
            }

            Vehicle existing = vehicleRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));

            if (!existing.getOwner().getUser_id().equals(user.getUser_id())) {
                return ResponseEntity.status(403).body("Not your vehicle");
            }

            // Update fields
            existing.setVehicleBrand(vehicle.getVehicleBrand());
            existing.setVehicleModel(vehicle.getVehicleModel());
            existing.setVehicleYear(vehicle.getVehicleYear());
            existing.setVehicleRegistrationNumber(vehicle.getVehicleRegistrationNumber());
            existing.setChargingType(vehicle.getChargingType());
            existing.setBatteryCapacity(vehicle.getBatteryCapacity());
            existing.setPrimaryVehicle(vehicle.isPrimaryVehicle());
            existing.setColour(vehicle.getColour());

            Vehicle updated = vehicleRepo.save(existing);
            return ResponseEntity.ok(Map.of(
                "id", updated.getId(),
                "message", "Vehicle updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update: " + e.getMessage());
        }
    }

    // DELETE 
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id, Authentication auth) {
        try {
            String email = (String) auth.getPrincipal();
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!"ROLE_EV_OWNER".equals(getUserRole(auth))) {
                return ResponseEntity.status(403).body("Only EV owners can delete vehicles");
            }

            Vehicle vehicle = vehicleRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));

            if (!vehicle.getOwner().getUser_id().equals(user.getUser_id())) {
                return ResponseEntity.status(403).body("Not your vehicle");
            }

            vehicleRepo.delete(vehicle);
            return ResponseEntity.ok(Map.of("message", "Vehicle deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete: " + e.getMessage());
        }
    }

    // Helper
    private String getUserRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .findFirst()
                .map(r -> r.getAuthority())
                .orElse("ROLE_NONE");
    }
}
