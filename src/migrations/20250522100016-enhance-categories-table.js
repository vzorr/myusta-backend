'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to existing categories table
    await queryInterface.addColumn('categories', 'icon_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL to category icon for UI display'
    });

    await queryInterface.addColumn('categories', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Category description for better UX'
    });

    await queryInterface.addColumn('categories', 'parent_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'For hierarchical categories'
    });

    await queryInterface.addColumn('categories', 'level', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '0 = main category, 1 = subcategory'
    });

    await queryInterface.addColumn('categories', 'display_order', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'For ordering categories in UI'
    });

    await queryInterface.addColumn('categories', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: 'To hide/show categories'
    });

    // Add indexes for performance
    await queryInterface.addIndex('categories', ['parent_id']);
    await queryInterface.addIndex('categories', ['level']);
    await queryInterface.addIndex('categories', ['is_active']);
    await queryInterface.addIndex('categories', ['display_order']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('categories', 'icon_url');
    await queryInterface.removeColumn('categories', 'description');
    await queryInterface.removeColumn('categories', 'parent_id');
    await queryInterface.removeColumn('categories', 'level');
    await queryInterface.removeColumn('categories', 'display_order');
    await queryInterface.removeColumn('categories', 'is_active');
  }
};