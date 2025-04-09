// src/models/Job.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Job = sequelize.define('Job', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card'),
      allowNull: false,
    },
    area_size: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    area_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    materials: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    locationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    budget: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'completed'),
      defaultValue: 'pending',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  });

  Job.associate = (models) => {
    Job.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Job;
};