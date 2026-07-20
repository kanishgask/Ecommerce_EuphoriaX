const repo = require('../repositories/userRepository');
const { newUserProfile } = require('../models/userModel');
const { AppError } = require('../middleware/errorHandler');

async function getOrCreateProfile(authUser) {
  let profile = await repo.getById(authUser.sub);
  if (!profile) {
    const role = authUser.groups.includes('ADMIN') ? 'ADMIN' : 'USER';
    profile = await repo.upsertFromAuth(newUserProfile({
      userId: authUser.sub,
      email: authUser.username,
      name: authUser.username,
      role
    }));
  }
  return profile;
}

async function updateProfile(userId, patch) {
  const { version, ...rest } = patch;
  try {
    return await repo.update(userId, rest, version);
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      throw new AppError('Profile was modified elsewhere. Please refresh and retry.', 409);
    }
    throw err;
  }
}

async function updateRole(userId, role, version) {
  try {
    return await repo.update(userId, { role }, version);
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      throw new AppError('Record changed concurrently. Please retry.', 409);
    }
    throw err;
  }
}

async function updateStatus(userId, status, version) {
  try {
    return await repo.update(userId, { status }, version);
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      throw new AppError('Record changed concurrently. Please retry.', 409);
    }
    throw err;
  }
}

async function getById(userId) {
  const profile = await repo.getById(userId);
  if (!profile) throw new AppError('User not found', 404);
  return profile;
}

async function listUsers(query) {
  return repo.listAll(query);
}

async function deleteUser(userId) {
  await repo.remove(userId);
  return true;
}

module.exports = { getOrCreateProfile, updateProfile, updateRole, updateStatus, getById, listUsers, deleteUser };
