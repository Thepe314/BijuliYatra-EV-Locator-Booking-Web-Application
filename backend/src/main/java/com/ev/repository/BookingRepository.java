package com.ev.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ev.model.Bookings;
import com.ev.model.User;

@Repository
public interface BookingRepository extends JpaRepository<Bookings, Long> {
	List<Bookings> FindByBooking(User user);
}