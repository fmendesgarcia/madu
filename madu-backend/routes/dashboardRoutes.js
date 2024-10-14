const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

router.get('/saldo-mensal', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT TO_CHAR(data_lancamento, 'MM-YYYY') as mes_ano, SUM(valor) as saldo
      FROM lancamentos
      GROUP BY mes_ano
      ORDER BY mes_ano;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar saldo mensal:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/receitas-despesas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as receitas,
        SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as despesas
      FROM lancamentos;
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar receitas e despesas:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status-receitas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        SUM(CASE WHEN status = 'futura' THEN valor ELSE 0 END) as futuras,
        SUM(CASE WHEN status = 'efetivada' THEN valor ELSE 0 END) as efetivadas
      FROM lancamentos
      WHERE tipo = 'receita';
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar status das receitas:', error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;