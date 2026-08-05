const axios = require('axios');
const { AppError } = require('../middleware/errorHandler');

const BASE_URL = process.env.PRODUCT_SERVICE_URL;

async function fetchProduct(productId) {
  try {
    const { data } = await axios.get(`${BASE_URL}/api/v1/products/${productId}`, { timeout: 5000 });
    return data.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      throw new AppError('Product not found', 404);
    }
    throw new AppError('Unable to reach product service', 502);
  }
}

module.exports = { fetchProduct };
