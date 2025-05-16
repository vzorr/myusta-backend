// diagnostic.js
require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { DATABASE } = require('./src/config/index');

console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Database config:', {
  host: DATABASE.HOST,
  database: DATABASE.NAME,
  username: DATABASE.USERNAME,
  // password hidden for security
  dialect: DATABASE.DIALECT
});

// Create a Sequelize instance
const sequelize = new Sequelize(
  DATABASE.NAME,
  DATABASE.USERNAME,
  DATABASE.PASSWORD,
  {
    host: DATABASE.HOST,
    port: parseInt(DATABASE.PORT, 10),
    dialect: DATABASE.DIALECT,
    logging: console.log,
    define: {
      underscored: true,
      timestamps: true
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Check available tables
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Tables in database:', tables);
    
    // Test each model individually
    console.log('\nTesting individual models:');
    const modelFiles = fs.readdirSync(path.join(__dirname, 'src/models'))
      .filter(file => file !== 'index.js' && file.endsWith('.js'));
    
    for (const file of modelFiles) {
      try {
        console.log(`\nLoading model: ${file}`);
        const modelPath = path.join(__dirname, 'src/models', file);
        const modelFn = require(modelPath);
        const model = modelFn(sequelize, Sequelize.DataTypes);
        console.log(`✅ Successfully loaded model: ${model.name}`);
        
        // Try a simple query
        const count = await model.count();
        console.log(`- ${model.name} record count: ${count}`);
      } catch (error) {
        console.error(`❌ Error loading model ${file}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

testConnection();