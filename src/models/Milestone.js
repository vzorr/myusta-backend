// src/models/Milestone.js
const { DataTypes } = require('sequelize');
const { MILESTONE_STATUS } = require('../utils/constant');

module.exports = (sequelize) => {
  const Milestone = sequelize.define('Milestone', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
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
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MILESTONE_STATUS)),
      defaultValue: MILESTONE_STATUS.PENDING,
    },
    jobProposalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'job_proposals',
        key: 'id',
      },
    }
  });

  return Milestone;
};