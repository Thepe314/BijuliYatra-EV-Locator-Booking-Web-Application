package com.ev.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
import com.ev.repository.BookingRepository;
import com.ev.repository.ChargingStationRepository;
import com.ev.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/operator")
public class OperatorController {

	 @Autowired
	 private ChargingStationRepository repository;
	 
	 @Autowired
	 private BookingRepository bookingRepository;
	 
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
        station.setImageUrl(request.getImageUrl());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setLevel1Chargers(request.getLevel1Chargers());
        station.setDcUltraChargers(request.getDcUltraChargers());
        station.setDcComboChargers(request.getDcComboChargers());
   

        ChargingStations saved = repository.save(station);
        return new ResponseEntity<>(new StationResponseDTO(saved), HttpStatus.CREATED);
    }
    
    @GetMapping("/stations")
    public ResponseEntity<List<StationResponseDTO>> getOperatorStations(Authentication authentication) {
        
        // Get the logged-in operator from JWT
        User currentOperator = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Operator not found"));

    
        List<ChargingStations> stations = repository
                .findByOperator(currentOperator);  

        List<StationResponseDTO> dtos = stations.stream()
                .map(StationResponseDTO::new)
                .toList();

        return ResponseEntity.ok(dtos);
    }
    

    @PutMapping("/stations/edit/{stationId}")
    public ResponseEntity<StationResponseDTO> updateStationOperator(
            @PathVariable Long stationId,
            @Valid @RequestBody CreateStationRequestDTO request,
            Authentication authentication) {

        // 1) Load station
        Optional<ChargingStations> opt = repository.findById(stationId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ChargingStations station = opt.get();

        // 2) Resolve operator from authenticated user
        String email = authentication.getName(); // e.g. "operator@gmail.com"
        User operator = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Operator not found"));
        station.setOperator(operator);

        // 3) Basic fields
        station.setName(request.getName());
        station.setLocation(request.getLocation());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setAddress(request.getAddress());
        station.setCity(request.getCity());
        station.setState(request.getState());
        station.setZipCode(request.getZipCode());

        // 4) Chargers & rates
        station.setLevel2Chargers(request.getLevel2Chargers());
        station.setDcFastChargers(request.getDcFastChargers());
        station.setLevel2Rate(request.getLevel2Rate());
        station.setDcFastRate(request.getDcFastRate());
        station.setLevel1Chargers(request.getLevel1Chargers());
        station.setDcUltraChargers(request.getDcUltraChargers());
        station.setDcComboChargers(request.getDcComboChargers());

        // 5) Peak pricing
        station.setPeakPricing(request.getPeakPricing());
        station.setPeakMultiplier(
                request.getPeakMultiplier() != null
                        ? request.getPeakMultiplier()
                        : 1.25
        );

        // 6) Notes
        station.setNotes(request.getNotes());

        // 7) Image preset
        station.setImageUrl(request.getImageUrl());

        // 8) Total / available slots (same rule as admin)
        int totalSlots = request.getLevel2Chargers() + request.getDcFastChargers();
        station.setTotalSlots(totalSlots);
        if (station.getAvailableSlots() == null || station.getAvailableSlots() > totalSlots) {
            station.setAvailableSlots(totalSlots);
        }

        ChargingStations updated = repository.save(station);
        return ResponseEntity.ok(new StationResponseDTO(updated));
    }
    
    @DeleteMapping("/stations/{id}")
    public ResponseEntity<Void> deleteStation(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/stations/{id}")
    public ResponseEntity<StationResponseDTO> getOperatorStationById(@PathVariable Long id, Authentication auth) {
        // optionally check that authenticated operator owns this station
        return repository.findById(id)
                .map(station -> ResponseEntity.ok(new StationResponseDTO(station)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    
    //Total Operator money and also Total Bookings per Id

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getOperatorStats(Authentication auth) {
        User operator = userRepository.findByEmail(auth.getName()).orElseThrow();

        BigDecimal totalRevenue = bookingRepository.getOperatorTotalRevenue(operator.getUser_id());
        List<Object[]> paymentBreakdown = bookingRepository.getPaymentMethodBreakdown(operator.getUser_id());
        
        // Total bookings count
        long totalSessions = bookingRepository.countOperatorBookings(operator.getUser_id());
        
        // ADD: Monthly sessions (current year)
        List<Object[]> monthlySessionsRaw = bookingRepository.getMonthlySessions(operator.getUser_id());
        
        // Month names for current year
        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        
        List<Map<String, Object>> monthlySessions = monthlySessionsRaw.stream()
            .map(row -> {
                int monthNum = ((Number) row[0]).intValue();
                long sessions = ((Number) row[1]).longValue();
                
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", monthNames[monthNum - 1]);
                monthData.put("sessions", sessions);
                return monthData;
            })
            .collect(Collectors.toList());

        long totalCount = paymentBreakdown.stream()
                .mapToLong(r -> ((Number) r[1]).longValue())
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue.doubleValue());
        stats.put("totalSessions", totalSessions);
        stats.put("monthlySessions", monthlySessions);  // NEW: for BarChart

        stats.put("paymentMethods", paymentBreakdown.stream()
            .map(row -> {
                String method = String.valueOf(row[0]);
                long count = ((Number) row[1]).longValue();
                double percentage = totalCount > 0 ? (count * 100.0 / totalCount) : 0.0;

                Map<String, Object> m = new HashMap<>();
                m.put("method", method);
                m.put("count", count);
                m.put("percentage", percentage);
                return m;
            })
            .collect(Collectors.toList())
        );

        return ResponseEntity.ok(stats);
    }

}