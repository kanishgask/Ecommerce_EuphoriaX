const app = require('./app');
const config = require('./config/config');

const PORT = config.port || 3002;

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT} in ${config.env} mode`);
});
