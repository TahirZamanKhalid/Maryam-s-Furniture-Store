// Admin Authentication JavaScript
// Elite Furniture Gallery Shop - Admin Login Only

let isDarkTheme = localStorage.getItem('theme') === 'dark';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        updateThemeIcon();
    }

    // Check if admin is already logged in
    checkExistingAdminSession();
});

// Check if admin is already logged in and verified
function checkExistingAdminSession() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                // Check if user is admin
                const userRef = database.ref(`users/${user.uid}`);
                const snapshot = await userRef.once('value');
                const userData = snapshot.val();

                if (userData && userData.role === 'admin') {
                    // Already logged in as admin, redirect to admin panel
                    showToast('Already logged in! Redirecting to admin panel...', 'info');
                    setTimeout(() => {
                        // Set flag to indicate coming from admin login
                        sessionStorage.setItem('adminAuthenticated', 'true');
                        window.location.href = 'admin.html';
                    }, 1000);
                } else {
                    // Not an admin, sign out
                    await auth.signOut();
                }
            } catch (error) {
                console.error('Session check error:', error);
            }
        }
    });
}

// Handle admin login
async function handleAdminLogin(event) {
    event.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Show loading state
    const submitBtn = event.target.querySelector('.btn-submit');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying Admin Access...';
    submitBtn.disabled = true;

    try {
        // Set persistence based on remember me
        const persistence = rememberMe ?
            firebase.auth.Auth.Persistence.LOCAL :
            firebase.auth.Auth.Persistence.SESSION;

        await auth.setPersistence(persistence);

        // Sign in with email and password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Get user data from database
        const userRef = database.ref(`users/${user.uid}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();

        // Check if user is admin
        if (!userData) {
            throw new Error('USER_DATA_NOT_FOUND');
        }

        if (userData.role !== 'admin') {
            throw new Error('NOT_ADMIN');
        }

        // Admin verified! Update last login
        await userRef.update({
            lastLogin: Date.now()
        });

        // Set session flag to indicate successful admin authentication
        sessionStorage.setItem('adminAuthenticated', 'true');

        showToast('Admin login successful! Redirecting...', 'success');

        // Redirect to admin panel
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);

    } catch (error) {
        console.error('Admin login error:', error);

        // Sign out if authentication succeeded but authorization failed
        if (error.message === 'NOT_ADMIN' || error.message === 'USER_DATA_NOT_FOUND') {
            await auth.signOut();
        }

        // Show appropriate error message
        let errorMessage = 'Admin login failed. Please try again.';

        if (error.message === 'USER_DATA_NOT_FOUND') {
            errorMessage = 'User account not found in database. Please contact system administrator.';
        } else if (error.message === 'NOT_ADMIN') {
            errorMessage = 'Access Denied: Admin privileges required. Please use the regular login page.';
        } else {
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No admin account found with this email address.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This admin account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection.';
                    break;
            }
        }

        showToast(errorMessage, 'error');

        // Reset button
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Theme toggle
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    updateThemeIcon();
}

// Update theme icon
function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Export functions
window.handleAdminLogin = handleAdminLogin;
window.togglePassword = togglePassword;
window.toggleTheme = toggleTheme;
