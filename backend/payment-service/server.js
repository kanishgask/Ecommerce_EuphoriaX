const app = require('./app');
const config = require('./config/config');

const PORT = config.port || 3006;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT} in ${config.env} mode`);
});
