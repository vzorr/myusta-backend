// src/models/Job.js
const { DataTypes } = require('sequelize');
const { PREFRENCES } = require('../utils/constant');

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
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card'),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(...Object.values(PREFRENCES)),
      allowNull: false,
    },
    areaSize: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    areaType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
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
      allowNull: true,
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
    images: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Images must be an array');
          }
        },
        isValidImageArray(value) {
          if (!value.every(item => typeof item === 'string' && item.startsWith('http'))) {
            throw new Error('Each image must be a valid URL string');
          }
        }
      }
    }
  });

  Job.associate = (models) => {
    Job.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Job;
};