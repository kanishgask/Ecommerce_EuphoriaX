/**
 * DynamoDB item shape for the Cart table.
 * Table: CART_TABLE_NAME
 * PK: userId (string)
 * SK: productId (string)
 * TTL attribute: expiresAt (epoch seconds) — enables automatic abandoned-cart cleanup
 *
 * {
 *   userId, productId, name, price, currency, image,
 *   quantity, addedAt, updatedAt, expiresAt
 * }
 */
function newCartItem({ userId, productId, name, price, currency, image, quantity }) {
  const now = new Date().toISOString();
  const ttlDays = Number(process.env.CART_ITEM_TTL_DAYS || 30);
  const expiresAt = Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60;

  return {
    userId, productId, name, price, currency: currency || 'USD', image: image || null,
    quantity, addedAt: now, updatedAt: now, expiresAt
  };
}

module.exports = { newCartItem };
