// Main Application JavaScript
// Elite Furniture Gallery Shop

// Global variables
let currentProducts = [];
let filteredProducts = [];
let productsPerPage = 12;
let currentPage = 1;
let isDarkTheme = localStorage.getItem('theme') === 'dark';

// Wrapper function for add to cart (calls Firebase function)
function addToCart(productId) {
    if (typeof addToCartFirebase === 'function') {
        addToCartFirebase(productId);
    } else {
        console.error('addToCartFirebase function not available');
        showToast('Please login to add items to cart', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// Function to go to cart page
function goToCart() {
    window.location.href = 'cart.html';
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be ready
    if (typeof database === 'undefined') {
        // Retry after a short delay if Firebase isn't ready yet
        setTimeout(() => {
            initializeApp();
            loadCategories();
            loadFeaturedProducts();
            loadProducts();
            loadDeals();
            setupEventListeners();
            hideLoadingScreen();
        }, 500);
    } else {
        initializeApp();
        loadCategories();
        loadFeaturedProducts();
        loadProducts();
        loadDeals();
        setupEventListeners();
        hideLoadingScreen();
    }
});

// Initialize application
function initializeApp() {
    // Apply saved theme
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        updateThemeIcon();
    }
    
    // Check authentication state
    if (appState.user) {
        updateCartCount();
    }
}

// Hide loading screen
function hideLoadingScreen() {
    setTimeout(() => {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hide');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1000);
}

// Setup event listeners
function setupEventListeners() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Update active nav link
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    // Intersection Observer for sections
    setupIntersectionObserver();
    
    // Ctrl+Space keyboard shortcut for admin login
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.code === 'Space') {
            e.preventDefault();
            window.location.href = 'admin-login.html';
        }
    });
}

// Setup Intersection Observer for animations
function setupIntersectionObserver() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Update active nav link
                const id = entry.target.getAttribute('id');
                if (id) {
                    document.querySelectorAll('.nav-links a').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    }, options);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s ease';
        observer.observe(section);
    });
}

// Load categories from Firebase
function loadCategories() {
    if (typeof database === 'undefined') {
        console.error('Database not initialized');
        return;
    }
    
    const categoriesRef = database.ref('categories');
    categoriesRef.on('value', snapshot => {
        const categories = snapshot.val() || {};
        appState.categories = categories;
        
        // Update product counts for each category
        if (appState.products && Object.keys(appState.products).length > 0) {
            updateCategoryProductCounts(categories);
        }
        
        displayCategories(categories);
        updateCategoryFilter(categories);
    });
}

// Update product counts for categories based on actual products
function updateCategoryProductCounts(categories) {
    const products = appState.products || {};
    const categoryCounts = {};
    
    // Count products per category
    Object.values(products).forEach(product => {
        if (product.status === 'active' && product.category) {
            categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        }
    });
    
    // Update category counts in Firebase
    Object.keys(categories).forEach(catId => {
        const count = categoryCounts[catId] || 0;
        if (categories[catId].productCount !== count) {
            database.ref(`categories/${catId}/productCount`).set(count);
        }
    });
}

// Display categories
function displayCategories(categories) {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    const categoriesArray = Object.values(categories).filter(cat => cat.status === 'active');
    
    if (categoriesArray.length === 0) {
        grid.innerHTML = '<p class="text-center">No categories available</p>';
        return;
    }
    
    // Sort categories by name
    categoriesArray.sort((a, b) => a.name.localeCompare(b.name));
    
    grid.innerHTML = categoriesArray.map((category, index) => {
        // Get actual product count
        const productCount = category.productCount || 0;
        const productText = productCount === 1 ? 'Product' : 'Products';
        
        return `
        <div class="category-card" onclick="filterByCategory('${category.id}')" 
             style="animation-delay: ${index * 0.1}s">
            <div class="category-icon">${category.icon || '📦'}</div>
            <div class="category-name">${category.name}</div>
            <div class="category-count">${productCount} ${productText}</div>
        </div>
        `;
    }).join('');
}

