const { DataTypes } = require('sequelize');
const { PREFRENCES } = require('../utils/constant');

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
        model: 'users',
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
    }
  });

  return ProfessionalDetail;
};
