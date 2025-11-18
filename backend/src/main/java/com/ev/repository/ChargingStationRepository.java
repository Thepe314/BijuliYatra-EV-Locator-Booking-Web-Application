package com.ev.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ev.model.ChargingStations;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStations, Long> {
	@Query("SELECT s FROM ChargingStations s LEFT JOIN FETCH s.operator o LEFT JOIN FETCH o.chargerOperatorDetails")
	List<ChargingStations> findAllWithOperator();
}