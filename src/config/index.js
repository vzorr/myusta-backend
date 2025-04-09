
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
    SECRET_KEY: process.env.JWT_SECRET_KEY,
    EXPIRES_IN: process.env.JWT_EXPIRATION_TIME,
  },
  EMAIL: {
    SERVICE: process.env.MAIL_SERVICE,
    USER: process.env.MAIL_USER,
    PASSWORD: process.env.MAIL_PASSWORD,
    HOST: process.env.MAIL_HOST,
    PORT: process.env.MAIL_PORT,
  },
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  },
  VONAGE: {
    API_KEY: process.env.VONAGE_API_KEY,
    API_SECRET: process.env.VONAGE_API_SECRET,
    FROM: 'Vonage',
  }
}
