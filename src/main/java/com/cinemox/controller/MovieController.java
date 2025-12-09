package com.cinemox.controller;

import com.cinemox.dto.ApiResponse;
import com.cinemox.model.Movie;
import com.cinemox.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {

    @Autowired
    private MovieRepository movieRepository;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllMovies() {
        List<Movie> movies = movieRepository.findAll();
        return ResponseEntity.ok(new ApiResponse(true, "Movies retrieved successfully", movies));
    }

    @GetMapping("/now-showing")
    public ResponseEntity<ApiResponse> getNowShowingMovies() {
        List<Movie> movies = movieRepository.findByNowShowingTrue();
        return ResponseEntity.ok(new ApiResponse(true, "Now showing movies retrieved successfully", movies));
    }

    @GetMapping("/coming-soon")
    public ResponseEntity<ApiResponse> getComingSoonMovies() {
        List<Movie> movies = movieRepository.findByComingSoonTrue();
        return ResponseEntity.ok(new ApiResponse(true, "Coming soon movies retrieved successfully", movies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getMovieById(@PathVariable String id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        return ResponseEntity.ok(new ApiResponse(true, "Movie retrieved successfully", movie));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchMovies(@RequestParam String query) {
        List<Movie> movies = movieRepository.findByTitleContainingIgnoreCase(query);
        return ResponseEntity.ok(new ApiResponse(true, "Search results retrieved successfully", movies));
    }
}
