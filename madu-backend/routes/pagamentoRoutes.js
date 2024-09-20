const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar um novo pagamento
router.post('/', async (req, res) => {
  try {
    const { aluno_id, turma_id, data_pagamento, valor_pago, forma_pagamento } = req.body;
    
    const query = `
      INSERT INTO pagamentos (aluno_id, turma_id, data_pagamento, valor_pago, forma_pagamento)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    const values = [aluno_id, turma_id, data_pagamento, valor_pago, forma_pagamento];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna o pagamento criado
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todos os pagamentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pagamentos.*, alunos.nome AS aluno_nome, turmas.nome AS turma_nome
      FROM pagamentos
      LEFT JOIN alunos ON pagamentos.aluno_id = alunos.id
      LEFT JOIN turmas ON pagamentos.turma_id = turmas.id
      ORDER BY data_pagamento DESC;
    `);
    res.json(result.rows); // Retorna a lista de pagamentos
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar um pagamento por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pagamentos.*, alunos.nome AS aluno_nome, turmas.nome AS turma_nome
      FROM pagamentos
      LEFT JOIN alunos ON pagamentos.aluno_id = alunos.id
      LEFT JOIN turmas ON pagamentos.turma_id = turmas.id
      WHERE pagamentos.id = $1;
    `, [req.params.id]);

    const pagamento = result.rows[0];

    if (pagamento) {
      res.json(pagamento);
    } else {
      res.status(404).json({ message: 'Pagamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar pagamento por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar um pagamento
router.put('/:id', async (req, res) => {
  try {
    const { aluno_id, turma_id, data_pagamento, valor_pago, forma_pagamento } = req.body;

    const query = `
      UPDATE pagamentos
      SET aluno_id = $1, turma_id = $2, data_pagamento = $3, valor_pago = $4, forma_pagamento = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *;
    `;

    const values = [aluno_id, turma_id, data_pagamento, valor_pago, forma_pagamento, req.params.id];

    const result = await pool.query(query, values);
    const pagamentoAtualizado = result.rows[0];

    if (pagamentoAtualizado) {
      res.json(pagamentoAtualizado);
    } else {
      res.status(404).json({ message: 'Pagamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar um pagamento
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pagamentos WHERE id = $1 RETURNING *;', [req.params.id]);

    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Pagamento deletado' });
    } else {
      res.status(404).json({ message: 'Pagamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// curl -X POST http://localhost:5000/pagamentos \
// -H 'Content-Type: application/json' \
// -d '{
//   "aluno_id": 1,
//   "turma_id": 2,
//   "data_pagamento": "2024-09-25",
//   "valor_pago": 500.00,
//   "forma_pagamento": "cartão"
// }'

