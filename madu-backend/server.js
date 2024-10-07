// server.js
const cors = require('cors');
require('dotenv').config();

const express = require('express');
const app = express();

// Habilita CORS para todas as rotas
app.use(cors());


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

// Middleware para permitir JSON no corpo das requisições
app.use(express.json());

// Rotas
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

// Exporta o app sem iniciar o servidor
module.exports = app;
