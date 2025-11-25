
package com.ev.controller;

import com.ev.dto.BookingResponseDTO;
import com.ev.model.*;
import com.ev.repository.BookingRepository;
import com.ev.repository.ChargingStationRepository;
import com.ev.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired private BookingRepository bookingRepo;
    @Autowired private ChargingStationRepository stationRepo;
    @Autowired private UserRepository userRepository;

    // ===================== LIST BOOKINGS (All Roles) =====================
    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getBookings(Authentication auth) {
        // FIX 1: Principal is email string, NOT User object
        String email = (String) auth.getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // FIX 2: Get role correctly (it comes as "ROLE_EV_OWNER", not just "EV_OWNER")
        String role = auth.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)  // ← This returns "ROLE_EV_OWNER"
                .orElse("");

        List<Booking> bookings;

        if ("ROLE_ADMIN".equals(role)) {
            bookings = bookingRepo.findAllByOrderByStartTimeDesc();

        } else if ("ROLE_CHARGER_OPERATOR".equals(role)) {
            bookings = bookingRepo.findByOperatorStations(user);

        } else if ("ROLE_EV_OWNER".equals(role)) {
            bookings = bookingRepo.findByEvOwnerOrderByStartTimeDesc(user);  

        } else {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(bookings.stream()
                .map(BookingResponseDTO::new)
                .toList());
    }

    // ===================== CREATE BOOKING (Only EV Owner) =====================\
    @PostMapping
    public ResponseEntity<?> createBooking(Authentication auth, @RequestBody Map<String, Object> req) {
        try {
            // 1. Get user & role
            String email = (String) auth.getPrincipal();
            User evOwner = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String role = auth.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("");

            if (!"ROLE_EV_OWNER".equals(role)) {
                return ResponseEntity.status(403).body("Only EV owners can book");
            }

            // 2. Parse request
            Long stationId = Long.valueOf(req.get("stationId").toString());
            String startTimeStr = (String) req.get("startTime");
            String endTimeStr = (String) req.get("endTime");
            String connectorType = (String) req.get("connectorType");

            // 3. Validate station
            ChargingStations station = stationRepo.findById(stationId)
                    .orElse(null);
            if (station == null || !"operational".equalsIgnoreCase(station.getStatus())) {
                return ResponseEntity.badRequest().body("Station is not available");
            }

            // 4. Parse times
            LocalDateTime start = LocalDateTime.parse(startTimeStr);
            LocalDateTime end = LocalDateTime.parse(endTimeStr);
            LocalDateTime now = LocalDateTime.now();

            // BLOCK PAST BOOKINGS
            if (start.isBefore(now.plusMinutes(2))) {
                return ResponseEntity.badRequest().body("Cannot book in the past or too soon");
            }

            // Duration: 30 min – 4 hours
            long minutes = Duration.between(start, end).toMinutes();
            if (minutes < 30 || minutes > 240) {
                return ResponseEntity.badRequest().body("Duration must be 30 minutes to 4 hours");
            }

            // REAL OVERLAP CHECK WITH 15-MIN BUFFER
            LocalDateTime bufferStart = start.minusMinutes(15);
            LocalDateTime bufferEnd = end.plusMinutes(15);

            boolean conflict = bookingRepo.findAll().stream()
                    .anyMatch(b ->
                            b.getStation().getId().equals(stationId) &&
                            (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.IN_PROGRESS) &&
                            bufferStart.isBefore(b.getEndTime()) &&
                            bufferEnd.isAfter(b.getStartTime())
                    );

            if (conflict) {
                return ResponseEntity.badRequest().body("This time slot is not available (15-min buffer required)");
            }

            // SLOT AVAILABILITY
            int totalSlots = station.getTotalSlots() != null && station.getTotalSlots() > 0
                    ? station.getTotalSlots()
                    : (station.getLevel2Chargers() + station.getDcFastChargers());

            long occupied = bookingRepo.findAll().stream()
                    .filter(b -> b.getStation().getId().equals(stationId))
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.IN_PROGRESS)
                    .filter(b -> now.isBefore(b.getEndTime()))
                    .count();

            if (occupied >= totalSlots) {
                return ResponseEntity.badRequest().body("No charging ports available at this time");
            }

            // PRICING
            double hours = minutes / 60.0;
            double rate = "DC Fast".equalsIgnoreCase(connectorType)
                    ? (station.getDcFastRate() != null ? station.getDcFastRate() : 60.0)
                    : (station.getLevel2Rate() != null ? station.getLevel2Rate() : 40.0);

            double estimatedKwh = hours * 50;
            double totalAmount = Math.round(rate * estimatedKwh);

            // CREATE BOOKING — FIX actual_kwh NULL ERROR
            Booking booking = new Booking();
            booking.setEvOwner(evOwner);
            booking.setStation(station);
            booking.setStartTime(start);
            booking.setEndTime(end);
            booking.setConnectorType(connectorType);
            booking.setEstimatedKwh(estimatedKwh);
            booking.setActualKwh(0.0);           // FIX #1: actual_kwh = 0 when created
            booking.setTotalAmount(totalAmount);
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setCompletedAt(LocalDateTime.now());  // or use @CreationTimestamp if you have it

            Booking saved = bookingRepo.save(booking);

            return ResponseEntity.status(201).body(new BookingResponseDTO(saved));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Booking failed: " + e.getMessage());
        }
    }
    // ===================== CANCEL BOOKING =====================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelBooking(@PathVariable Long id, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Booking booking = bookingRepo.findById(id).orElse(null);
        if (booking == null) return ResponseEntity.notFound().build();

        if (!booking.getEvOwner().getUser_id().equals(user.getUser_id())) {
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