package com.example.demo.controller;

import com.example.demo.entity.Booking;
import com.example.demo.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping
    public Booking addBooking(@RequestBody Booking booking) {
        if (booking.getStatus() == null || booking.getStatus().isEmpty()) {
            booking.setStatus("Confirmed");
        }
        Booking saved = bookingRepository.save(booking);
        // Simulate sending a "Real" SMS using the guest's mobile number
        System.out.println("--------------------------------------------------");
        System.out.println("[SMS SERVICE] Sending Booking SMS to: " + booking.getPhone());
        System.out.println("[MESSAGE]: Hello " + booking.getCustomerName() + "! Your stay at " + booking.getRoomType() + " is confirmed. Booking ID: #" + saved.getId());
        System.out.println("--------------------------------------------------");
        return saved;
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public void deleteBooking(@PathVariable Long id) {
        bookingRepository.deleteById(id);
    }
}
