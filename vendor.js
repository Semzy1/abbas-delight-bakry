// vendor.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const ordersStorage = require('../utils/ordersStorage');
const router = express.Router();

// Get vendor dashboard data
router.get('/dashboard', (req, res) => {
  console.log('GET /vendor/dashboard - fetch dashboard data');
  const orders = ordersStorage.getAllOrders();
  const today = new Date().toDateString();
  const todayOrders = orders.filter(order => new Date(order.timestamp).toDateString() === today);
  const pendingOrders = orders.filter(order => order.status !== 'completed').length;

  res.json({
    success: true,
    data: {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      pendingOrders
    }
  });
});

// Get all vendor orders
router.get('/orders', (req, res) => {
  console.log('GET /vendor/orders - fetch all orders');
  const orders = ordersStorage.getAllOrders();
  res.json({ success: true, data: orders });
});

// Get vendor order details
router.get('/orders/:orderId', (req, res) => {
  console.log(`GET /vendor/orders/${req.params.orderId} - fetch order details`);
  const order = ordersStorage.getOrderById(req.params.orderId);
  if (!order) {
    console.log(`Order not found: ${req.params.orderId}`);
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

// Update order status (vendor)
router.patch('/orders/:orderId/status', (req, res) => {
  console.log(`PATCH /vendor/orders/${req.params.orderId}/status - update status`, req.body);
  const { orderId } = req.params;
  const { status, message } = req.body;

  const order = ordersStorage.getOrderById(orderId);
  if (!order) {
    console.log(`Order not found for status update: ${orderId}`);
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  if (typeof status !== 'string' || !['new', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
    console.log('Invalid status value:', status);
    return res.status(400).json({ success: false, error: 'Invalid status value' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  if (message && typeof message === 'string') {
    order.messages.push({
      id: uuidv4(),
      type: 'status_update',
      content: message,
      timestamp: new Date().toISOString()
    });
  }

  ordersStorage.updateOrder(order);

  res.json({ success: true, data: order });
});

// Send message to customer
router.post('/orders/:orderId/message', (req, res) => {
  console.log(`POST /vendor/orders/${req.params.orderId}/message - send message`, req.body);
  const { orderId } = req.params;
  const { type, content } = req.body;

  if (!type || !content) {
    console.log('Message type or content missing');
    return res.status(400).json({ success: false, error: 'Message type and content are required' });
  }

  const order = ordersStorage.getOrderById(orderId);
  if (!order) {
    console.log(`Order not found for sending message: ${orderId}`);
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const message = {
    id: uuidv4(),
    type,
    content,
    timestamp: new Date().toISOString()
  };

  order.messages.push(message);
  ordersStorage.updateOrder(order);

  res.json({ success: true, data: message });
});

// Get vendor analytics (basic example)
router.get('/analytics', (req, res) => {
  console.log('GET /vendor/analytics - fetch analytics');
  const orders = ordersStorage.getAllOrders();
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  res.json({ success: true, data: { totalOrders, completedOrders } });
});

module.exports = router;