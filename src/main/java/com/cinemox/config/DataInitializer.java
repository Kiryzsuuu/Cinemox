package com.cinemox.config;

import com.cinemox.model.Movie;
import com.cinemox.model.Schedule;
import com.cinemox.model.User;
import com.cinemox.repository.MovieRepository;
import com.cinemox.repository.ScheduleRepository;
import com.cinemox.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin user if not exists
        if (!userRepository.existsByEmail("maskiryz23@gmail.com")) {
            User admin = new User();
            admin.setEmail("maskiryz23@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Admin Cinemox");
            admin.setPhoneNumber("081234567890");
            admin.setEmailVerified(true);
            admin.setActive(true);

            Set<String> roles = new HashSet<>();
            roles.add("ADMIN");
            roles.add("USER");
            admin.setRoles(roles);

            userRepository.save(admin);
            System.out.println("Admin user created successfully");
        }

        // Create sample movies if none exist
        if (movieRepository.count() == 0) {
            Movie movie1 = new Movie();
            movie1.setTitle("The Avengers: Endgame");
            movie1.setDescription(
                    "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.");
            movie1.setGenre("Action, Adventure, Sci-Fi");
            movie1.setDuration(181);
            movie1.setDirector("Anthony Russo, Joe Russo");
            movie1.setCast(Arrays.asList("Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth"));
            movie1.setPosterUrl("https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg");
            movie1.setTrailerUrl("https://www.youtube.com/watch?v=TcMBFSGVi1c");
            movie1.setRating("PG-13");
            movie1.setImdbRating(8.4);
            movie1.setReleaseDate(LocalDateTime.of(2019, 4, 26, 0, 0));
            movie1.setNowShowing(true);
            movieRepository.save(movie1);

            Movie movie2 = new Movie();
            movie2.setTitle("Inception");
            movie2.setDescription(
                    "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.");
            movie2.setGenre("Action, Sci-Fi, Thriller");
            movie2.setDuration(148);
            movie2.setDirector("Christopher Nolan");
            movie2.setCast(Arrays.asList("Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"));
            movie2.setPosterUrl("https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg");
            movie2.setTrailerUrl("https://www.youtube.com/watch?v=YoHD9XEInc0");
            movie2.setRating("PG-13");
            movie2.setImdbRating(8.8);
            movie2.setReleaseDate(LocalDateTime.of(2010, 7, 16, 0, 0));
            movie2.setNowShowing(true);
            movieRepository.save(movie2);

            Movie movie3 = new Movie();
            movie3.setTitle("Interstellar");
            movie3.setDescription(
                    "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.");
            movie3.setGenre("Adventure, Drama, Sci-Fi");
            movie3.setDuration(169);
            movie3.setDirector("Christopher Nolan");
            movie3.setCast(Arrays.asList("Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"));
            movie3.setPosterUrl("https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg");
            movie3.setTrailerUrl("https://www.youtube.com/watch?v=zSWdZVtXT7E");
            movie3.setRating("PG-13");
            movie3.setImdbRating(8.6);
            movie3.setReleaseDate(LocalDateTime.of(2014, 11, 7, 0, 0));
            movie3.setNowShowing(true);
            movieRepository.save(movie3);

            System.out.println("Sample movies created successfully");

            // Create schedules for movies
            LocalDate today = LocalDate.now();

            for (Movie movie : Arrays.asList(movie1, movie2, movie3)) {
                for (int day = 0; day < 7; day++) {
                    LocalDate showDate = today.plusDays(day);

                    for (String time : Arrays.asList("12:00", "15:00", "18:00", "21:00")) {
                        Schedule schedule = new Schedule();
                        schedule.setMovieId(movie.getId());
                        schedule.setMovieTitle(movie.getTitle());
                        schedule.setTheater("Theater " + ((day % 3) + 1));
                        schedule.setShowDate(showDate);
                        schedule.setShowTime(LocalTime.parse(time));
                        schedule.setTotalSeats(50);
                        schedule.setAvailableSeats(50);
                        schedule.setPrice(50000.0);
                        schedule.setActive(true);

                        scheduleRepository.save(schedule);
                    }
                }
            }

            System.out.println("Sample schedules created successfully");
        }
    }
}
