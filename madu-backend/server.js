const cors = require('cors');
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const pool = require('./config/config');

// Migração leve: garantir colunas/tabelas necessárias
(async () => {
  try {
    // aulas
    await pool.query(`
      ALTER TABLE IF EXISTS aulas
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'planejada',
      ADD COLUMN IF NOT EXISTS substituto_professor_id INTEGER,
      ADD COLUMN IF NOT EXISTS observacoes TEXT;
    `);
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'aulas_substituto_professor_fk'
        ) THEN
          ALTER TABLE aulas
          ADD CONSTRAINT aulas_substituto_professor_fk FOREIGN KEY (substituto_professor_id)
          REFERENCES professores(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_aulas_start ON aulas (start);`);

    // alunos
    await pool.query(`
      ALTER TABLE IF EXISTS alunos
      ADD COLUMN IF NOT EXISTS codigo VARCHAR(64),
      ADD COLUMN IF NOT EXISTS responsavel_nome VARCHAR(255),
      ADD COLUMN IF NOT EXISTS responsavel_cpf VARCHAR(32),
      ADD COLUMN IF NOT EXISTS responsavel_telefone VARCHAR(64),
      ADD COLUMN IF NOT EXISTS responsavel_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS responsavel_parentesco VARCHAR(64);
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_alunos_codigo ON alunos (codigo);`);

    // pagamentos de professores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pagamentos_professores (
        id SERIAL PRIMARY KEY,
        professor_id INTEGER NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
        mes VARCHAR(2) NOT NULL,
        ano INTEGER NOT NULL,
        total_horas NUMERIC(10,2) NOT NULL DEFAULT 0,
        valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
        data_pagamento DATE,
        forma_pagamento VARCHAR(50),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pag_prof_periodo ON pagamentos_professores (professor_id, ano, mes);`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pagamentos_professores_aulas (
        pagamento_professor_id INTEGER NOT NULL REFERENCES pagamentos_professores(id) ON DELETE CASCADE,
        aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
        PRIMARY KEY (pagamento_professor_id, aula_id)
      );
    `);
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_pagamento_aula ON pagamentos_professores_aulas (aula_id);`);
  } catch (e) {
    console.error('Migração leve falhou (seguindo sem bloquear):', e.message);
  }
})();

// Configuração de CORS com múltiplas origens (via env)
// Use ALLOWED_ORIGINS=comma,separated,urls
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman/SSR
    const isExplicit = allowedOrigins.includes(origin);
    const isVercel = /\.vercel\.app$/.test(origin);
    if (isExplicit || isVercel) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

const alunoRoutes = require('./routes/alunoRoutes');
const professorRoutes = require('./routes/professorRoutes');
const turmaRoutes = require('./routes/turmaRoutes');
const aulaRoutes = require('./routes/aulaRoutes');
const presencaRoutes = require('./routes/presencaRoutes');
const matriculaRoutes = require('./routes/matriculaRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const fluxoCaixaRoutes = require('./routes/fluxoCaixaRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const vendaRoutes = require('./routes/vendaRoutes');
const mensalidadeRoutes = require('./routes/mensalidadeRoutes');
const lancamentoRoutes = require('./routes/lancamentoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const financeiroRoutes = require('./routes/financeiroRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/alunos', alunoRoutes);
app.use('/professores', professorRoutes);
app.use('/turmas', turmaRoutes);
app.use('/aulas', aulaRoutes);
app.use('/presencas', presencaRoutes);
app.use('/matriculas', matriculaRoutes);
app.use('/pagamentos', pagamentoRoutes);
app.use('/fluxo_caixa', fluxoCaixaRoutes);
app.use('/produtos', produtoRoutes);
app.use('/vendas', vendaRoutes);
app.use('/mensalidades', mensalidadeRoutes);
app.use('/lancamentos', lancamentoRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/financeiro', financeiroRoutes);
app.use('/auth', authRoutes);

module.exports = app;
