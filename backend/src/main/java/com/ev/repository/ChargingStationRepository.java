package com.ev.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ev.model.ChargingStations;
import com.ev.model.User;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStations, Long> {
	List<ChargingStations> findByOperator(User operator);
	
	@Modifying
	@Query("DELETE FROM ChargingStations s WHERE s.operator.user_id = :userId")
	void deleteByOperatorUserId(@Param("userId") Long userId);
}