require('dotenv').config({ path: './env.local' });

const { Pool } = require('pg');

// Configuração do pool de conexões com o PostgreSQL Neon

const pool = new Pool({
  user: process.env.DB_USER || 'dbmanu_owner',
  host: process.env.DB_HOST || 'ep-plain-truth-a51i94ih.us-east-2.aws.neon.tech',
  database: process.env.DB_NAME || 'dbmanu',
  password: process.env.DB_PASS || '4xjSQcgX9zbN',
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  },
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
