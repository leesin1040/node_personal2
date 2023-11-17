'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Users, {
        targetKey: 'id',
        foreignKey: 'userId',
      });
    }
  }
  Products.init(
    {
      userId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Products',
    }
  );
  return Products;
};
