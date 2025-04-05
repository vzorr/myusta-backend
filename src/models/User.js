'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name', // Map attribute to snake_case column
      },
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name', // Map attribute to snake_case column
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      // password: {
      //   type: DataTypes.STRING,
      // },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      tableName: 'users', // Explicit table name to avoid pluralization
      underscored: true,   // Use snake_case for column names
    }
  );
  return User;
};
