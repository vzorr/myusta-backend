// models/SavedJob.js
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
      tableName: 'SavedJobs'
    });

  
    return SavedJob;
  };
  