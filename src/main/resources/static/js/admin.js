// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth() || !isAdmin()) {
        modal.show({
            title: 'Access Denied',
            message: 'You do not have permission to access the admin dashboard.',
            type: 'error',
            confirmText: 'Go to Home',
            onConfirm: () => {
                window.location.href = 'index.html';
            }
        });
        return;
    }
    
    loading.show('Loading dashboard...');
    await loadDashboard();
    loading.hide();
});

function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    event.target.closest('a').classList.add('active');
    
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'movies':
            loadMovies();
            break;
        case 'schedules':
            loadSchedules();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

async function loadDashboard() {
    try {
        const response = await apiRequest('/admin/statistics');
        const stats = response.data;
        
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('totalMovies').textContent = stats.totalMovies;
        document.getElementById('totalBookings').textContent = stats.totalBookings;
        document.getElementById('totalRevenue').textContent = 'Rp ' + stats.totalRevenue.toLocaleString('id-ID');
        
        await loadCharts();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadCharts() {
    try {
        const response = await apiRequest('/admin/statistics/bookings-by-month');
        const data = response.data;
        
        const months = Object.keys(data.bookingsByMonth);
        const bookingsData = Object.values(data.bookingsByMonth);
        const revenueData = Object.values(data.revenueByMonth);
        
        // Bookings Chart
        new Chart(document.getElementById('bookingsChart'), {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Bookings',
                    data: bookingsData,
                    backgroundColor: '#00B7B5',
                    borderColor: '#018790',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        // Revenue Chart
        new Chart(document.getElementById('revenueChart'), {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue (Rp)',
                    data: revenueData,
                    borderColor: '#018790',
                    backgroundColor: 'rgba(0, 183, 181, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

async function loadMovies() {
    try {
        const response = await apiRequest('/movies');
        const movies = response.data;
        
        const table = document.getElementById('moviesTable');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Duration</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${movies.map(movie => {
                    let status = '';
                    if (movie.nowShowing && movie.comingSoon) {
                        status = '<span class="badge badge-primary">Now Showing</span> <span class="badge badge-info">Coming Soon</span>';
                    } else if (movie.nowShowing) {
                        status = '<span class="badge badge-primary">Now Showing</span>';
                    } else if (movie.comingSoon) {
                        status = '<span class="badge badge-info">Coming Soon</span>';
                    } else {
                        status = '<span class="badge badge-secondary">Not Available</span>';
                    }
                    return `
                    <tr>
                        <td>${movie.title}</td>
                        <td>${movie.genre}</td>
                        <td>${movie.duration} min</td>
                        <td>${movie.rating}</td>
                        <td>${status}</td>
                        <td>
                            <button class="btn-action btn-delete" onclick="deleteMovie('${movie.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        `;
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

async function loadSchedules() {
    try {
        const response = await apiRequest('/admin/schedules');
        const schedules = response.data;
        
        const table = document.getElementById('schedulesTable');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Movie</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Theater</th>
                    <th>Price</th>
                    <th>Available Seats</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${schedules.map(schedule => `
                    <tr>
                        <td>${schedule.movieTitle}</td>
                        <td>${schedule.showDate}</td>
                        <td>${schedule.showTime}</td>
                        <td>${schedule.theater}</td>
                        <td>Rp ${schedule.price.toLocaleString('id-ID')}</td>
                        <td>${schedule.availableSeats}/${schedule.totalSeats}</td>
                        <td>
                            <button class="btn-action btn-delete" onclick="deleteSchedule('${schedule.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
    } catch (error) {
        console.error('Error loading schedules:', error);
    }
}

async function loadBookings() {
    try {
        const response = await apiRequest('/admin/bookings');
        const bookings = response.data;
        
        const table = document.getElementById('bookingsTable');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Booking Code</th>
                    <th>User</th>
                    <th>Movie</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Seats</th>
                    <th>Total Price</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td>${booking.bookingCode}</td>
                        <td>${booking.userName}</td>
                        <td>${booking.movieTitle}</td>
                        <td>${booking.showDate}</td>
                        <td>${booking.showTime}</td>
                        <td>${booking.seats.join(', ')}</td>
                        <td>Rp ${booking.totalPrice.toLocaleString('id-ID')}</td>
                        <td><span class="booking-status ${booking.status.toLowerCase()}">${booking.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        `;
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

async function loadUsers() {
    try {
        const response = await apiRequest('/admin/users');
        const users = response.data;
        
        const table = document.getElementById('usersTable');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.fullName}</td>
                        <td>${user.email}</td>
                        <td>${user.phoneNumber || 'N/A'}</td>
                        <td>${user.roles.join(', ')}</td>
                        <td>${user.active ? 'Active' : 'Inactive'}</td>
                        <td>
                            <button class="btn-action btn-toggle" onclick="toggleUserActive('${user.id}')">
                                <i class="fas fa-toggle-on"></i> Toggle
                            </button>
                            <button class="btn-action btn-delete" onclick="deleteUser('${user.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function deleteMovie(id) {
    const confirmed = await modal.confirm({
        title: 'Delete Movie',
        message: 'Are you sure you want to delete this movie? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
    });
    
    if (!confirmed) return;
    
    loading.show('Deleting movie...');
    try {
        await apiRequest(`/admin/movies/${id}`, { method: 'DELETE' });
        loading.hide();
        notify.success('Movie deleted successfully');
        loadMovies();
    } catch (error) {
        loading.hide();
        notify.error(error.message || 'Failed to delete movie');
    }
}

async function deleteSchedule(id) {
    const confirmed = await modal.confirm({
        title: 'Delete Schedule',
        message: 'Are you sure you want to delete this schedule? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
    });
    
    if (!confirmed) return;
    
    loading.show('Deleting schedule...');
    try {
        await apiRequest(`/admin/schedules/${id}`, { method: 'DELETE' });
        loading.hide();
        notify.success('Schedule deleted successfully');
        loadSchedules();
    } catch (error) {
        loading.hide();
        notify.error(error.message || 'Failed to delete schedule');
    }
}

async function toggleUserActive(id) {
    loading.show('Updating user status...');
    try {
        await apiRequest(`/admin/users/${id}/toggle-active`, { method: 'PUT' });
        loading.hide();
        notify.success('User status updated successfully');
        loadUsers();
    } catch (error) {
        loading.hide();
        notify.error(error.message || 'Failed to update user status');
    }
}

async function deleteUser(id) {
    const confirmed = await modal.confirm({
        title: 'Delete User',
        message: 'Are you sure you want to delete this user? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
    });
    
    if (!confirmed) return;
    
    loading.show('Deleting user...');
    try {
        await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
        loading.hide();
        notify.success('User deleted successfully');
        loadUsers();
    } catch (error) {
        loading.hide();
        notify.error(error.message || 'Failed to delete user');
    }
}

function showAddMovieForm() {
    const formHtml = `
        <form id="addMovieForm" class="admin-form">
            <div class="form-group">
                <label>Title *</label>
                <input type="text" name="title" required>
            </div>
            <div class="form-group">
                <label>Description *</label>
                <textarea name="description" rows="3" required></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Genre *</label>
                    <input type="text" name="genre" required>
                </div>
                <div class="form-group">
                    <label>Duration (minutes) *</label>
                    <input type="number" name="duration" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Rating *</label>
                    <select name="rating" required>
                        <option value="">Select Rating</option>
                        <option value="G">G - General Audiences</option>
                        <option value="PG">PG - Parental Guidance</option>
                        <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
                        <option value="R">R - Restricted</option>
                        <option value="NC-17">NC-17 - Adults Only</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>IMDB Rating</label>
                    <input type="number" name="imdbRating" step="0.1" min="0" max="10">
                </div>
            </div>
            <div class="form-group">
                <label>Director *</label>
                <input type="text" name="director" required>
            </div>
            <div class="form-group">
                <label>Cast (comma separated) *</label>
                <input type="text" name="cast" placeholder="Actor 1, Actor 2, Actor 3" required>
            </div>
            <div class="form-group">
                <label>Poster URL *</label>
                <input type="url" name="posterUrl" placeholder="https://example.com/poster.jpg" required>
            </div>
            <div class="form-group">
                <label>Trailer URL</label>
                <input type="url" name="trailerUrl" placeholder="https://youtube.com/watch?v=...">
            </div>
            <div class="form-group">
                <label>Release Date *</label>
                <input type="date" name="releaseDate" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="nowShowing" id="nowShowingCheck">
                        Now Showing
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="comingSoon" id="comingSoonCheck">
                        Coming Soon
                    </label>
                </div>
            </div>
        </form>
    `;
    
    modal.show({
        title: 'Add New Movie',
        message: formHtml,
        type: 'info',
        confirmText: 'Add Movie',
        cancelText: 'Cancel',
        onConfirm: async () => {
            const form = document.getElementById('addMovieForm');
            if (!form.checkValidity()) {
                notify.warning('Please fill all required fields');
                return false;
            }
            
            const formData = new FormData(form);
            const movieData = {
                title: formData.get('title'),
                description: formData.get('description'),
                genre: formData.get('genre'),
                duration: parseInt(formData.get('duration')),
                rating: formData.get('rating'),
                imdbRating: parseFloat(formData.get('imdbRating')) || null,
                director: formData.get('director'),
                cast: formData.get('cast').split(',').map(c => c.trim()),
                posterUrl: formData.get('posterUrl'),
                trailerUrl: formData.get('trailerUrl') || null,
                releaseDate: formData.get('releaseDate'),
                nowShowing: formData.get('nowShowing') === 'on',
                comingSoon: formData.get('comingSoon') === 'on'
            };
            
            loading.show('Adding movie...');
            try {
                await apiRequest('/admin/movies', {
                    method: 'POST',
                    body: JSON.stringify(movieData)
                });
                loading.hide();
                notify.success('Movie added successfully!');
                loadMovies();
                return true;
            } catch (error) {
                loading.hide();
                notify.error(error.message || 'Failed to add movie');
                return false;
            }
        }
    });
}

async function showAddScheduleForm() {
    // Load movies first
    loading.show('Loading movies...');
    try {
        const response = await apiRequest('/movies');
        const movies = response.data;
        loading.hide();
        
        const formHtml = `
            <form id="addScheduleForm" class="admin-form">
                <div class="form-group">
                    <label>Movie *</label>
                    <select name="movieId" required>
                        <option value="">Select Movie</option>
                        ${movies.map(movie => `
                            <option value="${movie.id}">${movie.title}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Show Date *</label>
                        <input type="date" name="showDate" required>
                    </div>
                    <div class="form-group">
                        <label>Show Time *</label>
                        <input type="time" name="showTime" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Theater *</label>
                    <select name="theater" required>
                        <option value="">Select Theater</option>
                        <option value="Theater 1">Theater 1</option>
                        <option value="Theater 2">Theater 2</option>
                        <option value="Theater 3">Theater 3</option>
                        <option value="Theater 4">Theater 4</option>
                        <option value="Theater 5">Theater 5</option>
                        <option value="IMAX">IMAX</option>
                        <option value="VIP">VIP</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Price (Rp) *</label>
                        <input type="number" name="price" min="0" step="1000" placeholder="50000" required>
                    </div>
                    <div class="form-group">
                        <label>Total Seats *</label>
                        <input type="number" name="totalSeats" min="1" max="100" value="50" required>
                    </div>
                </div>
            </form>
        `;
        
        modal.show({
            title: 'Add New Schedule',
            message: formHtml,
            type: 'info',
            confirmText: 'Add Schedule',
            cancelText: 'Cancel',
            onConfirm: async () => {
                const form = document.getElementById('addScheduleForm');
                if (!form.checkValidity()) {
                    notify.warning('Please fill all required fields');
                    return false;
                }
                
                const formData = new FormData(form);
                const scheduleData = {
                    movieId: formData.get('movieId'),
                    showDate: formData.get('showDate'),
                    showTime: formData.get('showTime'),
                    theater: formData.get('theater'),
                    price: parseInt(formData.get('price')),
                    totalSeats: parseInt(formData.get('totalSeats'))
                };
                
                loading.show('Adding schedule...');
                try {
                    await apiRequest('/admin/schedules', {
                        method: 'POST',
                        body: JSON.stringify(scheduleData)
                    });
                    loading.hide();
                    notify.success('Schedule added successfully!');
                    loadSchedules();
                    return true;
                } catch (error) {
                    loading.hide();
                    notify.error(error.message || 'Failed to add schedule');
                    return false;
                }
            }
        });
    } catch (error) {
        loading.hide();
        notify.error('Failed to load movies');
    }
}

function showAddAdminForm() {
    const formHtml = `
        <form id="addAdminForm" class="admin-form">
            <div class="form-group">
                <label>Full Name *</label>
                <input type="text" name="fullName" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phoneNumber" placeholder="+62812345678">
            </div>
            <div class="form-group">
                <label>Password *</label>
                <input type="password" name="password" minlength="6" required>
            </div>
            <div class="form-group">
                <label>Confirm Password *</label>
                <input type="password" name="confirmPassword" minlength="6" required>
            </div>
            <div class="form-group">
                <label style="color: #e74c3c; font-size: 0.9em;">
                    <i class="fas fa-exclamation-triangle"></i>
                    This will create a new admin account with full privileges.
                </label>
            </div>
        </form>
    `;
    
    modal.show({
        title: 'Add New Admin',
        message: formHtml,
        type: 'warning',
        confirmText: 'Create Admin',
        cancelText: 'Cancel',
        onConfirm: async () => {
            const form = document.getElementById('addAdminForm');
            if (!form.checkValidity()) {
                notify.warning('Please fill all required fields');
                return false;
            }
            
            const formData = new FormData(form);
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            
            if (password !== confirmPassword) {
                notify.error('Passwords do not match');
                return false;
            }
            
            const adminData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phoneNumber: formData.get('phoneNumber') || null,
                password: password
            };
            
            loading.show('Creating admin account...');
            try {
                await apiRequest('/admin/users/create-admin', {
                    method: 'POST',
                    body: JSON.stringify(adminData)
                });
                loading.hide();
                notify.success('Admin account created successfully!');
                loadUsers();
                return true;
            } catch (error) {
                loading.hide();
                notify.error(error.message || 'Failed to create admin account');
                return false;
            }
        }
    });
}
