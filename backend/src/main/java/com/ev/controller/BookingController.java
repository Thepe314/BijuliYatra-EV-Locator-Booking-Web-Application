// src/main/java/com/ev/controller/BookingController.java
package com.ev.controller;

import com.ev.dto.BookingResponseDTO;
import com.ev.model.*;
import com.ev.repository.BookingRepository;
import com.ev.repository.ChargingStationRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/evowner")
public class BookingController {

    @Autowired private BookingRepository bookingRepo;
    @Autowired private ChargingStationRepository stationRepo;

    // 1. Get my bookings
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(@AuthenticationPrincipal User evOwner) {
        List<Booking> bookings = bookingRepo.findByEvOwnerOrderByStartTimeDesc(evOwner);
        return ResponseEntity.ok(bookings.stream()
                .map(BookingResponseDTO::new)
                .toList());
    }

    // 2. Create booking – NO BookingRequestDTO! Just raw JSON
    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(
            @AuthenticationPrincipal User evOwner,
            @RequestBody Map<String, Object> request) {

        // === 1. Extract & validate input ===
        Long stationId = Long.valueOf(request.get("stationId").toString());
        String startTimeStr = (String) request.get("startTime");
        String endTimeStr = (String) request.get("endTime");
        String connectorType = (String) request.get("connectorType");

        ChargingStations station = stationRepo.findById(stationId)
                .orElse(null);
        if (station == null || !"operational".equalsIgnoreCase(station.getStatus())) {
            return ResponseEntity.badRequest().body("Station not available or offline");
        }

        LocalDateTime start, end;
        try {
            start = LocalDateTime.parse(startTimeStr);
            end = LocalDateTime.parse(endTimeStr);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use ISO (e.g. 2025-11-22T14:00:00)");
        }

        LocalDateTime now = LocalDateTime.now();

        // === 2. Basic validations ===
        if (start.isBefore(now.plusMinutes(15))) {
            return ResponseEntity.badRequest().body("Booking must be at least 15 minutes from now");
        }

        long durationMinutes = Duration.between(start, end).toMinutes();
        if (durationMinutes < 30 || durationMinutes > 240) {
            return ResponseEntity.badRequest()
                    .body("Booking duration must be 30 minutes to 4 hours only");
        }

        // === 3. Overlap check with 15-minute grace period ===
        LocalDateTime bufferEnd = end.plusMinutes(15); // 15 min grace for previous user

        boolean overlap = bookingRepo.findAll().stream()
                .anyMatch(b -> b.getStation().getId().equals(stationId)
                        && b.getStatus() != BookingStatus.CANCELLED
                        && b.getStartTime().isBefore(bufferEnd)
                        && b.getEndTime().isAfter(start.minusMinutes(1)));

        if (overlap) {
            return ResponseEntity.badRequest()
                    .body("This slot is already booked or too close to another booking (15-min buffer)");
        }

        // === 4. Check total available slots (real-time) ===
        int totalSlots = station.getTotalSlots() != null ? station.getTotalSlots() : 4;

        long currentlyOccupied = bookingRepo.findAll().stream()
                .filter(b -> b.getStation().getId().equals(stationId))
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.IN_PROGRESS)
                .filter(b -> now.isBefore(b.getEndTime().plusMinutes(15))) 
                .count();

        if (currentlyOccupied >= totalSlots) {
            return ResponseEntity.badRequest()
                    .body("All charging slots are currently in use. Try later!");
        }

        // === 5. Calculate price (Nepal style) ===
        double hours = durationMinutes / 60.0;
        double ratePerKwh = "DC Fast".equalsIgnoreCase(connectorType) 
                ? (station.getDcFastRate() != null ? station.getDcFastRate() : 60.0)
                : (station.getLevel2Rate() != null ? station.getLevel2Rate() : 40.0);

        double amount = Math.round(hours * ratePerKwh * 60); // assuming ~60 kWh per hour average

        // === 6. Save booking ===
        Booking booking = new Booking();
        booking.setEvOwner(evOwner);
        booking.setStation(station);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setConnectorType(connectorType);
        booking.setEstimatedKwh(hours * 60);
        booking.setTotalAmount(amount);
        booking.setStatus(BookingStatus.CONFIRMED);

        Booking saved = bookingRepo.save(booking);

        return ResponseEntity.status(201).body(new BookingResponseDTO(saved));
    }
    // 3. Cancel booking
    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<String> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal User evOwner) {

        Booking booking = bookingRepo.findById(id).orElse(null);
        if (booking == null || !booking.getEvOwner().getUser_id().equals(evOwner.getUser_id())) {
            return ResponseEntity.status(403).body("Not your booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return ResponseEntity.badRequest().body("Already cancelled");
        }
        if (booking.getStartTime().isBefore(LocalDateTime.now().plusMinutes(30))) {
            return ResponseEntity.badRequest().body("Cannot cancel < 30 mins before");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepo.save(booking);

        return ResponseEntity.ok("Booking cancelled");
    }
}