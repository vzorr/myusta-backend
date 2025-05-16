// src/config/database.js - Fixed to prevent USING syntax error
const { Sequelize } = require('sequelize');
const { DATABASE, NODE_ENV } = require('./index');

// Initialize Sequelize with basic configuration
const sequelize = new Sequelize(
  DATABASE.NAME,
  DATABASE.USERNAME,
  DATABASE.PASSWORD,
  {
    host: DATABASE.HOST,
    port: parseInt(DATABASE.PORT, 10),
    dialect: DATABASE.DIALECT,
    logging: msg => console.log(`[SQL] ${msg}`),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true, // Convert camelCase to snake_case for all models
      freezeTableName: false, // Prevent table name pluralization
      timestamps: true, // Automatically manage createdAt and updatedAt
    }
  }
);

// Enhanced connection method with better error reporting
const connectDB = async () => {
  try {
    console.log(`[INFO] Connecting to database ${DATABASE.NAME} on ${DATABASE.HOST}:${DATABASE.PORT}`);
    console.log(`[INFO] Database dialect: ${DATABASE.DIALECT}`);
    
    // Test authentication
    await sequelize.authenticate();
    console.log(`[INFO] Database connected successfully in "${NODE_ENV}" environment.`);

    // Get database schema information
    try {
      const tables = await sequelize.getQueryInterface().showAllTables();
      console.log(`[INFO] Database tables (${tables.length}): ${tables.join(', ')}`);
    } catch (error) {
      console.error('[ERROR] Could not fetch database tables:', error.message);
    }
    
    // IMPORTANT: Disable sync temporarily to avoid USING syntax error
    // if (DATABASE.SYNC === 'true') {
    //   console.log('[INFO] Database sync is enabled. This will alter tables if needed.');
    //   await sequelize.sync({ alter: true });
    //   console.log('[INFO] Database synchronized.');
    // }
    console.log('[INFO] Database sync is disabled. Using migrations instead.');
    
    return true;
  } catch (error) {
    // Provide detailed error information
    console.error('[ERROR] Unable to connect to the database');
    console.error(`[ERROR] Message: ${error.message}`);
    
    // Categorize common database connection errors
    if (error.name === 'SequelizeConnectionRefusedError') {
      console.error('[ERROR] Connection refused. Check if database server is running.');
    } else if (error.name === 'SequelizeHostNotFoundError') {
      console.error('[ERROR] Host not found. Check hostname and network connectivity.');
    } else if (error.name === 'SequelizeAccessDeniedError') {
      console.error('[ERROR] Access denied. Check username and password.');
    } else if (error.name === 'SequelizeConnectionError') {
      console.error('[ERROR] Connection error. Database may be unavailable or credentials incorrect.');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('[ERROR] Database error. SQL query or schema issue.');
    } else {
      console.error('[ERROR] Unexpected database error.');
    }
    
    // Log detailed error info
    console.error('[ERROR] Error details:', {
      name: error.name,
      code: error.original?.code,
      errno: error.original?.errno,
      syscall: error.original?.syscall,
      address: error.original?.address,
      port: error.original?.port,
      stack: error.stack
    });
    
    throw error;
  }
};

module.exports = { sequelize, connectDB };