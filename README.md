# Abba's Delight Backend API

A comprehensive backend API for the Abba's Delight Bakery order management system. This API handles customer orders, vendor management, and automated email notifications.

## 🚀 Features

- **Order Management**: Create, read, update, and track customer orders
- **Vendor Dashboard**: Complete vendor interface for order management
- **Email Notifications**: Automated order confirmations and status updates
- **Order Statistics**: Analytics and reporting for business insights
- **RESTful API**: Clean, well-documented API endpoints
- **Input Validation**: Comprehensive data validation and error handling
- **Security**: Rate limiting, CORS protection, and input sanitization

## 📋 Prerequisites

- Node.js (version 14.0.0 or higher)
- npm or yarn package manager
- SMTP email service (Gmail, SendGrid, etc.) for notifications

## 🛠️ Installation

1. **Clone or download the backend files**
   ```bash
   # If you have the files locally, navigate to the backend directory
   cd abbas-delight-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit the .env file with your configuration
   nano .env
   ```

4. **Configure email settings** (optional but recommended)
   ```env
   # Gmail example
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   VENDOR_EMAIL=vendor@abbasdelight.com
   ```

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📚 API Endpoints

### Health Check
- `GET /health` - Server health status

### Orders
- `GET /api/orders` - Get all orders (with pagination and filtering)
- `GET /api/orders/:orderId` - Get specific order details
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:orderId/status` - Update order status
- `POST /api/orders/:orderId/messages` - Add message to order
- `GET /api/orders/stats/overview` - Get order statistics

### Vendor Management
- `GET /api/vendor/dashboard` - Get vendor dashboard data
- `GET /api/vendor/orders` - Get orders for vendor management
- `GET /api/vendor/orders/:orderId` - Get order details for vendor
- `PATCH /api/vendor/orders/:orderId/status` - Update order status (vendor)
- `POST /api/vendor/orders/:orderId/message` - Send message to customer
- `GET /api/vendor/analytics` - Get vendor analytics

## 📝 API Usage Examples

### Creating an Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerPhone": "+375255266598",
    "customerEmail": "john@example.com",
    "customerAddress": "123 Main St, Minsk, Belarus",
    "deliveryTime": "2024-01-15T14:00:00.000Z",
    "specialInstructions": "Please ring the doorbell twice",
    "items": [
      {
        "id": "1",
        "name": "Meat Pie",
        "price": 1.50,
        "quantity": 2,
        "unit": "pc"
      },
      {
        "id": "5",
        "name": "Puff-Puff",
        "price": 1.50,
        "quantity": 6,
        "unit": "pc"
      }
    ]
  }'
```

### Getting Order Statistics

```bash
curl http://localhost:3000/api/orders/stats/overview
```

### Updating Order Status

```bash
curl -X PATCH http://localhost:3000/api/vendor/orders/AD1704112345678001/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "preparing",
    "message": "Your order is being prepared and will be ready in 30 minutes."
  }'
```

## 📧 Email Configuration

The system supports automated email notifications. Configure your SMTP settings in the `.env` file:

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

### Other SMTP Providers
- **SendGrid**: Use `smtp.sendgrid.net` as host
- **Mailgun**: Use `smtp.mailgun.org` as host
- **Outlook**: Use `smtp-mail.outlook.com` as host

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `SMTP_HOST` | SMTP server host | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_SECURE` | Use SSL/TLS | false |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `VENDOR_EMAIL` | Vendor notification email | - |

## 🗄️ Data Storage

Currently, the system uses in-memory storage for simplicity. For production use, consider integrating with:

- **PostgreSQL** - For relational data
- **MongoDB** - For document-based storage
- **Redis** - For caching and session storage

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive validation using express-validator
- **Helmet**: Security headers and protection
- **Data Sanitization**: Automatic input sanitization

## 📊 Order Status Flow

1. **new** - Order just received
2. **preparing** - Order is being prepared
3. **ready** - Order is ready for pickup/delivery
4. **completed** - Order has been delivered
5. **cancelled** - Order has been cancelled

## 🧪 Testing the API

### Using curl
```bash
# Health check
curl http://localhost:3000/health

# Get all orders
curl http://localhost:3000/api/orders

# Get vendor dashboard
curl http://localhost:3000/api/vendor/dashboard
```

### Using Postman
Import the API collection or use the provided examples above.

## 🚀 Deployment

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name "abbas-delight-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Integration with Frontend

To integrate with your existing HTML frontend:

1. Update the frontend JavaScript to send orders to the backend API
2. Replace localStorage with API calls
3. Add error handling for API responses
4. Update the vendor panel to fetch data from the API

### Example Frontend Integration

```javascript
// Replace the order submission in your frontend
async function submitOrder(orderData) {
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Show success message
      console.log('Order created:', result.data.orderId);
    } else {
      // Show error message
      console.error('Order failed:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

## 📞 Support

For support or questions:
- Email: 0xhephzibah@gmail.com
- Phone: +375 255 266 598

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This is a development version. For production use, ensure you:
- Use a proper database instead of in-memory storage
- Set up proper logging and monitoring
- Configure SSL/TLS certificates
- Set up backup and recovery procedures
- Implement proper authentication and authorization
