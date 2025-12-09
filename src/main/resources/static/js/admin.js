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
                ${movies.map(movie => `
                    <tr>
                        <td>${movie.title}</td>
                        <td>${movie.genre}</td>
                        <td>${movie.duration} min</td>
                        <td>${movie.rating}</td>
                        <td>${movie.nowShowing ? 'Now Showing' : 'Coming Soon'}</td>
                        <td>
                            <button class="btn-action btn-delete" onclick="deleteMovie('${movie.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
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
    modal.show({
        title: 'Add Movie',
        message: 'Feature to add movies will open a form modal. Implementation can be expanded.',
        type: 'info'
    });
}

function showAddScheduleForm() {
    modal.show({
        title: 'Add Schedule',
        message: 'Feature to add schedules will open a form modal. Implementation can be expanded.',
        type: 'info'
    });
}
