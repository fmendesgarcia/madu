const cors = require('cors');
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// Configuração de CORS com múltiplas origens
const allowedOrigins = [
  'http://localhost:3000',
  'https://madu-j6zi.vercel.app',
  'https://madu-j6zi-git-main-fmendesgarcias-projects.vercel.app',
  'https://madu-j6zi-cud8gweh3-fmendesgarcias-projects.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origem (como Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true // Permite envio de cookies, se necessário
}));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para permitir JSON no corpo das requisições
app.use(express.json());

// Suas rotas
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
const authRoutes = require('./routes/authRoutes');

// Adicione as rotas no app
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
app.use('/auth', authRoutes);

// Exporta o app
module.exports = app;
