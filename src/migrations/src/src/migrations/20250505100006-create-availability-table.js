// src/migrations/20250505100006-create-availability-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('availabilities'));
    
    if (!tableExists) {
      await queryInterface.createTable('availabilities', {
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
        budget_amount: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        preferred_job_types: {
          type: Sequelize.JSONB,
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

      // Add unique constraint for one-to-one relationship
      await queryInterface.addIndex('availabilities', ['user_id'], {
        unique: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('availabilities');
  }
};