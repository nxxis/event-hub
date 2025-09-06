const { port } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

(async () => {
  try {
    await connectDB();
    app.listen(port, () => console.log(`API on http://localhost:${port}`));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
