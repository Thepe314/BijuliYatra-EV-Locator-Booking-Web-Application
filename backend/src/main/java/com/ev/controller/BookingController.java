
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
import java.time.LocalDate;
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
        
        String email = (String) auth.getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = auth.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)  
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
    
    @GetMapping("/stations/{id}/bookings")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByStationAndDate(
        @PathVariable Long id,
        @RequestParam String date,
        Authentication auth
    ) {
        try {
            // Validate station exists
            ChargingStations station = stationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found"));

            // Only allow EV Owners or Admins to see bookings
            String email = (String) auth.getPrincipal();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            String role = auth.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("");

            // Restrict access: Admins or station operator can see bookings
            if (!"ROLE_ADMIN".equals(role) && 
                !"ROLE_EV_OWNER".equals(role) && 
                !station.getOperator().getUser_id().equals(user.getUser_id())) {
                return ResponseEntity.status(403).body(null);
            }

            // Parse date
            LocalDateTime start;
            try {
                start = LocalDate.parse(date).atStartOfDay();
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body(null);
            }
            LocalDateTime end = start.plusDays(1);

            // Fetch bookings
            List<Booking> bookings = bookingRepo.findByStationIdAndStartTimeBetween(id, start, end);

            return ResponseEntity.ok(
                bookings.stream()
                    .map(BookingResponseDTO::new)
                    .toList()
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // ===================== CREATE BOOKING (Only EV Owner) =====================\
    @PostMapping
    public ResponseEntity<?> createBooking(Authentication auth, @RequestBody Map<String, Object> req) {
        try {
            // 1. Get authenticated EV Owner
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

            LocalDateTime start = LocalDateTime.parse(startTimeStr);
            LocalDateTime end = LocalDateTime.parse(endTimeStr);
            LocalDateTime now = LocalDateTime.now();

            // 3. Basic validations
            if (start.isBefore(now.plusMinutes(15))) {
                return ResponseEntity.badRequest().body("Booking must be at least 15 minutes from now");
            }

            long minutes = Duration.between(start, end).toMinutes();
            if (minutes < 30 || minutes > 240) {
                return ResponseEntity.badRequest().body("Duration must be 30 minutes to 4 hours");
            }

            // 4. Station exists and operational
            ChargingStations station = stationRepo.findById(stationId)
                    .orElse(null);
            if (station == null || !"operational".equalsIgnoreCase(station.getStatus())) {
                return ResponseEntity.badRequest().body("Station is not available");
            }

            // 5. RECOMMENDED CONFLICT CHECK (Best Practice)
            // → Allow back-to-back bookings (end at 11:00 → next starts 11:00)
            // → Only add 15-min buffer AFTER booking ends (for cleanup)
            LocalDateTime conflictStart = start;
            LocalDateTime conflictEnd = end.plusMinutes(15);  // Only post-buffer

            boolean hasConflict = bookingRepo.hasOverlappingBooking(
                    stationId,
                    conflictStart,
                    conflictEnd,
                    List.of(BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS)
            );

            if (hasConflict) {
                return ResponseEntity.badRequest()
                        .body("This time slot is too close to another booking (15-min gap required after previous booking ends)");
            }

            // 6. Slot availability (optional: if you track per-port slots)
            int totalSlots = station.getTotalSlots() != null && station.getTotalSlots() > 0
                    ? station.getTotalSlots()
                    : (station.getLevel2Chargers() + station.getDcFastChargers());

            long bookedDuringThisTime = bookingRepo.countBookingsDuringPeriod(
            	    stationId,
            	    start,           // start of new booking
            	    end.plusMinutes(15)  // include cleanup buffer
            	);

            	if (bookedDuringThisTime >= totalSlots) {
            	    return ResponseEntity.badRequest()
            	        .body("No charging ports available during this time slot");
            	}

            // 7. Pricing
            double hours = minutes / 60.0;
            double rate = "DC Fast".equalsIgnoreCase(connectorType)
                    ? (station.getDcFastRate() != null ? station.getDcFastRate() : 60.0)
                    : (station.getLevel2Rate() != null ? station.getLevel2Rate() : 40.0);

            double estimatedKwh = hours * 50;  // rough estimate
            double totalAmount = Math.round(rate * estimatedKwh);

            // 8. Create booking
            Booking booking = new Booking();
            booking.setEvOwner(evOwner);
            booking.setStation(station);
            booking.setStartTime(start);
            booking.setEndTime(end);
            booking.setConnectorType(connectorType);
            booking.setEstimatedKwh(estimatedKwh);
            booking.setActualKwh(0.0);
            booking.setTotalAmount(totalAmount);
            booking.setStatus(BookingStatus.CONFIRMED);

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