const Sequelize = require('sequelize')
const db = require('../services/database');

// 1: The model schema.
const modelDefinition = {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  refresh_token: {
    type: Sequelize.STRING,
    allowNull: false
  },
  expires_in: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
};
// 2: The model options.
const modelOptions = {
};

// 3: Define the Session model.
const SessionModel = db.define('session', modelDefinition, modelOptions);

module.exports = SessionModel;