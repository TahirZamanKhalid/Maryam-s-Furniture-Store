// Profile Page JavaScript
// Elite Furniture Gallery Shop

let isDarkTheme = localStorage.getItem('theme') === 'dark';
let currentUser = null;
let userData = null;

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile page loaded');

    // Apply theme
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        updateThemeIcon();
    }

    // Check authentication
    checkAuth();

    // Setup password match validation
    setupPasswordValidation();
});

// Check if user is authenticated
function checkAuth() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            showToast('Please login to view your profile', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        currentUser = user;
        await loadUserProfile(user.uid);
        updateCartCount();
    });
}

// Load user profile data
async function loadUserProfile(userId) {
    try {
        const userRef = database.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
        userData = snapshot.val();

        if (userData) {
            // Populate form fields
            document.getElementById('profileName').value = userData.name || '';
            document.getElementById('profileEmail').value = userData.email || '';
            document.getElementById('profilePhone').value = userData.phone || '';
            document.getElementById('profileAddress').value = userData.address || '';

            // Populate account info
            const memberSince = new Date(userData.createdAt || Date.now());
            document.getElementById('memberSince').textContent = memberSince.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const lastLogin = new Date(userData.lastLogin || Date.now());
            document.getElementById('lastLogin').textContent = lastLogin.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const emailVerified = currentUser.emailVerified ?
                '<span style="color: #28a745;"><i class="fas fa-check-circle"></i> Verified</span>' :
                '<span style="color: #dc3545;"><i class="fas fa-times-circle"></i> Not Verified</span>';
            document.getElementById('emailVerified').innerHTML = emailVerified;

            // Load preferences
            if (userData.preferences) {
                document.getElementById('emailNotifications').checked = userData.preferences.emailNotifications !== false;
                document.getElementById('promotionalEmails').checked = userData.preferences.promotionalEmails || false;
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error loading profile data', 'error');
    }
}

// Update cart count
function updateCartCount() {
    if (currentUser && userData) {
        const cartRef = database.ref(`users/${currentUser.uid}/cart`);
        cartRef.on('value', snapshot => {
            const cartData = snapshot.val();
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                const totalItems = cartData ? Object.values(cartData).reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
                cartCount.textContent = totalItems;
            }
        });
    }
}

// Switch profile tabs
function switchProfileTab(tab) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}Tab`).classList.add('active');
}

// Update profile
async function updateProfile(event) {
    event.preventDefault();

    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }

    const name = document.getElementById('profileName').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const address = document.getElementById('profileAddress').value.trim();

    // Show loading
    const submitBtn = event.target.querySelector('.btn-submit');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;

    try {
        // Update Firebase user profile
        await currentUser.updateProfile({
            displayName: name
        });

        // Update database
        const userRef = database.ref(`users/${currentUser.uid}`);
        await userRef.update({
            name: name,
            phone: phone,
            address: address,
            updatedAt: Date.now()
        });

        showToast('Profile updated successfully!', 'success');
        userData.name = name;
        userData.phone = phone;
        userData.address = address;

    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Failed to update profile: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Change password
async function changePassword(event) {
    event.preventDefault();

    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        document.getElementById('passwordMatchError').textContent = 'Passwords do not match';
        return;
    }

    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    // Show loading
    const submitBtn = event.target.querySelector('.btn-submit');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    submitBtn.disabled = true;

    try {
        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );
        await currentUser.reauthenticateWithCredential(credential);

        // Update password
        await currentUser.updatePassword(newPassword);

        showToast('Password updated successfully!', 'success');

        // Clear form
        event.target.reset();

    } catch (error) {
        console.error('Error changing password:', error);

        let errorMessage = 'Failed to update password';
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Current password is incorrect';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'New password is too weak';
        } else if (error.code === 'auth/requires-recent-login') {
            errorMessage = 'Please logout and login again to change password';
        }

        showToast(errorMessage, 'error');
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Send verification email
async function sendVerificationEmail() {
    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }

    if (currentUser.emailVerified) {
        showToast('Your email is already verified', 'info');
        return;
    }

    try {
        await currentUser.sendEmailVerification();
        showToast('Verification email sent! Please check your inbox.', 'success');
    } catch (error) {
        console.error('Error sending verification email:', error);

        let errorMessage = 'Failed to send verification email';
        if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many requests. Please try again later.';
        }

        showToast(errorMessage, 'error');
    }
}

// Update preference
async function updatePreference(preference, value) {
    if (!currentUser) return;

    try {
        const userRef = database.ref(`users/${currentUser.uid}/preferences`);
        await userRef.update({
            [preference]: value
        });

        showToast('Preference updated', 'success');
    } catch (error) {
        console.error('Error updating preference:', error);
        showToast('Failed to update preference', 'error');
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

// Setup password validation
function setupPasswordValidation() {
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmNewPassword');

    if (confirmPassword) {
        confirmPassword.addEventListener('input', () => {
            const errorElement = document.getElementById('passwordMatchError');

            if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
                errorElement.textContent = 'Passwords do not match';
                confirmPassword.style.borderColor = 'var(--error-color)';
            } else {
                errorElement.textContent = '';
                confirmPassword.style.borderColor = '';
            }
        });
    }
}

// Toggle theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    updateThemeIcon();
}

// Update theme icon
function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    const themeIconPref = document.getElementById('themeIconPref');
    const themeText = document.getElementById('themeText');

    if (themeIcon) {
        themeIcon.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (themeIconPref) {
        themeIconPref.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (themeText) {
        themeText.textContent = isDarkTheme ? 'Light Mode' : 'Dark Mode';
    }
}

// Export functions
window.switchProfileTab = switchProfileTab;
window.updateProfile = updateProfile;
window.changePassword = changePassword;
window.sendVerificationEmail = sendVerificationEmail;
window.updatePreference = updatePreference;
window.togglePassword = togglePassword;
window.toggleTheme = toggleTheme;
