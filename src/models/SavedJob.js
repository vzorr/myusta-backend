// Updated src/models/SavedJob.js - Fixed tableName case
module.exports = (sequelize, DataTypes) => {
  const SavedJob = sequelize.define('SavedJob', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ustaId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'saved_jobs' // Explicitly set to match migration (lowercase with underscore)
  });

  return SavedJob;
};