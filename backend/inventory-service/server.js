const app = require('./app');
const config = require('./config/config');

const PORT = config.port || 3004;

app.listen(PORT, () => {
  console.log(`Inventory Service running on port ${PORT} in ${config.env} mode`);
});
