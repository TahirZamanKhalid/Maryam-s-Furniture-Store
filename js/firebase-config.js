// Firebase Configuration and Initialization
// Maryam's Furniture Shop - Real-time Database Management

const firebaseConfig = {
    apiKey: "AIzaSyCNwRyfXqXGasKTqQrOCp55eOcQYOShw8Y",
    authDomain: "furniture-shop-aa5fb.firebaseapp.com",
    projectId: "furniture-shop-aa5fb",
    storageBucket: "furniture-shop-aa5fb.firebasestorage.app",
    messagingSenderId: "170329602819",
    appId: "1:170329602819:web:88d988c797348715b84736",
    databaseURL: "https://furniture-shop-aa5fb-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to services
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Global state management
const appState = {
    user: null,
    isAdmin: false,
    cart: [],
    wishlist: [],
    categories: {},
    products: {},
    deals: {},
    orders: {}
};

// Database structure initialization
function initializeDatabaseStructure() {
    const dbRefs = {
        categories: database.ref('categories'),
        products: database.ref('products'),
        deals: database.ref('deals'),
        users: database.ref('users'),
        orders: database.ref('orders'),
        settings: database.ref('settings')
    };

    // Check and initialize categories
    dbRefs.categories.once('value', snapshot => {
        if (!snapshot.exists()) {
            const defaultCategories = {
                'cat_1': {
                    id: 'cat_1',
                    name: 'Sofas & Couches',
                    icon: '🛋️',
                    slug: 'sofas-couches',
                    productCount: 0,
                    createdAt: Date.now(),
                    status: 'active'
                },
                'cat_2': {
                    id: 'cat_2',
                    name: 'Beds',
                    icon: '🛏️',
                    slug: 'beds',
                    productCount: 0,
                    createdAt: Date.now(),
                    status: 'active'
                },
                'cat_3': {
                    id: 'cat_3',
                    name: 'Tables',
                    icon: '🪑',
                    slug: 'tables',
                    productCount: 0,
                    createdAt: Date.now(),
                    status: 'active'
                },
                'cat_4': {
                    id: 'cat_4',
                    name: 'Chairs',
                    icon: '💺',
                    slug: 'chairs',
                    productCount: 0,
                    createdAt: Date.now(),
                    status: 'active'
                },
                'cat_5': {
                    id: 'cat_5',
                    name: 'Storage',
                    icon: '🗄️',
                    slug: 'storage',
                    productCount: 0,
                    createdAt: Date.now(),
                    status: 'active'
                },
                'cat_6': {
                    id: 'cat_6',
                    name: 'Office Furniture',
                    icon: '💼',
                    slug: 'office',
                    productCount: 0,
                    createdAt: Date.now(),
                    status: 'active'
                }
            };
            dbRefs.categories.set(defaultCategories);
            console.log('✅ Default categories initialized');
        }
    });

    // Check and initialize products
    dbRefs.products.once('value', snapshot => {
        if (!snapshot.exists()) {
            const defaultProducts = {
                'prod_1': {
                    id: 'prod_1',
                    name: 'Luxury L-Shape Sofa',
                    description: 'Premium quality L-shaped sofa with soft cushioning and modern design',
                    price: 85000,
                    originalPrice: 95000,
                    category: 'cat_1',
                    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'],
                    stock: 10,
                    featured: true,
                    rating: 4.5,
                    reviews: 23,
                    createdAt: Date.now(),
                    status: 'active'
                },
                'prod_2': {
                    id: 'prod_2',
                    name: 'King Size Bed',
                    description: 'Spacious king size bed with storage and premium mattress',
                    price: 65000,
                    originalPrice: 75000,
                    category: 'cat_2',
                    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500'],
                    stock: 5,
                    featured: true,
                    rating: 4.8,
                    reviews: 15,
                    createdAt: Date.now(),
                    status: 'active'
                },
                'prod_3': {
                    id: 'prod_3',
                    name: 'Executive Office Desk',
                    description: 'Modern executive desk with built-in cable management',
                    price: 45000,
                    originalPrice: 50000,
                    category: 'cat_6',
                    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500'],
                    stock: 8,
                    featured: false,
                    rating: 4.3,
                    reviews: 12,
                    createdAt: Date.now(),
                    status: 'active'
                }
            };
            dbRefs.products.set(defaultProducts);
            console.log('✅ Default products initialized');
        }
    });

    // Initialize settings
    dbRefs.settings.once('value', snapshot => {
        if (!snapshot.exists()) {
            const defaultSettings = {
                storeName: "Maryam's Furniture Shop",
                currency: 'PKR',
                deliveryFee: 500,
                freeDeliveryThreshold: 50000,
                taxRate: 0,
                maintenanceMode: false,
                socialLinks: {
                    facebook: 'https://facebook.com/maryamsfurniture',
                    instagram: 'https://instagram.com/maryamsfurniture',
                    twitter: 'https://twitter.com/maryamsfurniture'
                }
            };
            dbRefs.settings.set(defaultSettings);
            console.log('✅ Default settings initialized');
        }
    });
}

// Authentication state observer
let authStateInitialized = false;
auth.onAuthStateChanged(async (user) => {
    if (user) {
        appState.user = user;
        
        // Get user profile
        const userRef = database.ref(`users/${user.uid}`);
        const snapshot = await userRef.once('value');
        let userData = snapshot.val();
        
        if (userData) {
            appState.isAdmin = userData.role === 'admin';
            // Update last login
            await userRef.update({ lastLogin: Date.now() });
        } else {
            // Create user profile if doesn't exist (shouldn't happen after signup, but just in case)
            userData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email.split('@')[0],
                role: 'customer',
                createdAt: Date.now(),
                lastLogin: Date.now(),
                cart: {},
                wishlist: {},
                orders: {}
            };
            await userRef.set(userData);
            appState.isAdmin = false;
        }
        
        // Update UI - make sure this runs on index.html
        if (typeof updateUserInterface === 'function') {
            updateUserInterface(userData);
        }
        
        // Load user's cart and wishlist
        if (typeof loadUserCart === 'function') {
            loadUserCart(user.uid);
        }
        if (typeof loadUserWishlist === 'function') {
            loadUserWishlist(user.uid);
        }
        
        console.log('✅ User logged in:', user.email);
        authStateInitialized = true;
    } else {
        appState.user = null;
        appState.isAdmin = false;
        
        // Update UI - make sure this runs on index.html
        if (typeof updateUserInterface === 'function') {
            updateUserInterface(null);
        }
        
        console.log('👋 User logged out');
        authStateInitialized = true;
    }
});

