package com.cinemox.repository;

import com.cinemox.model.Schedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends MongoRepository<Schedule, String> {
    List<Schedule> findByMovieIdAndActiveTrue(String movieId);

    List<Schedule> findByShowDateAndActiveTrue(LocalDate showDate);

    List<Schedule> findByMovieIdAndShowDateAndActiveTrue(String movieId, LocalDate showDate);
}
