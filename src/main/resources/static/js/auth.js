// Authentication utilities
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function getUserInfo() {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
}

function setUserInfo(userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

function removeUserInfo() {
    localStorage.removeItem('userInfo');
}

function isLoggedIn() {
    return getToken() !== null;
}

function isAdmin() {
    const userInfo = getUserInfo();
    return userInfo && userInfo.role === 'ADMIN';
}

function logout() {
    removeToken();
    removeUserInfo();
    window.location.href = 'index.html';
}

function checkAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function updateNavigation() {
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const userName = document.getElementById('userName');
    
    if (isLoggedIn()) {
        const userInfo = getUserInfo();
        if (navAuth) navAuth.style.display = 'none';
        if (navUser) navUser.style.display = 'flex';
        if (userName) userName.textContent = userInfo.fullName;
        
        // Add admin link if user is admin
        if (isAdmin()) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.className = 'btn-admin';
            adminLink.textContent = 'Admin Dashboard';
            if (navUser && !navUser.querySelector('.btn-admin')) {
                navUser.insertBefore(adminLink, navUser.firstChild);
            }
        }
    } else {
        if (navAuth) navAuth.style.display = 'flex';
        if (navUser) navUser.style.display = 'none';
    }
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            logout();
            throw new Error('Session expired. Please login again.');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', updateNavigation);
