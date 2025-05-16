// src/migrations/YYYYMMDDHHMMSS-create-invitations.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('invitations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      usta_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      job_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'jobs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      preferred_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'expired', 'canceled'),
        defaultValue: 'pending'
      },
      viewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      response_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      alternative_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      previous_invitation_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'invitations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      invitation_type: {
        type: Sequelize.ENUM('direct', 'job-based', 'follow-up'),
        defaultValue: 'direct'
      },
      service_details: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      location_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'locations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      budget_min: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      budget_max: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes for faster lookups
    await queryInterface.addIndex('invitations', ['usta_id']);
    await queryInterface.addIndex('invitations', ['customer_id']);
    await queryInterface.addIndex('invitations', ['job_id']);
    await queryInterface.addIndex('invitations', ['status']);
    await queryInterface.addIndex('invitations', ['expires_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('invitations');
  }
};