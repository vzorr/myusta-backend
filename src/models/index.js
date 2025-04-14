'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const db = {};

// Dynamically import all model files
fs
  .readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Associations
const {
  User,
  Job,
  Portfolio,
  Verification,
  ProfessionalDetail,
  Location,
  Availability
} = db;

// User ↔ Job
User.hasMany(Job, { foreignKey: 'userId', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ Portfolio
User.hasMany(Portfolio, { foreignKey: 'userId', as: 'portfolios' });
Portfolio.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ Verification
User.hasMany(Verification, { foreignKey: 'userId', as: 'verifications' });
Verification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ ProfessionalDetail (One-to-One)
User.hasOne(ProfessionalDetail, { foreignKey: 'userId', as: 'professionalDetail' });
ProfessionalDetail.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ Availability
User.hasOne(Availability, { foreignKey: 'userId', as: 'availability' });
Availability.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ Location
User.hasMany(Location, { foreignKey: 'userId', as: 'locations' });
Location.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Job ↔ Location
Location.hasMany(Job, { foreignKey: 'locationId', as: 'jobs' });
Job.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });

// Availability ↔ Location
Location.hasMany(Availability, { foreignKey: 'locationId', as: 'availabilities' });
Availability.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });

// Sequelize setup
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
