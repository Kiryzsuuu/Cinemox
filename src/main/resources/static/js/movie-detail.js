// Movie Detail JavaScript
let currentMovie = null;
let currentSchedule = null;
let selectedSeats = [];
let selectedRating = 0;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    // Prefer cached user info to avoid needless API hits
    const cachedUser = getUserInfo();
    if (cachedUser) {
        currentUser = cachedUser;
    }
    
    // Get current user
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await apiRequest('/auth/me');
            if (response?.data) {
                currentUser = response.data;
                setUserInfo(response.data);
            }
        } catch (error) {
            console.log('User not logged in');
        }
    }
    
    if (movieId) {
        await loadMovieDetail(movieId);
        await loadSchedules(movieId);
        await loadReviews(movieId);
        setupReviewForm();
    }
});

async function loadMovieDetail(movieId) {
    try {
        const response = await apiRequest(`/movies/${movieId}`);
        currentMovie = response.data;
        displayMovieDetail(currentMovie);
    } catch (error) {
        console.error('Error loading movie:', error);
        alert('Failed to load movie details');
    }
}

function displayMovieDetail(movie) {
    const detailDiv = document.getElementById('movieDetail');
    
    detailDiv.innerHTML = `
        <div class="movie-poster-large">
            <img src="${movie.posterUrl}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'">
        </div>
        <div class="movie-info-detail">
            <h1 class="movie-title-detail">${movie.title}</h1>
            <div class="movie-meta-detail">
                <div class="meta-item">
                    <i class="fas fa-star"></i>
                    <span>${movie.imdbRating || 'N/A'}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${movie.duration} min</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-tag"></i>
                    <span>${movie.rating}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${new Date(movie.releaseDate).getFullYear()}</span>
                </div>
            </div>
            <div class="movie-description">
                <p>${movie.description}</p>
            </div>
            <div class="movie-cast">
                <h3><i class="fas fa-film"></i> Genre</h3>
                <p>${movie.genre}</p>
            </div>
            <div class="movie-cast">
                <h3><i class="fas fa-user-tie"></i> Director</h3>
                <p>${movie.director}</p>
            </div>
            <div class="movie-cast">
                <h3><i class="fas fa-users"></i> Cast</h3>
                <div class="cast-list">
                    ${movie.cast.map(actor => `<span class="cast-item">${actor}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

async function loadSchedules(movieId) {
    try {
        const response = await apiRequest(`/schedules/movie/${movieId}`);
        const schedules = response.data;
        displaySchedules(schedules);
    } catch (error) {
        console.error('Error loading schedules:', error);
    }
}

function displaySchedules(schedules) {
    const grid = document.getElementById('schedulesGrid');
    
    if (schedules.length === 0) {
        grid.innerHTML = '<p>No schedules available for this movie</p>';
        return;
    }
    
    grid.innerHTML = schedules.map(schedule => `
        <div class="schedule-card" onclick='openBookingModal(event, ${JSON.stringify(schedule)})'>
            <div class="schedule-date">
                <i class="fas fa-calendar"></i> ${formatDate(schedule.showDate)}
            </div>
            <div class="schedule-time">
                <i class="fas fa-clock"></i> ${schedule.showTime}
            </div>
            <div class="schedule-theater">
                <i class="fas fa-tv"></i> ${schedule.theater}
            </div>
            <div class="schedule-price">
                Rp ${formatPrice(schedule.price)}
            </div>
            <div class="schedule-seats">
                <i class="fas fa-chair"></i> ${schedule.availableSeats} seats available
            </div>
        </div>
    `).join('');
}

function openBookingModal(evt, schedule) {
    if (!isLoggedIn()) {
        alert('Please login to book tickets');
        window.location.href = 'login.html';
        return;
    }
    
    // Add click animation
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('clicked');
        setTimeout(() => {
            evt.currentTarget.classList.remove('clicked');
        }, 400);
    }

    const safeSchedule = {
        ...schedule,
        bookedSeats: schedule.bookedSeats || []
    };

    currentSchedule = safeSchedule;
    selectedSeats = [];

    generateSeats(safeSchedule);
    updateBookingSummary();
    
    // Update schedule time info
    const scheduleInfo = `${formatDate(schedule.showDate)} - ${schedule.showTime} - ${schedule.theater}`;
    document.getElementById('scheduleTimeInfo').textContent = scheduleInfo;
    
    document.getElementById('bookingModal').style.display = 'flex';
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    selectedSeats = [];
}

