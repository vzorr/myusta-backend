'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'average_rating', {
      type: Sequelize.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    });

    await queryInterface.addColumn('users', 'total_ratings', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('users', 'total_hires', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('users', 'total_views', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('users', 'last_hired_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'is_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('users', 'is_featured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('users', 'search_boost', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'average_rating');
    await queryInterface.removeColumn('users', 'total_ratings');
    await queryInterface.removeColumn('users', 'total_hires');
    await queryInterface.removeColumn('users', 'total_views');
    await queryInterface.removeColumn('users', 'last_hired_at');
    await queryInterface.removeColumn('users', 'is_verified');
    await queryInterface.removeColumn('users', 'is_featured');
    await queryInterface.removeColumn('users', 'search_boost');
  }
};