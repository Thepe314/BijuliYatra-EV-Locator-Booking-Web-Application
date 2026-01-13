package com.ev.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ev.model.ChargingStations;
import com.ev.repository.ChargingStationRepository;
import com.ev.repository.UserRepository;

@RestController
@RequestMapping("/stations")
public class StationController {

    private final ChargingStationRepository stationRepo;

    public StationController(ChargingStationRepository stationRepo) {
        this.stationRepo = stationRepo;
    }

    @GetMapping("/nearby")
    public List<ChargingStations> getNearby(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam(defaultValue = "5") double radiusKm // 5 km default
    ) {
        return stationRepo.findNearby(lat, lng, radiusKm);
    }
}