require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Analytics API routes
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Database connection and server startup
const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected successfully');
    
    // Sync models
    await sequelize.sync();
    console.log('✓ Models synced');
    
    // Start server
    app.listen(PORT, () => {
      console.log('=====================================');
      console.log(`Analytics Service running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: ${process.env.DATABASE_PATH || './analytics.sqlite'}`);
      console.log('=====================================');
      console.log('\nAvailable endpoints:');
      console.log('  GET  /health');
      console.log('  POST /api/analytics/visit');
      console.log('  POST /api/analytics/game/start');
      console.log('  POST /api/analytics/game/end');
      console.log('  POST /api/analytics/pageview');
      console.log('  POST /api/analytics/session/end');
      console.log('  GET  /api/analytics/visits/total');
      console.log('  GET  /api/analytics/games/modes');
      console.log('  GET  /api/analytics/sessions/active');
      console.log('  GET  /api/analytics/games/completion');
      console.log('  GET  /api/analytics/pageviews');
      console.log('  GET  /api/analytics/engagement');
      console.log('  GET  /api/analytics/peak-usage');
      console.log('  GET  /api/analytics/dashboard');
      console.log('=====================================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, closing server gracefully...');
  await sequelize.close();
  process.exit(0);
});
