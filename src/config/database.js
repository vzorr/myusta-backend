const { Sequelize } = require('sequelize');
const { DATABASE, NODE_ENV } = require('./index');

// Initialize Sequelize using the centralized configuration
const sequelize = new Sequelize(
  DATABASE.NAME,
  DATABASE.USERNAME,
  DATABASE.PASSWORD,
  {
    host: DATABASE.HOST,
    port: parseInt(DATABASE.PORT, 10),
    dialect: DATABASE.DIALECT,
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[INFO] Database connected successfully in "${NODE_ENV}" environment.`);

    // Check if sync is enabled
    if (DATABASE.DB_SYNC === 'true') {
      await sequelize.sync({ alter: true });
      console.log('[INFO] Database synchronized.');
    }

  } catch (error) {
    console.error(`[ERROR] Unable to connect to the database: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
