// Global Variables
let currentZoomLevel = 1;
let searchTimeout;
let adCarouselInterval;
let captchaAnswer = {};
let saleTimerInterval;
let currentTheme = localStorage.getItem('theme') || 'light';

// Sample Products Data (Replace with actual API data)
const products = [
    {
        id: 1,
        name: "Luxury Sofa Set",
        description: "Premium quality 3-seater sofa with elegant design",
        price: 45000,
        category: "sofas",
        image: "images/sofa1.jpg"
    },
    {
        id: 2,
        name: "Modern King Bed",
        description: "Comfortable king-size bed with storage",
        price: 55000,
        category: "beds",
        image: "images/bed1.jpg"
    },
    {
        id: 3,
        name: "Dining Table Set",
        description: "6-seater wooden dining table with chairs",
        price: 35000,
        category: "tables",
        image: "images/table1.jpg"
    },
    {
        id: 4,
        name: "Office Chair",
        description: "Ergonomic office chair with lumbar support",
        price: 12000,
        category: "chairs",
        image: "images/chair1.jpg"
    },
    {
        id: 5,
        name: "Wardrobe",
        description: "Spacious 4-door wardrobe with mirror",
        price: 40000,
        category: "wardrobes",
        image: "images/wardrobe1.jpg"
    },
    {
        id: 6,
        name: "Decorative Lamp",
        description: "Modern floor lamp with adjustable height",
        price: 5000,
        category: "decor",
        image: "images/lamp1.jpg"
    },
    {
        id: 7,
        name: "L-Shape Sofa",
        description: "Spacious L-shaped sofa perfect for large living rooms",
        price: 65000,
        category: "sofas",
        image: "images/sofa2.jpg"
    },
    {
        id: 8,
        name: "Queen Bed",
        description: "Elegant queen-size bed with upholstered headboard",
        price: 42000,
        category: "beds",
        image: "images/bed2.jpg"
    }
];

