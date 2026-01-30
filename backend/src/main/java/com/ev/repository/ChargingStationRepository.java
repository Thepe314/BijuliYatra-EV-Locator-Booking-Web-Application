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

    // Nearby by simple radius (in km)
    @Query(
      value = """
        SELECT *
        FROM charging_stations s
        WHERE
          6371 * 2 * ASIN(
            SQRT(
              POWER(SIN(RADIANS(:lat - s.latitude) / 2), 2) +
              COS(RADIANS(:lat)) * COS(RADIANS(s.latitude)) *
              POWER(SIN(RADIANS(:lng - s.longitude) / 2), 2)
            )
          ) <= :radiusKm
        ORDER BY
          6371 * 2 * ASIN(
            SQRT(
              POWER(SIN(RADIANS(:lat - s.latitude) / 2), 2) +
              COS(RADIANS(:lat)) * COS(RADIANS(s.latitude)) *
              POWER(SIN(RADIANS(:lng - s.longitude) / 2), 2)
            )
          )
        """,
      nativeQuery = true
    )
    List<ChargingStations> findNearby(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusKm") double radiusKm
    );
}