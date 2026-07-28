require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const notificationRoutes = require('./routes/notificationRoutes');
const logger = require('./utils/logger');

const app = express();
app.use(helmet());
const allowedOrigins = ['https://d222r50ryi3b71.cloudfront.net', 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => callback(null, origin || true),
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));
app.use('/api/v1/notifications', notificationRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

const PORT = process.env.PORT || 4006;
if (require.main === module) {
  app.listen(PORT, () => logger.info(`Notification service listening on port ${PORT}`));
}

module.exports = app;