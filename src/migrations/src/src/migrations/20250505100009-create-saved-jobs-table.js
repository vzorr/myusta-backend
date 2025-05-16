// src/migrations/20250505100009-create-saved-jobs-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('saved_jobs'));
    
    if (!tableExists) {
      await queryInterface.createTable('saved_jobs', {
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

      // Add unique constraint to prevent duplicate saved jobs
      await queryInterface.addIndex('saved_jobs', ['usta_id', 'job_id'], {
        unique: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('saved_jobs');
  }
};