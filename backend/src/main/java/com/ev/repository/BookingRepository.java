package com.ev.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.ev.model.Booking;
import com.ev.model.BookingStatus;
import com.ev.model.ChargingStations;
import com.ev.model.User;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find all bookings for a user (EV Owner)
    List<Booking> findByEvOwnerOrderByStartTimeDesc(User evOwner);

    // Find active bookings (now or future) for a station
    List<Booking> findByStationAndStartTimeLessThanEqualAndEndTimeGreaterThanEqualAndStatusNot(
        ChargingStations station,
        LocalDateTime end,
        LocalDateTime start,
        BookingStatus status
    );

    // Count current active bookings at a station
    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.station = :station " +
           "AND b.startTime <= :now " +
           "AND b.endTime >= :now " +
           "AND b.status IN ('CONFIRMED', 'IN_PROGRESS')")
    long countActiveBookingsAtStation(@Param("station") ChargingStations station, @Param("now") LocalDateTime now);
}