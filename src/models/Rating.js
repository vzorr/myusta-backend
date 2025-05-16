// Updated src/models/Rating.js - Fixed tableName case
module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define('Rating', {
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
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      jobId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'jobs',
          key: 'id'
        }
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      
      // Additional fields to enhance the rating system:
      
      // Multiple rating dimensions (optional)
      serviceSatisfaction: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      communication: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      timeliness: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      valueForMoney: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      
      // Admin moderation fields
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      
      // Response from the Usta to the rating
      ustaResponse: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      
      // Times for when the Usta responded
      ustaResponseAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      
      // Helpfulness metrics (if you want to let other users rate reviews)
      helpfulCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      
      // For featuring certain reviews
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      tableName: 'ratings' // Explicitly set the table name to match migration
    });
    
    return Rating;
  };