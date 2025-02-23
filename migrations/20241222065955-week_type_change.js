'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "meal" ALTER COLUMN "dayOfWeek" TYPE INTEGER USING "dayOfWeek"::INTEGER;
  `);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.query(`
      ALTER TABLE "meal" ALTER COLUMN "dayOfWeek" TYPE VARCHAR(56);
  `);
  }
};
