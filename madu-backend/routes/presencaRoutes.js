const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para registrar uma presença
router.post('/', async (req, res) => {
  try {
    const { aluno_id, aula_id, presente } = req.body;

    const query = `
      INSERT INTO presencas (aluno_id, aula_id, presente)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [aluno_id, aula_id, presente || false]; // Se 'presente' não for fornecido, assume 'false'

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna o registro de presença criado
  } catch (error) {
    console.error('Erro ao registrar presença:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todas as presenças
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT presencas.*, alunos.nome AS aluno_nome, aulas.data AS aula_data, aulas.horario AS aula_horario
      FROM presencas
      LEFT JOIN alunos ON presencas.aluno_id = alunos.id
      LEFT JOIN aulas ON presencas.aula_id = aulas.id
      ORDER BY aulas.data ASC, aulas.horario ASC;
    `);
    res.json(result.rows); // Retorna a lista de presenças
  } catch (error) {
    console.error('Erro ao listar presenças:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar uma presença por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT presencas.*, alunos.nome AS aluno_nome, aulas.data AS aula_data, aulas.horario AS aula_horario
      FROM presencas
      LEFT JOIN alunos ON presencas.aluno_id = alunos.id
      LEFT JOIN aulas ON presencas.aula_id = aulas.id
      WHERE presencas.id = $1;
    `, [req.params.id]);

    const presenca = result.rows[0];

    if (presenca) {
      res.json(presenca);
    } else {
      res.status(404).json({ message: 'Presença não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar presença por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar a presença
router.put('/:id', async (req, res) => {
  try {
    const { aluno_id, aula_id, presente } = req.body;

    const query = `
      UPDATE presencas
      SET aluno_id = $1, aula_id = $2, presente = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;

    const values = [aluno_id, aula_id, presente, req.params.id];

    const result = await pool.query(query, values);
    const presencaAtualizada = result.rows[0];

    if (presencaAtualizada) {
      res.json(presencaAtualizada);
    } else {
      res.status(404).json({ message: 'Presença não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar presença:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar uma presença
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM presencas WHERE id = $1 RETURNING *;', [req.params.id]);

    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Presença deletada' });
    } else {
      res.status(404).json({ message: 'Presença não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar presença:', error);
    res.status(500).json({ error: error.message });
  }
});


// Rota para listar os alunos e suas presenças em uma aula específica
router.get('/aulas/:aula_id/presencas', async (req, res) => {
  try {
    const { aula_id } = req.params;

    const query = `
      SELECT 
          a.id AS aluno_id,
          a.nome AS aluno_nome,
          a.cpf AS aluno_cpf,
          COALESCE(p.presente, false) AS presente
      FROM 
          public.alunos a
      JOIN 
          public.matriculas m ON m.aluno_id = a.id
      JOIN 
          public.matriculas_turmas mt ON mt.matricula_id = m.id
      JOIN 
          public.aulas au ON au.turma_id = mt.turma_id
      LEFT JOIN 
          public.presencas p ON p.aluno_id = a.id AND p.aula_id = au.id
      WHERE 
          au.id = $1;
    `;

    const values = [aula_id];
    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar presenças da aula:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// curl -X POST http://localhost:5000/presencas \
// -H 'Content-Type: application/json' \
// -d '{
//   "aluno_id": 1,
//   "aula_id": 1,
//   "presente": true
// }'

