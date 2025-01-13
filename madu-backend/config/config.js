require('dotenv').config({ path: './madu-backend/.env' });

const { Pool } = require('pg');

// Configuração do pool de conexões com o PostgreSQL


const pool = new Pool({
  user: process.env.DB_USER || 'default_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'default_db',
  password: process.env.DB_PASS || 'default_password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
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
