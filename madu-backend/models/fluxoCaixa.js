const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const FluxoCaixa = sequelize.define('FluxoCaixa', {
  descricao: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('entrada', 'saida'),
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),  // Exemplo: 1000.50
    allowNull: false
  },
  data_movimentacao: {
    type: DataTypes.DATEONLY,
    allowNull: false
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

module.exports = FluxoCaixa;
