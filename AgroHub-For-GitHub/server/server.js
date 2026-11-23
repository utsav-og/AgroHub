const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const machineryRoutes = require('./routes/machineryRoutes');
const workerRoutes = require('./routes/workerRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Error Handling Middlewares
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Built-in & Third-party Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded image files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    status: 'success',
    message: 'AgroHub backend server is running smoothly',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.send('Welcome to AgroHub API Server. Use /api/health to verify service status.');
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/machinery', machineryRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Fallback Middlewares for 404 & Global Errors
app.use(notFound);
app.use(errorHandler);

// Start Express Server
app.listen(PORT, () => {
  console.log(`[AgroHub Server] Server running on http://localhost:${PORT}`);
  console.log(`[AgroHub Server] CORS configured for: ${CLIENT_URL}`);
});
