// src/migrations/20250505100005-create-portfolios-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('portfolios'));
    
    if (!tableExists) {
      await queryInterface.createTable('portfolios', {
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
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        category: {
          type: Sequelize.STRING,
          allowNull: false
        },
        media: {
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

      // Add indexes
      await queryInterface.addIndex('portfolios', ['user_id']);
      await queryInterface.addIndex('portfolios', ['category']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('portfolios');
  }
};