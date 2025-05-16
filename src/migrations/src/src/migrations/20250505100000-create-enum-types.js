// src/migrations/20250505100000-create-enum-types.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check PostgreSQL schema for existing enums
    const query = "SELECT typname FROM pg_type JOIN pg_catalog.pg_namespace ON pg_namespace.oid = pg_type.typnamespace WHERE typtype = 'e'";
    const [results] = await queryInterface.sequelize.query(query);
    const existingEnums = results.map(result => result.typname);

    // Create ENUM types if they don't exist
    if (!existingEnums.includes('enum_users_role')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_users_role" AS ENUM (\'customer\', \'usta\')');
    }

    if (!existingEnums.includes('enum_users_status')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_users_status" AS ENUM (\'active\', \'inprogress\', \'inactive\', \'blocked\')');
    }

    if (!existingEnums.includes('enum_users_auth_provider')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_users_auth_provider" AS ENUM (\'email\', \'phone\', \'google\', \'facebook\')');
    }

    if (!existingEnums.includes('enum_verifications_type')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_verifications_type" AS ENUM (\'email\', \'phone\')');
    }

    if (!existingEnums.includes('enum_locations_whose_location')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_locations_whose_location" AS ENUM (\'customer\', \'usta\', \'job\')');
    }

    if (!existingEnums.includes('enum_jobs_payment_method')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_jobs_payment_method" AS ENUM (\'cash\', \'card\')');
    }

    if (!existingEnums.includes('enum_jobs_status')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_jobs_status" AS ENUM (\'pending\', \'active\', \'completed\', \'cancelled\')');
    }

    if (!existingEnums.includes('enum_job_proposals_proposal_type')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_job_proposals_proposal_type" AS ENUM (\'project\', \'milestone\')');
    }

    if (!existingEnums.includes('enum_job_proposals_status')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_job_proposals_status" AS ENUM (\'pending\', \'accepted\', \'rejected\')');
    }

    if (!existingEnums.includes('enum_job_proposals_who_will_provide_material')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_job_proposals_who_will_provide_material" AS ENUM (\'customer\', \'usta\', \'partial\')');
    }

    if (!existingEnums.includes('enum_milestones_status')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_milestones_status" AS ENUM (\'pending\', \'ongoing\', \'completed\')');
    }

    if (!existingEnums.includes('enum_contracts_status')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_contracts_status" AS ENUM (\'pending\', \'accepted\', \'rejected\')');
    }

    if (!existingEnums.includes('enum_invitations_status')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_invitations_status" AS ENUM (\'pending\', \'accepted\', \'rejected\', \'expired\', \'canceled\')');
    }

    if (!existingEnums.includes('enum_invitations_invitation_type')) {
      await queryInterface.sequelize.query('CREATE TYPE "enum_invitations_invitation_type" AS ENUM (\'direct\', \'job-based\', \'follow-up\')');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Not recommended to drop ENUM types in down migration as they may be used by other tables
    // This could be implemented if needed, but requires careful sequencing
  }
};