const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProfessionalDetail = sequelize.define('ProfessionalDetail', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    nipt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experiences: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    portfolio: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  });

  return ProfessionalDetail;
};
