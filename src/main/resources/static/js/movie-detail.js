// Movie Detail JavaScript
let currentMovie = null;
let currentSchedule = null;
let selectedSeats = [];

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    
    if (movieId) {
        await loadMovieDetail(movieId);
        await loadSchedules(movieId);
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
        <div class="schedule-card" onclick='openBookingModal(${JSON.stringify(schedule)})'>
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

function openBookingModal(schedule) {
    if (!isLoggedIn()) {
        alert('Please login to book tickets');
        window.location.href = 'login.html';
        return;
    }
    
    // Add click animation
    event.currentTarget.classList.add('clicked');
    setTimeout(() => {
        event.currentTarget.classList.remove('clicked');
    }, 400);
    
    currentSchedule = schedule;
    selectedSeats = [];
    
    generateSeats(schedule);
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
    
    let html = '';
    for (let i = 1; i <= totalSeats; i++) {
        const row = String.fromCharCode(64 + Math.ceil(i / cols));
        const col = ((i - 1) % cols) + 1;
        const seatLabel = `${row}${col}`;
        
        const isBooked = schedule.bookedSeats.includes(seatLabel);
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
        alert('Please select at least one seat');
        return;
    }
    
    const bookingData = {
        scheduleId: currentSchedule.id,
        seats: selectedSeats,
        totalPrice: selectedSeats.length * currentSchedule.price
    };
    
    try {
        const response = await apiRequest('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
        
        if (response.success) {
            alert('Booking successful! Check your email for ticket confirmation.');
            closeBookingModal();
            window.location.href = 'my-bookings.html';
        } else {
            alert(response.message);
        }
    } catch (error) {
        alert(error.message);
    }
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
