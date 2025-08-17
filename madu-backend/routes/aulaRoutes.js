const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar uma nova aula
router.post('/', async (req, res) => {
  try {
    const { turma_id, start, end_time, status, substituto_professor_id, observacoes } = req.body;
    const query = `
      INSERT INTO aulas (turma_id, start, end_time, status, substituto_professor_id, observacoes)
      VALUES ($1, $2, $3, COALESCE($4, 'planejada'), $5, $6)
      RETURNING *;
    `;
    const values = [turma_id, start, end_time, status, substituto_professor_id || null, observacoes || null];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar aula:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todas as aulas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT aulas.*, turmas.nome AS turma_nome, turmas.professor_id, professores.nome AS professor_nome
      FROM aulas
      LEFT JOIN turmas ON aulas.turma_id = turmas.id
      LEFT JOIN professores ON turmas.professor_id = professores.id
      ORDER BY aulas.start ASC;  
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar aulas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar uma aula por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT aulas.*, turmas.nome AS turma_nome, turmas.professor_id, professores.nome AS professor_nome
      FROM aulas
      LEFT JOIN turmas ON aulas.turma_id = turmas.id
      LEFT JOIN professores ON turmas.professor_id = professores.id
      WHERE aulas.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Aula não encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar aula:', error);
    res.status(500).json({ error: error.message });
  }
});

// Atualiza os horários e metadados de uma aula específica
router.put('/:id', async (req, res) => {
  const { start, end_time, status, substituto_professor_id, observacoes } = req.body;
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: 'ID da aula não fornecido' });
  }

  try {
    const query = `
      UPDATE aulas
      SET start = COALESCE($1, start),
          end_time = COALESCE($2, end_time),
          status = COALESCE($3, status),
          substituto_professor_id = $4,
          observacoes = COALESCE($5, observacoes)
      WHERE id = $6
      RETURNING *;
    `;
    const values = [start || null, end_time || null, status || null, substituto_professor_id || null, observacoes || null, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aula não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar aula:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para deletar uma aula
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM aulas WHERE id = $1 RETURNING *;', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Aula não encontrada' });
    res.status(204).json({ message: 'Aula deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aula:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
