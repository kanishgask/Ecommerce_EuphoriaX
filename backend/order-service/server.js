const app = require('./app');
const config = require('./config/config');

const PORT = config.port || 3005;

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT} in ${config.env} mode`);
});
