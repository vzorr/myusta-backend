// src/migrations/20250505100003-create-locations-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('locations'));
    
    if (!tableExists) {
      await queryInterface.createTable('locations', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
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
        whose_location: {
          type: Sequelize.ENUM('customer', 'usta', 'job')
        },
        address: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        latitude: {
          type: Sequelize.DECIMAL(10, 7),
          allowNull: false
        },
        longitude: {
          type: Sequelize.DECIMAL(10, 7),
          allowNull: false
        },
        max_distance: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: null
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
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
      await queryInterface.addIndex('locations', ['user_id']);
      await queryInterface.addIndex('locations', ['whose_location']);
      await queryInterface.addIndex('locations', ['latitude', 'longitude']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('locations');
  }
};