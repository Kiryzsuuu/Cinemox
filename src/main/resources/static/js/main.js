// Main JavaScript
let allMovies = [];

// Load movies on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadNowShowingMovies();
    await loadComingSoonMovies();
    setupSearch();
    setupMobileMenu();
    animateOnScroll();
});

// Load now showing movies
async function loadNowShowingMovies() {
    try {
        const response = await apiRequest('/movies/now-showing');
        const movies = response.data;
        allMovies = movies;
        displayMovies(movies, 'nowShowingGrid');
    } catch (error) {
        console.error('Error loading movies:', error);
        showError('Failed to load movies');
    }
}

// Load coming soon movies
async function loadComingSoonMovies() {
    try {
        const response = await apiRequest('/movies/coming-soon');
        const movies = response.data;
        displayMovies(movies, 'comingSoonGrid');
    } catch (error) {
        console.error('Error loading coming soon movies:', error);
    }
}

// Display movies in grid
function displayMovies(movies, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    if (movies.length === 0) {
        grid.innerHTML = '<p class="no-movies">No movies available</p>';
        return;
    }
    
    grid.innerHTML = movies.map(movie => `
        <div class="movie-card animate-slide-up">
            <div class="movie-poster">
                <img src="${movie.posterUrl}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="movie-overlay">
                    <button onclick="viewMovie('${movie.id}')" class="btn-view">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button onclick="bookMovie('${movie.id}')" class="btn-book">
                        <i class="fas fa-ticket-alt"></i> Book Now
                    </button>
                </div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span class="movie-genre">${movie.genre}</span>
                    <span class="movie-rating">
                        <i class="fas fa-star"></i> ${movie.imdbRating || 'N/A'}
                    </span>
                </div>
                <div class="movie-duration">
                    <i class="fas fa-clock"></i> ${movie.duration} min
                </div>
            </div>
        </div>
    `).join('');
}

// View movie details
function viewMovie(movieId) {
    window.location.href = `movie-detail.html?id=${movieId}`;
}

// Book movie
function bookMovie(movieId) {
    if (!isLoggedIn()) {
        alert('Please login to book tickets');
        window.location.href = 'login.html';
        return;
    }
    window.location.href = `movie-detail.html?id=${movieId}`;
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length === 0) {
            displayMovies(allMovies, 'nowShowingGrid');
            return;
        }
        
        const filtered = allMovies.filter(movie => 
            movie.title.toLowerCase().includes(query) ||
            movie.genre.toLowerCase().includes(query)
        );
        displayMovies(filtered, 'nowShowingGrid');
    });
}

// Setup mobile menu toggle
function setupMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Animate elements on scroll
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.animate-slide-up').forEach(el => {
        observer.observe(el);
    });
}

// Show error message
function showError(message) {
    alert(message);
}

// Show success message
function showSuccess(message) {
    alert(message);
}
