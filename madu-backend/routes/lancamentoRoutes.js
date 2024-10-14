const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar um novo lançamento (despesa ou receita)
router.post('/', async (req, res) => {
  try {
    const { descricao, tipo, valor, data_lancamento, status } = req.body;

    // Validação básica
    if (!descricao || !tipo || !valor || !data_lancamento) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    // Inserir o lançamento na tabela
    const query = `
      INSERT INTO lancamentos (descricao, tipo, valor, data_lancamento, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [descricao, tipo, valor, data_lancamento, status || 'futura'];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna o lançamento criado
  } catch (error) {
    console.error('Erro ao criar lançamento:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para listar todos os lançamentos (incluindo receitas, despesas e mensalidades vinculadas)
router.get('/', async (req, res) => {
  const { mes, ano } = req.query;
  try {
    let query = `
      SELECT lancamentos.*, 
             CASE 
               WHEN mensalidades.id IS NOT NULL THEN 'mensalidade'
               ELSE lancamentos.tipo 
             END AS tipo_lancamento,
             mensalidades.valor AS valor_mensalidade,
             TO_CHAR(mensalidades.data_vencimento, 'DD/MM/YYYY') as data_mensalidade,
             pagamentos.valor_pago AS valor_pago
      FROM lancamentos
      LEFT JOIN mensalidades ON lancamentos.id = mensalidades.lancamento_id
      LEFT JOIN pagamentos ON mensalidades.id = pagamentos.mensalidade_id
    `;

    const params = [];

    if (mes || ano) {
      query += ' WHERE ';
      if (mes) {
        query += `TO_CHAR(lancamentos.data_lancamento, 'MM') = $${params.length + 1} `;
        params.push(mes);
      }
      if (ano) {
        query += (mes ? 'AND ' : '') + `TO_CHAR(lancamentos.data_lancamento, 'YYYY') = $${params.length + 1} `;
        params.push(ano);
      }
    }

    query += ' ORDER BY lancamentos.data_lancamento ASC';

    const result = await pool.query(query, params);
    res.json(result.rows); 
  } catch (error) {
    console.error('Erro ao listar lançamentos:', error);
    res.status(500).json({ error: error.message });
  }
});


// Rota para atualizar um lançamento
router.put('/:id', async (req, res) => {
  try {
    const { descricao, tipo, valor, data_lancamento, status } = req.body;

    const query = `
      UPDATE lancamentos
      SET descricao = $1, tipo = $2, valor = $3, data_lancamento = $4, status = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *;
    `;
    const values = [descricao, tipo, valor, data_lancamento, status, req.params.id];

    const result = await pool.query(query, values);
    const lancamentoAtualizado = result.rows[0];

    if (lancamentoAtualizado) {
      res.json(lancamentoAtualizado);
    } else {
      res.status(404).json({ message: 'Lançamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar lançamento:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para deletar um lançamento
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lancamentos WHERE id = $1 RETURNING *;', [req.params.id]);

    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Lançamento deletado' });
    } else {
      res.status(404).json({ message: 'Lançamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar lançamento:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
