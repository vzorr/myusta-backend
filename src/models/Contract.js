// src/models/Contract.js
const { CONTRACT_STATUS } = require('../utils/constant');

module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define('Contract', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    status: {
      type: DataTypes.ENUM(...Object.values(CONTRACT_STATUS)),
      defaultValue: CONTRACT_STATUS.PENDING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'jobs', key: 'id' },
    },
    ustaId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    jobProposalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'job_proposals', key: 'id' },
    },
  });

  return Contract;
};