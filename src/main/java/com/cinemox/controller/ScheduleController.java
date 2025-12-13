package com.cinemox.controller;

import com.cinemox.dto.ApiResponse;
import com.cinemox.model.Schedule;
import com.cinemox.repository.MovieRepository;
import com.cinemox.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "*")
public class ScheduleController {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private MovieRepository movieRepository;

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ApiResponse> getSchedulesByMovie(@PathVariable String movieId) {
        List<Schedule> schedules = scheduleRepository.findByMovieIdAndActiveTrue(movieId)
                .stream()
                .map(this::normalizeSchedule)
                .toList();
        return ResponseEntity.ok(new ApiResponse(true, "Schedules retrieved successfully", schedules));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse> getSchedulesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Schedule> schedules = scheduleRepository.findByShowDateAndActiveTrue(date)
            .stream()
            .map(this::normalizeSchedule)
            .toList();
        return ResponseEntity.ok(new ApiResponse(true, "Schedules retrieved successfully", schedules));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getScheduleById(@PathVariable String id) {
        Schedule schedule = scheduleRepository.findById(id)
                .map(this::normalizeSchedule)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        return ResponseEntity.ok(new ApiResponse(true, "Schedule retrieved successfully", schedule));
    }

    private Schedule normalizeSchedule(Schedule schedule) {
        boolean updated = false;

        if (schedule.getBookedSeats() == null) {
            schedule.setBookedSeats(new ArrayList<>());
            updated = true;
        }

        if (schedule.getMovieTitle() == null || schedule.getMovieTitle().isBlank()) {
            movieRepository.findById(schedule.getMovieId()).ifPresent(movie -> {
                schedule.setMovieTitle(movie.getTitle());
            });
            updated = true;
        }

        if (schedule.getTotalSeats() != null) {
            int bookedCount = schedule.getBookedSeats().size();
            int totalSeats = schedule.getTotalSeats();
            int available = Math.max(0, totalSeats - bookedCount);
            if (schedule.getAvailableSeats() == null || !schedule.getAvailableSeats().equals(available)) {
                schedule.setAvailableSeats(available);
                updated = true;
            }
        }

        if (updated) {
            scheduleRepository.save(schedule);
        }

        return schedule;
    }
}
