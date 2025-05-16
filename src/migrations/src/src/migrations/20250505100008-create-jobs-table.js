// src/migrations/20250505100008-create-jobs-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('jobs'));
    
    if (!tableExists) {
      await queryInterface.createTable('jobs', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        payment_method: {
          type: Sequelize.ENUM('cash', 'card'),
          allowNull: false
        },
        category: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: []
        },
        area_size: {
          type: Sequelize.FLOAT,
          allowNull: true
        },
        area_type: {
          type: Sequelize.STRING,
          allowNull: true
        },
        start_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        end_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        materials: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        location_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'locations',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        budget: {
          type: Sequelize.FLOAT,
          allowNull: true
        },
        status: {
          type: Sequelize.ENUM('pending', 'active', 'completed', 'cancelled'),
          defaultValue: 'pending'
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        images: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: []
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

      // Add indexes
      await queryInterface.addIndex('jobs', ['user_id']);
      await queryInterface.addIndex('jobs', ['location_id']);
      await queryInterface.addIndex('jobs', ['status']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('jobs');
  }
};