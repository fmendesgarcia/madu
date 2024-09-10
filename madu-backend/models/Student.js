const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Student = sequelize.define('Student', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data_nascimento: {
    type: DataTypes.DATE,
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  doc: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bolsista: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  responsavel_financeiro: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Student;
