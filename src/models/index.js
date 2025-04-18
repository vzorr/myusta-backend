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
  Availability,
  SavedJob,
  JobProposal,
  Milestone
} = db;

// User ↔ Job
User.hasMany(Job, { foreignKey: 'userId', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

// Location associations
Job.belongsTo(Location, { foreignKey: 'locationId', as: 'jobLocation' });

// User ↔ Portfolio
User.hasMany(Portfolio, { foreignKey: 'userId', as: 'portfolios' });
Portfolio.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ Verification
User.hasMany(Verification, { foreignKey: 'userId', as: 'verifications' });
Verification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ ProfessionalDetail (One-to-One)
User.hasOne(ProfessionalDetail, { foreignKey: 'userId', as: 'professionalDetail' });
ProfessionalDetail.belongsTo(User, { foreignKey: 'userId', as: 'usta' });

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

// SavedJob ↔ User
SavedJob.belongsTo(User, { foreignKey: 'ustaId', as: 'usta' });
SavedJob.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// User ↔ SavedJob
User.hasMany(SavedJob, { foreignKey: 'ustaId', as: 'savedJobs' });

// JobProposal ↔ User (Usta)
User.hasMany(JobProposal, { foreignKey: 'createdBy', as: 'proposals' });
JobProposal.belongsTo(User, { foreignKey: 'createdBy', as: 'usta' });

// JobProposal ↔ Job
Job.hasMany(JobProposal, { foreignKey: 'jobId', as: 'proposals' });
JobProposal.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// JobProposal ↔ Milestone
JobProposal.hasMany(Milestone, { foreignKey: 'jobProposalId', as: 'milestones' });
Milestone.belongsTo(JobProposal, { foreignKey: 'jobProposalId', as: 'proposal' });

// Sequelize setup
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
