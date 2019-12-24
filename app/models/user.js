const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const db = require('../services/database');
const SessionModel = require('./session');

// 1: The model schema.
const modelDefinition = {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
};

// 2: The model options.
const modelOptions = {
  hooks: {
    beforeCreate: hashPassword,
    beforeUpdate: hashPassword
  }
};

// 3: Define the User model.
const UserModel = db.define('user', modelDefinition, modelOptions);

// Compares two passwords.
UserModel.prototype.comparePasswords = async function(password, callback) {
  await bcrypt.compare(password, this.password, function(error, isMatch) {
    if(error) {
      return callback(error);
    }
    return callback(null, isMatch);
  });
}

// Hashes the password for a user object.
function hashPassword(user) {
  if(user.changed('password')) {
    return bcrypt.hash(user.password, 10).then(function(password) {
      user.password = password;
    });
  }
}

UserModel.hasOne(SessionModel, {foreignKey: { name: 'user_id', allowNull: false }, onDelete: 'CASCADE'});
SessionModel.belongsTo(UserModel, {foreignKey: { name: 'user_id', allowNull: false }, onDelete: 'CASCADE'});

module.exports = UserModel;