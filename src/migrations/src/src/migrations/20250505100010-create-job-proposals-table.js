// src/migrations/20250505100010-create-job-proposals-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('job_proposals'));
    
    if (!tableExists) {
      await queryInterface.createTable('job_proposals', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        proposal_type: {
          type: Sequelize.ENUM('project', 'milestone'),
          allowNull: false,
          defaultValue: 'project'
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
        total_cost: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        service_fee: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        final_payment: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
          defaultValue: 'pending'
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
        additional_details: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        who_will_provide_material: {
          type: Sequelize.ENUM('customer', 'usta', 'partial'),
          allowNull: true
        },
        material_items: {
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
      await queryInterface.addIndex('job_proposals', ['created_by']);
      await queryInterface.addIndex('job_proposals', ['job_id']);
      await queryInterface.addIndex('job_proposals', ['status']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('job_proposals');
  }
};