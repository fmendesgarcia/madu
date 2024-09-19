const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar uma nova aula
router.post('/', async (req, res) => {
  try {
    const { turma_id, data, horario, duracao } = req.body;
    
    const query = `
      INSERT INTO aulas (turma_id, data, horario, duracao)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const values = [turma_id, data, horario, duracao];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna a aula criada
  } catch (error) {
    console.error('Erro ao criar aula:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todas as aulas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT aulas.*, turmas.nome AS turma_nome
      FROM aulas
      LEFT JOIN turmas ON aulas.turma_id = turmas.id
      ORDER BY aulas.data ASC, aulas.horario ASC;
    `);
    res.json(result.rows); // Retorna a lista de aulas
  } catch (error) {
    console.error('Erro ao listar aulas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar uma aula por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT aulas.*, turmas.nome AS turma_nome
      FROM aulas
      LEFT JOIN turmas ON aulas.turma_id = turmas.id
      WHERE aulas.id = $1;
    `, [req.params.id]);
    
    const aula = result.rows[0];
    
    if (aula) {
      res.json(aula);
    } else {
      res.status(404).json({ message: 'Aula não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar aula por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar uma aula
router.put('/:id', async (req, res) => {
  try {
    const { turma_id, data, horario, duracao } = req.body;
    
    const query = `
      UPDATE aulas
      SET turma_id = $1, data = $2, horario = $3, duracao = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `;
    
    const values = [turma_id, data, horario, duracao, req.params.id];
    
    const result = await pool.query(query, values);
    const aulaAtualizada = result.rows[0];
    
    if (aulaAtualizada) {
      res.json(aulaAtualizada);
    } else {
      res.status(404).json({ message: 'Aula não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar aula:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar uma aula
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM aulas WHERE id = $1 RETURNING *;', [req.params.id]);
    
    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Aula deletada' });
    } else {
      res.status(404).json({ message: 'Aula não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar aula:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// curl -X POST http://localhost:5000/aulas \
// -H 'Content-Type: application/json' \
// -d '{
//   "turma_id": 1,
//   "data": "2024-09-25",
//   "horario": "18:00:00",
//   "duracao": 60
// }'
