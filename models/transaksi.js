'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transaksi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, {
        foreignKey: 'id_user', as: 'user'
      })
      this.hasMany(models.transaksi, {
        foreignKey: 'id_transaksi', as: 'details'
      })
    }
  }
  transaksi.init({
    id_transaksi: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_user: {
     type: DataTypes.INTEGER,
     allowNull: false
    },
    nama_pemesan: DataTypes.STRING,
    metodePay: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'transaksi',
  });
  return transaksi;
};