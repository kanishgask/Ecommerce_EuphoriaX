/**
 * DynamoDB item shape for the Users table.
 * Table: USERS_TABLE_NAME
 * PK: userId (Cognito sub)
 *
 * {
 *   userId: string (PK),
 *   email: string,
 *   name: string,
 *   phoneNumber?: string,
 *   role: 'USER' | 'ADMIN',
 *   addresses: Array<Address>,
 *   status: 'ACTIVE' | 'SUSPENDED',
 *   createdAt: ISO string,
 *   updatedAt: ISO string,
 *   version: number
 * }
 */
function newUserProfile({ userId, email, name, phoneNumber, role = 'USER' }) {
  const now = new Date().toISOString();
  return {
    userId,
    email,
    name,
    phoneNumber: phoneNumber || null,
    role,
    addresses: [],
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    version: 1
  };
}

module.exports = { newUserProfile };
