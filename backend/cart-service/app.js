const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cartRoutes = require('./routes/cart.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Cart Service' });
});

// Routes
app.use('/api/v1/cart', cartRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
