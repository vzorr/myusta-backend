const { DataTypes } = require('sequelize');
const { ROLES, STATUS, AUTH_PROVIDERS } = require('../utils/constant');

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
      unique: true,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
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
    role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(STATUS)),
      defaultValue: STATUS.INACTIVE,
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        unique: true,
        fields: ['phone'],
      },
    ],
  });

  return User;
};
