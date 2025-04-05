
const dotenv = require('dotenv');

dotenv.config();
module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5500,
  BASE_URL: process.env.BASE_URL || 5500,
  DATABASE: {
    USERNAME: process.env.DB_USER,
    PASSWORD: process.env.DB_PASS,
    NAME: process.env.DB_NAME,
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT,
    DIALECT: process.env.DB_DIALECT,
    SYNC: process.env.DB_SYNC
  },
  JWT: {
    SECRET_KEY: process.env.SECRET_KEY,
  }
}
