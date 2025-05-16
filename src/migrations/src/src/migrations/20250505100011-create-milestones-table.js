// src/migrations/20250505100011-create-milestones-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('milestones'));
    
    if (!tableExists) {
      await queryInterface.createTable('milestones', {
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
        start_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        end_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        price: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('pending', 'ongoing', 'completed'),
          defaultValue: 'pending'
        },
        job_proposal_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'job_proposals',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
      await queryInterface.addIndex('milestones', ['job_proposal_id']);
      await queryInterface.addIndex('milestones', ['status']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('milestones');
  }
};