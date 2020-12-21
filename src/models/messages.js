'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Messages.belongsTo(models.Users, { foreignKey: 'sender', as: 'SenderDetails' })
      Messages.belongsTo(models.Users, { foreignKey: 'recipient', as: 'RecipientDetails' })
    }
  };
  Messages.init({
    sender: DataTypes.INTEGER,
    recipient: DataTypes.INTEGER,
    messages: DataTypes.TEXT,
    isLates: DataTypes.BOOLEAN,
    unread: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Messages'
  })
  return Messages
}
