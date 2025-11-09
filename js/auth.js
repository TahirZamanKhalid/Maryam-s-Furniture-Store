// User Authentication JavaScript - Clean Rewrite
// Elite Furniture Gallery Shop - Regular User Login/Signup ONLY

let isDarkTheme = localStorage.getItem('theme') === 'dark';
let isAuthenticating = false; // Flag to prevent auth state checks during login/signup

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth page loaded');

    // Apply saved theme
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        updateThemeIcon();
    }

    // Check URL parameters for tab
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'signup') {
        switchTab('signup');
    }

    // Only check for existing session ONCE on page load
    checkExistingUserSession();

    // Add password validation
    setupPasswordValidation();
});

// Check if user is already logged in (only on initial page load)
function checkExistingUserSession() {
    // Wait for Firebase to initialize
    setTimeout(() => {
        const currentUser = auth.currentUser;

        // If there's a current user, check their role
        if (currentUser) {
            const userRef = database.ref(`users/${currentUser.uid}`);
            userRef.once('value').then((snapshot) => {
                const userData = snapshot.val();

                if (userData && userData.role === 'admin') {
                    // Admin user - redirect to admin panel
                    console.log('Admin already logged in, redirecting...');
                    showToast('Admin already logged in! Redirecting to admin panel...', 'info');
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1500);
                } else if (userData) {
                    // Regular user already logged in - redirect to home
                    console.log('User already logged in, redirecting...');
                    showToast('You are already logged in! Redirecting...', 'info');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }
            }).catch((error) => {
                console.error('Error checking user session:', error);
            });
        }
    }, 500);
}