// Update category filter dropdown
function updateCategoryFilter(categories) {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    
    const options = ['<option value="">All Categories</option>'];
    Object.values(categories).forEach(category => {
        if (category.status === 'active') {
            options.push(`<option value="${category.id}">${category.name}</option>`);
        }
    });
    
    filter.innerHTML = options.join('');
}

// Load featured products from Firebase
function loadFeaturedProducts() {
    if (typeof database === 'undefined') {
        console.error('Database not initialized');
        return;
    }

    const productsRef = database.ref('products');
    productsRef.on('value', snapshot => {
        const products = snapshot.val() || {};
        const featuredProducts = Object.values(products).filter(prod =>
            prod.status === 'active' && prod.featured === true
        );
        displayFeaturedProducts(featuredProducts);
    });
}

// Display featured products
function displayFeaturedProducts(products) {
    const grid = document.getElementById('featuredProductsGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1">No featured products available</p>';
        return;
    }

    // Limit to 8 featured products
    const productsToShow = products.slice(0, 8);

    grid.innerHTML = productsToShow.map((product, index) => {
        const discount = product.originalPrice ?
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        return `
            <div class="product-card" data-product-id="${product.id}"
                 style="animation-delay: ${index * 0.1}s">
                ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
                <div class="featured-badge">⭐ Featured</div>
                <div style="overflow: hidden; height: 250px;">
                    <img src="${product.images?.[0] || 'placeholder.jpg'}"
                         alt="${product.name}"
                         class="product-image"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 font-size=%2218%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-price">
                        <span class="price">Rs. ${product.price.toLocaleString()}</span>
                        ${product.originalPrice ?
                            `<span class="original-price">Rs. ${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    ${product.rating ? `
                        <div class="product-rating">
                            ${generateStars(product.rating)}
                            <span>(${product.reviews || 0})</span>
                        </div>
                    ` : ''}
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="addToCart('${product.id}')">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn-wishlist ${appState.wishlist && appState.wishlist.some(w => w.id === product.id) ? 'active' : ''}"
                                onclick="toggleWishlist('${product.id}')">
                            <i class="${appState.wishlist && appState.wishlist.some(w => w.id === product.id) ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Load products from Firebase
function loadProducts() {
    if (typeof database === 'undefined') {
        console.error('Database not initialized');
        return;
    }

    const productsRef = database.ref('products');
    productsRef.on('value', snapshot => {
        const products = snapshot.val() || {};
        appState.products = products;
        currentProducts = Object.values(products).filter(prod => prod.status === 'active');
        filteredProducts = currentProducts;
        displayProducts();

        // Update category product counts after products are loaded
        if (appState.categories && Object.keys(appState.categories).length > 0) {
            updateCategoryProductCounts(appState.categories);
        }
    });
}

// Display products
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) {
        console.error('Products grid not found');
        return;
    }

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    console.log('Displaying products:', {
        totalFiltered: filteredProducts.length,
        currentPage: currentPage,
        showing: productsToShow.length
    });

    if (productsToShow.length === 0) {
        grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1">No products found</p>';
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        return;
    }
    
    grid.innerHTML = productsToShow.map((product, index) => {
        const discount = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        
        return `
            <div class="product-card" data-product-id="${product.id}" 
                 style="animation-delay: ${index * 0.1}s">
                ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
                <div style="overflow: hidden; height: 250px;">
                    <img src="${product.images?.[0] || 'placeholder.jpg'}" 
                         alt="${product.name}" 
                         class="product-image"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 font-size=%2218%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-price">
                        <span class="price">Rs. ${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? 
                            `<span class="original-price">Rs. ${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    ${product.rating ? `
                        <div class="product-rating">
                            ${generateStars(product.rating)}
                            <span>(${product.reviews || 0})</span>
                        </div>
                    ` : ''}
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="addToCart('${product.id}')">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn-wishlist ${appState.wishlist && appState.wishlist.some(w => w.id === product.id) ? 'active' : ''}" 
                                onclick="toggleWishlist('${product.id}')">
                            <i class="${appState.wishlist && appState.wishlist.some(w => w.id === product.id) ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Show/hide load more button
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
        loadMoreContainer.style.display = 
            filteredProducts.length > endIndex ? 'block' : 'none';
    }
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star" style="color: #FFD700"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt" style="color: #FFD700"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star" style="color: #FFD700"></i>';
    }
    return stars;
}

// Load more products
function loadMoreProducts() {
    currentPage++;
    displayProducts();
}

// Filter products
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    
    filteredProducts = currentProducts.filter(product => {
        let pass = true;
        
        // Category filter
        if (categoryFilter && product.category !== categoryFilter) {
            pass = false;
        }
        
        // Price filter
        if (priceFilter) {
            const price = product.price;
            if (priceFilter === '0-25000' && price > 25000) pass = false;
            else if (priceFilter === '25000-50000' && (price < 25000 || price > 50000)) pass = false;
            else if (priceFilter === '50000-100000' && (price < 50000 || price > 100000)) pass = false;
            else if (priceFilter === '100000+' && price < 100000) pass = false;
        }
        
        return pass;
    });
    
    currentPage = 1;
    displayProducts();
}

// Filter by category
function filterByCategory(categoryId) {
    document.getElementById('categoryFilter').value = categoryId;
    filterProducts();
    scrollToSection('products');
}

// Sort products
function sortProducts() {
    const sortValue = document.getElementById('sortFilter').value;
    
    if (!sortValue) {
        filteredProducts = [...currentProducts];
    } else if (sortValue === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'name') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    currentPage = 1;
    displayProducts();
}

// Search products
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        console.error('Search input not found');
        return;
    }

    const query = searchInput.value.toLowerCase().trim();
    console.log('Searching for:', query);

    if (!query) {
        filteredProducts = currentProducts;
        console.log('Empty search, showing all', currentProducts.length, 'products');
    } else {
        filteredProducts = currentProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query)
        );
        console.log('Found', filteredProducts.length, 'products matching:', query);
    }

    currentPage = 1;
    displayProducts();
    scrollToSection('products');

    // Show feedback if no results
    if (query && filteredProducts.length === 0) {
        showToast(`No products found for "${query}"`, 'info');
    }
}

