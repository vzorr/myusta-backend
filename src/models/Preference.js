const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Preference = sequelize.define('Preference', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  return Preference;
};
