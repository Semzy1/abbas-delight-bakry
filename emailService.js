const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

function isConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

if (isConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendOrderConfirmation(order) {
  if (!transporter) return;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: order.customerEmail,
    subject: `Order Confirmation - ${order.id}`,
    text: `Hello ${order.customerName},\n\nThank you for your order. Your order ID is ${order.id}. We will notify you when it is ready.\n\nBest regards,\nAbba's Delight Bakery`
  };

  await transporter.sendMail(mailOptions);
}

async function sendStatusUpdate(order, message) {
  if (!transporter) return;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: order.customerEmail,
    subject: `Order Status Update - ${order.id}`,
    text: `Hello ${order.customerName},\n\n${message}\n\nBest regards,\nAbba's Delight Bakery`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  isConfigured,
  sendOrderConfirmation,
  sendStatusUpdate
};