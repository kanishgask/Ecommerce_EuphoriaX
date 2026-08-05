const axios = require('axios');
const { AppError } = require('../middleware/errorHandler');

const BASE_URL = process.env.CART_SERVICE_URL;

async function getCart(accessToken) {
  try {
    const { data } = await axios.get(`${BASE_URL}/api/v1/cart`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 5000
    });
    return data.data;
  } catch (err) {
    throw new AppError('Unable to reach cart service', 502);
  }
}

async function clearCart(accessToken) {
  try {
    await axios.delete(`${BASE_URL}/api/v1/cart`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 5000
    });
  } catch (err) {
    // Non-fatal: order is already placed; cart cleanup can be retried/manual.
  }
}

module.exports = { getCart, clearCart };
