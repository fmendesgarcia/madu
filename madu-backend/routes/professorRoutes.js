const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar um novo professor
router.post('/', async (req, res) => {
  try {
    const { nome, apelido, sexo, data_nascimento, cpf, cnpj, email, telefone, endereco, cidade, estado, valor_hora, dia_pagamento, dados_bancarios, contrato } = req.body;
    
    const query = `
      INSERT INTO professores (nome, apelido, sexo, data_nascimento, cpf, cnpj, email, telefone, endereco, cidade, estado, valor_hora, dia_pagamento, dados_bancarios, contrato)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;
    
    const values = [nome, apelido, sexo, data_nascimento, cpf, cnpj, email, telefone, endereco, cidade, estado, valor_hora, dia_pagamento, dados_bancarios, contrato];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna o professor criado
  } catch (error) {
    console.error('Erro ao criar professor:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todos os professores
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM professores ORDER BY nome ASC;');
    res.json(result.rows); // Retorna a lista de professores
  } catch (error) {
    console.error('Erro ao listar professores:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar um professor por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM professores WHERE id = $1;', [req.params.id]);
    const professor = result.rows[0];
    
    if (professor) {
      res.json(professor);
    } else {
      res.status(404).json({ message: 'Professor não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar professor por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar um professor
router.put('/:id', async (req, res) => {
  try {
    const { nome, apelido, sexo, data_nascimento, cpf, cnpj, email, telefone, endereco, cidade, estado, valor_hora, dia_pagamento, dados_bancarios, contrato } = req.body;
    
    const query = `
      UPDATE professores
      SET nome = $1, apelido = $2, sexo = $3, data_nascimento = $4, cpf = $5, cnpj = $6, email = $7, telefone = $8, endereco = $9, cidade = $10, estado = $11, valor_hora = $12, dia_pagamento = $13, dados_bancarios = $14, contrato = $15, updated_at = NOW()
      WHERE id = $16
      RETURNING *;
    `;
    
    const values = [nome, apelido, sexo, data_nascimento, cpf, cnpj, email, telefone, endereco, cidade, estado, valor_hora, dia_pagamento, dados_bancarios, contrato, req.params.id];
    
    const result = await pool.query(query, values);
    const professorAtualizado = result.rows[0];
    
    if (professorAtualizado) {
      res.json(professorAtualizado);
    } else {
      res.status(404).json({ message: 'Professor não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar um professor
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM professores WHERE id = $1 RETURNING *;', [req.params.id]);
    
    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Professor deletado' });
    } else {
      res.status(404).json({ message: 'Professor não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar professor:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// curl -X POST http://localhost:5000/professores \
// -H 'Content-Type: application/json' \
// -d '{
//   "nome": "Carlos Silva",
//   "apelido": "Carlão",
//   "sexo": "M",
//   "data_nascimento": "1980-03-15",
//   "cpf": "12345678901",
//   "cnpj": "98765432100123",
//   "email": "carlos@gmail.com",
//   "telefone": "11988887777",
//   "endereco": "Rua ABC, 456",
//   "cidade": "São Paulo",
//   "estado": "SP",
//   "valor_hora": 150.50,
//   "dia_pagamento": 15,
//   "dados_bancarios": "chave-pix",
//   "contrato": "https://contrato-url.com"
// }'

