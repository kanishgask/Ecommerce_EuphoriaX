const service = require('../services/userService');
const { success } = require('../utils/response');

async function getMe(req, res, next) {
  try {
    const profile = await service.getOrCreateProfile(req.user);
    return success(res, 200, profile);
  } catch (err) { next(err); }
}

async function updateMe(req, res, next) {
  try {
    const updated = await service.updateProfile(req.user.sub, req.body);
    return success(res, 200, updated, 'Profile updated');
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const profile = await service.getById(req.params.userId);
    return success(res, 200, profile);
  } catch (err) { next(err); }
}

async function listUsers(req, res, next) {
  try {
    const { limit, cursor } = req.query;
    const result = await service.listUsers({ limit: limit ? Number(limit) : undefined, cursor });
    return success(res, 200, result);
  } catch (err) { next(err); }
}

async function updateRole(req, res, next) {
  try {
    const { role, version } = req.body;
    const updated = await service.updateRole(req.params.userId, role, version);
    return success(res, 200, updated, 'Role updated');
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const { status, version } = req.body;
    const updated = await service.updateStatus(req.params.userId, status, version);
    return success(res, 200, updated, 'Status updated');
  } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try {
    await service.deleteUser(req.params.userId);
    return success(res, 200, null, 'User deleted');
  } catch (err) { next(err); }
}

module.exports = { getMe, updateMe, getById, listUsers, updateRole, updateStatus, deleteUser };
