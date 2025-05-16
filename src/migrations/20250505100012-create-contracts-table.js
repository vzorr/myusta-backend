// src/migrations/20250505100012-create-contracts-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('contracts'));
    
    if (!tableExists) {
      await queryInterface.createTable('contracts', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        start_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        end_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        total_cost: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
          defaultValue: 'pending',
          allowNull: false
        },
        details: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        job_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'jobs',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
        created_by: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
      await queryInterface.addIndex('contracts', ['job_id']);
      await queryInterface.addIndex('contracts', ['usta_id']);
      await queryInterface.addIndex('contracts', ['created_by']);
      await queryInterface.addIndex('contracts', ['status']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contracts');
  }
};