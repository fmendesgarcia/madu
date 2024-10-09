const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar uma nova mensalidade
router.post('/', async (req, res) => {
  try {
    const { matricula_id, valor, data_vencimento, status, data_pagamento, desconto } = req.body;

    const query = `
      INSERT INTO mensalidades (matricula_id, valor, data_vencimento, status, data_pagamento, desconto)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [matricula_id, valor, data_vencimento, status || 'pendente', data_pagamento || null, desconto || null];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna a mensalidade criada
  } catch (error) {
    console.error('Erro ao criar mensalidade:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todas as mensalidades
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mensalidades ORDER BY data_vencimento ASC;');
    res.json(result.rows); // Retorna a lista de mensalidades
  } catch (error) {
    console.error('Erro ao listar mensalidades:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar uma mensalidade por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mensalidades WHERE id = $1;', [req.params.id]);
    const mensalidade = result.rows[0];

    if (mensalidade) {
      res.json(mensalidade);
    } else {
      res.status(404).json({ message: 'Mensalidade não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar mensalidade por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar uma mensalidade
router.put('/:id', async (req, res) => {
  try {
    const { matricula_id, valor, data_vencimento, status, data_pagamento, desconto } = req.body;

    const query = `
      UPDATE mensalidades
      SET matricula_id = $1, valor = $2, data_vencimento = $3, status = $4, data_pagamento = $5, desconto = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *;
    `;

    const values = [matricula_id, valor, data_vencimento, status, data_pagamento || null, desconto || null, req.params.id];

    const result = await pool.query(query, values);
    const mensalidadeAtualizada = result.rows[0];

    if (mensalidadeAtualizada) {
      res.json(mensalidadeAtualizada);
    } else {
      res.status(404).json({ message: 'Mensalidade não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar mensalidade:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar uma mensalidade
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM mensalidades WHERE id = $1 RETURNING *;', [req.params.id]);

    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Mensalidade deletada' });
    } else {
      res.status(404).json({ message: 'Mensalidade não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar mensalidade:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
