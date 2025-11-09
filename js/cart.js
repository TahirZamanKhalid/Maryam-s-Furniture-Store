// Cart Management
let cart = [];
let currentTheme = localStorage.getItem('theme') || 'light';
let promoDiscount = 0;
const DELIVERY_FEE = 500;

// Promo codes
const promoCodes = {
    'SAVE10': { discount: 10, type: 'percentage' },
    'SAVE500': { discount: 500, type: 'fixed' },
    'WELCOME20': { discount: 20, type: 'percentage' },
    'FIRSTORDER': { discount: 1000, type: 'fixed' }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Apply saved theme
    applyTheme(currentTheme);
    
    // Check if user is logged in
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                // User not logged in - redirect to login
                const toast = document.getElementById('toast');
                if (toast) {
                    toast.className = 'toast show warning';
                    toast.textContent = 'Please login to view your cart';
                } else {
                    alert('Please login to view your cart');
                }
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
                return;
            }
            
            // Load cart from Firebase
            loadCartFromFirebase(user.uid);
        });
    } else {
        // Fallback to localStorage if Firebase not loaded
        loadCart();
        displayCart();
        updateCartCount();
    }
});

// Load cart from Firebase
async function loadCartFromFirebase(userId) {
    if (typeof database === 'undefined') {
        loadCart(); // Fallback to localStorage
        return;
    }
    
    try {
        const cartRef = database.ref(`users/${userId}/cart`);
        cartRef.on('value', (snapshot) => {
            const cartData = snapshot.val();
            if (cartData) {
                cart = Object.values(cartData);
            } else {
                cart = [];
            }
            displayCart();
            updateCartCount();
        });
    } catch (error) {
        console.error('Error loading cart from Firebase:', error);
        loadCart(); // Fallback to localStorage
    }
}

// Load cart from localStorage (fallback)
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Save cart to Firebase
async function saveCartToFirebase(userId) {
    if (typeof database === 'undefined') {
        saveCart(); // Fallback to localStorage
        return;
    }
    
    try {
        const cartRef = database.ref(`users/${userId}/cart`);
        const cartObj = {};
        cart.forEach(item => {
            cartObj[item.id] = item;
        });
        await cartRef.set(cartObj);
        updateCartCount();
    } catch (error) {
        console.error('Error saving cart to Firebase:', error);
        saveCart(); // Fallback to localStorage
    }
}

// Save cart to localStorage (fallback)
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Display cart items
function displayCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');

    if (!cartItemsContainer || !emptyCart) return;

    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContent) cartContent.style.display = 'block';

    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
            <img src="${item.image}"
                 alt="${item.name}"
                 class="cart-item-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect width=%22120%22 height=%22120%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23666%22%3E${item.name}%3C/text%3E%3C/svg%3E'">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-description">${item.description}</p>
                <div>
                    <span class="cart-item-price">Rs. ${item.price.toLocaleString()}</span>
                    ${item.originalPrice ? `<span class="cart-item-original-price">Rs. ${item.originalPrice.toLocaleString()}</span>` : ''}
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="decreaseQuantity(${index})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="increaseQuantity(${index})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-btn" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');

    updateCartSummary();
}

// Increase quantity
async function increaseQuantity(index) {
    cart[index].quantity += 1;
    await saveCartItem(cart[index]);
    displayCart();
    showNotification('Quantity updated', 'success');
}

// Decrease quantity
async function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        await saveCartItem(cart[index]);
        displayCart();
        showNotification('Quantity updated', 'success');
    } else {
        removeItem(index);
    }
}

// Remove item from cart
async function removeItem(index) {
    const item = cart[index];
    const itemName = item.name;
    const itemId = item.id;
    
    // Remove from Firebase
    if (typeof auth !== 'undefined' && auth.currentUser) {
        try {
            const cartRef = database.ref(`users/${auth.currentUser.uid}/cart/${itemId}`);
            await cartRef.remove();
        } catch (error) {
            console.error('Error removing item from Firebase:', error);
        }
    }
    
    cart.splice(index, 1);
    await saveCartToFirebaseOrLocal();
    displayCart();
    showNotification(`${itemName} removed from cart`, 'info');
}

