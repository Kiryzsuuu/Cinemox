package com.cinemox.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "movies")
public class Movie {
    @Id
    private String id;

    private String title;

    private String description;

    private String genre;

    private Integer duration; // in minutes

    private String director;

    private List<String> cast;

    private String posterUrl;

    private String trailerUrl;

    private String rating; // G, PG, PG-13, R, etc.

    private Double imdbRating;

    private LocalDateTime releaseDate;

    private boolean nowShowing = true;

    private boolean comingSoon = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();
}
