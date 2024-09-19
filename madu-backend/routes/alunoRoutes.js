const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Importa a conexão do banco de dados

// Rota para criar um novo aluno
router.post('/', async (req, res) => {
  try {
    const { nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato } = req.body;
    
    const query = `
      INSERT INTO alunos (nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    
    const values = [nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato];
    
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]); // Retorna o aluno criado
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alunos ORDER BY nome ASC;');
    res.json(result.rows); // Retorna a lista de alunos
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar um aluno por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alunos WHERE id = $1;', [req.params.id]);
    const aluno = result.rows[0];
    
    if (aluno) {
      res.json(aluno);
    } else {
      res.status(404).json({ message: 'Aluno não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar aluno por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar um aluno
router.put('/:id', async (req, res) => {
  try {
    const { nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato } = req.body;
    
    const query = `
      UPDATE alunos
      SET nome = $1, sexo = $2, data_nascimento = $3, telefone = $4, cpf = $5, email = $6, responsavel_financeiro = $7, bolsista = $8, endereco = $9, cidade = $10, estado = $11, foto = $12, contrato = $13, updated_at = NOW()
      WHERE id = $14
      RETURNING *;
    `;
    
    const values = [nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato, req.params.id];
    
    const result = await pool.query(query, values);
    const alunoAtualizado = result.rows[0];
    
    if (alunoAtualizado) {
      res.json(alunoAtualizado);
    } else {
      res.status(404).json({ message: 'Aluno não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar um aluno
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM alunos WHERE id = $1 RETURNING *;', [req.params.id]);
    
    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Aluno deletado' });
    } else {
      res.status(404).json({ message: 'Aluno não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// curl -X POST http://localhost:5000/alunos \
// -H 'Content-Type: application/json' \
// -d '{
//   "nome": "João Silva",
//   "sexo": "M",
//   "data_nascimento": "1990-05-20",
//   "telefone": "11999999999",
//   "cpf": "12345678901",
//   "email": "joao@gmail.com",
//   "responsavel_financeiro": false,
//   "bolsista": true,
//   "endereco": "Rua ABC, 123",
//   "cidade": "São Paulo",
//   "estado": "SP",
//   "foto": "https://foto-url.com",
//   "contrato": "https://contrato-url.com"
// }'
