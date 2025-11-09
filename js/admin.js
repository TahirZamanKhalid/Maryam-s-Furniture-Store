// Admin Panel JavaScript - Fixed Version
// Maryam's Furniture Shop

// Check admin authentication
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
});

// Check if user is admin
function checkAdminAuth() {
  // Show loading state
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'adminLoading';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    flex-direction: column;
  `;
  loadingOverlay.innerHTML = `
    <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #3498db;"></i>
    <p style="margin-top: 1rem; color: #2c3e50; font-size: 1.1rem;">Verifying admin access...</p>
  `;
  document.body.appendChild(loadingOverlay);

  auth.onAuthStateChanged(async (user) => {
      if (!user) {
          showToast('Please login as admin', 'error');
          // Clear admin session flag
          sessionStorage.removeItem('adminAuthenticated');
          setTimeout(() => {
              window.location.href = 'admin-login.html';
          }, 1000);
          return;
      }

      try {
          // Get user data from database
          const userRef = database.ref(`users/${user.uid}`);
          const snapshot = await userRef.once('value');
          const userData = snapshot.val();

          if (!userData || userData.role !== 'admin') {
              showToast('Access denied. Admin privileges required.', 'error');
              await auth.signOut();
              sessionStorage.removeItem('adminAuthenticated');
              setTimeout(() => {
                  window.location.href = 'index.html';
              }, 1500);
              return;
          }

          // Admin verified - load admin panel
          document.getElementById('adminEmail').textContent = user.email;

          // Remove loading overlay
          if (loadingOverlay && loadingOverlay.parentNode) {
              loadingOverlay.remove();
          }

          // Clear the admin authenticated flag (no longer needed)
          sessionStorage.removeItem('adminAuthenticated');

          // Load admin data
          loadDashboardData();
          loadCategories();
          loadProducts();
          loadDeals();
          loadOrders();
          loadCustomers();
          loadSettings();

      } catch (error) {
          console.error('Admin auth error:', error);
          showToast('Authentication error', 'error');
          sessionStorage.removeItem('adminAuthenticated');
          setTimeout(() => {
              window.location.href = 'admin-login.html';
          }, 1500);
      }
  });
}

// Switch admin tabs
function switchAdminTab(tab) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Update sections
  document.querySelectorAll('.admin-section').forEach(section => {
      section.classList.remove('active');
  });
  document.getElementById(`${tab}Section`).classList.add('active');
}

// Load dashboard data
async function loadDashboardData() {
  try {
      // Get total orders
      const ordersSnapshot = await database.ref('orders').once('value');
      const orders = ordersSnapshot.val() || {};
      const ordersArray = Object.values(orders);
      document.getElementById('totalOrders').textContent = ordersArray.length;
      
      // Calculate total revenue
      const totalRevenue = ordersArray.reduce((sum, order) => sum + (order.total || 0), 0);
      document.getElementById('totalRevenue').textContent = `Rs. ${totalRevenue.toLocaleString()}`;
      
      // Get total customers
      const usersSnapshot = await database.ref('users').once('value');
      const users = usersSnapshot.val() || {};
      const customers = Object.values(users).filter(user => user.role === 'customer' || !user.role);
      document.getElementById('totalCustomers').textContent = customers.length;
      
      // Get total products
      const productsSnapshot = await database.ref('products').once('value');
      const products = productsSnapshot.val() || {};
      document.getElementById('totalProducts').textContent = Object.keys(products).length;
      
      // Load recent orders
      loadRecentOrders(ordersArray.slice(-5).reverse());
      
  } catch (error) {
      console.error('Error loading dashboard data:', error);
  }
}

// Load recent orders
function loadRecentOrders(orders) {
  const container = document.getElementById('recentOrdersList');
  
  if (orders.length === 0) {
      container.innerHTML = '<p class="empty-state">No recent orders</p>';
      return;
  }
  
  container.innerHTML = `
      <table class="admin-table">
          <thead>
              <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
              </tr>
          </thead>
          <tbody>
              ${orders.map(order => `
                  <tr>
                      <td>#${order.id?.substr(-8) || 'N/A'}</td>
                      <td>${order.customerName || 'Guest'}</td>
                      <td>Rs. ${(order.total || 0).toLocaleString()}</td>
                      <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'Pending'}</span></td>
                  </tr>
              `).join('')}
          </tbody>
      </table>
  `;
}

// CATEGORIES MANAGEMENT
function loadCategories() {
  const categoriesRef = database.ref('categories');
  categoriesRef.on('value', snapshot => {
      const categories = snapshot.val() || {};
      appState.categories = categories;
      displayCategories(categories);
      updateCategoryDropdowns(categories);
  });
}

function displayCategories(categories) {
  const tbody = document.getElementById('categoriesList');
  const categoriesArray = Object.entries(categories);
  
  if (categoriesArray.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No categories found</td></tr>';
      return;
  }
  
  tbody.innerHTML = categoriesArray.map(([id, category]) => `
      <tr>
          <td style="font-size: 2rem">${category.icon || '📦'}</td>
          <td>${category.name}</td>
          <td>${category.slug}</td>
          <td>${category.productCount || 0}</td>
          <td><span class="status-badge status-${category.status}">${category.status}</span></td>
          <td>
              <div class="action-buttons">
                  <button onclick="editCategory('${id}')" class="btn-primary btn-sm">
                      <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteCategory('${id}')" class="btn-danger btn-sm">
                      <i class="fas fa-trash"></i>
                  </button>
              </div>
          </td>
      </tr>
  `).join('');
}

function updateCategoryDropdowns(categories) {
  const selects = ['productCategory', 'productCategoryFilter'];
  
  selects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (select) {
          const currentValue = select.value;
          const options = ['<option value="">Select Category</option>'];
          
          Object.entries(categories).forEach(([id, category]) => {
              if (category.status === 'active') {
                  options.push(`<option value="${id}">${category.name}</option>`);
              }
          });
          
          select.innerHTML = options.join('');
          select.value = currentValue;
      }
  });
}

function openCategoryModal(categoryId = null) {
  const modal = document.getElementById('categoryModal');
  const title = document.getElementById('categoryModalTitle');
  
  if (categoryId) {
      title.textContent = 'Edit Category';
      // Load category data
      database.ref(`categories/${categoryId}`).once('value', snapshot => {
          const category = snapshot.val();
          if (category) {
              document.getElementById('categoryId').value = categoryId;
              document.getElementById('categoryName').value = category.name;
              document.getElementById('categoryIcon').value = category.icon;
              document.getElementById('categorySlug').value = category.slug;
              document.getElementById('categoryStatus').value = category.status;
          }
      });
  } else {
      title.textContent = 'Add Category';
      document.getElementById('categoryId').value = '';
      document.querySelector('#categoryModal form').reset();
  }
  
  modal.classList.add('active');
}

function closeCategoryModal() {
  document.getElementById('categoryModal').classList.remove('active');
}

function editCategory(id) {
  openCategoryModal(id);
}

async function saveCategoryData(event) {
  event.preventDefault();
  
  const categoryId = document.getElementById('categoryId').value;
  const categoryData = {
      name: document.getElementById('categoryName').value,
      icon: document.getElementById('categoryIcon').value,
      slug: document.getElementById('categorySlug').value,
      status: document.getElementById('categoryStatus').value,
      updatedAt: Date.now()
  };
  
  try {
      if (categoryId) {
          // Update existing category
          await database.ref(`categories/${categoryId}`).update(categoryData);
          showToast('Category updated successfully', 'success');
      } else {
          // Add new category
          const newCategoryRef = database.ref('categories').push();
          categoryData.id = newCategoryRef.key;
          categoryData.createdAt = Date.now();
          categoryData.productCount = 0;
          await newCategoryRef.set(categoryData);
          showToast('Category added successfully', 'success');
      }
      
      closeCategoryModal();
  } catch (error) {
      console.error('Error saving category:', error);
      showToast('Failed to save category', 'error');
  }
}

async function deleteCategory(id) {
  if (confirm('Are you sure you want to delete this category?')) {
      try {
          await database.ref(`categories/${id}`).remove();
          showToast('Category deleted successfully', 'success');
      } catch (error) {
          console.error('Error deleting category:', error);
          showToast('Failed to delete category', 'error');
      }
  }
}

// PRODUCTS MANAGEMENT
function loadProducts() {
  const productsRef = database.ref('products');
  productsRef.on('value', snapshot => {
      const products = snapshot.val() || {};
      displayProducts(products);
  });
}

function displayProducts(products) {
  const tbody = document.getElementById('productsList');
  const productsArray = Object.entries(products);
  
  if (productsArray.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
      return;
  }
  
  tbody.innerHTML = productsArray.map(([id, product]) => {
      const categoryName = appState.categories[product.category]?.name || 'Uncategorized';
      
      return `
          <tr>
              <td>
                  <img src="${product.images?.[0] || 'placeholder.jpg'}" 
                       alt="${product.name}"
                       onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 font-size=%2212%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
              </td>
              <td>${product.name}</td>
              <td>${categoryName}</td>
              <td>Rs. ${product.price.toLocaleString()}</td>
              <td>${product.stock || 0}</td>
              <td><span class="status-badge status-${product.status}">${product.status}</span></td>
              <td>
                  <div class="action-buttons">
                      <button onclick="editProduct('${id}')" class="btn-primary btn-sm">
                          <i class="fas fa-edit"></i>
                      </button>
                      <button onclick="deleteProduct('${id}')" class="btn-danger btn-sm">
                          <i class="fas fa-trash"></i>
                      </button>
                  </div>
              </td>
          </tr>
      `;
  }).join('');
}

function openProductModal(productId = null) {
  const modal = document.getElementById('productModal');
  const title = document.getElementById('productModalTitle');
  
  if (productId) {
      title.textContent = 'Edit Product';
      // Load product data
      database.ref(`products/${productId}`).once('value', snapshot => {
          const product = snapshot.val();
          if (product) {
              document.getElementById('productId').value = productId;
              document.getElementById('productName').value = product.name;
              document.getElementById('productCategory').value = product.category;
              document.getElementById('productDescription').value = product.description;
              document.getElementById('productPrice').value = product.price;
              document.getElementById('productOriginalPrice').value = product.originalPrice || '';
              document.getElementById('productStock').value = product.stock || 10;
              document.getElementById('productImage').value = product.images?.[0] || '';
              document.getElementById('productFeatured').value = product.featured ? 'true' : 'false';
              document.getElementById('productStatus').value = product.status;
          }
      });
  } else {
      title.textContent = 'Add Product';
      document.getElementById('productId').value = '';
      document.querySelector('#productModal form').reset();
  }
  
  modal.classList.add('active');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
}

function editProduct(id) {
  openProductModal(id);
}

async function saveProductData(event) {
  event.preventDefault();
  
  const productId = document.getElementById('productId').value;
  const productData = {
      name: document.getElementById('productName').value,
      category: document.getElementById('productCategory').value,
      description: document.getElementById('productDescription').value,
      price: parseFloat(document.getElementById('productPrice').value),
      originalPrice: parseFloat(document.getElementById('productOriginalPrice').value) || null,
      stock: parseInt(document.getElementById('productStock').value),
      images: [document.getElementById('productImage').value || 'placeholder.jpg'],
      featured: document.getElementById('productFeatured').value === 'true',
      status: document.getElementById('productStatus').value,
      updatedAt: Date.now()
  };
  
  try {
      if (productId) {
          // Update existing product
          await database.ref(`products/${productId}`).update(productData);
          showToast('Product updated successfully', 'success');
      } else {
          // Add new product
          const newProductRef = database.ref('products').push();
          productData.id = newProductRef.key;
          productData.createdAt = Date.now();
          productData.rating = 0;
          productData.reviews = 0;
          await newProductRef.set(productData);
          
          // Update category product count
          const categoryRef = database.ref(`categories/${productData.category}/productCount`);
          const snapshot = await categoryRef.once('value');
          await categoryRef.set((snapshot.val() || 0) + 1);
          
          showToast('Product added successfully', 'success');
      }
      
      closeProductModal();
  } catch (error) {
      console.error('Error saving product:', error);
      showToast('Failed to save product', 'error');
  }
}

async function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
      try {
          // Get product to update category count
          const productSnapshot = await database.ref(`products/${id}`).once('value');
          const product = productSnapshot.val();
          
          // Delete product
          await database.ref(`products/${id}`).remove();
          
          // Update category product count
          if (product && product.category) {
              const categoryRef = database.ref(`categories/${product.category}/productCount`);
              const snapshot = await categoryRef.once('value');
              const currentCount = snapshot.val() || 0;
              if (currentCount > 0) {
                  await categoryRef.set(currentCount - 1);
              }
          }
          
          showToast('Product deleted successfully', 'success');
      } catch (error) {
          console.error('Error deleting product:', error);
          showToast('Failed to delete product', 'error');
      }
  }
}

// DEALS MANAGEMENT
function loadDeals() {
  const dealsRef = database.ref('deals');
  dealsRef.on('value', snapshot => {
      const deals = snapshot.val() || {};
      displayDeals(deals);
  });
}

function displayDeals(deals) {
  const tbody = document.getElementById('dealsList');
  const dealsArray = Object.entries(deals);
  
  if (dealsArray.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No deals found</td></tr>';
      return;
  }
  
  tbody.innerHTML = dealsArray.map(([id, deal]) => {
      const discount = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);
      
      return `
          <tr>
              <td>
                  <img src="${deal.image || 'placeholder.jpg'}" 
                       alt="${deal.name}"
                       onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 font-size=%2212%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
              </td>
              <td>${deal.name}</td>
              <td>Rs. ${deal.originalPrice.toLocaleString()}</td>
              <td>Rs. ${deal.price.toLocaleString()}</td>
              <td>${discount}% OFF</td>
              <td><span class="status-badge status-${deal.status}">${deal.status}</span></td>
              <td>
                  <div class="action-buttons">
                      <button onclick="editDeal('${id}')" class="btn-primary btn-sm">
                          <i class="fas fa-edit"></i>
                      </button>
                      <button onclick="deleteDeal('${id}')" class="btn-danger btn-sm">
                          <i class="fas fa-trash"></i>
                      </button>
                  </div>
              </td>
          </tr>
      `;
  }).join('');
}

// ORDERS MANAGEMENT
function loadOrders() {
  const ordersRef = database.ref('orders');
  ordersRef.on('value', snapshot => {
      const orders = snapshot.val() || {};
      displayOrders(orders);
  });
}

function displayOrders(orders) {
  const tbody = document.getElementById('ordersList');
  const ordersArray = Object.entries(orders);
  
  if (ordersArray.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
      return;
  }
  
  tbody.innerHTML = ordersArray.reverse().map(([id, order]) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      
      return `
          <tr>
              <td>#${id.substr(-8)}</td>
              <td>${order.customerName || 'Guest'}</td>
              <td>${date}</td>
              <td>Rs. ${(order.total || 0).toLocaleString()}</td>
              <td>
                  <select onchange="updateOrderStatus('${id}', this.value)" class="status-select">
                      <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                      <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                      <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                      <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                      <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
              </td>
              <td>
                  <button onclick="deleteOrder('${id}')" class="btn-danger btn-sm">
                      <i class="fas fa-trash"></i>
                  </button>
              </td>
          </tr>
      `;
  }).join('');
}

async function updateOrderStatus(orderId, status) {
  try {
      await database.ref(`orders/${orderId}`).update({
          status: status,
          updatedAt: Date.now()
      });
      showToast('Order status updated', 'success');
  } catch (error) {
      console.error('Error updating order:', error);
      showToast('Failed to update order status', 'error');
  }
}

async function deleteOrder(id) {
  if (confirm('Delete this order?')) {
      try {
          await database.ref(`orders/${id}`).remove();
          showToast('Order deleted', 'success');
      } catch (error) {
          showToast('Failed to delete order', 'error');
      }
  }
}

// CUSTOMERS MANAGEMENT
function loadCustomers() {
  const usersRef = database.ref('users');
  usersRef.on('value', snapshot => {
      const users = snapshot.val() || {};
      const customers = Object.entries(users).filter(([id, user]) => user.role !== 'admin');
      displayCustomers(customers);
  });
}

function displayCustomers(customers) {
  const tbody = document.getElementById('customersList');
  
  if (customers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No customers found</td></tr>';
      return;
  }
  
  tbody.innerHTML = customers.map(([id, customer]) => {
      const joinDate = new Date(customer.createdAt || Date.now()).toLocaleDateString();
      
      return `
          <tr>
              <td>${customer.name || 'N/A'}</td>
              <td>${customer.email}</td>
              <td>${customer.phone || 'N/A'}</td>
              <td>${customer.orders ? Object.keys(customer.orders).length : 0}</td>
              <td>${joinDate}</td>
              <td>
                  <button onclick="deleteCustomer('${id}')" class="btn-danger btn-sm">
                      <i class="fas fa-trash"></i>
                  </button>
              </td>
          </tr>
      `;
  }).join('');
}

async function deleteCustomer(id) {
  if (confirm('Delete this customer?')) {
      try {
          await database.ref(`users/${id}`).remove();
          showToast('Customer deleted', 'success');
      } catch (error) {
          showToast('Failed to delete customer', 'error');
      }
  }
}

// SETTINGS
async function loadSettings() {
  try {
      const snapshot = await database.ref('settings').once('value');
      const settings = snapshot.val();
      
      if (settings) {
          document.getElementById('storeName').value = settings.storeName || "Maryam's Furniture Shop";
          document.getElementById('currency').value = settings.currency || 'PKR';
          document.getElementById('deliveryFee').value = settings.deliveryFee || 500;
      }
  } catch (error) {
      console.error('Error loading settings:', error);
  }
}

async function updateStoreSettings(event) {
  event.preventDefault();
  
  const settings = {
      storeName: document.getElementById('storeName').value,
      currency: document.getElementById('currency').value,
      deliveryFee: parseFloat(document.getElementById('deliveryFee').value),
      updatedAt: Date.now()
  };
  
  try {
      await database.ref('settings').update(settings);
      showToast('Settings updated successfully', 'success');
  } catch (error) {
      showToast('Failed to update settings', 'error');
  }
}

// Utility functions
function exportData() {
  showToast('Feature coming soon', 'info');
}

function clearCache() {
  if (confirm('Clear cache?')) {
      localStorage.clear();
      sessionStorage.clear();
      showToast('Cache cleared', 'success');
      location.reload();
  }
}

function toggleMaintenanceMode() {
  showToast('Feature coming soon', 'info');
}

function adminLogout() {
  if (confirm('Logout?')) {
      auth.signOut().then(() => {
          sessionStorage.clear();
          window.location.href = 'index.html';
      });
  }
}

function filterAdminProducts() {}
function searchAdminProducts() {}
function filterOrders() {}
function searchCustomers() {}
function openDealModal() { showToast('Deal modal coming soon', 'info'); }
function editDeal(id) { openDealModal(id); }
function deleteDeal(id) {
  if (confirm('Delete this deal?')) {
      database.ref(`deals/${id}`).remove();
      showToast('Deal deleted', 'success');
  }
}

// Export all functions
window.switchAdminTab = switchAdminTab;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.saveCategoryData = saveCategoryData;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.saveProductData = saveProductData;
window.filterAdminProducts = filterAdminProducts;
window.searchAdminProducts = searchAdminProducts;
window.openDealModal = openDealModal;
window.editDeal = editDeal;
window.deleteDeal = deleteDeal;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.filterOrders = filterOrders;
window.deleteCustomer = deleteCustomer;
window.searchCustomers = searchCustomers;
window.updateStoreSettings = updateStoreSettings;
window.exportData = exportData;
window.clearCache = clearCache;
window.toggleMaintenanceMode = toggleMaintenanceMode;
window.adminLogout = adminLogout;