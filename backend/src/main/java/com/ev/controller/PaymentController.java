package com.ev.controller;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ev.dto.PaymentDTO;
import com.ev.model.Payment;
import com.ev.model.User;
import com.ev.repository.PaymentRepository;
import com.ev.repository.UserRepository;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentRepository paymentRepo;
    private final UserRepository userRepo;

    public PaymentController(PaymentRepository paymentRepo, UserRepository userRepo) {
        this.paymentRepo = paymentRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/my")
    public List<PaymentDTO> getMyPayments(Authentication auth) {
        String email = (String) auth.getPrincipal();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Payment> payments =
            paymentRepo.findByUserIdOrderByCreatedAtDesc(user.getUser_id());

        DateTimeFormatter fmt =
                DateTimeFormatter.ofPattern("MMM d, yyyy • h:mm a");

        return payments.stream().map(p -> {
            PaymentDTO dto = new PaymentDTO();
            dto.setId(p.getId());
            dto.setAmount(p.getAmount());
            dto.setType(p.getAmount().compareTo(BigDecimal.ZERO) < 0 ? "debit" : "credit");
            dto.setDatetime(p.getCreatedAt().format(fmt));

            // (e.g. "CARD", "ESEWA", "KHALTI")
            if (p.getPaymentMethod() != null) {
                dto.setPaymentMethod(p.getPaymentMethod().name());
            }

            if (p.getBooking() != null && p.getBooking().getStation() != null) {
                dto.setTitle("Charging Session - " + p.getBooking().getStation().getName());
            } else {
                dto.setTitle("Payment " + p.getId());
            }
            return dto;
        }).toList();
    }
}