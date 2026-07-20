const express = require('express');
const controller = require('../controllers/productController');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/authenticate');
const { createProductSchema, updateProductSchema } = require('../validators/productValidators');

const router = express.Router();

// Public catalog browsing
router.get('/', controller.list);
router.get('/search', controller.search);
router.get('/slug/:slug', controller.getBySlug);
router.get('/:productId', controller.getById);

// Admin-only catalog management
router.post('/', authenticate, requireRole('ADMIN'), validate(createProductSchema), controller.create);
router.patch('/:productId', authenticate, requireRole('ADMIN'), validate(updateProductSchema), controller.update);
router.delete('/:productId', authenticate, requireRole('ADMIN'), controller.remove);

module.exports = router;
