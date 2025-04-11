'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Import the runtime config

const db = {};

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Job associations
db.User.hasMany(db.Job, { foreignKey: 'userId', as: 'jobs' });
db.Job.belongsTo(db.User, { foreignKey: 'userId', as: 'customer' });

// Professional Detail associations
db.User.hasOne(db.ProfessionalDetail, { foreignKey: 'userId', as: 'professionalDetail' });
db.ProfessionalDetail.belongsTo(db.User, { foreignKey: 'userId', as: 'usta' });

// Location associations
db.Job.belongsTo(db.Location, { foreignKey: 'locationId', as: 'jobLocation' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
