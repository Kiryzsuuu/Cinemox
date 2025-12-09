package com.cinemox.controller;

import com.cinemox.dto.ApiResponse;
import com.cinemox.model.Booking;
import com.cinemox.model.Movie;
import com.cinemox.model.Schedule;
import com.cinemox.model.User;
import com.cinemox.repository.BookingRepository;
import com.cinemox.repository.MovieRepository;
import com.cinemox.repository.ScheduleRepository;
import com.cinemox.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // User Management
    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(new ApiResponse(true, "Users retrieved successfully", users));
    }

    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<ApiResponse> toggleUserActive(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return ResponseEntity.ok(new ApiResponse(true, "User status updated", user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse(true, "User deleted successfully", null));
    }

    // Movie Management
    @PostMapping("/movies")
    public ResponseEntity<ApiResponse> createMovie(@RequestBody Movie movie) {
        Movie savedMovie = movieRepository.save(movie);
        return ResponseEntity.ok(new ApiResponse(true, "Movie created successfully", savedMovie));
    }

    @PutMapping("/movies/{id}")
    public ResponseEntity<ApiResponse> updateMovie(@PathVariable String id, @RequestBody Movie movie) {
        Movie existingMovie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        movie.setId(id);
        movie.setCreatedAt(existingMovie.getCreatedAt());
        movie.setUpdatedAt(LocalDateTime.now());

        Movie updatedMovie = movieRepository.save(movie);
        return ResponseEntity.ok(new ApiResponse(true, "Movie updated successfully", updatedMovie));
    }

    @DeleteMapping("/movies/{id}")
    public ResponseEntity<ApiResponse> deleteMovie(@PathVariable String id) {
        movieRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Movie deleted successfully", null));
    }

    // Schedule Management
    @GetMapping("/schedules")
    public ResponseEntity<ApiResponse> getAllSchedules() {
        List<Schedule> schedules = scheduleRepository.findAll();
        return ResponseEntity.ok(new ApiResponse(true, "Schedules retrieved successfully", schedules));
    }

    @PostMapping("/schedules")
    public ResponseEntity<ApiResponse> createSchedule(@RequestBody Schedule schedule) {
        Schedule savedSchedule = scheduleRepository.save(schedule);
        return ResponseEntity.ok(new ApiResponse(true, "Schedule created successfully", savedSchedule));
    }

    @PutMapping("/schedules/{id}")
    public ResponseEntity<ApiResponse> updateSchedule(@PathVariable String id, @RequestBody Schedule schedule) {
        scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        schedule.setId(id);
        Schedule updatedSchedule = scheduleRepository.save(schedule);
        return ResponseEntity.ok(new ApiResponse(true, "Schedule updated successfully", updatedSchedule));
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<ApiResponse> deleteSchedule(@PathVariable String id) {
        scheduleRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Schedule deleted successfully", null));
    }

    // Booking Management
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return ResponseEntity.ok(new ApiResponse(true, "Bookings retrieved successfully", bookings));
    }

    // Statistics
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put("totalMovies", movieRepository.count());
        stats.put("totalSchedules", scheduleRepository.count());
        stats.put("totalBookings", bookingRepository.count());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        Long monthlyBookings = bookingRepository.countByCreatedAtBetween(startOfMonth, now);
        stats.put("monthlyBookings", monthlyBookings);

        List<Booking> allBookings = bookingRepository.findAll();
        Double totalRevenue = allBookings.stream()
                .mapToDouble(Booking::getTotalPrice)
                .sum();
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(new ApiResponse(true, "Statistics retrieved successfully", stats));
    }

    @GetMapping("/statistics/bookings-by-month")
    public ResponseEntity<ApiResponse> getBookingsByMonth() {
        List<Booking> bookings = bookingRepository.findAll();

        Map<String, Long> bookingsByMonth = new HashMap<>();
        Map<String, Double> revenueByMonth = new HashMap<>();

        for (Booking booking : bookings) {
            String month = booking.getCreatedAt().getMonth().toString() + " " +
                    booking.getCreatedAt().getYear();

            bookingsByMonth.put(month, bookingsByMonth.getOrDefault(month, 0L) + 1);
            revenueByMonth.put(month, revenueByMonth.getOrDefault(month, 0.0) + booking.getTotalPrice());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("bookingsByMonth", bookingsByMonth);
        result.put("revenueByMonth", revenueByMonth);

        return ResponseEntity.ok(new ApiResponse(true, "Monthly statistics retrieved successfully", result));
    }
}
