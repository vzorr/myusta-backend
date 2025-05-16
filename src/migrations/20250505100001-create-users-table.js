// src/migrations/20250505100001-create-users-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the table exists before creating
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('users'));
    
    if (!tableExists) {
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        first_name: {
          type: Sequelize.STRING,
          allowNull: true
        },
        last_name: {
          type: Sequelize.STRING,
          allowNull: true
        },
        email: {
          type: Sequelize.STRING,
          validate: {
            isEmail: true
          }
        },
        phone: {
          type: Sequelize.STRING
        },
        email_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        phone_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        password: {
          type: Sequelize.STRING,
          allowNull: true
        },
        auth_provider: {
          type: Sequelize.ENUM('email', 'phone', 'google', 'facebook')
        },
        google_id: {
          type: Sequelize.STRING,
          allowNull: true
        },
        facebook_id: {
          type: Sequelize.STRING,
          allowNull: true
        },
        role: {
          type: Sequelize.ENUM('customer', 'usta')
        },
        status: {
          type: Sequelize.ENUM('active', 'inprogress', 'inactive', 'blocked'),
          defaultValue: 'inactive'
        },
        customer_preferences: {
          type: Sequelize.JSON,
          allowNull: true
        },
        profile_picture: {
          type: Sequelize.STRING,
          allowNull: true
        },
        notification_via_app: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        notification_via_email: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        notification_via_sms: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        terms_and_conditions: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        average_rating: {
          type: Sequelize.FLOAT,
          defaultValue: 0
        },
        total_ratings: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_hires: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_views: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        last_hired_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        is_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        is_featured: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        search_boost: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      // Add indexes for faster lookups
      await queryInterface.addIndex('users', ['email']);
      await queryInterface.addIndex('users', ['role']);
      await queryInterface.addIndex('users', ['status']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};