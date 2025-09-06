require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  mongoUri:
    process.env.MONGODB_URI ||
    'mmongodb+srv://event-hub:event-hub@event-hub.uttthob.mongodb.net/event-hub',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
