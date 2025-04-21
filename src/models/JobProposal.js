// src/models/JobProposal.js
const { DataTypes } = require('sequelize');
const { PROPOSAL_TYPES, PROPOSAL_STATUS, WHO_WILL_PROVIDE_MATERIAL } = require('../utils/constant');

module.exports = (sequelize) => {
  const JobProposal = sequelize.define('JobProposal', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    proposalType: {
      type: DataTypes.ENUM(...Object.values(PROPOSAL_TYPES)),
      allowNull: false,
      defaultValue: PROPOSAL_TYPES.PROJECT, // Set default to Project
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    totalCost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    serviceFee: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    finalPayment: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PROPOSAL_STATUS)),
      defaultValue: PROPOSAL_STATUS.PENDING,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'jobs',
        key: 'id',
      },
    },
    additionalDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    whoWillProvideMaterial: {
      type: DataTypes.ENUM(...Object.values(WHO_WILL_PROVIDE_MATERIAL)),
      allowNull: true,
    },
    materialItems: {
      type: DataTypes.JSONB,
      allowNull: true,
    }
  });

  return JobProposal;
};