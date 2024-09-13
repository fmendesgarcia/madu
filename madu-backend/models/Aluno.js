const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Aluno = sequelize.define('Aluno', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sexo: {
    type: DataTypes.STRING(10),  // Pode ser 'M', 'F', ou outros valores permitidos
    allowNull: false
  },
  data_nascimento: {
    type: DataTypes.DATE,
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true  // Pode ser opcional
  },
  documento: {
    type: DataTypes.STRING(20),  // CPF ou RG
    allowNull: false,
    unique: true  // Documento deve ser único
  },
  bolsista: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  responsavel_financeiro: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  cep: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  rua: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  complemento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bairro: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(2),  // Ex: SP, RJ
    allowNull: true
  },
  foto_url: {
    type: DataTypes.STRING,  // Armazena o caminho ou URL da foto
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Aluno;
