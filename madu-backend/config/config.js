require('dotenv').config({ path: './madu-backend/.env' });

const { Pool } = require('pg');

// Configuração do pool de conexões com o PostgreSQL


const pool = new Pool({
  user: process.env.DB_USER,       // Usuário do banco de dados
  host: process.env.DB_HOST,       // Endereço do banco de dados (localhost ou outro)
  database: process.env.DB_NAME,   // Nome do banco de dados
  password: process.env.DB_PASS,   // Senha do banco de dados
  port: process.env.DB_PORT || 5432, // Porta do banco de dados (5432 por padrão)
});

// Função para verificar a conexão com o banco
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao banco de dados:', err);
  }
  console.log('Conexão com o banco de dados foi bem-sucedida.');
  release(); // Libera o cliente após a conexão bem-sucedida
});

module.exports = pool;
