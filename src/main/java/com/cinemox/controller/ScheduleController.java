package com.cinemox.controller;

import com.cinemox.dto.ApiResponse;
import com.cinemox.model.Schedule;
import com.cinemox.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "*")
public class ScheduleController {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ApiResponse> getSchedulesByMovie(@PathVariable String movieId) {
        List<Schedule> schedules = scheduleRepository.findByMovieIdAndActiveTrue(movieId);
        return ResponseEntity.ok(new ApiResponse(true, "Schedules retrieved successfully", schedules));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse> getSchedulesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Schedule> schedules = scheduleRepository.findByShowDateAndActiveTrue(date);
        return ResponseEntity.ok(new ApiResponse(true, "Schedules retrieved successfully", schedules));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getScheduleById(@PathVariable String id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        return ResponseEntity.ok(new ApiResponse(true, "Schedule retrieved successfully", schedule));
    }
}
