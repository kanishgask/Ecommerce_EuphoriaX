const app = require('./app');
const config = require('./config/config');

const PORT = config.port || 3007;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT} in ${config.env} mode`);
});