// Update user interface based on auth state
function updateUserInterface(userData) {
    // Only update UI if we're on a page that has these elements (index.html, cart.html)
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const cartBtn = document.getElementById('cartBtn');
    const adminBtn = document.getElementById('adminBtn');
    
    if (userData) {
        // User is logged in - hide login/signup, show user menu and cart
        console.log('Updating UI for logged in user:', userData.name || userData.email);
        
        if (loginBtn) {
            loginBtn.style.display = 'none';
            loginBtn.style.visibility = 'hidden';
        }
        if (signupBtn) {
            signupBtn.style.display = 'none';
            signupBtn.style.visibility = 'hidden';
        }
        if (userMenu) {
            userMenu.style.display = 'flex';
            userMenu.style.visibility = 'visible';
            userMenu.style.opacity = '1';
        }
        if (userName) {
            userName.textContent = userData.name || userData.email.split('@')[0];
        }
        if (cartBtn) {
            cartBtn.style.display = 'flex';
            cartBtn.style.visibility = 'visible';
        }
        
        // Admin button should not be visible on main page - admin accesses via Ctrl+Space
        if (adminBtn) {
            adminBtn.style.display = 'none';
            adminBtn.style.visibility = 'hidden';
        }
    } else {
        // User is not logged in - show login/signup, hide user menu and cart
        console.log('Updating UI for logged out user');
        
        if (loginBtn) {
            loginBtn.style.display = 'flex';
            loginBtn.style.visibility = 'visible';
            loginBtn.style.opacity = '1';
        }
        if (signupBtn) {
            signupBtn.style.display = 'flex';
            signupBtn.style.visibility = 'visible';
            signupBtn.style.opacity = '1';
        }
        if (userMenu) {
            userMenu.style.display = 'none';
            userMenu.style.visibility = 'hidden';
            userMenu.style.opacity = '0';
        }
        if (cartBtn) {
            cartBtn.style.display = 'none';
            cartBtn.style.visibility = 'hidden';
        }
        if (adminBtn) {
            adminBtn.style.display = 'none';
            adminBtn.style.visibility = 'hidden';
        }
    }
}

