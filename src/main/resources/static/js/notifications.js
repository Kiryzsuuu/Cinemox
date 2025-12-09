// Custom notification system
class NotificationManager {
    constructor() {
        this.createContainer();
    }

    createContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} notification-enter`;
        
        const icon = this.getIcon(type);
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <p>${message}</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        const container = document.getElementById('notification-container');
        container.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('notification-show'), 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => this.hide(notification), duration);
        }

        return notification;
    }

    hide(notification) {
        notification.classList.remove('notification-show');
        notification.classList.add('notification-exit');
        setTimeout(() => notification.remove(), 300);
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Custom modal system
class ModalManager {
    show(options) {
        const {
            title = '',
            message = '',
            type = 'info',
            confirmText = 'OK',
            cancelText = 'Cancel',
            showCancel = false,
            onConfirm = null,
            onCancel = null
        } = options;

        // Remove existing modal
        this.hide();

        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="custom-modal-overlay"></div>
            <div class="custom-modal-content custom-modal-${type}">
                <div class="custom-modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="custom-modal-body">
                    <p>${message}</p>
                </div>
                <div class="custom-modal-footer">
                    ${showCancel ? `<button class="btn-secondary" data-action="cancel">${cancelText}</button>` : ''}
                    <button class="btn-primary" data-action="confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Trigger animation
        setTimeout(() => modal.classList.add('custom-modal-show'), 10);

        // Event listeners
        modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            this.hide();
        });

        if (showCancel) {
            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                if (onCancel) onCancel();
                this.hide();
            });
        }

        modal.querySelector('.custom-modal-overlay').addEventListener('click', () => {
            if (onCancel) onCancel();
            this.hide();
        });

        return modal;
    }

    hide() {
        const existingModal = document.querySelector('.custom-modal');
        if (existingModal) {
            existingModal.classList.remove('custom-modal-show');
            setTimeout(() => existingModal.remove(), 300);
        }
    }

    confirm(options) {
        return new Promise((resolve) => {
            this.show({
                ...options,
                showCancel: true,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }

    alert(message, title = 'Notice') {
        return this.show({
            title,
            message,
            showCancel: false
        });
    }
}

// Loading spinner
class LoadingManager {
    show(message = 'Loading...') {
        this.hide(); // Remove existing

        const loading = document.createElement('div');
        loading.id = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;

        document.body.appendChild(loading);
        setTimeout(() => loading.classList.add('loading-show'), 10);
    }

    hide() {
        const loading = document.getElementById('loading-overlay');
        if (loading) {
            loading.classList.remove('loading-show');
            setTimeout(() => loading.remove(), 300);
        }
    }
}

// Global instances
const notify = new NotificationManager();
const modal = new ModalManager();
const loading = new LoadingManager();

// Backward compatibility with alert
window.showNotification = (message, type = 'info') => notify.show(message, type);
window.showModal = (options) => modal.show(options);
window.showLoading = (message) => loading.show(message);
window.hideLoading = () => loading.hide();
