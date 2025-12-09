package com.cinemox.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "schedules")
public class Schedule {
    @Id
    private String id;

    private String movieId;

    private String movieTitle;

    private String theater; // Theater name (e.g., "Theater 1", "Theater 2")

    private LocalDate showDate;

    private LocalTime showTime;

    private Integer totalSeats = 50;

    private Integer availableSeats = 50;

    private List<String> bookedSeats = new ArrayList<>();

    private Double price;

    private boolean active = true;
}
