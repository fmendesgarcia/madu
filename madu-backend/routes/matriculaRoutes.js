const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar uma nova matrícula
router.post('/', async (req, res) => {
  try {
    const { aluno_id, turma_id, status, mensalidade, data_vencimento, data_final_contrato, desconto, isencao_taxa, bolsista } = req.body;
    
    const query = `
      INSERT INTO matriculas (aluno_id, turma_id, status, mensalidade, data_vencimento, data_final_contrato, desconto, isencao_taxa, bolsista)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    
    const values = [aluno_id, turma_id, status, mensalidade, data_vencimento, data_final_contrato, desconto, isencao_taxa, bolsista];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna a matrícula criada
  } catch (error) {
    console.error('Erro ao criar matrícula:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todas as matrículas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT matriculas.*, alunos.nome AS aluno_nome, turmas.nome AS turma_nome
      FROM matriculas
      LEFT JOIN alunos ON matriculas.aluno_id = alunos.id
      LEFT JOIN turmas ON matriculas.turma_id = turmas.id
      ORDER BY matriculas.data_matricula DESC;
    `);
    res.json(result.rows); // Retorna a lista de matrículas
  } catch (error) {
    console.error('Erro ao listar matrículas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar uma matrícula por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT matriculas.*, alunos.nome AS aluno_nome, turmas.nome AS turma_nome
      FROM matriculas
      LEFT JOIN alunos ON matriculas.aluno_id = alunos.id
      LEFT JOIN turmas ON matriculas.turma_id = turmas.id
      WHERE matriculas.id = $1;
    `, [req.params.id]);
    
    const matricula = result.rows[0];
    
    if (matricula) {
      res.json(matricula);
    } else {
      res.status(404).json({ message: 'Matrícula não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar matrícula por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar uma matrícula
router.put('/:id', async (req, res) => {
  try {
    const { aluno_id, turma_id, status, mensalidade, data_vencimento, data_final_contrato, desconto, isencao_taxa, bolsista } = req.body;
    
    const query = `
      UPDATE matriculas
      SET aluno_id = $1, turma_id = $2, status = $3, mensalidade = $4, data_vencimento = $5, data_final_contrato = $6, desconto = $7, isencao_taxa = $8, bolsista = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *;
    `;
    
    const values = [aluno_id, turma_id, status, mensalidade, data_vencimento, data_final_contrato, desconto, isencao_taxa, bolsista, req.params.id];
    
    const result = await pool.query(query, values);
    const matriculaAtualizada = result.rows[0];
    
    if (matriculaAtualizada) {
      res.json(matriculaAtualizada);
    } else {
      res.status(404).json({ message: 'Matrícula não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar matrícula:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar uma matrícula
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM matriculas WHERE id = $1 RETURNING *;', [req.params.id]);
    
    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Matrícula deletada' });
    } else {
      res.status(404).json({ message: 'Matrícula não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar matrícula:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// curl -X POST http://localhost:5000/matriculas \
// -H 'Content-Type: application/json' \
// -d '{
//   "aluno_id": 1,
//   "turma_id": 1,
//   "status": "ativa",
//   "mensalidade": 500.00,
//   "data_vencimento": "2024-10-01",
//   "data_final_contrato": "2025-09-30",
//   "desconto": 50.00,
//   "isencao_taxa": true,
//   "bolsista": false
// }'

// Exemplo de requisição GET para listar todas as matrículas:
// curl -X GET http://localhost:5000/matriculas