// Switch between login and signup tabs
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('loginTab').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('signupTab').classList.add('active');
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();

    // Prevent auth state checks during login
    isAuthenticating = true;

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Show loading state
    const submitBtn = event.target.querySelector('.btn-submit');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;

    try {
        console.log('Starting login process...');

        // Set persistence based on remember me
        const persistence = rememberMe ?
            firebase.auth.Auth.Persistence.LOCAL :
            firebase.auth.Auth.Persistence.SESSION;

        await auth.setPersistence(persistence);

        // Sign in with email and password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('User authenticated:', user.uid);

        // Get user data from database
        const userRef = database.ref(`users/${user.uid}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();

        if (!userData) {
            throw new Error('User data not found in database');
        }

        // Update last login
        await userRef.update({
            lastLogin: Date.now()
        });

        console.log('User role:', userData.role);

        if (userData.role === 'admin') {
            // Admin should not login here - redirect to admin login
            showToast('Please use Ctrl+Space to access admin login', 'warning');
            await auth.signOut();
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
            isAuthenticating = false;
            return;
        }

        // Regular user login successful
        showToast('Login successful! Welcome back!', 'success');

        // Small delay then redirect
        setTimeout(() => {
            console.log('Redirecting to home page...');
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        isAuthenticating = false;

        // Show appropriate error message
        let errorMessage = 'Login failed. Please try again.';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address format.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'Invalid email or password.';
                break;
        }

        showToast(errorMessage, 'error');

        // Reset button
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();

    // Prevent auth state checks during signup
    isAuthenticating = true;

    const name = document.getElementById('signupName').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const address = document.getElementById('signupAddress').value.trim();

    // Validate passwords match
    if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        document.getElementById('passwordMatchError').textContent = 'Passwords do not match';
        isAuthenticating = false;
        return;
    }

    // Show loading state
    const submitBtn = event.target.querySelector('.btn-submit');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;

    try {
        console.log('Starting signup process...');

        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('User account created:', user.uid);

        // Update display name
        await user.updateProfile({
            displayName: name
        });

        // Send email verification
        await user.sendEmailVerification();

        // Save user data to database
        const userData = {
            uid: user.uid,
            name: name,
            email: email,
            phone: phone,
            address: address,
            role: 'customer',
            createdAt: Date.now(),
            lastLogin: Date.now(),
            emailVerified: false,
            cart: {},
            wishlist: {},
            orders: {}
        };

        await database.ref(`users/${user.uid}`).set(userData);

        console.log('User data saved to database');

        showToast('Account created successfully! Redirecting...', 'success');

        // User is already logged in after signup (Firebase auto-login)
        // Redirect to home page after a short delay
        setTimeout(() => {
            console.log('Redirecting to home page...');
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('Signup error:', error);
        isAuthenticating = false;

        // Show appropriate error message
        let errorMessage = 'Signup failed. Please try again.';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'An account with this email already exists.';
                document.getElementById('emailError').textContent = errorMessage;
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address format.';
                document.getElementById('emailError').textContent = errorMessage;
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak. Please use at least 6 characters.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password accounts are not enabled.';
                break;
        }

        showToast(errorMessage, 'error');

        // Reset button
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Login with Google
async function loginWithGoogle() {
    isAuthenticating = true;

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        console.log('Google login successful:', user.uid);

        // Check if user exists in database
        const userRef = database.ref(`users/${user.uid}`);
        const snapshot = await userRef.once('value');

        if (!snapshot.exists()) {
            // Create user profile
            await userRef.set({
                uid: user.uid,
                name: user.displayName || 'Google User',
                email: user.email,
                phone: user.phoneNumber || '',
                photoURL: user.photoURL,
                role: 'customer',
                createdAt: Date.now(),
                lastLogin: Date.now(),
                emailVerified: true,
                provider: 'google',
                cart: {},
                wishlist: {},
                orders: {}
            });
        } else {
            // Update last login
            await userRef.update({
                lastLogin: Date.now()
            });
        }

        showToast('Login successful! Redirecting...', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Google login error:', error);
        isAuthenticating = false;

        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Login cancelled', 'info');
        } else {
            showToast('Google login failed. Please try again.', 'error');
        }
    }
}

// Sign up with Google
async function signupWithGoogle() {
    // Same as login with Google
    loginWithGoogle();
}

// Login with Facebook
async function loginWithFacebook() {
    isAuthenticating = true;

    try {
        const provider = new firebase.auth.FacebookAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        console.log('Facebook login successful:', user.uid);

        // Check if user exists in database
        const userRef = database.ref(`users/${user.uid}`);
        const snapshot = await userRef.once('value');

        if (!snapshot.exists()) {
            // Create user profile
            await userRef.set({
                uid: user.uid,
                name: user.displayName || 'Facebook User',
                email: user.email,
                phone: user.phoneNumber || '',
                photoURL: user.photoURL,
                role: 'customer',
                createdAt: Date.now(),
                lastLogin: Date.now(),
                emailVerified: true,
                provider: 'facebook',
                cart: {},
                wishlist: {},
                orders: {}
            });
        } else {
            // Update last login
            await userRef.update({
                lastLogin: Date.now()
            });
        }

        showToast('Login successful! Redirecting...', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Facebook login error:', error);
        isAuthenticating = false;

        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Login cancelled', 'info');
        } else {
            showToast('Facebook login failed. Please try again.', 'error');
        }
    }
}

// Sign up with Facebook
async function signupWithFacebook() {
    // Same as login with Facebook
    loginWithFacebook();
}

// Show forgot password modal
function showForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.classList.add('active');
}

// Close forgot password modal
function closeForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.classList.remove('active');
}

// Handle forgot password
async function handleForgotPassword(event) {
    event.preventDefault();

    const email = document.getElementById('resetEmail').value.trim();

    // Show loading state
    const submitBtn = event.target.querySelector('.btn-submit');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    try {
        await auth.sendPasswordResetEmail(email);

        showToast('Password reset email sent! Please check your inbox.', 'success');

        // Close modal and reset form
        closeForgotPassword();
        event.target.reset();

    } catch (error) {
        console.error('Password reset error:', error);

        let errorMessage = 'Failed to send reset email.';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address format.';
                break;
        }

        showToast(errorMessage, 'error');
    } finally {
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

// Setup password validation
function setupPasswordValidation() {
    const signupPassword = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('signupConfirmPassword');

    if (confirmPassword) {
        confirmPassword.addEventListener('input', () => {
            const errorElement = document.getElementById('passwordMatchError');

            if (confirmPassword.value && signupPassword.value !== confirmPassword.value) {
                errorElement.textContent = 'Passwords do not match';
                confirmPassword.style.borderColor = 'var(--error-color)';
            } else {
                errorElement.textContent = '';
                confirmPassword.style.borderColor = '';
            }
        });
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
window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.loginWithGoogle = loginWithGoogle;
window.signupWithGoogle = signupWithGoogle;
window.loginWithFacebook = loginWithFacebook;
window.signupWithFacebook = signupWithFacebook;
window.showForgotPassword = showForgotPassword;
window.closeForgotPassword = closeForgotPassword;
window.handleForgotPassword = handleForgotPassword;
window.togglePassword = togglePassword;
window.toggleTheme = toggleTheme;
