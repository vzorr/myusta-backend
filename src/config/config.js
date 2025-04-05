const { Sequelize } = require('sequelize');
const { DATABASE, NODE_ENV } = require('./index');

// Log the environment in which the migration is running
console.log(`\x1b[32m[INFO] Running migration in "${NODE_ENV}" environment.\x1b[0m`);

// Function to check if a value exists
const checkEnvVar = (value, name) => {
  if (!value) {
    throw new Error(`[ERROR] Environment variable "${name}" not found.`);
  }
  return value;
};

// Validate required environment variables
try {
  checkEnvVar(DATABASE.USERNAME, 'DATABASE_USERNAME');
  checkEnvVar(DATABASE.PASSWORD, 'DATABASE_PASSWORD');
  checkEnvVar(DATABASE.NAME, 'DATABASE_NAME');
  checkEnvVar(DATABASE.HOST, 'DATABASE_HOST');
  checkEnvVar(DATABASE.PORT, 'DATABASE_PORT');
  checkEnvVar(DATABASE.DIALECT, 'DATABASE_DIALECT');
} catch (error) {
  console.error(`\x1b[31m${error.message}\x1b[0m`);
  process.exit(1);
}

// Sequelize configuration object
const config = {
  development: {
    username: DATABASE.USERNAME,
    password: DATABASE.PASSWORD,
    database: DATABASE.NAME,
    host: DATABASE.HOST,
    port: parseInt(DATABASE.PORT, 10),
    dialect: DATABASE.DIALECT,
    logging: false,
  },
  stage: {
    username: DATABASE.USERNAME,
    password: DATABASE.PASSWORD,
    database: DATABASE.NAME,
    host: DATABASE.HOST,
    port: parseInt(DATABASE.PORT, 10),
    dialect: DATABASE.DIALECT,
    logging: false,
  },
  production: {
    username: DATABASE.USERNAME,
    password: DATABASE.PASSWORD,
    database: DATABASE.NAME,
    host: DATABASE.HOST,
    port: parseInt(DATABASE.PORT, 10),
    dialect: DATABASE.DIALECT,
    logging: false,
  },
};

module.exports = config[NODE_ENV || 'development'];
