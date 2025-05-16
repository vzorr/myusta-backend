// src/migrations/20250505100015-enhance-verifications-table.js - Modified for compatibility

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // First, create the ENUM types if they don't exist
      // We'll use a safer method to check for and create enum types
      try {
        await queryInterface.sequelize.query(`
          CREATE TYPE "enum_verifications_purpose" AS ENUM ('signup', 'password_reset', 'account_update');
        `);
      } catch (error) {
        // Type might already exist, which would cause an error
        console.log('Purpose enum type might already exist, continuing...');
      }
      
      try {
        await queryInterface.sequelize.query(`
          CREATE TYPE "enum_verifications_status" AS ENUM ('pending', 'verified', 'expired');
        `);
      } catch (error) {
        // Type might already exist, which would cause an error
        console.log('Status enum type might already exist, continuing...');
      }
      
      // Check if verifications table exists before adding columns
      const tableInfo = await queryInterface.sequelize.query(
        "SELECT * FROM information_schema.tables WHERE table_name = 'verifications'",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (tableInfo.length > 0) {
        // Table exists, now add new columns
        
        // Add purpose column
        try {
          await queryInterface.addColumn('verifications', 'purpose', {
            type: Sequelize.ENUM('signup', 'password_reset', 'account_update'),
            allowNull: false,
            defaultValue: 'signup'
          });
        } catch (error) {
          console.log('Could not add purpose column, it might already exist:', error.message);
        }
        
        // Add status column
        try {
          await queryInterface.addColumn('verifications', 'status', {
            type: Sequelize.ENUM('pending', 'verified', 'expired'),
            allowNull: false,
            defaultValue: 'pending'
          });
        } catch (error) {
          console.log('Could not add status column, it might already exist:', error.message);
        }
        
        // Add attempts column
        try {
          await queryInterface.addColumn('verifications', 'attempts', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
          });
        } catch (error) {
          console.log('Could not add attempts column, it might already exist:', error.message);
        }
        
        // Add metadata column
        try {
          await queryInterface.addColumn('verifications', 'metadata', {
            type: Sequelize.JSONB,
            allowNull: true
          });
        } catch (error) {
          console.log('Could not add metadata column, it might already exist:', error.message);
        }
        
        // Check if the old index exists
        const indexInfo = await queryInterface.sequelize.query(
          "SELECT * FROM pg_indexes WHERE tablename = 'verifications' AND indexname = 'verifications_user_id_type_idx'",
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        
        // If old index exists, drop it and create new one
        if (indexInfo.length > 0) {
          await queryInterface.sequelize.query(`
            DROP INDEX IF EXISTS "verifications_user_id_type_idx";
          `);
        }
        
        // Create new index without using the USING keyword
        await queryInterface.sequelize.query(`
          CREATE UNIQUE INDEX "verifications_user_id_type_purpose_idx" 
          ON "verifications" ("user_id", "type", "purpose");
        `);
      }
      
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Drop the new index first
      await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS "verifications_user_id_type_purpose_idx";
      `);
      
      // Recreate the old index
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX "verifications_user_id_type_idx" 
        ON "verifications" ("user_id", "type");
      `);
      
      // Remove columns in reverse order
      await queryInterface.removeColumn('verifications', 'metadata');
      await queryInterface.removeColumn('verifications', 'attempts');
      await queryInterface.removeColumn('verifications', 'status');
      await queryInterface.removeColumn('verifications', 'purpose');
      
      // We don't drop the enum types as they might be used elsewhere
    } catch (error) {
      console.error('Migration rollback failed:', error);
      throw error;
    }
  }
};