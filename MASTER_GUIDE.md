# 🪑 Elite Furniture Gallery - Complete Website Documentation

**Version:** 1.0
**Date:** November 2024
**Author:** Tahir Zaman Khalid

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Technologies & Tools Used](#technologies--tools-used)
3. [Project Structure](#project-structure)
4. [Firebase Setup & Configuration](#firebase-setup--configuration)
5. [Database Structure](#database-structure)
6. [File-by-File Breakdown](#file-by-file-breakdown)
7. [JavaScript Functions Explained](#javascript-functions-explained)
8. [How Files are Connected](#how-files-are-connected)
9. [Features Overview](#features-overview)
10. [Setup Instructions](#setup-instructions)
11. [Common Issues & Solutions](#common-issues--solutions)

---

## 🎯 Overview

**Elite Furniture Gallery** is a full-featured e-commerce website for selling furniture online. It includes:

- User authentication (Email/Password and Google OAuth)
- Product browsing with categories
- Shopping cart functionality
- **Wishlist functionality** - Save favorite products for later
- **Order management system** - Track all orders in real-time
- Admin dashboard for managing products, categories, orders, and team
- User profile management
- Interactive map showing store location
- Contact form with EmailJS integration
- Policy pages (Privacy, Terms, FAQ, Careers)
- Team management system
- Hot deals section
- Responsive design for mobile and desktop

**All data is fetched from Firebase Realtime Database in real-time!**

---

## 🛠️ Technologies & Tools Used

### **Frontend Technologies**

1. **HTML5** - Structure and content of web pages
2. **CSS3** - Styling, animations, and responsive design
   - Flexbox for layouts
   - Grid for product displays
   - CSS animations and transitions
3. **JavaScript (ES6+)** - Interactive functionality
   - Async/await for asynchronous operations
   - Arrow functions
   - Template literals
   - Promises

### **Backend Services**

4. **Firebase** - Backend as a Service (BaaS)
   - **Firebase Authentication** - User login/signup management
   - **Firebase Realtime Database** - NoSQL database for storing data
   - **Firebase Storage** - File storage (initialized but not actively used)
   - **Firebase Hosting** - Can be used to host the website

### **Third-Party Libraries & APIs**

5. **Font Awesome 6.4.0** - Icon library for UI elements
   - Used for: cart icons, user icons, social media icons, navigation icons

6. **Leaflet.js 1.9.4** - Open-source mapping library
   - Used for: displaying store location on interactive map
   - Lightweight alternative to Google Maps

7. **EmailJS** - Email service for contact forms
   - Sends emails directly from JavaScript without backend server
   - Used for: contact form submissions

8. **Google reCAPTCHA v2** - Bot prevention
   - Used on: login and signup forms
   - Site key: 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI (test key)

### **Development Tools**

9. **Local Web Server** - Required for development
   - Python's http.server
   - VS Code Live Server
   - Node.js http-server
   - PHP built-in server

### **Version Control**

10. **Git** - Version control system
11. **GitHub** - Code hosting platform

---

## 📁 Project Structure

```
Maryam-s-Furniture-Store/
│
├── index.html                 # Main landing page
├── client-login.html          # Login and signup page
├── profile.html               # User profile page
├── cart.html                  # Shopping cart page
├── wishlist.html              # User wishlist page (saves favorite products)
├── orders.html                # User orders page (track all orders)
├── products.html              # Products listing page
├── categories.html            # Categories page
├── admin-dashboard.html       # Admin panel
├── team.html                  # Team members page
├── privacy-policy.html        # Privacy policy page
├── terms.html                 # Terms and conditions page
├── faq.html                   # Frequently asked questions
├── careers.html               # Careers/jobs page
│
├── css/
│   └── styles.css             # Main stylesheet for all pages
│
├── js/
│   ├── firebase-config.js     # Firebase initialization and core functions
│   ├── app.js                 # Main application logic for index.html
│   ├── auth.js                # Authentication helper functions
│   ├── admin-auth.js          # Admin authentication
│   ├── orders.js              # Orders page functionality
│   ├── wishlist.js            # Wishlist functionality (embedded in wishlist.html)
│   ├── admin.js               # Admin dashboard functionality
│   ├── cart.js                # Shopping cart functionality
│   ├── email-config.js        # EmailJS configuration
│   ├── map.js                 # Leaflet map functionality
│   ├── team.js                # Team management
│   ├── profile.js             # User profile functionality
│   ├── orders.js              # Order management
│   └── main.js                # Additional utilities
│
├── assets/
│   ├── images/                # Product images, logos, banners
│   └── videos/                # Hero video for homepage
│
├── database.rules.json           # Firebase security rules
├── MASTER_GUIDE.md              # This comprehensive guide
├── EMAIL_SETUP_GUIDE.md         # Guide for setting up EmailJS
├── FIREBASE_HOSTING_GUIDE.md    # Complete guide for deploying to Firebase
└── README.md                    # Project overview
```

---

## 🔥 Firebase Setup & Configuration

### **What is Firebase?**

Firebase is a platform by Google that provides backend services like authentication, database, and storage without writing server code. Our website uses:

1. **Firebase Authentication** - Manages user accounts
2. **Firebase Realtime Database** - Stores products, orders, users, etc.
3. **Firebase Storage** - Ready for storing product images

### **Firebase Configuration**

Located in: `js/firebase-config.js` (lines 4-12)

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyCNwRyfXqXGasKTqQrOCp55eOcQYOShw8Y",
    authDomain: "furniture-shop-aa5fb.firebaseapp.com",
    projectId: "furniture-shop-aa5fb",
    storageBucket: "furniture-shop-aa5fb.firebasestorage.app",
    messagingSenderId: "170329602819",
    appId: "1:170329602819:web:88d988c797348715b84736",
    databaseURL: "https://furniture-shop-aa5fb-default-rtdb.firebaseio.com"
};
```

**What each field means:**
- `apiKey` - Public key to connect to Firebase project
- `authDomain` - Domain for authentication popups
- `projectId` - Unique identifier for the Firebase project
- `storageBucket` - Where uploaded files are stored
- `messagingSenderId` - For push notifications (not used yet)
- `appId` - Unique app identifier
- `databaseURL` - URL of the Realtime Database

### **Firebase SDK Version**

We use **Firebase JavaScript SDK version 10.7.0** with **compat** libraries for backward compatibility.

```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-database-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-storage-compat.js"></script>
```

---

## 💾 Database Structure

Firebase Realtime Database is a **NoSQL database** that stores data as JSON. Here's how our data is organized:

```
furniture-shop-aa5fb-default-rtdb/
│
├── categories/                    # Product categories
│   ├── cat_1/
│   │   ├── id: "cat_1"
│   │   ├── name: "Sofas & Couches"
│   │   ├── icon: "🛋️"
│   │   ├── slug: "sofas-couches"
│   │   ├── productCount: 0
│   │   ├── createdAt: 1234567890
│   │   └── status: "active"
│   ├── cat_2/
│   └── ...
│
├── products/                      # All furniture products
│   ├── prod_1/
│   │   ├── id: "prod_1"
│   │   ├── name: "Luxury L-Shape Sofa"
│   │   ├── description: "Premium quality..."
│   │   ├── price: 85000
│   │   ├── originalPrice: 95000
│   │   ├── category: "cat_1"
│   │   ├── images: ["https://..."]
│   │   ├── stock: 10
│   │   ├── featured: true
│   │   ├── rating: 4.5
│   │   ├── reviews: 23
│   │   ├── createdAt: 1234567890
│   │   └── status: "active"
│   └── ...
│
├── deals/                         # Hot deals/discounts
│   ├── deal_1/
│   │   ├── productId: "prod_1"
│   │   ├── discount: 20
│   │   ├── expiresAt: 1234567890
│   │   └── active: true
│   └── ...
│
├── users/                         # User accounts
│   ├── {userId}/                  # Firebase UID
│   │   ├── uid: "abc123..."
│   │   ├── email: "user@email.com"
│   │   ├── name: "John Doe"
│   │   ├── phone: "03001234567"
│   │   ├── city: "Lahore"
│   │   ├── role: "user" or "admin"
│   │   ├── createdAt: 1234567890
│   │   ├── lastLogin: 1234567890
│   │   ├── cart/                  # User's shopping cart
│   │   │   ├── prod_1/
│   │   │   │   ├── id: "prod_1"
│   │   │   │   ├── name: "..."
│   │   │   │   ├── price: 85000
│   │   │   │   ├── quantity: 2
│   │   │   │   └── addedAt: 1234567890
│   │   │   └── ...
│   │   ├── wishlist/              # User's wishlist
│   │   └── orders/                # User's order IDs
│   └── ...
│
├── orders/                        # All orders
│   ├── order_1/
│   │   ├── orderId: "order_1"
│   │   ├── userId: "abc123..."
│   │   ├── userName: "John Doe"
│   │   ├── userEmail: "user@email.com"
│   │   ├── items: [...]
│   │   ├── totalAmount: 85000
│   │   ├── status: "pending"
│   │   ├── shippingAddress: {...}
│   │   ├── paymentMethod: "COD"
│   │   ├── createdAt: 1234567890
│   │   └── updatedAt: 1234567890
│   └── ...
│
├── team/                          # Team members
│   ├── member_1/
│   │   ├── id: "member_1"
│   │   ├── name: "Sarah Ahmed"
│   │   ├── role: "CEO"
│   │   ├── image: "https://..."
│   │   ├── bio: "..."
│   │   └── social: {...}
│   └── ...
│
└── settings/                      # Store settings
    ├── storeName: "Elite Furniture Gallery Shop"
    ├── currency: "PKR"
    ├── deliveryFee: 500
    ├── freeDeliveryThreshold: 50000
    ├── taxRate: 0
    ├── maintenanceMode: false
    ├── location/                  # For map
    │   ├── lat: 31.5204
    │   ├── lng: 74.3587
    │   └── address: "..."
    └── socialLinks/
        ├── facebook: "..."
        ├── instagram: "..."
        └── twitter: "..."
```

---

## 📄 File-by-File Breakdown

### **1. index.html** - Main Landing Page

**Purpose:** The first page visitors see. Shows hero video, categories, featured products, deals, and contact form.

**Sections:**
- **Header/Navbar** - Logo, navigation links, login/signup buttons, cart icon, user menu
- **Hero Section** - Background video with welcome message and CTA button
- **Categories Section** - Grid of furniture categories (Sofas, Beds, Tables, etc.)
- **Featured Products** - Highlighted products loaded from database
- **Hot Deals** - Special discounts loaded from database
- **About Section** - Company information
- **Map Section** - Interactive Leaflet map showing store location
- **Contact Form** - EmailJS powered contact form
- **Footer** - Social links, policies, copyright

**Connected JavaScript Files:**
- `js/firebase-config.js` - Database initialization
- `js/app.js` - Main functionality
- `js/map.js` - Interactive map
- `js/email-config.js` - Contact form
- `js/auth.js` - User authentication state

**Key Functions Used:**
- `loadCategories()` - Fetches and displays categories from Firebase
- `loadFeaturedProducts()` - Fetches featured products
- `loadDeals()` - Fetches hot deals
- `initMap()` - Initializes Leaflet map
- `sendEmail()` - Sends contact form via EmailJS

---

### **2. client-login.html** - Authentication Page

**Purpose:** Allows users to login or create an account using email/password or Google OAuth.

**Features:**
- Tab switching between Login and Signup
- Email/password authentication
- Google OAuth social login
- Password visibility toggle
- Form validation
- Google reCAPTCHA v2 for bot prevention
- Forgot password functionality
- Error handling with user-friendly messages

**Firebase Functions Used:**
- `firebase.auth().signInWithEmailAndPassword()` - Email/password login
- `firebase.auth().createUserWithEmailAndPassword()` - Create new account
- `firebase.auth().signInWithPopup()` - Google OAuth login
- `firebase.auth().sendPasswordResetEmail()` - Password reset
- `firebase.database().ref().set()` - Save user data to database

**Key JavaScript Functions:**

1. **`switchTab(tab)`** - Switches between login and signup forms
   - Shows/hides appropriate form
   - Updates welcome message
   - Changes active tab button

2. **`handleLogin(event)`** - Processes login form submission
   - Validates email and password
   - Checks reCAPTCHA (optional)
   - Calls Firebase authentication
   - Redirects based on user role (admin → admin-dashboard, user → index)
   - Shows error messages for failed login

3. **`handleSignup(event)`** - Processes signup form submission
   - Validates all fields (name, email, password, confirm password, phone, city)
   - Checks password length (minimum 6 characters)
   - Confirms password match
   - Creates Firebase account
   - Saves user data to database
   - Sends verification email
   - Redirects to homepage

4. **`signInWithGoogle()`** - Initiates Google OAuth login
   - Creates GoogleAuthProvider
   - Calls handleSocialSignIn with provider

5. **`handleSocialSignIn(provider, providerName)`** - Handles social authentication
   - Checks if running on local server (required for OAuth)
   - Shows popup for social login
   - Creates user profile if first-time login
   - Redirects to homepage on success

6. **`togglePasswordVisibility(fieldId)`** - Shows/hides password
   - Toggles input type between "password" and "text"

7. **`showForgotPasswordModal(event)`** - Password reset
   - Prompts user for email
   - Sends password reset email via Firebase

**Connected Files:**
- `js/firebase-config.js` - Firebase initialization and auth state management
- `css/styles.css` - Styling

**Security Features:**
- reCAPTCHA v2 prevents automated bot signups
- Firebase Authentication handles password hashing
- Email verification sent on signup
- Captcha errors handled gracefully

---

### **3. profile.html** - User Profile Page

**Purpose:** Displays and allows editing of user profile information, order history, and account settings.

**Design:** Modern gradient design with avatar, statistics, and card-based layout.

**Sections:**
1. **Profile Header**
   - User avatar (shows first letter of name)
   - User name and email
   - User role badge (Customer/Admin)
   - Statistics: Total orders, Total spent, Member since

2. **Profile Content Cards**
   - **Personal Information Card** - Edit name, email, phone, city
   - **Order History Card** - List of past orders with status
   - **Security Settings Card** - Change password
   - **Account Management Card** - Logout and delete account options

**Connected JavaScript File:**
- `js/profile.js` - All profile functionality

**Key JavaScript Functions:**

1. **`checkAuth()`** - Ensures user is logged in
   - Uses `firebase.auth().onAuthStateChanged()`
   - Redirects to login page if not authenticated
   - Calls `loadUserProfile()` if authenticated

2. **`loadUserProfile(user)`** - Loads user data from Firebase
   - Fetches user data from `users/{uid}`
   - Displays name, email, role
   - Calculates and shows member since date
   - Populates edit form fields

3. **`loadUserOrders(userId)`** - Fetches user's order history
   - Gets orders from `orders/` node
   - Filters orders by userId
   - Displays order cards with status, date, items, total
   - Shows empty state if no orders

4. **`formatDate(timestamp)`** - Formats timestamps
   - Converts Firebase timestamp to readable date
   - Example: "Nov 15, 2024"

5. **`formatCurrency(amount)`** - Formats prices
   - Adds currency symbol and commas
   - Example: "Rs. 85,000"

6. **`toggleEditMode()`** - Enables profile editing
   - Makes input fields editable
   - Shows save/cancel buttons
   - Hides edit button

7. **`saveProfile()`** - Saves profile changes
   - Validates input fields
   - Updates Firebase database
   - Shows success notification
   - Disables edit mode

8. **`cancelEdit()`** - Cancels profile editing
   - Reloads original data
   - Disables edit mode

9. **`changePassword()`** - Changes user password
   - Prompts for current and new password
   - Validates password strength
   - Uses Firebase auth to update password

10. **`deleteAccount()`** - Deletes user account
    - Shows confirmation dialog
    - Deletes user data from database
    - Deletes Firebase authentication account
    - Redirects to homepage

11. **`showToast(message, type)`** - Shows notification messages
    - Types: success, error, info, warning
    - Auto-dismisses after 3 seconds

**Firebase Functions Used:**
- `firebase.database().ref('users/' + uid).once('value')` - Get user data
- `firebase.database().ref('users/' + uid).update()` - Update user data
- `firebase.database().ref('orders').once('value')` - Get all orders
- `firebase.auth().currentUser.updatePassword()` - Change password
- `firebase.database().ref('users/' + uid).remove()` - Delete user data
- `firebase.auth().currentUser.delete()` - Delete auth account

---

### **4. cart.html** - Shopping Cart Page

**Purpose:** Displays items in user's cart, allows quantity changes, and checkout.

**Sections:**
- **Cart Items List** - Shows each product with image, name, price, quantity controls
- **Cart Summary** - Subtotal, delivery fee, total
- **Checkout Button** - Proceeds to checkout process

**Connected JavaScript File:**
- `js/cart.js` - Cart functionality

**Key JavaScript Functions:**

1. **`loadCart()`** - Fetches cart items from Firebase
   - Gets cart from `users/{uid}/cart`
   - Displays each item
   - Calculates totals

2. **`updateQuantity(productId, newQuantity)`** - Changes item quantity
   - Updates Firebase database
   - Recalculates totals
   - Removes item if quantity is 0

3. **`removeFromCart(productId)`** - Removes item from cart
   - Deletes from Firebase
   - Updates UI
   - Shows notification

4. **`calculateTotal()`** - Calculates cart totals
   - Sums all item prices × quantities
   - Adds delivery fee if below threshold
   - Updates summary display

5. **`checkout()`** - Initiates checkout process
   - Validates cart is not empty
   - Shows address form
   - Creates order in Firebase
   - Clears cart
   - Redirects to order confirmation

**Firebase Functions Used:**
- `firebase.database().ref('users/' + uid + '/cart').on('value')` - Listen for cart changes
- `firebase.database().ref('users/' + uid + '/cart/' + productId).update()` - Update quantity
- `firebase.database().ref('users/' + uid + '/cart/' + productId).remove()` - Remove item

---

### **5. wishlist.html** - User Wishlist Page

**Purpose:** Displays user's saved favorite products for later purchase.

**Features:**
- Beautiful gradient design with heart theme
- Real-time wishlist updates from Firebase
- Product cards with images, prices, and actions
- Add to cart directly from wishlist
- Remove from wishlist functionality
- Wishlist statistics (total items, total value)
- Empty state with call-to-action
- Loading skeleton while fetching data

**Connected JavaScript:**
- JavaScript is embedded in the HTML file (for simplicity)

**Key JavaScript Functions:**

1. **`checkAuth()`** - Verifies user is logged in
   - Redirects to login if not authenticated
   - Calls `loadWishlist()` if logged in

2. **`loadWishlist(userId)`** - Fetches wishlist from Firebase
   - Listens to `users/{uid}/wishlist` in real-time
   - Fetches full product details from `products` node
   - Merges wishlist data with product details
   - Sorts by date added (newest first)
   - Calls `displayWishlist()` to show items

3. **`displayWishlist()`** - Renders wishlist items
   - Shows empty state if no items
   - Creates product cards with images, prices
   - Adds "Remove" and "Add to Cart" buttons
   - Updates statistics

4. **`updateStats()`** - Updates wishlist statistics
   - Calculates total items count
   - Calculates total value of all items
   - Updates stats display

5. **`removeFromWishlist(productId)`** - Removes item from wishlist
   - Deletes from Firebase: `users/{uid}/wishlist/{productId}`
   - Shows success notification
   - UI updates automatically (real-time listener)

6. **`addToCartFromWishlist(productId)`** - Adds wishlist item to cart
   - Finds product in wishlist
   - Checks if already in cart
   - If in cart: increases quantity
   - If not in cart: adds new item
   - Updates Firebase cart
   - Shows success notification

7. **`viewProduct(productId)`** - Views product details
   - Redirects to main page with product filter
   - Could be enhanced to show product modal

**Firebase Functions Used:**
- `database.ref('users/' + uid + '/wishlist').on('value')` - Real-time wishlist listener
- `database.ref('products').once('value')` - Fetch all product details
- `database.ref('users/' + uid + '/wishlist/' + productId).remove()` - Remove from wishlist
- `database.ref('users/' + uid + '/cart/' + productId).set()` - Add to cart
- `database.ref('users/' + uid + '/cart/' + productId).update()` - Update cart quantity

**Why Real-time?**
The wishlist uses `.on('value')` instead of `.once('value')`, which means:
- Any changes to wishlist update instantly
- If you add/remove items on another device, this page updates automatically
- No need to refresh the page

---

### **6. orders.html** - User Orders Page

**Purpose:** Displays all orders placed by the user with tracking and management features.

**Features:**
- Filter orders by status (All, Pending, Processing, Shipped, Delivered, Cancelled)
- Real-time order updates from Firebase
- Order cards with all details
- View full order details modal
- Cancel pending orders
- Reorder delivered orders
- Order status tracking
- Order history sorted by date

**Connected JavaScript File:**
- `js/orders.js` - All orders functionality

**Key JavaScript Functions:**

1. **`checkAuth()`** - Verifies user authentication
   - Redirects to login if not logged in
   - Calls `loadOrders()` when authenticated

2. **`loadOrders(userId)`** - Fetches orders from Firebase
   - Listens to `users/{uid}/orders` in real-time
   - Converts to array and sorts by date (newest first)
   - Calls `displayOrders()` to render

3. **`displayOrders()`** - Renders order cards
   - Filters orders based on currentFilter
   - Shows empty state if no orders
   - Creates order cards with:
     - Order ID and date
     - Status badge with icon
     - Items list with images
     - Total amount
     - Action buttons (View, Cancel, Reorder, Track)

4. **`filterOrders(status)`** - Filters by order status
   - Updates currentFilter variable
   - Updates active tab styling
   - Re-renders display with filtered orders

5. **`getStatusIcon(status)`** - Returns icon for status
   - Pending: Clock icon
   - Processing: Spinning cog
   - Shipped: Truck icon
   - Delivered: Check circle
   - Cancelled: X circle

6. **`formatStatus(status)`** - Capitalizes status text
   - "pending" → "Pending"

7. **`viewOrderDetails(orderId)`** - Shows full order details
   - Finds order in allOrders array
   - Generates detailed HTML with:
     - Order info (ID, date, status, payment method)
     - Delivery address
     - All order items with images
     - Order summary (subtotal, delivery fee, discount, total)
   - Shows modal with all information

8. **`closeOrderDetails()`** - Closes order details modal
   - Hides modal by removing 'active' class

9. **`reorderItems(orderId)`** - Adds all items from order to cart
   - Finds order by ID
   - Loops through order items
   - Adds each item to cart using `addToCartFirebase()`
   - Shows success message
   - Redirects to cart page

10. **`cancelOrder(orderId)`** - Cancels a pending order
    - Shows confirmation dialog
    - Updates order status to 'cancelled' in Firebase
    - Adds cancelledAt timestamp
    - Shows success notification

11. **`trackOrder(orderId)`** - Order tracking (placeholder)
    - Currently shows "coming soon" message
    - Can be enhanced with real tracking integration

**Firebase Functions Used:**
- `database.ref('users/' + uid + '/orders').on('value')` - Real-time orders listener
- `database.ref('users/' + uid + '/orders/' + orderId).update()` - Update order status

**Order Statuses:**
- **Pending** - Order placed, awaiting processing
- **Processing** - Order is being prepared
- **Shipped** - Order is on the way
- **Delivered** - Order successfully delivered
- **Cancelled** - Order was cancelled

**Real-time Updates:**
When admin changes order status in admin dashboard, the user's orders page updates automatically without refresh!

---

### **7. products.html** - Products Listing Page

**Purpose:** Shows all available furniture products with filtering and search.

**Features:**
- Product grid display
- Category filtering
- Price range filtering
- Search functionality
- Sort by price/name/date
- Pagination
- Add to cart and wishlist buttons

**Connected JavaScript Files:**
- `js/app.js` - Product loading and filtering

**Key Functions:**
- `loadProducts()` - Fetches all products
- `filterByCategory(categoryId)` - Shows only selected category
- `filterByPrice(min, max)` - Price range filter
- `searchProducts(query)` - Text search
- `sortProducts(sortBy)` - Sorting functionality

---

### **6. admin-dashboard.html** - Admin Control Panel

**Purpose:** Allows administrators to manage the entire website.

**Features:**
- Dashboard overview with statistics
- Product management (add, edit, delete)
- Category management
- Order management (view, update status)
- User management
- Team member management
- Deals management
- Settings configuration

**Connected JavaScript Files:**
- `js/admin.js` - Main admin functionality
- `js/admin-auth.js` - Admin authentication check

**Key JavaScript Functions:**

1. **`checkAdminAuth()`** - Verifies user is admin
   - Checks user role in database
   - Redirects non-admins to homepage

2. **`loadDashboardStats()`** - Shows statistics
   - Total products, orders, users, revenue
   - Recent orders list
   - Low stock alerts

3. **`showSection(sectionName)`** - Navigation between admin sections
   - Hides all sections
   - Shows selected section
   - Updates active menu item

4. **`addProduct()`** - Creates new product
   - Shows product form modal
   - Validates all fields
   - Uploads image (if using Storage)
   - Saves to Firebase database
   - Updates product count in category

5. **`editProduct(productId)`** - Updates existing product
   - Loads product data into form
   - Allows editing all fields
   - Saves changes to Firebase

6. **`deleteProduct(productId)`** - Removes product
   - Shows confirmation dialog
   - Deletes from Firebase
   - Updates category product count
   - Removes from any carts/wishlists

7. **`updateOrderStatus(orderId, newStatus)`** - Changes order status
   - Updates status in Firebase
   - Sends notification to user (future feature)
   - Updates order history

8. **`addCategory()`** - Creates new category
   - Validates category name and slug
   - Assigns icon emoji
   - Saves to Firebase

9. **`deleteCategory(categoryId)`** - Removes category
   - Checks if any products use this category
   - Shows warning if products exist
   - Deletes from Firebase

10. **`addTeamMember()`** - Adds new team member
    - Form with name, role, bio, image, social links
    - Saves to Firebase `team/` node

11. **`updateSettings()`** - Modifies store settings
    - Store name, delivery fee, currency
    - Map location (lat, lng, address)
    - Social media links

**Firebase Functions Used:**
- `database.ref('products').push()` - Add new product
- `database.ref('products/' + id).update()` - Edit product
- `database.ref('products/' + id).remove()` - Delete product
- `database.ref('orders').on('value')` - Listen for new orders
- `database.ref('orders/' + id + '/status').set()` - Update order status
- `database.ref('categories').push()` - Add category
- `database.ref('team').push()` - Add team member
- `database.ref('settings').update()` - Update settings

---

### **7. team.html** - Team Members Page

**Purpose:** Displays all team members with their roles and information.

**Connected JavaScript File:**
- `js/team.js`

**Key Function:**
- `loadTeam()` - Fetches team members from Firebase and displays them

---

### **8. Policy Pages** (privacy-policy.html, terms.html, faq.html, careers.html)

**Purpose:** Static informational pages.

**Features:**
- Consistent header with navigation
- Styled content sections
- Links back to main site

---

## 🔧 JavaScript Functions Explained

### **js/firebase-config.js** - Core Firebase Functions

**Purpose:** Initializes Firebase and provides core authentication and database functions used throughout the site.

**Key Functions:**

1. **`initializeDatabaseStructure()`** (Line 35)
   - **Purpose:** Sets up default data when database is empty
   - **What it does:**
     - Checks if categories exist, if not creates 6 default categories
     - Checks if products exist, if not creates 3 sample products
     - Checks if settings exist, if not creates default store settings
   - **When it runs:** On page load (line 486)

2. **`auth.onAuthStateChanged(callback)`** (Line 188)
   - **Purpose:** Monitors user login/logout status in real-time
   - **What it does:**
     - Runs whenever user logs in or out
     - Updates `appState.user` with current user
     - Checks if user is admin by querying database
     - Updates UI to show/hide login buttons and user menu
     - Loads user's cart and wishlist
   - **Important:** This function runs automatically on every page

3. **`updateUserInterface(userData)`** (Line 248)
   - **Purpose:** Shows/hides UI elements based on login status
   - **What it does:**
     - If logged in: Hides login/signup buttons, shows user menu and cart
     - If logged out: Shows login/signup buttons, hides user menu and cart
     - Updates user name display
     - Hides admin button (admin access is via special URL)

4. **`loadUserCart(userId)`** (Line 318)
   - **Purpose:** Fetches user's shopping cart from Firebase
   - **What it does:**
     - Listens to `users/{uid}/cart` in database
     - Updates `appState.cart` array
     - Calls `updateCartCount()` to update cart badge
   - **Real-time:** Uses `.on('value')` so cart updates automatically

5. **`loadUserWishlist(userId)`** (Line 332)
   - **Purpose:** Fetches user's wishlist from Firebase
   - **What it does:**
     - Listens to `users/{uid}/wishlist` in database
     - Updates `appState.wishlist` array
     - Updates heart icons on product cards
   - **Real-time:** Uses `.on('value')` so wishlist updates automatically

6. **`updateCartCount()`** (Line 346)
   - **Purpose:** Updates the cart badge number in navbar
   - **What it does:**
     - Counts total items in cart (sum of all quantities)
     - Updates badge text
     - Hides badge if cart is empty

7. **`addToCartFirebase(productId)`** (Line 369)
   - **Purpose:** Adds a product to user's cart
   - **Parameters:** `productId` - The ID of product to add
   - **What it does:**
     - Checks if user is logged in (redirects to login if not)
     - Checks if product exists
     - If product already in cart: increases quantity by 1
     - If new product: adds to cart with quantity 1
     - Updates Firebase database
     - Shows success notification
   - **Used by:** "Add to Cart" buttons throughout site

8. **`toggleWishlist(productId)`** (Line 421)
   - **Purpose:** Adds/removes product from wishlist
   - **What it does:**
     - Checks if user is logged in
     - If product in wishlist: removes it
     - If not in wishlist: adds it
     - Updates Firebase database
     - Toggles heart icon color
   - **Used by:** Heart icon buttons on product cards

9. **`logout()`** (Line 460)
   - **Purpose:** Logs out the current user
   - **What it does:**
     - Calls `firebase.auth().signOut()`
     - Shows success notification
     - Redirects to homepage
   - **Used by:** Logout button in user menu

10. **`showToast(message, type)`** (Line 473)
    - **Purpose:** Shows notification messages
    - **Parameters:**
      - `message` - Text to display
      - `type` - 'success', 'error', 'info', or 'warning'
    - **What it does:**
      - Creates toast notification element
      - Styles it based on type (green for success, red for error)
      - Shows for 3 seconds then disappears
    - **Used by:** All functions that need to show user feedback

**Global Variables Exported (Line 511-520):**
```javascript
window.auth = auth;                    // Firebase authentication object
window.database = database;            // Firebase database object
window.storage = storage;              // Firebase storage object
window.appState = appState;            // Global state (user, cart, wishlist)
window.addToCart = addToCartFirebase;  // Add to cart function
window.toggleWishlist = toggleWishlist;// Wishlist function
window.logout = logout;                // Logout function
window.showToast = showToast;          // Notification function
```

These are made global so any page can use them by calling `window.addToCart()` or just `addToCart()`.

---

### **js/app.js** - Main Application Logic

**Purpose:** Controls the homepage functionality including categories, products, and deals display.

**Key Functions:**

1. **`initializeApp()`**
   - Initializes the application
   - Sets up event listeners
   - Loads initial data

2. **`loadCategories()`**
   - **Purpose:** Fetches and displays furniture categories
   - **What it does:**
     - Reads from `database.ref('categories')`
     - Creates HTML cards for each category
     - Adds click handlers to navigate to filtered products
     - Updates category count

3. **`loadFeaturedProducts()`**
   - **Purpose:** Shows featured products on homepage
   - **What it does:**
     - Queries products where `featured: true`
     - Creates product cards with image, name, price
     - Adds "Add to Cart" and "Wishlist" buttons
     - Limits to first 8 products

4. **`loadDeals()`**
   - **Purpose:** Shows products with active deals
   - **What it does:**
     - Reads from `database.ref('deals')`
     - Fetches associated products
     - Displays discount percentage
     - Shows original and discounted prices

5. **`loadProducts(categoryId = null)`**
   - **Purpose:** Loads all products or filtered by category
   - **Parameters:** `categoryId` - Optional category filter
   - **What it does:**
     - Reads from `database.ref('products')`
     - Filters by category if provided
     - Creates product grid
     - Handles pagination if many products

6. **`searchProducts(query)`**
   - **Purpose:** Searches products by name or description
   - **Parameters:** `query` - Search text
   - **What it does:**
     - Filters products array
     - Checks if query matches product name or description
     - Re-renders product grid with results

7. **`filterProducts(filters)`**
   - **Purpose:** Advanced filtering (price range, category, rating)
   - **Parameters:** `filters` - Object with filter criteria
   - **What it does:**
     - Applies multiple filters simultaneously
     - Updates product display
     - Shows filter count

8. **`sortProducts(sortBy)`**
   - **Purpose:** Sorts products by different criteria
   - **Parameters:** `sortBy` - 'price-low', 'price-high', 'name', 'newest'
   - **What it does:**
     - Sorts products array
     - Re-renders display

9. **`createProductCard(product)`**
   - **Purpose:** Generates HTML for a product card
   - **Parameters:** `product` - Product object from database
   - **Returns:** HTML string
   - **What it includes:**
     - Product image
     - Name and price
     - Discount badge if on sale
     - Add to cart button
     - Wishlist heart button
     - Quick view button

---

### **js/cart.js** - Shopping Cart Functions

**Purpose:** Manages shopping cart functionality.

**Key Functions:**

1. **`loadCart()`**
   - Fetches cart items for logged-in user
   - Displays each item with quantity controls
   - Calculates and shows totals

2. **`updateCartItem(productId, quantity)`**
   - Updates quantity of specific cart item
   - If quantity = 0, removes item
   - Updates Firebase
   - Recalculates total

3. **`removeCartItem(productId)`**
   - Removes item from cart
   - Updates Firebase
   - Shows confirmation

4. **`clearCart()`**
   - Removes all items from cart
   - Used after successful checkout

5. **`calculateCartTotal()`**
   - Sums all item prices × quantities
   - Adds delivery fee if applicable
   - Returns total amount

6. **`proceedToCheckout()`**
   - Validates cart is not empty
   - Shows shipping address form
   - Creates order in Firebase
   - Clears cart
   - Redirects to thank you page

---

### **js/admin.js** - Admin Dashboard Functions

**Purpose:** Provides all admin management functionality.

**Key Sections:**

**Product Management:**
- `loadProducts()` - Shows all products in admin table
- `showAddProductModal()` - Opens form to add new product
- `saveProduct()` - Saves new or edited product to Firebase
- `editProduct(id)` - Loads product data for editing
- `deleteProduct(id)` - Removes product after confirmation

**Category Management:**
- `loadCategories()` - Shows all categories in table
- `addCategory()` - Creates new category
- `editCategory(id)` - Updates category details
- `deleteCategory(id)` - Removes category (checks for products first)

**Order Management:**
- `loadOrders()` - Shows all orders with filters
- `filterOrders(status)` - Shows only orders with specific status
- `viewOrderDetails(orderId)` - Shows order details modal
- `updateOrderStatus(orderId, status)` - Changes order status
- `deleteOrder(id)` - Removes order (careful!)

**User Management:**
- `loadUsers()` - Shows all registered users
- `viewUserDetails(userId)` - Shows user profile and orders
- `changeUserRole(userId, newRole)` - Makes user admin or customer
- `deleteUser(userId)` - Removes user account

**Team Management:**
- `loadTeam()` - Shows all team members
- `addTeamMember()` - Adds new team member
- `editTeamMember(id)` - Updates member details
- `deleteTeamMember(id)` - Removes team member

**Deals Management:**
- `loadDeals()` - Shows all active deals
- `createDeal(productId, discount, expiry)` - Creates new deal
- `deleteDeal(dealId)` - Removes deal

**Settings:**
- `loadSettings()` - Loads store configuration
- `updateSettings()` - Saves updated settings
- `updateMapLocation(lat, lng, address)` - Updates map location

---

### **js/map.js** - Interactive Map Functions

**Purpose:** Displays store location using Leaflet.js.

**Key Functions:**

1. **`initMap()`**
   - **Purpose:** Creates and displays the map
   - **What it does:**
     - Gets location from Firebase `settings/location`
     - Creates Leaflet map instance
     - Adds OpenStreetMap tiles
     - Places marker at store location
     - Adds popup with store info
     - Sets zoom level and controls

2. **`updateMapLocation(lat, lng, address)`**
   - **Purpose:** Updates map marker (used in admin)
   - **What it does:**
     - Moves marker to new coordinates
     - Updates popup text
     - Saves new location to Firebase

**Map Configuration:**
```javascript
const map = L.map('map').setView([31.5204, 74.3587], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);
```

---

### **js/email-config.js** - Contact Form Functions

**Purpose:** Sends contact form emails using EmailJS.

**EmailJS Configuration:**
```javascript
emailjs.init("YOUR_USER_ID");
```

**Key Function:**

1. **`sendEmail(event)`**
   - **Purpose:** Sends contact form submission via EmailJS
   - **Parameters:** `event` - Form submit event
   - **What it does:**
     - Prevents default form submission
     - Validates all fields are filled
     - Sends email using EmailJS
     - Shows success/error message
     - Resets form on success

**EmailJS Service Setup:**
- Service ID: Connects to email provider (Gmail, Outlook, etc.)
- Template ID: Defines email format
- User ID: Your EmailJS account ID

See `EmailJS_Setup_Guide.md` for detailed setup instructions.

---

### **js/auth.js** - Authentication Helpers

**Purpose:** Helper functions for authentication across the site.

**Key Functions:**

1. **`redirectIfLoggedIn()`**
   - Checks if user is logged in
   - If yes, redirects to homepage
   - Used on login/signup page

2. **`requireAuth()`**
   - Checks if user is logged in
   - If not, redirects to login page
   - Used on protected pages (cart, profile)

3. **`requireAdmin()`**
   - Checks if user is admin
   - If not, redirects to homepage
   - Used on admin pages

---

### **js/profile.js** - Profile Page Functions

**Purpose:** Manages user profile functionality.

(See detailed explanation in profile.html section above)

---

## 🔗 How Files are Connected

### **Connection Flow:**

```
1. index.html
   ├── Loads: css/styles.css (styling)
   ├── Loads: js/firebase-config.js (Firebase initialization)
   ├── Loads: js/app.js (homepage logic)
   ├── Loads: js/map.js (store location map)
   ├── Loads: js/email-config.js (contact form)
   └── Loads: js/auth.js (authentication helpers)

2. client-login.html
   ├── Loads: css/styles.css
   ├── Loads: js/firebase-config.js
   ├── Contains: All authentication logic inline in <script> tag
   └── On Success: Redirects to index.html or admin-dashboard.html

3. profile.html
   ├── Loads: css/styles.css
   ├── Loads: js/firebase-config.js
   ├── Loads: js/profile.js
   └── Requires: User must be logged in (checks auth state)

4. cart.html
   ├── Loads: css/styles.css
   ├── Loads: js/firebase-config.js
   ├── Loads: js/cart.js
   └── Requires: User must be logged in

5. admin-dashboard.html
   ├── Loads: css/styles.css
   ├── Loads: js/firebase-config.js
   ├── Loads: js/admin-auth.js (checks admin role)
   ├── Loads: js/admin.js (admin functionality)
   └── Requires: User must be admin

6. team.html
   ├── Loads: css/styles.css
   ├── Loads: js/firebase-config.js
   └── Loads: js/team.js

7. Policy Pages (privacy-policy.html, terms.html, etc.)
   ├── Loads: css/styles.css
   └── Static content (no JavaScript needed)
```

### **JavaScript Loading Order (Important!):**

Always load scripts in this order:
1. **Firebase SDK scripts** (app, auth, database, storage)
2. **firebase-config.js** - Must load first, initializes Firebase
3. **Other libraries** (Leaflet, EmailJS, Font Awesome)
4. **Page-specific scripts** (app.js, admin.js, etc.)

**Why?** Each script depends on the previous ones being loaded.

### **CSS Structure:**

`css/styles.css` contains styles for ALL pages organized in sections:
- Reset & Global Styles
- Header & Navigation
- Buttons & Forms
- Product Cards
- Cart Styles
- Admin Dashboard Styles
- Profile Page Styles
- Policy Pages Styles
- Responsive Media Queries

---

## ✨ Features Overview

### **1. User Authentication**
- Email/password signup and login
- Google OAuth social login
- Password reset via email
- Email verification on signup
- Automatic session management
- Role-based access (user/admin)

### **2. Product Management**
- Browse all products
- Filter by category
- Search by name/description
- Sort by price/name/date
- View product details
- Add to cart
- Add to wishlist
- Product ratings and reviews

### **3. Shopping Cart**
- Add/remove products
- Update quantities
- Real-time total calculation
- Delivery fee calculation
- Free delivery threshold
- Cart persists across sessions

### **4. Order Management**
- Checkout process
- Order history
- Order status tracking
- Order details view

### **5. Admin Dashboard**
- Product CRUD operations
- Category management
- Order management
- User management
- Team management
- Deals/discounts management
- Store settings configuration
- Map location management

### **6. Additional Features**
- Interactive store location map
- Contact form with EmailJS
- Team members page
- Policy pages
- Responsive design
- Toast notifications
- Loading states
- Error handling
- Bot prevention (reCAPTCHA)

---

## 🚀 Setup Instructions

### **Prerequisites:**
1. A computer with a web browser
2. Text editor (VS Code recommended)
3. Python installed (for local server)
4. Git (optional, for version control)

### **Step 1: Download the Project**
```bash
git clone <repository-url>
cd Maryam-s-Furniture-Store
```

### **Step 2: Firebase Setup**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. The project is already created: `furniture-shop-aa5fb`
3. Firebase config is already in `js/firebase-config.js`
4. No changes needed unless you want your own Firebase project

### **Step 3: Run Local Server**

**Option 1: Python (Recommended)**
```bash
# Navigate to project folder
cd Maryam-s-Furniture-Store

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Open browser to:
http://localhost:8000
```

**Option 2: VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

**Option 3: Node.js http-server**
```bash
npm install -g http-server
http-server -p 8000
```

**Option 4: PHP**
```bash
php -S localhost:8000
```

### **Step 4: EmailJS Setup**
See `EmailJS_Setup_Guide.md` for detailed instructions to set up contact form.

### **Step 5: Test the Website**
1. Open `http://localhost:8000/index.html`
2. Click "Sign Up" and create a test account
3. Browse products and add to cart
4. Test all features

### **Step 6: Admin Access**
To access admin dashboard:
1. Open Firebase Console
2. Go to Realtime Database
3. Find your user in `users/` node
4. Change `role` from "user" to "admin"
5. Refresh website
6. Go to `http://localhost:8000/admin-dashboard.html`

---

## ❗ Common Issues & Solutions

### **Issue 1: Firebase SDK Errors**
**Error:** "Uncaught SyntaxError: export declarations may only appear at top level"
**Solution:** Make sure you're using `-compat` versions:
```html
<script src=".../firebase-app-compat.js"></script>
<script src=".../firebase-auth-compat.js"></script>
<script src=".../firebase-database-compat.js"></script>
```

### **Issue 2: Social Login Not Working**
**Error:** "This operation is not supported in the environment"
**Cause:** Opening HTML files directly (file:// protocol)
**Solution:** Run on local server (http://localhost)

### **Issue 3: Unauthorized Domain**
**Error:** "This domain is not authorized for OAuth"
**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Add `localhost` and `127.0.0.1` to authorized domains

### **Issue 4: Products Not Loading**
**Cause:** Firebase database rules or empty database
**Solution:**
1. Check Firebase Console → Realtime Database
2. Ensure data exists (run `initializeDatabaseStructure()`)
3. Check database rules allow read access

### **Issue 5: Cart Not Working**
**Cause:** User not logged in or Firebase rules
**Solution:**
1. Make sure user is logged in
2. Check Firebase rules allow authenticated users to write to their cart

### **Issue 6: Contact Form Not Working**
**Cause:** EmailJS not configured
**Solution:** Follow `EmailJS_Setup_Guide.md` to set up EmailJS account and get credentials

### **Issue 7: Map Not Displaying**
**Cause:** Leaflet.js not loaded or location not set
**Solution:**
1. Check browser console for errors
2. Ensure Leaflet CSS and JS are loaded
3. Set location in admin settings

---

## 📊 Database Security Rules

Located in: `database.rules.json`

```json
{
  "rules": {
    "categories": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "products": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid === $userId",
        ".write": "auth != null && auth.uid === $userId"
      }
    },
    "orders": {
      ".read": "auth != null",
      "$orderId": {
        ".write": "auth != null"
      }
    }
  }
}
```

**What this means:**
- **Categories & Products:** Anyone can read, only admins can write
- **Users:** Users can only read/write their own data
- **Orders:** Logged-in users can read all orders and create new ones

---

## 🔐 Security Best Practices

1. **Never commit Firebase API keys to public repos** (already done - keys are public in our case but protected by Firebase rules)
2. **Always validate user input** on both client and server side
3. **Use Firebase Security Rules** to protect database
4. **Implement proper authentication** - always check user is logged in
5. **Use HTTPS in production** - required for OAuth
6. **Sanitize user input** to prevent XSS attacks
7. **Don't store sensitive data** in Firebase (use Firebase Admin SDK on server for sensitive operations)

---

## 🎨 Customization Guide

### **Change Store Name:**
1. Open `js/firebase-config.js`
2. Update default settings (line 168):
```javascript
storeName: "Your Store Name"
```

### **Change Colors:**
Open `css/styles.css` and update CSS variables or colors:
```css
:root {
    --primary-color: #e67e22;
    --secondary-color: #2c3e50;
}
```

### **Add New Product:**
1. Go to Admin Dashboard
2. Click "Products" → "Add Product"
3. Fill form and save

### **Change Map Location:**
1. Go to Admin Dashboard
2. Click "Settings"
3. Update location coordinates and address

### **Modify Hero Video:**
1. Replace video file in `assets/videos/`
2. Update video source in `index.html`:
```html
<source src="assets/videos/your-video.mp4" type="video/mp4">
```

---

## 📞 Support & Contact

For questions about this codebase:
- Email: tahirzamankhalid@email.com
- Review the inline code comments
- Check Firebase documentation: https://firebase.google.com/docs

---

## 📝 Summary

This website is a fully functional e-commerce furniture store built with:
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Backend:** Firebase (Authentication, Realtime Database, Storage)
- **Libraries:** Leaflet.js (maps), EmailJS (contact form), Font Awesome (icons)

The code is organized into:
- **HTML pages** for different sections
- **JavaScript files** for functionality
- **CSS file** for styling
- **Firebase** for data and authentication

All functions are explained above. The architecture follows a simple client-side approach with Firebase handling all backend operations.

---

**End of Master Guide**

*Last Updated: November 2024*
*Created by: Tahir Zaman Khalid*
