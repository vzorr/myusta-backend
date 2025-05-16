// Updated src/models/index.js - Fixed associations
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
  Milestone,
  Contract,
  Rating,
  Invitation
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

// Contract ↔ Job
Contract.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
// Contract ↔ Usta (User)
Contract.belongsTo(User, { foreignKey: 'ustaId', as: 'usta' });
// Contract ↔ Customer (User)
Contract.belongsTo(User, { foreignKey: 'createdBy', as: 'customer' });
// Contract ↔ JobProposal
Contract.belongsTo(JobProposal, { foreignKey: 'jobProposalId', as: 'JobProposal' });

JobProposal.hasOne(Contract, { foreignKey: 'jobProposalId', as: 'contract' });

// Rating associations
User.hasMany(Rating, { foreignKey: 'ustaId', as: 'receivedRatings' });
Rating.belongsTo(User, { foreignKey: 'ustaId', as: 'usta' });

User.hasMany(Rating, { foreignKey: 'customerId', as: 'givenRatings' });
Rating.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

Job.hasOne(Rating, { foreignKey: 'jobId', as: 'rating' });
Rating.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Invitation associations
User.hasMany(Invitation, { foreignKey: 'ustaId', as: 'receivedInvitations' });
Invitation.belongsTo(User, { foreignKey: 'ustaId', as: 'usta' });

User.hasMany(Invitation, { foreignKey: 'customerId', as: 'sentInvitations' });
Invitation.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

Job.hasMany(Invitation, { foreignKey: 'jobId', as: 'invitations' });
Invitation.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// If you added locationId to the Invitation model
Location.hasMany(Invitation, { foreignKey: 'locationId', as: 'invitations' });
Invitation.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });

// Self-reference for previous invitation (if you included previousInvitationId)
Invitation.belongsTo(Invitation, { foreignKey: 'previousInvitationId', as: 'previousInvitation' });
Invitation.hasMany(Invitation, { foreignKey: 'previousInvitationId', as: 'followUpInvitations' });

// Sequelize setup
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;