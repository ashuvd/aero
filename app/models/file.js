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
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  path: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  extension: {
    type: Sequelize.STRING,
    allowNull: false
  },
  mime_type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  size: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false
  }
};

// 2: The model options.
const modelOptions = {

};

// 3: Define the File model.
const FileModel = db.define('file', modelDefinition, modelOptions);

FileModel.prototype.getData =  function() {
  return {
    name: this.name,
    path: this.path,
    extension: this.extension,
    mime_type: this.mime_type,
    size: this.size,
    date: this.date,
  }
}

module.exports = FileModel;