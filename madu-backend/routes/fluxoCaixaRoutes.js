const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar uma nova entrada/saída no fluxo de caixa
router.post('/', async (req, res) => {
  try {
    const { tipo, descricao, valor, data_movimento } = req.body;
    
    const query = `
      INSERT INTO fluxo_caixa (tipo, descricao, valor, data_movimento)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const values = [tipo, descricao, valor, data_movimento || new Date()]; // Se não fornecer a data, usa a data atual
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna a entrada/saída criada
  } catch (error) {
    console.error('Erro ao criar movimento no fluxo de caixa:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todas as entradas/saídas no fluxo de caixa
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM fluxo_caixa
      ORDER BY data_movimento DESC;
    `);
    res.json(result.rows); // Retorna a lista de movimentos do fluxo de caixa
  } catch (error) {
    console.error('Erro ao listar fluxo de caixa:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar uma entrada/saída no fluxo de caixa por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fluxo_caixa WHERE id = $1;', [req.params.id]);

    const movimento = result.rows[0];

    if (movimento) {
      res.json(movimento);
    } else {
      res.status(404).json({ message: 'Movimento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar movimento por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar uma entrada/saída no fluxo de caixa
router.put('/:id', async (req, res) => {
  try {
    const { tipo, descricao, valor, data_movimento } = req.body;

    const query = `
      UPDATE fluxo_caixa
      SET tipo = $1, descricao = $2, valor = $3, data_movimento = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `;

    const values = [tipo, descricao, valor, data_movimento, req.params.id];

    const result = await pool.query(query, values);
    const movimentoAtualizado = result.rows[0];

    if (movimentoAtualizado) {
      res.json(movimentoAtualizado);
    } else {
      res.status(404).json({ message: 'Movimento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar movimento no fluxo de caixa:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar uma entrada/saída no fluxo de caixa
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM fluxo_caixa WHERE id = $1 RETURNING *;', [req.params.id]);

    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Movimento deletado' });
    } else {
      res.status(404).json({ message: 'Movimento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar movimento no fluxo de caixa:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// curl -X POST http://localhost:5000/fluxo_caixa \
// -H 'Content-Type: application/json' \
// -d '{
//   "tipo": "Entrada",
//   "descricao": "Recebimento de mensalidade",
//   "valor": 500.00,
//   "data_movimento": "2024-09-25"
// }'

