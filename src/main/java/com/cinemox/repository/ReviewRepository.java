package com.cinemox.repository;

import com.cinemox.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByMovieIdOrderByCreatedAtDesc(String movieId);

    List<Review> findByUserId(String userId);

    void deleteByMovieId(String movieId);
}