function generateSeats(schedule) {
    const container = document.getElementById('seatsContainer');
    const rows = 5;
    const cols = 10;
    const totalSeats = rows * cols;

    const bookedSeats = schedule.bookedSeats || [];
    
    let html = '';
    for (let i = 1; i <= totalSeats; i++) {
        const row = String.fromCharCode(64 + Math.ceil(i / cols));
        const col = ((i - 1) % cols) + 1;
        const seatLabel = `${row}${col}`;
        
        const isBooked = bookedSeats.includes(seatLabel);
        const seatClass = isBooked ? 'booked' : 'available';
        
        html += `
            <div class="seat ${seatClass}" 
                 data-seat="${seatLabel}" 
                 onclick="toggleSeat('${seatLabel}', ${isBooked})">
                ${seatLabel}
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function toggleSeat(seatLabel, isBooked) {
    if (isBooked) return;
    
    const seatElement = document.querySelector(`[data-seat="${seatLabel}"]`);
    
    if (selectedSeats.includes(seatLabel)) {
        selectedSeats = selectedSeats.filter(s => s !== seatLabel);
        seatElement.classList.remove('selected');
        seatElement.classList.add('available');
    } else {
        selectedSeats.push(seatLabel);
        seatElement.classList.remove('available');
        seatElement.classList.add('selected');
    }
    
    updateBookingSummary();
}

function updateBookingSummary() {
    const seatsText = selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None';
    const totalPrice = selectedSeats.length * currentSchedule.price;
    
    document.getElementById('selectedSeatsText').textContent = seatsText;
    document.getElementById('totalPrice').textContent = `Rp ${formatPrice(totalPrice)}`;
}

async function confirmBooking() {
    if (selectedSeats.length === 0) {
        showInlineNotice('Silakan pilih minimal 1 kursi.', 'warning');
        return;
    }
    
    const bookingData = {
        scheduleId: currentSchedule.id,
        seats: selectedSeats,
        totalPrice: selectedSeats.length * currentSchedule.price
    };

    const confirmButton = document.querySelector('.btn-confirm');
    if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Processing...';
    }
    if (window.loading) {
        loading.show('Processing your booking...');
    }

    try {
        const response = await apiRequest('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });

        if (response.success) {
            showInlineNotice('Tiket berhasil dipesan! Cek email untuk konfirmasi.', 'success');
            closeBookingModal();
            setTimeout(() => {
                window.location.href = 'my-bookings.html';
            }, 600);
        } else {
            showInlineNotice(response.message || 'Booking gagal, coba lagi.', 'error');
        }
    } catch (error) {
        showInlineNotice(error.message || 'Booking gagal, coba lagi.', 'error');
    } finally {
        if (window.loading) {
            loading.hide();
        }
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent = 'Confirm Booking';
        }
    }
}

function showInlineNotice(message, type = 'info') {
    if (window.notify) {
        if (type === 'success') return notify.success(message);
        if (type === 'error') return notify.error(message);
        if (type === 'warning') return notify.warning(message);
        return notify.info(message);
    }

    // Fallback mini-toast if notifications.js not loaded
    let container = document.getElementById('inline-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'inline-toast-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.marginBottom = '10px';
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '10px';
    toast.style.color = '#fff';
    toast.style.minWidth = '220px';
    toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.16)';
    toast.style.fontWeight = '600';
    toast.style.fontSize = '14px';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-5px)';
    toast.style.transition = 'all 0.25s ease';

    const colors = {
        success: '#2ecc71',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    toast.style.background = colors[type] || colors.info;

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-5px)';
        setTimeout(() => toast.remove(), 200);
    }, 2800);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

// Review Functions
async function loadReviews(movieId) {
    try {
        // Load review stats
        const statsResponse = await fetch(`${API_BASE_URL}/reviews/movie/${movieId}/stats`);
        const stats = await statsResponse.json();
        displayReviewStats(stats);

        // Load reviews
        const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/movie/${movieId}`);
        const reviews = await reviewsResponse.json();
        displayReviews(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

function displayReviewStats(stats) {
    const averageRating = stats.averageRating || 0;
    const totalReviews = stats.totalReviews || 0;

    document.getElementById('averageRating').textContent = averageRating.toFixed(1);
    document.getElementById('totalReviews').textContent = `${totalReviews} review${totalReviews !== 1 ? 's' : ''}`;

    // Display stars
    const starsContainer = document.getElementById('averageStars');
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = i <= Math.round(averageRating) ? 'fas fa-star' : 'far fa-star';
        starsContainer.appendChild(star);
    }
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    const addReviewSection = document.getElementById('addReviewSection');

    if (!currentUser) {
        addReviewSection.innerHTML = `
            <div class="login-prompt">
                <p>Please login to write a review</p>
                <a href="login.html" class="btn-login-review">Login</a>
            </div>
        `;
    }

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to review!</div>';
        return;
    }

    reviewsList.innerHTML = reviews.map(review => {
        const userInitial = review.userName.charAt(0).toUpperCase();
        const canDelete = currentUser && (currentUser.id === review.userId || currentUser.role === 'ADMIN');
        const reviewDate = new Date(review.createdAt).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-user">
                        <div class="user-avatar">${userInitial}</div>
                        <div class="user-info">
                            <h4>${review.userName}</h4>
                            <p class="review-date">${reviewDate}</p>
                        </div>
                    </div>
                    <div class="review-rating">
                        <div class="stars">
                            ${generateStars(review.rating)}
                        </div>
                    </div>
                </div>
                <div class="review-content">
                    <p>${review.comment}</p>
                </div>
                ${canDelete ? `
                    <div class="review-actions">
                        <button class="btn-delete-review" onclick="deleteReview('${review.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function generateStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        starsHtml += `<i class="${i <= rating ? 'fas' : 'far'} fa-star"></i>`;
    }
    return starsHtml;
}

function setupReviewForm() {
    const stars = document.querySelectorAll('.star-rating i');
    const ratingInput = document.getElementById('ratingInput');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            ratingInput.value = selectedRating;
            updateStarDisplay(stars, selectedRating);
        });

        star.addEventListener('mouseenter', () => {
            const hoverRating = parseInt(star.dataset.rating);
            updateStarDisplay(stars, hoverRating);
        });
    });

    const starRating = document.querySelector('.star-rating');
    starRating.addEventListener('mouseleave', () => {
        updateStarDisplay(stars, selectedRating);
    });

    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', handleReviewSubmit);
}

function updateStarDisplay(stars, rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

async function handleReviewSubmit(e) {
    e.preventDefault();

    if (!currentUser) {
        showInlineNotice('Silakan login untuk menulis review.', 'warning');
        setTimeout(() => window.location.href = 'login.html', 600);
        return;
    }

    const rating = parseInt(document.getElementById('ratingInput').value);
    const comment = document.getElementById('commentInput').value.trim();

    if (rating === 0) {
        showInlineNotice('Pilih rating dulu sebelum submit.', 'warning');
        return;
    }

    if (!comment) {
        showInlineNotice('Tulis komentar singkat sebelum submit.', 'warning');
        return;
    }

    const reviewData = {
        movieId: currentMovie.id,
        rating: rating,
        comment: comment
    };

    try {
        const response = await apiRequest('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });

        if (response) {
            showInlineNotice('Review berhasil dikirim!', 'success');
            // Reset form
            selectedRating = 0;
            document.getElementById('ratingInput').value = 0;
            document.getElementById('commentInput').value = '';
            const stars = document.querySelectorAll('.star-rating i');
            updateStarDisplay(stars, 0);
            // Reload reviews
            await loadReviews(currentMovie.id);
        }
    } catch (error) {
        showInlineNotice(error.message || 'Gagal mengirim review', 'error');
    }
}

async function deleteReview(reviewId) {
    const proceed = window.modal ? await modal.confirm({
        title: 'Hapus review?',
        message: 'Tindakan ini tidak dapat dibatalkan.',
        confirmText: 'Hapus',
        cancelText: 'Batal'
    }) : confirm('Are you sure you want to delete this review?');

    if (!proceed) return;

    try {
        const response = await apiRequest(`/reviews/${reviewId}`, {
            method: 'DELETE'
        });

        if (response) {
            showInlineNotice('Review dihapus.', 'success');
            await loadReviews(currentMovie.id);
        }
    } catch (error) {
        showInlineNotice(error.message || 'Gagal menghapus review', 'error');
    }
}
