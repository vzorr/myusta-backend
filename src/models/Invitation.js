// Updated src/models/Invitation.js - Fixed tableName case
module.exports = (sequelize, DataTypes) => {
    const Invitation = sequelize.define('Invitation', {
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
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      preferredTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'expired', 'canceled'),
        defaultValue: 'pending'
      },
      
      viewedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      
      responseMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      
      alternativeTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      
      previousInvitationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'invitations', // Notice this is lowercase to match migration
          key: 'id'
        }
      },
      
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      
      invitationType: {
        type: DataTypes.ENUM('direct', 'job-based', 'follow-up'),
        defaultValue: 'direct'
      },
      
      serviceDetails: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      
      locationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'locations',
          key: 'id'
        }
      },
      
      budgetMin: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      
      budgetMax: {
        type: DataTypes.FLOAT,
        allowNull: true
      }
    }, {
      tableName: 'invitations' // Explicitly set the table name to match migration
    });
    
    return Invitation;
  };