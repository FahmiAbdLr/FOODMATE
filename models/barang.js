'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class barang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.detail_transaksi, {
        foreignKey: 'id_barang'
      })
    }
  }
  barang.init({
    id_barang: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    nama: DataTypes.STRING,
    harga: DataTypes.INTEGER,
    kategori: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'barang',
  });
  return barang;
};