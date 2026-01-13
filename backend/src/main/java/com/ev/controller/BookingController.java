
package com.ev.controller;

import com.ev.dto.BookingResponseDTO;
import com.ev.model.*;
import com.ev.repository.BookingRepository;
import com.ev.repository.ChargingStationRepository;
import com.ev.repository.PaymentRepository;
import com.ev.repository.UserRepository;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams; // [web:20][web:27]
import org.springframework.beans.factory.annotation.Value;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    
    @Autowired
    private PaymentRepository paymentRepo;
    
    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${stripe.currency:npr}")
    private String stripeCurrency;
    
    
    private void handlePaymentSuccess(Long bookingId, String gatewayPaymentIdFromCallback) {
        Booking booking = bookingRepo.findById(bookingId)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        // Find latest payment for this booking
        List<Payment> payments = paymentRepo.findByBookingId(bookingId);
        if (payments.isEmpty()) {
            throw new RuntimeException("No payment found for booking " + bookingId);
        }

        Payment payment = payments.get(payments.size() - 1); // naive: last one

        payment.setStatus(PaymentStatus.SUCCESS);
        if (gatewayPaymentIdFromCallback != null) {
            payment.setGatewayPaymentId(gatewayPaymentIdFromCallback);
        }
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepo.save(payment);

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepo.save(booking);
    }

    
    private Session createStripeCheckoutSession(Long bookingId, long amountInRs) throws StripeException {
        long minRs = 100;
        if (amountInRs < minRs) {
            amountInRs = minRs;
        }

        long amountInSmallestUnit = amountInRs * 100; // Rs → paisa

        SessionCreateParams params =
            SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendBaseUrl + "/payment-success?bookingId=" + bookingId)
                .setCancelUrl(frontendBaseUrl + "/payment-failed?bookingId=" + bookingId)
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(stripeCurrency)
                                .setUnitAmount(amountInSmallestUnit)
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("EV Charging Booking #" + bookingId)
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .putMetadata("bookingId", String.valueOf(bookingId))
                .build();

        return Session.create(params);
    }


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
            String paymentMethod = req.get("paymentMethod") != null
                    ? req.get("paymentMethod").toString()   // e.g. CARD / ESEWA / KHALTI
                    : "KHALTI";

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

            // 5. Conflict check
            LocalDateTime conflictStart = start;
            LocalDateTime conflictEnd = end.plusMinutes(15);

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

            // 6. Slot availability
            int totalSlots = station.getTotalSlots() != null && station.getTotalSlots() > 0
                    ? station.getTotalSlots()
                    : (station.getLevel2Chargers() + station.getDcFastChargers());

            long bookedDuringThisTime = bookingRepo.countBookingsDuringPeriod(
                    stationId,
                    start,
                    end.plusMinutes(15)
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

            double estimatedKwh;
            if ("DC Fast".equalsIgnoreCase(connectorType)) {
                estimatedKwh = hours * 25;
            } else {
                estimatedKwh = hours * 15;
            }
            
            double totalAmount = Math.round(rate * estimatedKwh);

         // 8. Create booking as PENDING (not confirmed until payment success)
            Booking booking = new Booking();
            booking.setEvOwner(evOwner);
            booking.setStation(station);
            booking.setStartTime(start);
            booking.setEndTime(end);
            booking.setConnectorType(connectorType);
            booking.setEstimatedKwh(estimatedKwh);
            booking.setActualKwh(0.0);
            booking.setTotalAmount(totalAmount);
            booking.setStatus(BookingStatus.IN_PROGRESS);

            // convert String -> enum once
            PaymentMethod methodEnum = PaymentMethod.valueOf(paymentMethod.toUpperCase());
            booking.setPaymentMethod(methodEnum);

            Booking saved = bookingRepo.save(booking);
            
            
         // 9. INIT PAYMENT WITH GATEWAY
            String paymentUrl;
            String gatewayPaymentId = null;

            if (methodEnum == PaymentMethod.CARD) {
                long amountLong = (long) totalAmount;
                Session session = createStripeCheckoutSession(saved.getId(), amountLong);
                paymentUrl = session.getUrl();
                gatewayPaymentId = session.getId();
            } else if (methodEnum == PaymentMethod.KHALTI) {
                paymentUrl = "https://khalti.com/mock-payment?bookingId=" + saved.getId();
            } else if (methodEnum == PaymentMethod.ESEWA) {
                paymentUrl = "https://esewa.com/mock-payment?bookingId=" + saved.getId();
            } else {
                return ResponseEntity.badRequest().body("Unsupported payment method");
            }
            
         // Create Payment row (PENDING)
            Payment payment = new Payment();
            payment.setBooking(saved);
            payment.setUser(evOwner);
            payment.setAmount(totalAmount);
            payment.setCurrency("NPR");
            payment.setPaymentMethod(methodEnum);
            payment.setStatus(PaymentStatus.PENDING);
            payment.setGatewayPaymentId(gatewayPaymentId);

            paymentRepo.save(payment);

            // 10. Return bookingId + paymentUrl for redirect
            return ResponseEntity.ok(Map.of(
                    "bookingId", saved.getId(),
                    "paymentUrl", paymentUrl,
                    "amount", totalAmount,
                    "paymentMethod", paymentMethod
            ));

        } catch (StripeException se) {
            se.printStackTrace();
            return ResponseEntity.status(502).body("Stripe error: " + se.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Booking/payment init failed: " + e.getMessage());
        }
    }
    // ===================== CANCEL BOOKING =====================
    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelBooking(@PathVariable Long id, Authentication auth) {
        String email = auth.getName(); // or (String) auth.getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Booking booking = bookingRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        System.out.println("Cancel attempt:");
        System.out.println("  authEmail      = " + email);
        System.out.println("  authUserId     = " + user.getUser_id());
        System.out.println("  bookingId      = " + booking.getId());
        System.out.println("  bookingUserId  = " + booking.getEvOwner().getUser_id());
        System.out.println("  bookingStatus  = " + booking.getStatus());

        if (!booking.getEvOwner().getUser_id().equals(user.getUser_id())) {
            System.out.println("  RESULT         = Not your booking (403)");
            return ResponseEntity.status(403).body("Not your booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            System.out.println("  RESULT         = Already cancelled (400)");
            return ResponseEntity.badRequest().body("Already cancelled");
        }

        if (booking.getStartTime().isBefore(LocalDateTime.now().plusMinutes(30))) {
            System.out.println("  RESULT         = Too close to start (400)");
            return ResponseEntity.badRequest().body("Cannot cancel < 30 mins before");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepo.save(booking);

        System.out.println("  RESULT         = Cancelled OK (200)");
        return ResponseEntity.ok("Booking cancelled successfully");
    }
    
    
    
    //Confirmed Booking after payment
    
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable Long id) {
        Booking booking = bookingRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepo.save(booking);

        return ResponseEntity.ok("Booking confirmed");
    }
    
    
    //Payment success
    
    @PostMapping("/{bookingId}/payment-success")
    public ResponseEntity<?> markPaymentSuccess(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String gatewayPaymentId
    ) {
        System.out.println(">>> /bookings/" + bookingId + "/payment-success called, gatewayPaymentId=" + gatewayPaymentId);
        try {
            handlePaymentSuccess(bookingId, gatewayPaymentId);
            System.out.println(">>> payment-success OK for booking " + bookingId);
            return ResponseEntity.ok("Payment and booking marked as success");
        } catch (EntityNotFoundException ex) {
            ex.printStackTrace();
            return ResponseEntity.status(404).body("Booking not found");
        } catch (RuntimeException ex) {
            ex.printStackTrace();
            return ResponseEntity.status(400).body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Failed to process payment success");
        }
    }
   
}