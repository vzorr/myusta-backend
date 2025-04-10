const { DataTypes } = require('sequelize');
const { ROLES, STATUS, AUTH_PROVIDERS, APP_IDS } = require('../utils/constant');
const { preferences } = require('joi');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    authProvider: {
      type: DataTypes.ENUM(...Object.values(AUTH_PROVIDERS)),
      allowNull: false,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebookId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(STATUS)),
      defaultValue: STATUS.INACTIVE,
    },
    customerPreferences: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notificationViaApp: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notificationViaEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notificationViaSms: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    termAndCondition: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    indexes: [
    ],
  });

  return User;
};
