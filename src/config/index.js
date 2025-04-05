
const dotenv = require('dotenv');

dotenv.config();
module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5500,
  BASE_URL: process.env.BASE_URL || 'http://localhost',
  DATABASE: {
    USERNAME: process.env.DATABASE_USERNAME,
    PASSWORD: process.env.DATABASE_PASSWORD,
    NAME: process.env.DATABASE_NAME,
    HOST: process.env.DATABASE_HOST,
    PORT: process.env.DATABASE_PORT,
    DIALECT: process.env.DATABASE_DIALECT,
    SYNC: process.env.DATABASE_SYNC
  },
  JWT: {
    SECRET_KEY: process.env.SECRET_KEY,
  }
}
