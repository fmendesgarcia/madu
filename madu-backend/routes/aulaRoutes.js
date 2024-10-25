const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar uma nova aula
router.post('/', async (req, res) => {
  try {
    const { turma_id, start, end_time } = req.body;
    
    const query = `
      INSERT INTO aulas (turma_id, start, end_time)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    
    const values = [turma_id, start, end_time];
    
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
      ORDER BY aulas.start ASC;  
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
    const { turma_id, start, end_time } = req.body;
    
    const query = `
      UPDATE aulas
      SET turma_id = $1, start = $2, end_time = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
    
    const values = [turma_id, start, end_time, req.params.id];
    
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
