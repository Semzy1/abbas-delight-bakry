// Frontend Integration Example for Abba's Delight
// Replace the existing JavaScript in your HTML file with this enhanced version

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Enhanced order management with backend integration
class OrderManager {
  constructor() {
    this.cart = [];
    this.orders = [];
    this.init();
  }

  async init() {
    // Load existing orders from backend
    await this.loadOrders();
    this.setupEventListeners();
    this.updateOrderSummary();
  }

  async loadOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
      const data = await response.json();
      
      if (data.success) {
        this.orders = data.data.orders;
        this.updateVendorDashboard();
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Fallback to localStorage if backend is not available
      this.orders = JSON.parse(localStorage.getItem('abbasDelightOrders')) || [];
    }
  }

  async submitOrder(orderData) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add to local orders array
        this.orders.unshift(result.data.order);
        
        // Update vendor dashboard
        this.updateVendorDashboard();
        
        // Show success message
        this.showOrderConfirmation(result.data.orderId);
        
        // Reset cart and form
        this.cart = [];
        this.updateOrderSummary();
        document.getElementById('order-form').reset();
        
        return true;
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Failed to submit order: ' + error.message);
      return false;
    }
  }

  async updateOrderStatus(orderId, status, message = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, message })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local order
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          this.orders[orderIndex] = result.data.order;
        }
        
        // Update vendor dashboard
        this.updateVendorDashboard();
        
        return true;
      } else {
        throw new Error(result.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Status update failed:', error);
      alert('Failed to update order status: ' + error.message);
      return false;
    }
  }

  async sendCustomerMessage(orderId, type, content, subject = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/orders/${orderId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, content, subject })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local order with new message
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          if (!this.orders[orderIndex].messages) {
            this.orders[orderIndex].messages = [];
          }
          this.orders[orderIndex].messages.push({
            id: result.data.messageId,
            type,
            content,
            timestamp: new Date().toISOString(),
            sent: result.data.sent
          });
        }
        
        return true;
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Message sending failed:', error);
      alert('Failed to send message: ' + error.message);
      return false;
    }
  }

  setupEventListeners() {
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.cart-item');
        const id = itemElement.getAttribute('data-id');
        const name = itemElement.getAttribute('data-name');
        const price = parseFloat(itemElement.getAttribute('data-price'));
        const unit = itemElement.getAttribute('data-unit') || 'pc';
        
        this.addToCart({ id, name, price, unit });
      });
    });

    // Complete order button
    const completeOrderButton = document.getElementById('complete-order');
    if (completeOrderButton) {
      completeOrderButton.addEventListener('click', () => {
        this.completeOrder();
      });
    }

    // Vendor panel functionality
    this.setupVendorPanel();
  }

  addToCart(item) {
    const existingItemIndex = this.cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      this.cart[existingItemIndex].quantity += 1;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
    
    this.updateOrderSummary();
  }

  updateOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    const orderTotal = document.getElementById('order-total');
    const completeOrderButton = document.getElementById('complete-order');
    
    if (this.cart.length === 0) {
      orderSummary.innerHTML = '<p class="text-center text-gray-500 py-4">Your cart is empty</p>';
      orderTotal.textContent = '0.00₽';
      completeOrderButton.disabled = true;
      completeOrderButton.classList.add('opacity-50', 'cursor-not-allowed');
      return;
    }
    
    let summaryHTML = '';
    let total = 0;
    
    this.cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      summaryHTML += `
        <div class="order-summary-item flex justify-between items-center">
          <div>
            <p class="font-medium">${item.name} (${item.quantity}${item.unit === 'pc' ? 'pc' : ''})</p>
            <button class="remove-item text-sm text-amber-600 hover:text-amber-800" data-id="${item.id}">
              Remove
            </button>
          </div>
          <p>${itemTotal.toFixed(2)}₽</p>
        </div>
      `;
    });
    
    orderSummary.innerHTML = summaryHTML;
    orderTotal.textContent = `${total.toFixed(2)}₽`;
    
    completeOrderButton.disabled = false;
    completeOrderButton.classList.remove('opacity-50', 'cursor-not-allowed');
    
    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const itemId = e.target.getAttribute('data-id');
        const itemIndex = this.cart.findIndex(item => item.id === itemId);
        
        if (itemIndex >= 0) {
          this.cart.splice(itemIndex, 1);
          this.updateOrderSummary();
        }
      });
    });
  }

  async completeOrder() {
    const form = document.getElementById('order-form');
    const formData = new FormData(form);
    
    // Validate form
    const requiredFields = ['customer-name', 'customer-phone', 'customer-email', 'customer-address', 'delivery-time'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('border-red-500');
      } else {
        field.classList.remove('border-red-500');
      }
    });
    
    if (!isValid) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (this.cart.length === 0) {
      alert('Your cart is empty. Please add items before ordering.');
      return;
    }
    
    // Prepare order data
    const orderData = {
      customerName: document.getElementById('customer-name').value.trim(),
      customerPhone: document.getElementById('customer-phone').value.trim(),
      customerEmail: document.getElementById('customer-email').value.trim(),
      customerAddress: document.getElementById('customer-address').value.trim(),
      deliveryTime: document.getElementById('delivery-time').value,
      specialInstructions: document.getElementById('special-instructions').value.trim(),
      items: this.cart
    };
    
    // Submit order
    const success = await this.submitOrder(orderData);
    
    if (success) {
      // Show confirmation modal
      const orderConfirmation = document.getElementById('order-confirmation');
      const confirmedOrderId = document.getElementById('confirmed-order-id');
      confirmedOrderId.textContent = orderData.customerName; // You can get the actual order ID from the response
      orderConfirmation.classList.remove('hidden');
    }
  }

  showOrderConfirmation(orderId) {
    const orderConfirmation = document.getElementById('order-confirmation');
    const confirmedOrderId = document.getElementById('confirmed-order-id');
    confirmedOrderId.textContent = orderId;
    orderConfirmation.classList.remove('hidden');
  }

  setupVendorPanel() {
    // Vendor panel toggle
    const vendorToggle = document.getElementById('vendor-toggle');
    const vendorPanel = document.getElementById('vendor-panel');
    const closeVendorPanel = document.getElementById('close-vendor-panel');
    
    if (vendorToggle && vendorPanel) {
      vendorToggle.addEventListener('click', () => {
        vendorPanel.classList.toggle('open');
        this.updateVendorDashboard();
      });
    }
    
    if (closeVendorPanel && vendorPanel) {
      closeVendorPanel.addEventListener('click', () => {
        vendorPanel.classList.remove('open');
      });
    }

    // Update order status
    const vendorUpdateStatus = document.getElementById('vendor-update-status');
    if (vendorUpdateStatus) {
      vendorUpdateStatus.addEventListener('click', async () => {
        const orderId = vendorUpdateStatus.dataset.orderId;
        const newStatus = document.getElementById('vendor-order-status').value;
        const message = document.getElementById('vendor-custom-message').value;
        
        if (orderId) {
          await this.updateOrderStatus(orderId, newStatus, message);
        }
      });
    }

    // Send customer messages
    const vendorSendEmail = document.getElementById('vendor-send-email');
    const vendorSendWhatsapp = document.getElementById('vendor-send-whatsapp');
    
    if (vendorSendEmail) {
      vendorSendEmail.addEventListener('click', async () => {
        const orderId = vendorUpdateStatus.dataset.orderId;
        const message = document.getElementById('vendor-custom-message').value;
        
        if (orderId && message) {
          await this.sendCustomerMessage(orderId, 'email', message);
        }
      });
    }
    
    if (vendorSendWhatsapp) {
      vendorSendWhatsapp.addEventListener('click', async () => {
        const orderId = vendorUpdateStatus.dataset.orderId;
        const message = document.getElementById('vendor-custom-message').value;
        
        if (orderId && message) {
          await this.sendCustomerMessage(orderId, 'whatsapp', message);
        }
      });
    }
  }

  updateVendorDashboard() {
    // Update vendor stats
    const today = new Date().toDateString();
    const todayOrders = this.orders.filter(order => new Date(order.createdAt).toDateString() === today);
    const pendingOrders = this.orders.filter(order => ['new', 'preparing'].includes(order.status));
    
    const vendorTodayOrders = document.getElementById('vendor-today-orders');
    const vendorPendingOrders = document.getElementById('vendor-pending-orders');
    
    if (vendorTodayOrders) vendorTodayOrders.textContent = todayOrders.length;
    if (vendorPendingOrders) vendorPendingOrders.textContent = pendingOrders.length;
    
    // Update orders list
    this.displayVendorOrders();
  }

  displayVendorOrders() {
    const vendorOrdersList = document.getElementById('vendor-orders-list');
    if (!vendorOrdersList) return;
    
    if (this.orders.length === 0) {
      vendorOrdersList.innerHTML = '<p class="text-center text-gray-500 py-4">No orders yet</p>';
      return;
    }
    
    vendorOrdersList.innerHTML = '';
    
    this.orders.forEach(order => {
      const orderElement = document.createElement('div');
      orderElement.className = 'bg-amber-50 p-3 rounded-lg cursor-pointer hover:bg-amber-100 transition';
      orderElement.innerHTML = `
        <div class="flex justify-between items-center mb-1">
          <h4 class="font-bold">${order.id}</h4>
          <span class="text-xs ${this.getStatusClass(order.status)} px-2 py-1 rounded-full">${order.status}</span>
        </div>
        <p class="text-sm">${order.customerName}</p>
        <p class="text-sm">${order.total.toFixed(2)}₽</p>
        <p class="text-xs text-gray-500">${new Date(order.createdAt).toLocaleString()}</p>
      `;
      
      orderElement.addEventListener('click', () => {
        this.showVendorOrderDetails(order);
      });
      
      vendorOrdersList.appendChild(orderElement);
    });
  }

  showVendorOrderDetails(order) {
    const vendorOrderContent = document.getElementById('vendor-order-content');
    const vendorOrderDetails = document.getElementById('vendor-order-details');
    const vendorOrderStatus = document.getElementById('vendor-order-status');
    const vendorUpdateStatus = document.getElementById('vendor-update-status');
    
    if (vendorOrderContent) {
      vendorOrderContent.innerHTML = `
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Phone:</strong> ${order.customerPhone}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Address:</strong> ${order.customerAddress}</p>
        <p><strong>Delivery:</strong> ${new Date(order.deliveryTime).toLocaleString()}</p>
        <p><strong>Status:</strong> <span class="${this.getStatusClass(order.status)} px-2 py-1 rounded-full">${order.status}</span></p>
        
        <div class="mt-3">
          <strong>Items:</strong>
          <ul class="list-disc list-inside mt-1">
            ${order.items.map(item => `<li>${item.quantity}x ${item.name} - ${(item.quantity * item.price).toFixed(2)}₽</li>`).join('')}
          </ul>
        </div>
        
        <p class="mt-3"><strong>Total:</strong> ${order.total.toFixed(2)}₽</p>
        <p class="mt-1"><strong>Instructions:</strong> ${order.specialInstructions || 'None'}</p>
      `;
    }
    
    if (vendorOrderStatus) vendorOrderStatus.value = order.status;
    if (vendorOrderDetails) vendorOrderDetails.classList.remove('hidden');
    if (vendorUpdateStatus) vendorUpdateStatus.dataset.orderId = order.id;
  }

  getStatusClass(status) {
    const statusClasses = {
      'new': 'order-status-new',
      'preparing': 'order-status-preparing',
      'ready': 'order-status-ready',
      'completed': 'order-status-completed',
      'cancelled': 'order-status-cancelled'
    };
    return statusClasses[status] || 'order-status-new';
  }
}

// Initialize the order manager when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS and Feather Icons
  if (typeof AOS !== 'undefined') AOS.init();
  if (typeof feather !== 'undefined') feather.replace();
  
  // Initialize order manager
  window.orderManager = new OrderManager();
  
  // Close confirmation modal
  const closeConfirmation = document.getElementById('close-confirmation');
  const orderConfirmation = document.getElementById('order-confirmation');
  
  if (closeConfirmation && orderConfirmation) {
    closeConfirmation.addEventListener('click', () => {
      orderConfirmation.classList.add('hidden');
    });
  }
});
