'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detail_transaksi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.transaksi, {
        foreignKey: 'id_transaksi'
      })
      this.belongsTo(models.barang, {
        foreignKey: 'id_barang'
      })
    }
  }
  detail_transaksi.init({
    id_detail_transaksi: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_transaksi: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_barang: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    qyt: DataTypes.INTEGER,
    total: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'detail_transaksi',
  });
  return detail_transaksi;
};