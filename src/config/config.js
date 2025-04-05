const dotenv = require('dotenv');
dotenv.config();

const env = process.env.NODE_ENV || 'development';

// Function to check if environment variables are set
const getEnvVar = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[ERROR] Environment variable "${key}" not found.`);
  }
  return value;
};

console.log(`\x1b[32m[INFO] Running migration in "${env}" environment.\x1b[0m`);

const config = {
  development: {
    username: getEnvVar('DB_USER'),
    password: getEnvVar('DB_PASS'),
    database: getEnvVar('DB_NAME'),
    host: getEnvVar('DB_HOST'),
    port: parseInt(getEnvVar('DB_PORT'), 10),
    dialect: getEnvVar('DB_DIALECT'),
  },
  stage: {
    username: getEnvVar('DB_USER'),
    password: getEnvVar('DB_PASS'),
    database: getEnvVar('DB_NAME'),
    host: getEnvVar('DB_HOST'),
    port: parseInt(getEnvVar('DB_PORT'), 10),
    dialect: getEnvVar('DB_DIALECT'),
  },
  production: {
    username: getEnvVar('DB_USER'),
    password: getEnvVar('DB_PASS'),
    database: getEnvVar('DB_NAME'),
    host: getEnvVar('DB_HOST'),
    port: parseInt(getEnvVar('DB_PORT'), 10),
    dialect: getEnvVar('DB_DIALECT'),
  },
};

module.exports = config[env];
