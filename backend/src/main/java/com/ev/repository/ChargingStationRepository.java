package com.ev.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ev.model.ChargingStations;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStations, Long> {
   
}