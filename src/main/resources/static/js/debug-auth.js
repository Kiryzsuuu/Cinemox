// Debug Authentication Helper
function debugAuth() {
    console.log('=== AUTH DEBUG INFO ===');
    console.log('Token:', getToken());
    console.log('User Info:', getUserInfo());
    console.log('Is Logged In:', isLoggedIn());
    console.log('Is Admin:', isAdmin());
    
    const token = getToken();
    if (token) {
        try {
            // Decode JWT (without verification)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            console.log('JWT Payload:', payload);
            console.log('JWT Roles:', payload.roles);
            console.log('JWT Expiry:', new Date(payload.exp * 1000));
        } catch (e) {
            console.error('Failed to decode JWT:', e);
        }
    }
    console.log('======================');
}

// Auto-run on console
if (typeof window !== 'undefined') {
    window.debugAuth = debugAuth;
    console.log('Run debugAuth() to see authentication details');
}
