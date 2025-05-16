// src/migrations/20250505100004-create-professional-details-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('professional_details'));
    
    if (!tableExists) {
      await queryInterface.createTable('professional_details', {
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
        nipt: {
          type: Sequelize.STRING,
          allowNull: true
        },
        experiences: {
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
      await queryInterface.addIndex('professional_details', ['user_id'], {
        unique: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('professional_details');
  }
};