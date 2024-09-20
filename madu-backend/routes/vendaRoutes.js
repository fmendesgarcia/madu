const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar uma nova venda
router.post('/', async (req, res) => {
  try {
    const { aluno_id, produto_id, quantidade, valor_total, data_venda } = req.body;
    
    const query = `
      INSERT INTO vendas (aluno_id, produto_id, quantidade, valor_total, data_venda)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    const values = [aluno_id, produto_id, quantidade || 1, valor_total, data_venda];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna a venda criada
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todas as vendas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vendas.*, alunos.nome AS aluno_nome, produtos.nome AS produto_nome
      FROM vendas
      LEFT JOIN alunos ON vendas.aluno_id = alunos.id
      LEFT JOIN produtos ON vendas.produto_id = produtos.id
      ORDER BY data_venda DESC;
    `);
    res.json(result.rows); // Retorna a lista de vendas
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar uma venda por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vendas.*, alunos.nome AS aluno_nome, produtos.nome AS produto_nome
      FROM vendas
      LEFT JOIN alunos ON vendas.aluno_id = alunos.id
      LEFT JOIN produtos ON vendas.produto_id = produtos.id
      WHERE vendas.id = $1;
    `, [req.params.id]);

    const venda = result.rows[0];

    if (venda) {
      res.json(venda);
    } else {
      res.status(404).json({ message: 'Venda não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar venda por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar uma venda
router.put('/:id', async (req, res) => {
  try {
    const { aluno_id, produto_id, quantidade, valor_total, data_venda } = req.body;

    const query = `
      UPDATE vendas
      SET aluno_id = $1, produto_id = $2, quantidade = $3, valor_total = $4, data_venda = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *;
    `;

    const values = [aluno_id, produto_id, quantidade, valor_total, data_venda, req.params.id];

    const result = await pool.query(query, values);
    const vendaAtualizada = result.rows[0];

    if (vendaAtualizada) {
      res.json(vendaAtualizada);
    } else {
      res.status(404).json({ message: 'Venda não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar uma venda
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vendas WHERE id = $1 RETURNING *;', [req.params.id]);

    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Venda deletada' });
    } else {
      res.status(404).json({ message: 'Venda não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar venda:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// curl -X POST http://localhost:5000/vendas \
// -H 'Content-Type: application/json' \
// -d '{
//   "aluno_id": 1,
//   "produto_id": 2,
//   "quantidade": 3,
//   "valor_total": 150.00,
//   "data_venda": "2024-09-25"
// }'