// Load user's cart
function loadUserCart(userId) {
    const cartRef = database.ref(`users/${userId}/cart`);
    cartRef.on('value', snapshot => {
        const cartData = snapshot.val();
        if (cartData) {
            appState.cart = Object.values(cartData);
        } else {
            appState.cart = []; // Clear cart if empty
        }
        updateCartCount();
    });
}

// Load user's wishlist
function loadUserWishlist(userId) {
    const wishlistRef = database.ref(`users/${userId}/wishlist`);
    wishlistRef.on('value', snapshot => {
        const wishlistData = snapshot.val();
        if (wishlistData) {
            appState.wishlist = Object.values(wishlistData);
        } else {
            appState.wishlist = []; // Clear wishlist if empty
        }
        updateWishlistUI();
    });
}

// Update cart count in UI
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = appState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Update wishlist UI
function updateWishlistUI() {
    // Update wishlist hearts on product cards
    document.querySelectorAll('.product-card').forEach(card => {
        const productId = card.dataset.productId;
        const wishlistBtn = card.querySelector('.btn-wishlist');
        if (wishlistBtn && appState.wishlist.some(item => item.id === productId)) {
            wishlistBtn.classList.add('active');
            wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
        }
    });
}

// Add to cart function - requires login (exported from firebase-config for use in app.js)
async function addToCartFirebase(productId) {
    if (!appState.user) {
        showToast('Please login to add items to cart', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    try {
        const product = appState.products[productId];
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }
        
        const cartRef = database.ref(`users/${appState.user.uid}/cart/${productId}`);
        const snapshot = await cartRef.once('value');
        const existingItem = snapshot.val();
        
        if (existingItem) {
            // Update quantity
            await cartRef.update({
                quantity: existingItem.quantity + 1,
                updatedAt: Date.now()
            });
            showToast('Quantity updated in cart', 'success');
        } else {
            // Add new item
            await cartRef.set({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || 'placeholder.jpg',
                description: product.description || '',
                quantity: 1,
                addedAt: Date.now()
            });
            showToast('Added to cart successfully', 'success');
        }
        
        // Update local state
        loadUserCart(appState.user.uid);
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add to cart', 'error');
    }
}

// Toggle wishlist
async function toggleWishlist(productId) {
    if (!appState.user) {
        showToast('Please login to add to wishlist', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    try {
        const wishlistRef = database.ref(`users/${appState.user.uid}/wishlist/${productId}`);
        const snapshot = await wishlistRef.once('value');
        
        if (snapshot.exists()) {
            // Remove from wishlist
            await wishlistRef.remove();
            showToast('Removed from wishlist', 'info');
        } else {
            // Add to wishlist
            const product = appState.products[productId];
            await wishlistRef.set({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.images[0],
                addedAt: Date.now()
            });
            showToast('Added to wishlist', 'success');
        }
        
        // Update local state
        loadUserWishlist(appState.user.uid);
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        showToast('Failed to update wishlist', 'error');
    }
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }).catch(error => {
        console.error('Logout error:', error);
        showToast('Failed to logout', 'error');
    });
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.className = `toast show ${type}`;
        toast.textContent = message;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize database on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDatabaseStructure();
    
    // Wait for auth state to be determined
    // The onAuthStateChanged handler will update the UI
    // But if we're on index.html and no user, show login/signup buttons
    setTimeout(() => {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
            // Check if auth state has been initialized
            if (authStateInitialized) {
                // UI should already be updated, but ensure it's correct
                if (!appState.user && typeof updateUserInterface === 'function') {
                    updateUserInterface(null);
                }
            } else {
                // Auth not ready yet, show default (logged out) state
                if (typeof updateUserInterface === 'function') {
                    updateUserInterface(null);
                }
            }
        }
    }, 500);
});

// Export functions for global use
window.auth = auth;
window.database = database;
window.storage = storage;
window.appState = appState;
window.addToCart = addToCartFirebase;
window.addToCartFirebase = addToCartFirebase;
window.toggleWishlist = toggleWishlist;
window.logout = logout;
window.showToast = showToast;
window.updateUserInterface = updateUserInterface;