const app = require('./app');
const config = require('./config/config');

const PORT = config.port || 3003;

app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT} in ${config.env} mode`);
});