// Load deals from Firebase
function loadDeals() {
    if (typeof database === 'undefined') {
        console.error('Database not initialized');
        return;
    }
    
    const dealsRef = database.ref('deals');
    dealsRef.on('value', snapshot => {
        const deals = snapshot.val() || {};
        appState.deals = deals;
        displayDeals(deals);
    });
}

// Display deals
function displayDeals(deals) {
    const grid = document.getElementById('dealsGrid');
    if (!grid) return;
    
    const dealsArray = Object.values(deals).filter(deal => deal.status === 'active');
    
    if (dealsArray.length === 0) {
        grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1">No deals available at the moment</p>';
        return;
    }
    
    grid.innerHTML = dealsArray.map((deal, index) => {
        const discount = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);
        
        return `
            <div class="deal-card" style="animation-delay: ${index * 0.1}s">
                <div class="discount-badge">-${discount}%</div>
                <div style="overflow: hidden; height: 250px;">
                    <img src="${deal.image || 'placeholder.jpg'}" 
                         alt="${deal.name}" 
                         class="deal-image"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 font-size=%2218%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="deal-info">
                    <h3 class="deal-name">${deal.name}</h3>
                    <p class="deal-description">${deal.description || ''}</p>
                    <div class="deal-price">
                        <span class="price">Rs. ${deal.price.toLocaleString()}</span>
                        <span class="original-price">Rs. ${deal.originalPrice.toLocaleString()}</span>
                    </div>
                    <div class="deal-timer" data-end="${deal.endTime || ''}">
                        <i class="fas fa-clock"></i> Limited Time Offer
                    </div>
                    <div class="deal-actions">
                        <button class="btn-add-cart" onclick="addDealToCart('${deal.id}')">
                            <i class="fas fa-shopping-cart"></i> Grab Deal
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Add deal to cart
function addDealToCart(dealId) {
    // Use the Firebase addToCart function which handles login requirement
    if (typeof addToCart === 'function') {
        addToCart(dealId);
    } else if (typeof addToCartFirebase === 'function') {
        addToCartFirebase(dealId);
    } else {
        showToast('Please login to add items to cart', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// Theme toggle
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    updateThemeIcon();
    showToast(`${isDarkTheme ? 'Dark' : 'Light'} theme activated`, 'success');
}

// Update theme icon
function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Toggle user dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Go to cart page
function goToCart() {
    window.location.href = 'cart.html';
}

// Submit contact form
async function submitContactForm(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnContent = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    try {
        // Check if EmailJS is configured
        if (typeof emailjs !== 'undefined' && emailConfig && emailConfig.publicKey !== 'YOUR_PUBLIC_KEY') {
            // Send email using EmailJS
            const response = await emailjs.sendForm(
                emailConfig.serviceId,
                emailConfig.templateId,
                form
            );

            console.log('Email sent successfully:', response);
            showToast('Thank you for your message! We will get back to you soon.', 'success');
        } else {
            // EmailJS not configured, show warning
            console.warn('EmailJS not configured. Please set up email-config.js');
            showToast('Message saved! Email notification is not configured yet.', 'info');
        }

        // Save to Firebase
        if (database) {
            const formData = new FormData(form);
            const contactRef = database.ref('contacts').push();
            await contactRef.set({
                name: formData.get('from_name'),
                email: formData.get('from_email'),
                phone: formData.get('phone'),
                message: formData.get('message'),
                timestamp: Date.now(),
                status: 'new'
            });
        }

        // Reset form
        form.reset();

    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Failed to send message. Please try again or contact us directly.', 'error');
    } finally {
        // Restore button
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;
    }
}

// Subscribe to newsletter
function subscribeNewsletter(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    
    // Save to Firebase
    if (database) {
        const newsletterRef = database.ref('newsletter').push();
        newsletterRef.set({
            email: email,
            subscribedAt: Date.now()
        });
    }
    
    showToast('Thank you for subscribing to our newsletter!', 'success');
    form.reset();
}

// Product modal functions
function openProductModal(productId) {
    const product = appState.products[productId];
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <div class="modal-product">
            <div class="modal-images">
                <img src="${product.images?.[0] || 'placeholder.jpg'}" alt="${product.name}">
            </div>
            <div class="modal-info">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <div class="modal-price">
                    <span class="price">Rs. ${product.price.toLocaleString()}</span>
                    ${product.originalPrice ? 
                        `<span class="original-price">Rs. ${product.originalPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="modal-actions">
                    <button class="btn-add-cart" onclick="addToCart('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn-wishlist" onclick="toggleWishlist('${product.id}')">
                        <i class="far fa-heart"></i> Add to Wishlist
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
}

// Export functions
window.toggleTheme = toggleTheme;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleUserDropdown = toggleUserDropdown;
window.searchProducts = searchProducts;
window.filterProducts = filterProducts;
window.filterByCategory = filterByCategory;
window.sortProducts = sortProducts;
window.loadMoreProducts = loadMoreProducts;
window.goToCart = goToCart;
window.submitContactForm = submitContactForm;
window.subscribeNewsletter = subscribeNewsletter;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.scrollToSection = scrollToSection;
window.addDealToCart = addDealToCart;
window.updateCategoryProductCounts = updateCategoryProductCounts;