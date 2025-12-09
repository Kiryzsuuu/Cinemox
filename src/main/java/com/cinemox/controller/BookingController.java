package com.cinemox.controller;

import com.cinemox.dto.ApiResponse;
import com.cinemox.dto.BookingRequest;
import com.cinemox.model.Booking;
import com.cinemox.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            ApiResponse response = bookingService.createBooking(userEmail, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse> getMyBookings(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Booking> bookings = bookingService.getUserBookings(userEmail);
        return ResponseEntity.ok(new ApiResponse(true, "Bookings retrieved successfully", bookings));
    }

    @GetMapping("/code/{bookingCode}")
    public ResponseEntity<ApiResponse> getBookingByCode(@PathVariable String bookingCode) {
        try {
            Booking booking = bookingService.getBookingByCode(bookingCode);
            return ResponseEntity.ok(new ApiResponse(true, "Booking retrieved successfully", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }
}
