require('dotenv').config({ path: './madu-backend/.env' });


const { Sequelize } = require('sequelize');

console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);  // Verifique se a senha está correta
console.log('DB_HOST:', process.env.DB_HOST);


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: process.env.DB_PORT || 5432,
});

sequelize.authenticate()
  .then(() => console.log('Conexão com o banco de dados foi bem-sucedida.'))
  .catch((err) => console.error('Erro ao conectar com o banco de dados:', err));

module.exports = sequelize;
