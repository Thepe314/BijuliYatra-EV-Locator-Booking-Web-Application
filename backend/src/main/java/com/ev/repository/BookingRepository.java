package com.ev.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.ev.model.Booking;
import com.ev.model.BookingStatus;
import com.ev.model.ChargingStations;
import com.ev.model.User;

import jakarta.transaction.Transactional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find all bookings for a user (EV Owner)
    List<Booking> findByEvOwnerOrderByStartTimeDesc(User evOwner);

    
 // EV Owner bookings: earliest bookedAt first
    List<Booking> findByEvOwnerOrderByBookedAtAsc(User evOwner);

    // Admin: earliest bookedAt first, with pagination
    Page<Booking> findAllByOrderByBookedAtAsc(Pageable pageable);
    
    
    // Find active bookings (now or future) for a station
    List<Booking> findByStationAndStartTimeLessThanEqualAndEndTimeGreaterThanEqualAndStatusNot(
        ChargingStations station,
        LocalDateTime end,
        LocalDateTime start,
        BookingStatus status
    );

    
 // For Operator: bookings where the station belongs to them
    @Query("SELECT b FROM Booking b WHERE b.station.operator = :operator ORDER BY b.startTime DESC")
    List<Booking> findByOperatorStations(@Param("operator") User operator);

    // For Admin: all bookings (you can add pagination later)
    List<Booking> findAllByOrderByStartTimeDesc();
    // Count current active bookings at a station
    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.station = :station " +
           "AND b.startTime <= :now " +
           "AND b.endTime >= :now " +
           "AND b.status IN ('CONFIRMED', 'IN_PROGRESS')")
    long countActiveBookingsAtStation(@Param("station") ChargingStations station, @Param("now") LocalDateTime now);
    
    //Returns true if there is any CONFIRMED or IN_PROGRESS booking 
    //that overlaps with the requested time window (including 15-min cleanup buffer after)
    @Query("""
            SELECT COUNT(b) > 0 FROM Booking b 
            WHERE b.station.id = :stationId 
              AND b.status IN :statuses
              AND b.startTime < :endTime
              AND b.endTime > :startTime
            """)
        boolean hasOverlappingBooking(
            @Param("stationId") Long stationId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime")   LocalDateTime endTime,
            @Param("statuses")  List<BookingStatus> statuses
        );
    
    @Query("SELECT b FROM Booking b " +
            "WHERE b.station.id = :stationId " +
            "AND b.startTime >= :start " +
            "AND b.startTime < :end " +
            "AND b.status IN ('CONFIRMED', 'IN_PROGRESS')")
     List<Booking> findByStationIdAndStartTimeBetween(
         @Param("stationId") Long stationId,
         @Param("start") LocalDateTime start,
         @Param("end") LocalDateTime end
     );
    
    //Admin List
    Page<Booking> findAllByOrderByBookedAtDesc(Pageable pageable);
    
    @Query("""
    	    SELECT COUNT(b) FROM Booking b
    	    WHERE b.station.id = :stationId
    	      AND b.status IN ('CONFIRMED', 'IN_PROGRESS')
    	      AND b.startTime < :endTime
    	      AND b.endTime > :startTime
    	    """)
    	long countBookingsDuringPeriod(
    	    @Param("stationId") Long stationId,
    	    @Param("startTime") LocalDateTime startTime,
    	    @Param("endTime") LocalDateTime endTime
    	);
    
    //User is abstract +Joined Inheritance thats why we need a query
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.evOwner.user_id = :userId")
    boolean existsByEvOwnerUserId(@Param("userId") Long userId);
    
    @Modifying
    @Query("DELETE FROM Booking b WHERE b.evOwner.user_id = :userId")
    void deleteByEvOwnerUser_id(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("delete from Booking b where b.station.operator.user_id = :userId")
    int deleteByStationOperatorUserId(@Param("userId") Long userId);
    @Query("SELECT COALESCE(SUM(b.totalAmount * 0.05), 0) FROM Booking b WHERE b.status IN ('CONFIRMED', 'COMPLETED')")
    BigDecimal sumPlatformFees();

    @Query("SELECT COALESCE(SUM(b.totalAmount * 0.95), 0) FROM Booking b WHERE b.status IN ('CONFIRMED', 'COMPLETED')")
    BigDecimal sumStationFees();

    
    @Query("SELECT b FROM Booking b WHERE b.status != 'COMPLETED' AND b.status != 'CANCELLED' AND b.endTime < CURRENT_TIMESTAMP")
    List<Booking> findExpiredBookings();
   
    	
    	
    @Query("SELECT b.paymentMethod, COUNT(b) " +
    	       "FROM Booking b " +
    	       "WHERE b.station.operator.user_id = :operatorId " +
    	       "AND b.status IN ('CONFIRMED', 'COMPLETED') " +
    	       "GROUP BY b.paymentMethod " +
    	       "ORDER BY COUNT(b) DESC")
    List<Object[]> getPaymentMethodBreakdown(@Param("operatorId") Long operatorId);

    @Query("SELECT COALESCE(SUM(b.stationFee), 0) FROM Booking b WHERE b.station.operator.user_id = :operatorId AND b.status IN ('CONFIRMED', 'COMPLETED')")
    BigDecimal getOperatorTotalRevenue(@Param("operatorId") Long operatorId);
    		
    //Count how many bookings per Id
    @Query("SELECT COUNT(b) FROM Booking b " +
    			       "WHERE b.station.operator.user_id = :operatorId")
    			long countOperatorBookings(@Param("operatorId") Long operatorId);
    
    
    //Find Current Moth booking
    @Query("SELECT MONTH(b.bookedAt), COUNT(b) FROM Booking b " +
    	       "WHERE b.station.operator.user_id = :operatorId " +
    	       "GROUP BY MONTH(b.bookedAt) ORDER BY MONTH(b.bookedAt)")
    	List<Object[]> getMonthlySessions(@Param("operatorId") Long operatorId);

}