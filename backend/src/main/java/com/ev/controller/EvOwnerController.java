package com.ev.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ev.dto.StationResponseDTO;
import com.ev.model.ChargingStations;
import com.ev.repository.ChargingStationRepository;

@RestController
@RequestMapping("/evowner")
public class EvOwnerController {

    @Autowired
    private ChargingStationRepository chargingStationRepository;

    // EV Owners can see all public stations (or only active ones)
    @GetMapping("/station")
    public ResponseEntity<List<StationResponseDTO>> getAllStations() {
        List<ChargingStations> stations = chargingStationRepository.findAll();
        List<StationResponseDTO> dtos = stations.stream()
                .map(StationResponseDTO::new)
                .toList();
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<StationResponseDTO> getStationById(@PathVariable Long id) {
        return chargingStationRepository.findById(id)
                .map(station -> ResponseEntity.ok(new StationResponseDTO(station)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Optional: Filter only operational stations
//    @GetMapping("/stations/active")
//    public ResponseEntity<List<StationResponseDTO>> getActiveStations() {
//        List<ChargingStations> stations = chargingStationRepository.findByStatus("operational");
//        List<StationResponseDTO> dtos = stations.stream()
//                .map(StationResponseDTO::new)
//                .toList();
//        return ResponseEntity.ok(dtos);
//    }
}