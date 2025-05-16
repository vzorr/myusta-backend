// Enhancements for src/models/Invitation.js
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
      
      // Additional fields for enhanced functionality:
      
      // To track when the invitation was viewed
      viewedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      
      // Response from the Usta (if they reject with a reason)
      responseMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      
      // Alternative proposed time (if Usta can't make the preferred time)
      alternativeTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      
      // For follow-up invitations
      previousInvitationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Invitations',
          key: 'id'
        }
      },
      
      // Expiration date for the invitation
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      
      // Type of invitation (direct, job-based, etc.)
      invitationType: {
        type: DataTypes.ENUM('direct', 'job-based', 'follow-up'),
        defaultValue: 'direct'
      },
      
      // Service details if no job is associated
      serviceDetails: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      
      // Location for the service
      locationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'locations',
          key: 'id'
        }
      },
      
      // Budget information
      budgetMin: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      
      budgetMax: {
        type: DataTypes.FLOAT,
        allowNull: true
      }
    });
    
    return Invitation;
  };