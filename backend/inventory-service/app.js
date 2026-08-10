const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const inventoryRoutes = require('./routes/inventory.routes');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://d3mjp5edb9pajn.cloudfront.net',
  'http://localhost:5173',
  'http://localhost:3000'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security Middleware
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Logging Middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory Service API',
      version: '1.0.0',
      description: 'API documentation for the Inventory Microservice'
    },
    servers: [{ url: '/api/v1' }]
  },
  apis: ['./routes/*.js']
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Inventory Service' });
});

// Routes
// Mounted on exact path and root to support API Gateway {proxy+} mapping
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/', inventoryRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
