const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false, // Disable SQL logging
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Check if sync is enabled in the environment
    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: true }); // Automatically update table
      console.log('Database synchronized.');
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit on failure
  }
};

module.exports = { sequelize, connectDB };