// Deals/Sale Products Data
const dealsProducts = [
    {
        id: 101,
        name: "Premium Recliner Sofa",
        description: "Luxurious recliner sofa with massage feature",
        price: 85000,
        originalPrice: 120000,
        discount: 29,
        category: "sofas",
        image: "images/deal-sofa.jpg"
    },
    {
        id: 102,
        name: "Executive Office Desk",
        description: "Large executive desk with built-in storage",
        price: 28000,
        originalPrice: 40000,
        discount: 30,
        category: "office",
        image: "images/deal-desk.jpg"
    },
    {
        id: 103,
        name: "Luxury Bedroom Set",
        description: "Complete bedroom set with king bed, nightstands, and dresser",
        price: 95000,
        originalPrice: 150000,
        discount: 37,
        category: "bedroom",
        image: "images/deal-bedroom.jpg"
    },
    {
        id: 104,
        name: "Designer Dining Set",
        description: "8-seater marble top dining table with cushioned chairs",
        price: 60000,
        originalPrice: 95000,
        discount: 37,
        category: "tables",
        image: "images/deal-dining.jpg"
    },
    {
        id: 105,
        name: "Sectional Sofa",
        description: "Modern U-shaped sectional sofa in grey",
        price: 75000,
        originalPrice: 110000,
        discount: 32,
        category: "sofas",
        image: "images/deal-sectional.jpg"
    },
    {
        id: 106,
        name: "Outdoor Patio Set",
        description: "Weather-resistant outdoor furniture set",
        price: 45000,
        originalPrice: 70000,
        discount: 36,
        category: "outdoor",
        image: "images/deal-outdoor.jpg"
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize Website
function initializeWebsite() {
    // Apply saved theme
    applyTheme(currentTheme);

    // Load products
    loadProducts();

    // Load deals
    loadDeals();

    // Initialize sale countdown timer
    initializeSaleTimer();

    // Initialize advertisement carousel
    initAdCarousel();

    // Set up keyboard shortcut for admin login (Ctrl+Space)
    document.addEventListener('keydown', function(e) {
        // Check for Ctrl+Space (keyCode 32 or key ' ')
        if (e.ctrlKey && (e.key === ' ' || e.keyCode === 32 || e.code === 'Space')) {
            e.preventDefault();
            e.stopPropagation();
            // Redirect to dedicated admin login page
            window.location.href = 'admin-login.html';
        }
    });

    // Initialize CAPTCHA
    if (document.getElementById('loginCaptchaQuestion')) {
        refreshCaptcha('login');
    }
    if (document.getElementById('signupCaptchaQuestion')) {
        refreshCaptcha('signup');
    }

    // Character counter for textarea
    const textarea = document.getElementById('contactMessage');
    if (textarea) {
        textarea.addEventListener('input', function() {
            const charCount = this.value.length;
            const counter = this.parentElement.querySelector('.char-count');
            if (counter) {
                counter.textContent = `${charCount}/200`;
                if (charCount >= 200) {
                    counter.style.color = 'var(--error-color)';
                } else {
                    counter.style.color = 'var(--gray)';
                }
            }
        });
    }

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Load Products
function loadProducts(filterCategory = null) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    let filteredProducts = products;
    if (filterCategory) {
        filteredProducts = products.filter(p => p.category === filterCategory);
    }

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image"
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22280%22 height=%22250%22%3E%3Crect width=%22280%22 height=%22250%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2218%22 fill=%22%23666%22%3E${product.name}%3C/text%3E%3C/svg%3E'">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-price">Rs. ${product.price.toLocaleString()}</p>
            <button class="btn-add-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
        </div>
    `;
    return card;
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Show notification
    showNotification('Product added to cart!', 'success');
}

// Update Cart Count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Filter by Category
function filterByCategory(category) {
    loadProducts(category);
    scrollToSection('products');
    showNotification(`Showing ${category}`, 'info');
}

// Search Functionality
function handleSearch(query) {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
        if (query.length >= 2) {
            performSearch(query);
        } else {
            hideSearchResults();
        }
    }, 300);
}

function performSearch(query = null) {
    if (!query) {
        query = document.getElementById('searchBar').value.trim();
    }

    if (query.length < 2) {
        showNotification('Please enter at least 2 characters', 'warning');
        return;
    }

    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    const results = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
    } else {
        searchResults.innerHTML = results.map(product => `
            <div class="search-result-item" onclick="viewProduct(${product.id})">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <strong>Rs. ${product.price.toLocaleString()}</strong>
            </div>
        `).join('');
    }

    searchResults.classList.remove('hidden');
}

function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.classList.add('hidden');
    }
}

function viewProduct(productId) {
    hideSearchResults();
    const productCard = document.querySelector(`[onclick="addToCart(${productId})"]`)?.closest('.product-card');
    if (productCard) {
        productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        productCard.style.animation = 'pulse 1s ease';
        setTimeout(() => {
            productCard.style.animation = '';
        }, 1000);
    }
}

// Advertisement Carousel
function initAdCarousel() {
    const slides = document.querySelectorAll('.ad-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;

    adCarouselInterval = setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 4000);
}

// Admin login is now handled by dedicated admin-login.html page
// Ctrl+Space redirects to admin-login.html

// Password Toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;

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

// CAPTCHA
function generateCaptcha(type) {
    const operations = [
        { q: 'What is 5 + 3?', a: '8' },
        { q: 'What is 10 - 4?', a: '6' },
        { q: 'What is 3 × 4?', a: '12' },
        { q: 'What is 15 ÷ 3?', a: '5' },
        { q: 'What is 7 + 8?', a: '15' },
        { q: 'What is 20 - 12?', a: '8' },
        { q: 'What is 6 × 2?', a: '12' },
        { q: 'What is 18 ÷ 2?', a: '9' }
    ];

    const random = operations[Math.floor(Math.random() * operations.length)];
    captchaAnswer[type] = random.a;
    return random.q;
}

function refreshCaptcha(type) {
    const questionElement = document.getElementById(`${type}CaptchaQuestion`);
    const answerElement = document.getElementById(`${type}CaptchaAnswer`);

    if (questionElement) {
        questionElement.textContent = generateCaptcha(type);
    }
    if (answerElement) {
        answerElement.value = '';
    }
}

function verifyCaptcha(type, userAnswer) {
    return captchaAnswer[type] === userAnswer.trim();
}

// Contact Form
function handleContactForm(event) {
    event.preventDefault();

    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    // Save to Firebase
    if (typeof firebase !== 'undefined' && firebase.database) {
        const contactRef = firebase.database().ref('contacts');
        contactRef.push({
            name: name,
            email: email,
            message: message,
            timestamp: Date.now()
        })
        .then(() => {
            showNotification('Message sent successfully!', 'success');
            document.getElementById('contactForm').reset();
        })
        .catch((error) => {
            showNotification('Error sending message: ' + error.message, 'error');
        });
    } else {
        showNotification('Message saved (Firebase not configured)', 'warning');
        console.log('Contact Form Data:', { name, email, message });
        document.getElementById('contactForm').reset();
    }

    return false;
}

// Zoom Controls
function zoomIn() {
    currentZoomLevel = Math.min(currentZoomLevel + 0.1, 1.5);
    applyZoom();
}

function zoomOut() {
    currentZoomLevel = Math.max(currentZoomLevel - 0.1, 0.8);
    applyZoom();
}

function resetZoom() {
    currentZoomLevel = 1;
    applyZoom();
}

function applyZoom() {
    document.body.style.zoom = currentZoomLevel;
    showNotification(`Zoom: ${Math.round(currentZoomLevel * 100)}%`, 'info');
}

// Accessibility Features
function toggleAccessibilityPanel() {
    const options = document.getElementById('accessibilityOptions');
    if (options) {
        options.classList.toggle('hidden');
    }
}

function increaseTextSize() {
    document.body.style.fontSize = 'calc(var(--base-font-size) * 1.2)';
    showNotification('Text size increased', 'success');
}

function decreaseTextSize() {
    document.body.style.fontSize = 'calc(var(--base-font-size) * 0.8)';
    showNotification('Text size decreased', 'success');
}

function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    const isActive = document.body.classList.contains('high-contrast');
    showNotification(`High contrast ${isActive ? 'enabled' : 'disabled'}`, 'success');
}

function toggleReadableFont() {
    document.body.classList.toggle('readable-font');
    const isActive = document.body.classList.contains('readable-font');
    showNotification(`Readable font ${isActive ? 'enabled' : 'disabled'}`, 'success');
}

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
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

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Close search results when clicking outside
document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(event.target)) {
        hideSearchResults();
    }
});

// Initialize cart count on load
updateCartCount();

// ========================================
// NEW FEATURES FUNCTIONS
// ========================================

// Shop Tour Video
function openShopTour() {
    const modal = document.getElementById('shopTourModal');
    if (modal) {
        modal.classList.remove('hidden');
        const video = modal.querySelector('video');
        if (video) {
            video.play().catch(e => console.log('Video play failed:', e));
        }
    }
}

function closeShopTour() {
    const modal = document.getElementById('shopTourModal');
    if (modal) {
        modal.classList.add('hidden');
        const video = modal.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    }
}

// Category Video Player
function showCategoryVideo(category) {
    const modal = document.getElementById('categoryVideoModal');
    const video = document.getElementById('categoryVideo');
    const title = document.getElementById('categoryVideoTitle');
    
    if (modal && video) {
        const videoSources = {
            'beds': 'videos/beds-collection.mp4',
            'sofas': 'videos/sofas-collection.mp4',
            'tables': 'videos/tables-collection.mp4'
        };
        
        const videoSrc = videoSources[category] || 'videos/default-collection.mp4';
        video.src = videoSrc;
        
        if (title) {
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            title.textContent = categoryName + ' Collection';
        }
        
        modal.classList.remove('hidden');
        video.play().catch(e => {
            console.log('Video play failed:', e);
            showNotification(category + ' collection video not available yet', 'info');
        });
    }
}

function closeCategoryVideo() {
    const modal = document.getElementById('categoryVideoModal');
    const video = document.getElementById('categoryVideo');
    
    if (modal && video) {
        modal.classList.add('hidden');
        video.pause();
        video.currentTime = 0;
    }
}

// Category Audio Player
function playCategoryAudio(category) {
    const audioElements = {
        'chairs': document.getElementById('chairsAudio'),
        'decor': document.getElementById('decorAudio')
    };
    
    const audio = audioElements[category];
    
    if (audio) {
        Object.values(audioElements).forEach(a => {
            if (a && a !== audio) {
                a.pause();
                a.currentTime = 0;
            }
        });
        
        audio.play().then(() => {
            showNotification('Playing ' + category + ' description', 'success');
        }).catch(e => {
            console.log('Audio play failed:', e);
            showNotification(category + ' audio not available yet', 'info');
            filterByCategory(category);
        });
    } else {
        filterByCategory(category);
    }
}

// Email Validation and Cursor Position
function setEmailCursor(input) {
    if (!input) return;

    setTimeout(() => {
        try {
            if (input && input.value === '@gmail.com') {
                input.setSelectionRange(0, 0);
            }
        } catch (e) {
            // Ignore if element is no longer accessible
            console.log('setEmailCursor error (safe to ignore):', e.message);
        }
    }, 0);
}

function validateEmail(input) {
    const email = input.value.toLowerCase();
    const errorElement = document.getElementById(input.id + 'Error');
    
    if (!email.includes('@gmail.com')) {
        if (email.includes('@')) {
            const username = email.split('@')[0];
            input.value = username + '@gmail.com';
        } else {
            input.value = email + '@gmail.com';
        }
    }
    
    if (input.id.includes('login') || input.id.includes('signup')) {
        if (email.includes('admin@gmail.com')) {
            if (errorElement) {
                errorElement.textContent = 'Admin email cannot be used for user accounts';
                errorElement.style.display = 'block';
            }
            input.setCustomValidity('Admin email cannot be used for user accounts');
            showNotification('Admin email cannot be used for user accounts', 'error');
        } else {
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
            input.setCustomValidity('');
        }
    }
}

window.onclick = function(event) {
    const shopTourModal = document.getElementById('shopTourModal');
    const categoryVideoModal = document.getElementById('categoryVideoModal');

    if (event.target === shopTourModal) {
        closeShopTour();
    }
    if (event.target === categoryVideoModal) {
        closeCategoryVideo();
    }
};

function revealOnScroll() {
    const reveals = document.querySelectorAll('.scroll-reveal');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

// ========================================
// COUNTDOWN TIMER FOR SALE
// ========================================

function initializeSaleTimer() {
    // Set sale end date (7 days from now)
    const saleEndDate = new Date();
    saleEndDate.setDate(saleEndDate.getDate() + 7);

    // Save to localStorage if not exists
    if (!localStorage.getItem('saleEndDate')) {
        localStorage.setItem('saleEndDate', saleEndDate.getTime());
    }

    const savedEndDate = parseInt(localStorage.getItem('saleEndDate'));

    function updateTimer() {
        const now = new Date().getTime();
        const distance = savedEndDate - now;

        if (distance < 0) {
            // Sale ended, reset for next sale (7 days)
            const newEndDate = new Date();
            newEndDate.setDate(newEndDate.getDate() + 7);
            localStorage.setItem('saleEndDate', newEndDate.getTime());
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateTimer();
    saleTimerInterval = setInterval(updateTimer, 1000);
}

// ========================================
// THEME TOGGLER
// ========================================

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

// ========================================
// DEALS/SALE PRODUCTS
// ========================================

function loadDeals() {
    const dealsGrid = document.getElementById('dealsGrid');
    if (!dealsGrid) return;

    dealsGrid.innerHTML = '';

    dealsProducts.forEach(product => {
        const productCard = createDealCard(product);
        dealsGrid.appendChild(productCard);
    });
}

function createDealCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card deal-card';
    card.innerHTML = `
        <div class="deal-badge">${product.discount}% OFF</div>
        <img src="${product.image}" alt="${product.name}" class="product-image"
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22280%22 height=%22250%22%3E%3Crect width=%22280%22 height=%22250%22 fill=%22%23ff6b6b%22/%3E%3Ctext x=%2250%25%22 y=%2245%25%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2218%22 fill=%22white%22%3E${product.name}%3C/text%3E%3Ctext x=%2250%25%22 y=%2260%25%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2224%22 font-weight=%22bold%22 fill=%22white%22%3E${product.discount}%25 OFF%3C/text%3E%3C/svg%3E'">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="price-container">
                <p class="product-price">Rs. ${product.price.toLocaleString()}</p>
                <p class="original-price">Rs. ${product.originalPrice.toLocaleString()}</p>
            </div>
            <button class="btn-add-cart" onclick="addToCart(${product.id}, true)">
                <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
        </div>
    `;
    return card;
}

// Update addToCart to handle deals products
const originalAddToCart = addToCart;
function addToCart(productId, isDeal = false) {
    let product;
    if (isDeal) {
        product = dealsProducts.find(p => p.id === productId);
    } else {
        product = products.find(p => p.id === productId);
    }

    if (!product) return;

    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Show notification
    showNotification('Product added to cart!', 'success');
}
