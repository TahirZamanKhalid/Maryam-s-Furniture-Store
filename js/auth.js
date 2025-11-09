// Authentication JavaScript - Fixed Version
// Maryam's Furniture Shop

let isDarkTheme = localStorage.getItem('theme') === 'dark';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Check if this is an admin login attempt
    const adminLoginRequired = sessionStorage.getItem('adminLoginRequired');
    
    // Only check for existing login if NOT coming from admin redirect
    if (!adminLoginRequired && window.location.pathname.includes('login.html')) {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Wait a bit to ensure this isn't a fresh login
                setTimeout(async () => {
                    // Check if user just authenticated
                    if (sessionStorage.getItem('justAuthenticated')) {
                        return;
                    }
                    
                    // Check user role
                    const userRef = database.ref(`users/${user.uid}`);
                    const snapshot = await userRef.once('value');
                    const userData = snapshot.val();
                    
                    if (userData && userData.role === 'admin') {
                        // Admin user - redirect to admin panel
                        showToast('Admin already logged in! Redirecting...', 'info');
                        setTimeout(() => {
                            window.location.href = 'admin.html';
                        }, 1000);
                    } else {
                        // Regular user - redirect to home
                        showToast('You are already logged in! Redirecting...', 'info');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1000);
                    }
                }, 500);
            }
        });
    }
    
    // Add password validation
    setupPasswordValidation();
});

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
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Show loading state
    const submitBtn = event.target.querySelector('.btn-submit');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
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
        
        // Update last login in database
        await userRef.update({
            lastLogin: Date.now()
        });
        
        // Set flag to prevent redirect loop
        sessionStorage.setItem('justAuthenticated', 'true');
        
        // Clear admin login required flag
        sessionStorage.removeItem('adminLoginRequired');
        
        if (userData && userData.role === 'admin') {
            // Admin user - redirect to admin panel
            showToast('Admin login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            // Regular user - redirect to home
            showToast('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                const redirectTo = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
                sessionStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectTo;
            }, 1000);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
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
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('.btn-submit');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;
    
    try {
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
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
        
        showToast('Account created successfully! Redirecting...', 'success');
        
        // Set flag to prevent redirect loop
        sessionStorage.setItem('justAuthenticated', 'true');
        
        // User is already logged in after signup (Firebase auto-login)
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Signup error:', error);
        
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
                errorMessage = 'Password is too weak. Please use a stronger password.';
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
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
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
        
        // Set flag to prevent redirect loop
        sessionStorage.setItem('justAuthenticated', 'true');
        
        setTimeout(() => {
            const redirectTo = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectTo;
        }, 1500);
        
    } catch (error) {
        console.error('Google login error:', error);
        showToast('Google login failed. Please try again.', 'error');
    }
}

// Sign up with Google
async function signupWithGoogle() {
    // Same as login with Google
    loginWithGoogle();
}

// Login with Facebook
async function loginWithFacebook() {
    try {
        const provider = new firebase.auth.FacebookAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
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
        
        // Set flag to prevent redirect loop
        sessionStorage.setItem('justAuthenticated', 'true');
        
        setTimeout(() => {
            const redirectTo = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectTo;
        }, 1500);
        
    } catch (error) {
        console.error('Facebook login error:', error);
        showToast('Facebook login failed. Please try again.', 'error');
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