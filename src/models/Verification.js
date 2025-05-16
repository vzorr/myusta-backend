// src/models/Verification.js - Fixed to prevent ENUM issues
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Verification = sequelize.define('Verification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'user_id'
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING, // Changed from ENUM to STRING to avoid issues
      allowNull: false,
      validate: {
        isIn: [['email', 'phone']] // Validation instead of ENUM
      }
    },
    // New fields with STRING instead of ENUMs
    purpose: {
      type: DataTypes.STRING, // Changed from ENUM to STRING
      allowNull: false,
      defaultValue: 'signup',
      validate: {
        isIn: [['signup', 'password_reset', 'account_update']]
      }
    },
    status: {
      type: DataTypes.STRING, // Changed from ENUM to STRING
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'verified', 'expired']]
      }
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at'
    },
  }, {
    tableName: 'verifications',
    underscored: true,
    timestamps: true,
  });

  return Verification;
};