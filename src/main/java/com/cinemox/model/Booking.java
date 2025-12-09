package com.cinemox.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    private String userId;

    private String userEmail;

    private String userName;

    private String scheduleId;

    private String movieId;

    private String movieTitle;

    private String theater;

    private String showDate;

    private String showTime;

    private List<String> seats;

    private Integer totalTickets;

    private Double totalPrice;

    private String bookingCode;

    private String barcodeUrl;

    private String status; // PENDING, CONFIRMED, CANCELLED

    private LocalDateTime bookingDate = LocalDateTime.now();

    private LocalDateTime createdAt = LocalDateTime.now();
}
