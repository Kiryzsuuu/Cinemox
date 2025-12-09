package com.cinemox.repository;

import com.cinemox.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);

    List<Booking> findByUserEmail(String userEmail);

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByStatus(String status);

    List<Booking> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