// Save cart item to Firebase
async function saveCartItem(item) {
    if (typeof auth !== 'undefined' && auth.currentUser && typeof database !== 'undefined') {
        try {
            const cartRef = database.ref(`users/${auth.currentUser.uid}/cart/${item.id}`);
            await cartRef.set(item);
        } catch (error) {
            console.error('Error saving cart item to Firebase:', error);
            saveCart(); // Fallback
        }
    } else {
        saveCart(); // Fallback to localStorage
    }
}

// Save cart to Firebase or localStorage
async function saveCartToFirebaseOrLocal() {
    if (typeof auth !== 'undefined' && auth.currentUser) {
        await saveCartToFirebase(auth.currentUser.uid);
    } else {
        saveCart();
    }
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;

    let discountAmount = 0;
    if (promoDiscount > 0) {
        discountAmount = promoDiscount;
    }

    const total = subtotal + deliveryFee - discountAmount;

    document.getElementById('subtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;
    document.getElementById('deliveryFee').textContent = `Rs. ${deliveryFee.toLocaleString()}`;
    document.getElementById('discount').textContent = `- Rs. ${discountAmount.toLocaleString()}`;
    document.getElementById('total').textContent = `Rs. ${total.toLocaleString()}`;

    // Show/hide discount row
    const discountRow = document.getElementById('discountRow');
    if (discountRow) {
        if (discountAmount > 0) {
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
    }
}

// Apply promo code
function applyPromoCode() {
    const promoInput = document.getElementById('promoInput');
    const code = promoInput.value.trim().toUpperCase();

    if (!code) {
        showNotification('Please enter a promo code', 'warning');
        return;
    }

    if (cart.length === 0) {
        showNotification('Add items to cart first', 'warning');
        return;
    }

    const promo = promoCodes[code];
    if (!promo) {
        showNotification('Invalid promo code', 'error');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (promo.type === 'percentage') {
        promoDiscount = Math.round(subtotal * (promo.discount / 100));
    } else {
        promoDiscount = promo.discount;
    }

    updateCartSummary();
    showNotification(`Promo code "${code}" applied! You saved Rs. ${promoDiscount.toLocaleString()}`, 'success');
    promoInput.value = '';
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = DELIVERY_FEE;
    const total = subtotal + deliveryFee - promoDiscount;

    // Save order summary
    const orderSummary = {
        items: cart,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        discount: promoDiscount,
        total: total,
        date: new Date().toISOString()
    };

    localStorage.setItem('pendingOrder', JSON.stringify(orderSummary));

    // Show confirmation
    showNotification('Redirecting to checkout...', 'success');

    // In a real app, redirect to checkout page
    setTimeout(() => {
        alert(`Order Total: Rs. ${total.toLocaleString()}\n\nIn a real implementation, you would be redirected to a payment gateway.\n\nFor now, this is a demo.`);

        // Optionally clear cart after successful checkout
        const confirmClear = confirm('Clear cart after checkout?');
        if (confirmClear) {
            cart = [];
            promoDiscount = 0;
            saveCart();
            displayCart();
            showNotification('Thank you for your order!', 'success');
        }
    }, 1000);
}

// Theme toggle
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
    showNotification(`${currentTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'success');
}

function applyTheme(theme) {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');

    if (theme === 'dark') {
        body.classList.add('dark-theme');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    } else {
        body.classList.remove('dark-theme');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
}

// Show notification - use showToast if available, otherwise use custom notification
function showNotification(message, type = 'info') {
    // Try to use showToast from firebase-config if available
    if (typeof showToast === 'function') {
        showToast(message, type);
        return;
    }
    
    // Fallback to custom notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Toggle user dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Logout function - use from firebase-config if available
function logout() {
    if (typeof window.logout === 'function') {
        window.logout();
    } else if (typeof auth !== 'undefined') {
        auth.signOut().then(() => {
            showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }).catch(error => {
            console.error('Logout error:', error);
            showNotification('Failed to logout', 'error');
        });
    }
}

// Update user interface on cart page
if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged(async (user) => {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        
        if (user) {
            // Get user data
            if (typeof database !== 'undefined') {
                const userRef = database.ref(`users/${user.uid}`);
                const snapshot = await userRef.once('value');
                const userData = snapshot.val();
                
                if (loginBtn) loginBtn.style.display = 'none';
                if (userMenu) userMenu.style.display = 'flex';
                if (userName && userData) {
                    userName.textContent = userData.name || userData.email.split('@')[0];
                }
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    });
}

// Export functions
window.toggleUserDropdown = toggleUserDropdown;
window.logout = logout;

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
