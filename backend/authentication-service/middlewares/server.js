const app = require('./app');
const config = require('./config/config');

const PORT = config.port || 3001;

app.listen(PORT, () => {
  console.log(`Authentication Service running on port ${PORT} in ${config.env} mode`);
});
