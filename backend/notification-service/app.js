const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const notificationRoutes = require('./routes/notification.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Notification Service' });
});

// Routes
app.use('/api/v1/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
