'use strict';

const bcrypt = require('bcrypt');
const Op = require('sequelize').Op

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const salt = await bcrypt.genSalt();

    await queryInterface.bulkInsert('Users', [
      {
        nama: 'Admin 1',
        alamat: 'Jl. Danau Towuti',
        email: 'admin1@gmail.com',
        password: await bcrypt.hash('admin1', salt),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Admin 2',
        alamat: 'Jl. Danau Tambingan',
        email: 'admin2@gmail.com',
        password: await bcrypt.hash('admin2', salt),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'admin1@gmail.com',
          'admin2@gmail.com'
        ]
      }
    }, {});
  }
};
