// src/migrations/YYYYMMDDHHMMSS-create-ratings.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ratings', {
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
      customer_id: {
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
        allowNull: true,
        references: {
          model: 'jobs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      service_satisfaction: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      communication: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      timeliness: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      value_for_money: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      usta_response: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      usta_response_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      helpful_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add index for faster lookups
    await queryInterface.addIndex('ratings', ['usta_id']);
    await queryInterface.addIndex('ratings', ['customer_id']);
    await queryInterface.addIndex('ratings', ['job_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ratings');
  }
};