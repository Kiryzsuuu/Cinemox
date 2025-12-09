// Profile Management Script
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    loadProfile();
    setupEventListeners();
});

// Toast Notification Function
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-show`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type] || icons.info}"></i>
        </div>
        <div class="toast-content">
            <p>${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Show/Hide Loading on Button
function showLoading(buttonId) {
    const btn = document.getElementById(buttonId);
    btn.disabled = true;
    btn.querySelector('.btn-text').style.display = 'none';
    btn.querySelector('.btn-loader').style.display = 'inline-flex';
}

function hideLoading(buttonId) {
    const btn = document.getElementById(buttonId);
    btn.disabled = false;
    btn.querySelector('.btn-text').style.display = 'inline-flex';
    btn.querySelector('.btn-loader').style.display = 'none';
}

// Load Profile Data
async function loadProfile() {
    try {
        const response = await apiRequest('/profile');
        
        if (response.success) {
            const data = response.data;
            
            // Update navbar username
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = data.fullName || 'User';
            }
            
            // Fill form fields
            document.getElementById('fullName').value = data.fullName || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('phoneNumber').value = data.phoneNumber || '';
            
            // Set profile picture
            if (data.profilePicture) {
                const img = document.getElementById('profilePicturePreview');
                const placeholder = document.querySelector('.profile-picture-placeholder');
                img.src = data.profilePicture;
                img.classList.add('active');
                placeholder.classList.add('hidden');
                document.getElementById('deletePictureBtn').style.display = 'block';
            }
            
            // Set account info
            document.getElementById('emailVerifiedStatus').innerHTML = data.emailVerified 
                ? '<i class="fas fa-check-circle"></i> Verified' 
                : '<i class="fas fa-exclamation-circle"></i> Not Verified';
            document.getElementById('emailVerifiedStatus').className = data.emailVerified 
                ? 'info-value status-verified' 
                : 'info-value status-not-verified';
            
            if (data.createdAt) {
                const date = new Date(data.createdAt);
                document.getElementById('memberSince').textContent = date.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            
            const roles = Array.isArray(data.roles) ? data.roles.join(', ') : data.roles || 'USER';
            document.getElementById('userRole').textContent = roles;
        }
    } catch (error) {
        showToast('Failed to load profile data', 'error');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Profile Form Submit
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfile();
    });
    
    // Password Form Submit
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await changePassword();
    });
    
    // Profile Picture Upload
    document.getElementById('profilePictureInput').addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
            await uploadProfilePicture(e.target.files[0]);
        }
    });
    
    // Delete Profile Picture
    document.getElementById('deletePictureBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to remove your profile picture?')) {
            await deleteProfilePicture();
        }
    });
    
    // Logout Button
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        window.location.href = 'login.html';
    });
}

// Update Profile
async function updateProfile() {
    showLoading('saveProfileBtn');
    
    try {
        const fullName = document.getElementById('fullName').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        
        const response = await apiRequest('/profile', {
            method: 'PUT',
            body: JSON.stringify({ fullName, phoneNumber })
        });
        
        hideLoading('saveProfileBtn');
        
        if (response.success) {
            showToast('Profile updated successfully!', 'success');
            
            // Update user info in localStorage
            const userInfo = getUserInfo();
            userInfo.fullName = fullName;
            setUserInfo(userInfo);
        } else {
            showToast(response.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        hideLoading('saveProfileBtn');
        showToast(error.message || 'Failed to update profile', 'error');
    }
}

// Change Password
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'warning');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'warning');
        return;
    }
    
    showLoading('changePasswordBtn');
    
    try {
        const response = await apiRequest('/profile/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        hideLoading('changePasswordBtn');
        
        if (response.success) {
            showToast('Password changed successfully!', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            showToast(response.message || 'Failed to change password', 'error');
        }
    } catch (error) {
        hideLoading('changePasswordBtn');
        showToast(error.message || 'Failed to change password', 'error');
    }
}

// Upload Profile Picture
async function uploadProfilePicture(file) {
    // Validate file
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'warning');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('File size must not exceed 5MB', 'warning');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE_URL}/profile/upload-picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Profile picture uploaded successfully!', 'success');
            
            // Update preview
            const img = document.getElementById('profilePicturePreview');
            const placeholder = document.querySelector('.profile-picture-placeholder');
            img.src = data.profilePicture + '?t=' + new Date().getTime(); // Cache bust
            img.classList.add('active');
            placeholder.classList.add('hidden');
            document.getElementById('deletePictureBtn').style.display = 'block';
        } else {
            showToast(data.message || 'Failed to upload picture', 'error');
        }
    } catch (error) {
        showToast('Failed to upload picture', 'error');
    }
}

// Delete Profile Picture
async function deleteProfilePicture() {
    try {
        const response = await apiRequest('/profile/delete-picture', {
            method: 'DELETE'
        });
        
        if (response.success) {
            showToast('Profile picture removed successfully!', 'success');
            
            // Reset preview
            const img = document.getElementById('profilePicturePreview');
            const placeholder = document.querySelector('.profile-picture-placeholder');
            img.classList.remove('active');
            placeholder.classList.remove('hidden');
            document.getElementById('deletePictureBtn').style.display = 'none';
            document.getElementById('profilePictureInput').value = '';
        } else {
            showToast(response.message || 'Failed to remove picture', 'error');
        }
    } catch (error) {
        showToast('Failed to remove picture', 'error');
    }
}
