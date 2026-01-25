package com.ev.service;

import com.ev.model.Booking;
import com.ev.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.util.List;

@Service
public class BookingSchedulerService {
    private static final Logger log = LoggerFactory.getLogger(BookingSchedulerService.class);

    @Autowired
    private BookingRepository bookingRepo;

    @Scheduled(fixedDelay = 300000)  // Every 5 minutes
    @PostConstruct  // Run once on app start
    public void autoCompleteExpiredBookings() {
        List<Booking> expired = bookingRepo.findExpiredBookings();
        if (expired.isEmpty()) return;

        for (Booking b : expired) {
            b.setStatus(com.ev.model.BookingStatus.COMPLETED);
            b.setCompletedAt(b.getEndTime());
        }
        bookingRepo.saveAllAndFlush(expired);
        log.info("Auto-completed {} expired bookings", expired.size());
    }
}
