package com.ev.repository;

import com.ev.model.Booking;
import com.ev.model.Payment;
import com.ev.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByBooking(Booking booking);

    List<Payment> findByBookingId(Long bookingId);

    List<Payment> findByStatus(PaymentStatus status);

    // For wallet / history views
//    List<Payment> findByUserUserId(Long userId);
}
