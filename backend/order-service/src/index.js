require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
app.use(helmet());
const allowedOrigins = ['https://d222r50ryi3b71.cloudfront.net', 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'order-service' }));
app.use('/api/v1/orders', orderRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 4005;
if (require.main === module) {
  app.listen(PORT, () => logger.info(`Order service listening on port ${PORT}`));
}

module.exports = app;
