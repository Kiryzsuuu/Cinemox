package com.cinemox.service;

import com.cinemox.dto.ApiResponse;
import com.cinemox.dto.BookingRequest;
import com.cinemox.model.Booking;
import com.cinemox.model.Schedule;
import com.cinemox.model.User;
import com.cinemox.repository.BookingRepository;
import com.cinemox.repository.ScheduleRepository;
import com.cinemox.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BarcodeService barcodeService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public ApiResponse createBooking(String userEmail, BookingRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // Check seat availability
        for (String seat : request.getSeats()) {
            if (schedule.getBookedSeats().contains(seat)) {
                return new ApiResponse(false, "Seat " + seat + " is already booked", null);
            }
        }

        if (schedule.getAvailableSeats() < request.getSeats().size()) {
            return new ApiResponse(false, "Not enough seats available", null);
        }

        // Create booking
        Booking booking = new Booking();
        booking.setUserId(user.getId());
        booking.setUserEmail(user.getEmail());
        booking.setUserName(user.getFullName());
        booking.setScheduleId(schedule.getId());
        booking.setMovieId(schedule.getMovieId());
        booking.setMovieTitle(schedule.getMovieTitle());
        booking.setTheater(schedule.getTheater());
        booking.setShowDate(schedule.getShowDate().toString());
        booking.setShowTime(schedule.getShowTime().toString());
        booking.setSeats(request.getSeats());
        booking.setTotalTickets(request.getSeats().size());
        booking.setTotalPrice(request.getTotalPrice());
        booking.setStatus("CONFIRMED");

        // Generate booking code and barcode
        String bookingCode = barcodeService.generateBookingCode();
        booking.setBookingCode(bookingCode);

        String barcodeData = "CINEMOX|" + bookingCode + "|" + schedule.getMovieTitle() + "|" +
                schedule.getShowDate() + "|" + schedule.getShowTime();
        String barcodeUrl = barcodeService.generateBarcode(barcodeData);
        booking.setBarcodeUrl(barcodeUrl);

        bookingRepository.save(booking);

        // Update schedule
        schedule.getBookedSeats().addAll(request.getSeats());
        schedule.setAvailableSeats(schedule.getAvailableSeats() - request.getSeats().size());
        scheduleRepository.save(schedule);

        // Send confirmation email
        emailService.sendBookingConfirmation(
                user.getEmail(),
                bookingCode,
                schedule.getMovieTitle(),
                schedule.getShowDate().toString(),
                schedule.getShowTime().toString(),
                schedule.getTheater(),
                String.join(", ", request.getSeats()),
                request.getTotalPrice(),
                barcodeUrl);

        return new ApiResponse(true, "Booking successful", booking);
    }

    public List<Booking> getUserBookings(String userEmail) {
        return bookingRepository.findByUserEmail(userEmail);
    }

    public Booking getBookingByCode(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }
}
