// orders.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const ordersStorage = require('../utils/ordersStorage');
const emailService = require('../services/emailService');

const router = express.Router();

// Get all orders
router.get('/', (req, res) => {
  console.log('GET /orders - fetch all orders');
  const orders = ordersStorage.getAllOrders();
  res.json({ success: true, data: orders });
});

// Get specific order details
router.get('/:orderId', (req, res) => {
  console.log(`GET /orders/${req.params.orderId} - fetch order details`);
  const order = ordersStorage.getOrderById(req.params.orderId);
  if (!order) {
    console.log(`Order not found: ${req.params.orderId}`);
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

// Create new order
router.post(
  '/',
  [
    body('customerName').isString().notEmpty(),
    body('customerPhone').isString().notEmpty(),
    body('customerEmail').isEmail(),
    body('customerAddress').isString().notEmpty(),
    body('deliveryTime').isISO8601(),
    body('items').isArray({ min: 1 }),
    body('items.*.id').isString().notEmpty(),
    body('items.*.name').isString().notEmpty(),
    body('items.*.price').isFloat({ gt: 0 }),
    body('items.*.quantity').isInt({ gt: 0 }),
  ],
  (req, res) => {
    console.log('POST /orders - create new order, body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      deliveryTime,
      specialInstructions = '',
      items
    } = req.body;

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = {
      id: 'AD' + Date.now(),
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      deliveryTime,
      specialInstructions,
      items,
      total,
      status: 'new',
      timestamp: new Date().toISOString(),
      messages: []
    };

    ordersStorage.addOrder(newOrder);

    // Send order confirmation email (async, no await)
    emailService.sendOrderConfirmation(newOrder).catch((err) => {
      console.error('Error sending order confirmation email:', err);
    });

    res.status(201).json({ success: true, data: { orderId: newOrder.id } });
  }
);

// Update order status
router.patch('/:orderId/status', (req, res) => {
  console.log(`PATCH /orders/${req.params.orderId}/status - update status`, req.body);
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

    // Send status update email (async)
    emailService.sendStatusUpdate(order, message).catch((err) => {
      console.error('Error sending status update email:', err);
    });
  }

  ordersStorage.updateOrder(order);

  res.json({ success: true, data: order });
});

// Add message to order
router.post('/:orderId/messages', (req, res) => {
  console.log(`POST /orders/${req.params.orderId}/messages - add message`, req.body);
  const { orderId } = req.params;
  const { type, content } = req.body;

  if (!type || !content) {
    console.log('Message type or content missing');
    return res.status(400).json({ success: false, error: 'Message type and content are required' });
  }

  const order = ordersStorage.getOrderById(orderId);
  if (!order) {
    console.log(`Order not found for adding message: ${orderId}`);
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

// Get order statistics overview
router.get('/stats/overview', (req, res) => {
  console.log('GET /orders/stats/overview - fetch order stats overview');
  const orders = ordersStorage.getAllOrders();
  const totalOrders = orders.length;
  const statusCounts = {
    new: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0
  };

  orders.forEach(order => {
    if (statusCounts.hasOwnProperty(order.status)) {
      statusCounts[order.status] += 1;
    }
  });

  res.json({
    success: true,
    data: {
      totalOrders,
      statusCounts
    }
  });
});

module.exports = router;8