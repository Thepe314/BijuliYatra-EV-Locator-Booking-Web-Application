package com.ev.repository;

import com.ev.model.Booking;
import com.ev.model.Payment;
import com.ev.model.PaymentStatus;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByBooking(Booking booking);

    List<Payment> findByBookingId(Long bookingId);

    List<Payment> findByStatus(PaymentStatus status);
    
    @Query("SELECT p FROM Payment p WHERE p.user.user_id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    // For wallet / history views
//    List<Payment> findByUserUserId(Long userId);
    
    @Modifying
    @Transactional
    @Query("delete from Payment p where p.booking.evOwner.user_id = :userId")
    int deleteByEvOwnerUserId(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("delete from Payment p where p.booking.station.operator.user_id = :userId")
    int deleteByStationOperatorUserId(@Param("userId") Long userId);

}
