const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // NEW OPTIONAL FIELDS FOR FIGMA REQUIREMENTS
    iconUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL to category icon for UI display'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Category description for better UX'
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      },
      comment: 'For hierarchical categories (subcategories)'
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '0 = main category, 1 = subcategory, etc.'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'For ordering categories in UI'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: 'To hide/show categories without deletion'
    },
    expertCount: {
      type: DataTypes.VIRTUAL,
      get() {
        // This will be computed dynamically
        return this.getDataValue('expertCount') || 0;
      },
      comment: 'Virtual field - computed from User count'
    }
  });

  // Add associations method
  Category.associate = (models) => {
    // Self-referencing for parent-child relationships
    Category.belongsTo(models.Category, { 
      foreignKey: 'parentId', 
      as: 'parent' 
    });
    Category.hasMany(models.Category, { 
      foreignKey: 'parentId', 
      as: 'subcategories' 
    });
  };

  return Category;
};