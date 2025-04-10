const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Availability = sequelize.define('Availability', {
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
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    maxDistance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
    },
    budgetAmount: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    preferredJobTypes: {
      type: DataTypes.JSONB,
      allowNull: true,
    }
  },{

  }
);

  return Availability;
};
