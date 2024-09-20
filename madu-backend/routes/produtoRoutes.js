const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar um novo produto
router.post('/', async (req, res) => {
  try {
    const { nome, descricao, preco, quantidade_estoque } = req.body;
    
    const query = `
      INSERT INTO produtos (nome, descricao, preco, quantidade_estoque)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const values = [nome, descricao, preco, quantidade_estoque || 0]; // Se não fornecer quantidade, assume 0
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna o produto criado
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM produtos
      ORDER BY nome ASC;
    `);
    res.json(result.rows); // Retorna a lista de produtos
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar um produto por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos WHERE id = $1;', [req.params.id]);

    const produto = result.rows[0];

    if (produto) {
      res.json(produto);
    } else {
      res.status(404).json({ message: 'Produto não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar um produto
router.put('/:id', async (req, res) => {
  try {
    const { nome, descricao, preco, quantidade_estoque } = req.body;

    const query = `
      UPDATE produtos
      SET nome = $1, descricao = $2, preco = $3, quantidade_estoque = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `;

    const values = [nome, descricao, preco, quantidade_estoque, req.params.id];

    const result = await pool.query(query, values);
    const produtoAtualizado = result.rows[0];

    if (produtoAtualizado) {
      res.json(produtoAtualizado);
    } else {
      res.status(404).json({ message: 'Produto não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar um produto
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *;', [req.params.id]);

    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Produto deletado' });
    } else {
      res.status(404).json({ message: 'Produto não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// curl -X POST http://localhost:5000/produtos \
// -H 'Content-Type: application/json' \
// -d '{
//   "nome": "Produto Exemplo",
//   "descricao": "Descrição do produto exemplo",
//   "preco": 100.00,
//   "quantidade_estoque": 10
// }'

