// src/models/Job.js
const { DataTypes } = require('sequelize');
const { ALLOWED_CATEGORY_KEYS, PAYMENT_METHODS, JOB_STATUS } = require('../utils/constant');

module.exports = (sequelize) => {
  const Job = sequelize.define('Job', {
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
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_METHODS)),
      allowNull: false,
    },
    category: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayOfAllowedCategories(value) {
          if (!Array.isArray(value)) {
            throw new Error('Category must be an array');
          }
          //validate allowed keys
          value.forEach(cat => {
            if (!ALLOWED_CATEGORY_KEYS.includes(cat)) {
              throw new Error(`Invalid category: ${cat}`);
            }
          });
        }
      }
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
      references: {
        model: 'locations',
        key: 'id',
      },
    },
    budget: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(JOB_STATUS)),
      defaultValue: JOB_STATUS.PENDING,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
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
        }
      }
    }
  });

  Job.associate = (models) => {
    Job.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Job.belongsTo(models.Location, { foreignKey: 'locationId', as: 'location' });
  };

  return Job;
};