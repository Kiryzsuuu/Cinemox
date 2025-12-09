package com.cinemox.controller;

import com.cinemox.model.Review;
import com.cinemox.model.User;
import com.cinemox.repository.ReviewRepository;
import com.cinemox.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Review review, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "You must be logged in to submit a review"));
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Validate rating
            if (review.getRating() < 1 || review.getRating() > 5) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Rating must be between 1 and 5"));
            }

            // Validate comment
            if (review.getComment() == null || review.getComment().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Comment cannot be empty"));
            }

            review.setUserId(user.getId());
            review.setUserName(user.getFullName());

            Review savedReview = reviewRepository.save(review);
            return ResponseEntity.ok(savedReview);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to submit review: " + e.getMessage()));
        }
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<Review>> getMovieReviews(@PathVariable String movieId) {
        List<Review> reviews = reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/movie/{movieId}/stats")
    public ResponseEntity<?> getMovieReviewStats(@PathVariable String movieId) {
        List<Review> reviews = reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId);

        if (reviews.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "averageRating", 0,
                    "totalReviews", 0));
        }

        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        return ResponseEntity.ok(Map.of(
                "averageRating", Math.round(averageRating * 10.0) / 10.0,
                "totalReviews", reviews.size()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "You must be logged in to delete a review"));
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Review review = reviewRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Review not found"));

            // Check if user owns this review or is admin
            if (!review.getUserId().equals(user.getId()) && !user.getRoles().contains("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only delete your own reviews"));
            }

            reviewRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete review: " + e.getMessage()));
        }
    }
}
