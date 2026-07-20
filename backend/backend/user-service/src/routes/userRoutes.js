const express = require('express');
const controller = require('../controllers/userController');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/authenticate');
const { updateProfileSchema, updateRoleSchema, updateStatusSchema } = require('../validators/userValidators');

const router = express.Router();

router.use(authenticate);

// Self-service
router.get('/me', controller.getMe);
router.patch('/me', validate(updateProfileSchema), controller.updateMe);

// Admin-only user management
router.get('/', requireRole('ADMIN'), controller.listUsers);
router.get('/:userId', requireRole('ADMIN'), controller.getById);
router.patch('/:userId/role', requireRole('ADMIN'), validate(updateRoleSchema), controller.updateRole);
router.patch('/:userId/status', requireRole('ADMIN'), validate(updateStatusSchema), controller.updateStatus);
router.delete('/:userId', requireRole('ADMIN'), controller.deleteUser);

module.exports = router;
