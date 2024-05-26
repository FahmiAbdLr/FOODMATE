'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.transaksi, {
        foreignKey: 'id_user'
      })
    }
  }
  user.init({
    id_user: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    nama: DataTypes.STRING,
    alamat: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.ENUM('user','admin'),
    token: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};