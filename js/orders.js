// Orders Page JavaScript
// Elite Furniture Gallery Shop

let isDarkTheme = localStorage.getItem('theme') === 'dark';
let currentUser = null;
let allOrders = [];
let currentFilter = 'all';

// Initialize orders page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Orders page loaded');

    // Apply theme
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        updateThemeIcon();
    }

    // Check authentication
    checkAuth();
});

// Check if user is authenticated
function checkAuth() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            showToast('Please login to view your orders', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        currentUser = user;
        await loadOrders(user.uid);
        updateCartCount();
    });
}

// Update cart count
function updateCartCount() {
    if (currentUser) {
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

// Load user orders
async function loadOrders(userId) {
    try {
        const ordersRef = database.ref(`users/${userId}/orders`);
        ordersRef.on('value', (snapshot) => {
            const ordersData = snapshot.val();

            if (ordersData) {
                allOrders = Object.entries(ordersData).map(([id, order]) => ({
                    id,
                    ...order
                }));

                // Sort by date (newest first)
                allOrders.sort((a, b) => (b.orderDate || 0) - (a.orderDate || 0));

                displayOrders();
            } else {
                allOrders = [];
                displayOrders();
            }
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'error');
    }
}

// Display orders
function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    const emptyOrders = document.getElementById('emptyOrders');

    // Filter orders
    let filteredOrders = allOrders;
    if (currentFilter !== 'all') {
        filteredOrders = allOrders.filter(order => order.status === currentFilter);
    }

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '';
        emptyOrders.style.display = 'block';
        return;
    }

    emptyOrders.style.display = 'none';

    ordersList.innerHTML = filteredOrders.map(order => {
        const orderDate = new Date(order.orderDate || Date.now());
        const totalItems = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-id">Order #${order.id.substring(0, 8).toUpperCase()}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 0.25rem;">
                            ${orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    <div class="order-status status-${order.status || 'pending'}">
                        ${getStatusIcon(order.status)} ${formatStatus(order.status || 'pending')}
                    </div>
                </div>

                <div class="order-info">
                    <div>
                        <strong><i class="fas fa-box"></i> Items:</strong>
                        <div>${totalItems} item${totalItems !== 1 ? 's' : ''}</div>
                    </div>
                    <div>
                        <strong><i class="fas fa-money-bill"></i> Total:</strong>
                        <div>Rs. ${order.total ? order.total.toLocaleString() : '0'}</div>
                    </div>
                    <div>
                        <strong><i class="fas fa-credit-card"></i> Payment:</strong>
                        <div>${order.paymentMethod || 'Cash on Delivery'}</div>
                    </div>
                    <div>
                        <strong><i class="fas fa-map-marker-alt"></i> Delivery:</strong>
                        <div>${order.address ? order.address.substring(0, 30) + '...' : 'N/A'}</div>
                    </div>
                </div>

                <div class="order-items">
                    <strong><i class="fas fa-list"></i> Order Items:</strong>
                    ${order.items ? order.items.slice(0, 2).map(item => `
                        <div class="order-item">
                            <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" class="order-item-image">
                            <div class="order-item-details">
                                <div style="font-weight: 600;">${item.name}</div>
                                <div style="color: #666; font-size: 0.9rem;">Quantity: ${item.quantity}</div>
                                <div style="color: var(--primary-color); font-weight: 600;">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
                            </div>
                        </div>
                    `).join('') : ''}
                    ${order.items && order.items.length > 2 ? `
                        <div style="text-align: center; padding: 0.5rem; color: #666;">
                            +${order.items.length - 2} more item${order.items.length - 2 !== 1 ? 's' : ''}
                        </div>
                    ` : ''}
                </div>

                <div class="order-actions">
                    <button class="btn-order btn-primary-order" onclick="viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${order.status === 'delivered' ? `
                        <button class="btn-order btn-primary-order" onclick="reorderItems('${order.id}')">
                            <i class="fas fa-redo"></i> Reorder
                        </button>
                    ` : ''}
                    ${order.status === 'pending' ? `
                        <button class="btn-order btn-secondary-order" onclick="cancelOrder('${order.id}')">
                            <i class="fas fa-times"></i> Cancel Order
                        </button>
                    ` : ''}
                    ${order.status === 'shipped' ? `
                        <button class="btn-order btn-primary-order" onclick="trackOrder('${order.id}')">
                            <i class="fas fa-shipping-fast"></i> Track Order
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Filter orders
function filterOrders(status) {
    currentFilter = status;

    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === status) {
            tab.classList.add('active');
        }
    });

    displayOrders();
}

// Get status icon
function getStatusIcon(status) {
    const icons = {
        'pending': '<i class="fas fa-clock"></i>',
        'processing': '<i class="fas fa-cog fa-spin"></i>',
        'shipped': '<i class="fas fa-truck"></i>',
        'delivered': '<i class="fas fa-check-circle"></i>',
        'cancelled': '<i class="fas fa-times-circle"></i>'
    };
    return icons[status] || icons['pending'];
}

// Format status
function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// View order details
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const orderDate = new Date(order.orderDate || Date.now());
    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');

    content.innerHTML = `
        <h2><i class="fas fa-receipt"></i> Order Details</h2>

        <div class="order-info" style="margin: 1.5rem 0;">
            <div>
                <strong>Order ID:</strong>
                <div>#${order.id.substring(0, 12).toUpperCase()}</div>
            </div>
            <div>
                <strong>Order Date:</strong>
                <div>${orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div>
                <strong>Status:</strong>
                <div class="order-status status-${order.status || 'pending'}">
                    ${getStatusIcon(order.status)} ${formatStatus(order.status || 'pending')}
                </div>
            </div>
            <div>
                <strong>Payment Method:</strong>
                <div>${order.paymentMethod || 'Cash on Delivery'}</div>
            </div>
        </div>

        <h3><i class="fas fa-map-marker-alt"></i> Delivery Address</h3>
        <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="margin: 0.25rem 0;"><strong>Name:</strong> ${order.customerName || 'N/A'}</p>
            <p style="margin: 0.25rem 0;"><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
            <p style="margin: 0.25rem 0;"><strong>Email:</strong> ${order.email || 'N/A'}</p>
            <p style="margin: 0.25rem 0;"><strong>Address:</strong> ${order.address || 'N/A'}</p>
            ${order.city ? `<p style="margin: 0.25rem 0;"><strong>City:</strong> ${order.city}</p>` : ''}
            ${order.postalCode ? `<p style="margin: 0.25rem 0;"><strong>Postal Code:</strong> ${order.postalCode}</p>` : ''}
        </div>

        <h3><i class="fas fa-list"></i> Order Items</h3>
        <div style="margin-bottom: 1.5rem;">
            ${order.items ? order.items.map(item => `
                <div class="order-item">
                    <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" class="order-item-image">
                    <div class="order-item-details">
                        <div style="font-weight: 600;">${item.name}</div>
                        <div style="color: #666; font-size: 0.9rem;">Quantity: ${item.quantity}</div>
                        <div style="color: var(--primary-color); font-weight: 600;">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                </div>
            `).join('') : ''}
        </div>

        <h3><i class="fas fa-calculator"></i> Order Summary</h3>
        <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                <span>Subtotal:</span>
                <span>Rs. ${order.subtotal ? order.subtotal.toLocaleString() : '0'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                <span>Delivery Fee:</span>
                <span>Rs. ${order.deliveryFee || 500}</span>
            </div>
            ${order.discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin: 0.5rem 0; color: #28a745;">
                    <span>Discount:</span>
                    <span>- Rs. ${order.discount.toLocaleString()}</span>
                </div>
            ` : ''}
            <hr style="margin: 1rem 0;">
            <div style="display: flex; justify-content: space-between; margin: 0.5rem 0; font-size: 1.25rem; font-weight: 600;">
                <span>Total:</span>
                <span>Rs. ${order.total ? order.total.toLocaleString() : '0'}</span>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Close order details modal
function closeOrderDetails() {
    const modal = document.getElementById('orderDetailsModal');
    modal.classList.remove('active');
}

// Reorder items
async function reorderItems(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order || !order.items) return;

    try {
        // Add all items back to cart
        for (const item of order.items) {
            await addToCartFirebase(item.id);
        }

        showToast(`${order.items.length} items added to cart!`, 'success');

        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 1500);
    } catch (error) {
        console.error('Error reordering items:', error);
        showToast('Failed to reorder items', 'error');
    }
}

// Cancel order
async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
        const orderRef = database.ref(`users/${currentUser.uid}/orders/${orderId}`);
        await orderRef.update({
            status: 'cancelled',
            cancelledAt: Date.now()
        });

        showToast('Order cancelled successfully', 'success');
    } catch (error) {
        console.error('Error cancelling order:', error);
        showToast('Failed to cancel order', 'error');
    }
}

// Track order
function trackOrder(orderId) {
    showToast('Tracking feature coming soon!', 'info');
    // In a real app, this would show tracking information
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
    if (themeIcon) {
        themeIcon.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Export functions
window.filterOrders = filterOrders;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderDetails = closeOrderDetails;
window.reorderItems = reorderItems;
window.cancelOrder = cancelOrder;
window.trackOrder = trackOrder;
window.toggleTheme = toggleTheme;
