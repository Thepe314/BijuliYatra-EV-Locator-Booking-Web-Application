package com.ev.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import com.ev.dto.CreateStationRequestDTO;
import com.ev.dto.StationResponseDTO;
import com.ev.model.ChargingStations;
import com.ev.model.User;
import com.ev.repository.ChargingStationRepository;
import com.ev.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/operator")
public class OperatorController {

	 @Autowired
	 private ChargingStationRepository repository;
	 
	 @Autowired
	 private UserRepository userRepository;
    
    public OperatorController(ChargingStationRepository repository) {
        this.repository = repository;
    }
    
    
    @PostMapping("/stations")
    public ResponseEntity<StationResponseDTO> createStation(
            @Valid @RequestBody CreateStationRequestDTO request,
            Authentication auth) {                          
    	
        User operator = userRepository.findByEmail(auth.getName())
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

        ChargingStations saved = repository.save(station);
        return new ResponseEntity<>(new StationResponseDTO(saved), HttpStatus.CREATED);
    }
    
    @GetMapping("/stations")
    public ResponseEntity<List<StationResponseDTO>> getOperatorStations(Authentication authentication) {
        
        // Get the logged-in operator from JWT
        User currentOperator = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Operator not found"));

        // THIS IS THE KEY LINE — only return stations owned by this operator
        List<ChargingStations> stations = repository
                .findByOperator(currentOperator);   // ← THIS MUST EXIST!

        List<StationResponseDTO> dtos = stations.stream()
                .map(StationResponseDTO::new)
                .toList();

        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/stations/{id}")
    public ResponseEntity<StationResponseDTO> getStationById(@PathVariable Long id) {
        ChargingStations station = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));
        return ResponseEntity.ok(new StationResponseDTO(station));
    }
    
    @PutMapping("/stations/{id}")
    public ResponseEntity<StationResponseDTO> updateStation(
            @PathVariable Long id,
            @Valid @RequestBody CreateStationRequestDTO request) {
        ChargingStations station = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));
        
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
        
        ChargingStations updated = repository.save(station);
        return ResponseEntity.ok(new StationResponseDTO(updated));
    }
    
    @DeleteMapping("/stations/{id}")
    public ResponseEntity<Void> deleteStation(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}