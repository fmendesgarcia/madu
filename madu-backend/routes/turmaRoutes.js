const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar uma nova turma
router.post('/', async (req, res) => {
  try {
    const { nome, modalidade, nivel, professor_id, dias_da_semana, horario, max_alunos } = req.body;
    
    // Converter array de dias_da_semana em uma string separada por vírgulas
    const diasDaSemanaStr = dias_da_semana.join(',');

    const query = `
      INSERT INTO turmas (nome, modalidade, nivel, professor_id, dias_da_semana, horario, max_alunos)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [nome, modalidade, nivel, professor_id, diasDaSemanaStr, horario, max_alunos];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna a turma criada
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    res.status(400).json({ error: error.message });
  }
});


// Rota para listar todas as turmas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT turmas.*, professores.nome AS professor_nome 
      FROM turmas
      LEFT JOIN professores ON turmas.professor_id = professores.id
      ORDER BY turmas.nome ASC;
    `);
    res.json(result.rows); // Retorna a lista de turmas
  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar uma turma por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT turmas.*, professores.nome AS professor_nome
      FROM turmas
      LEFT JOIN professores ON turmas.professor_id = professores.id
      WHERE turmas.id = $1;
    `, [req.params.id]);
    
    const turma = result.rows[0];
    
    if (turma) {
      // Converter a string de dias_da_semana de volta para um array
      turma.dias_da_semana = turma.dias_da_semana.split(',');
      res.json(turma);
    } else {
      res.status(404).json({ message: 'Turma não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar turma por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar uma turma
router.put('/:id', async (req, res) => {
  try {
    const { nome, modalidade, nivel, professor_id, dias_da_semana, horario, max_alunos } = req.body;
    
    // Converter array de dias_da_semana em uma string separada por vírgulas
    const diasDaSemanaStr = dias_da_semana.join(',');

    const query = `
      UPDATE turmas
      SET nome = $1, modalidade = $2, nivel = $3, professor_id = $4, dias_da_semana = $5, horario = $6, max_alunos = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING *;
    `;
    
    const values = [nome, modalidade, nivel, professor_id, diasDaSemanaStr, horario, max_alunos, req.params.id];
    
    const result = await pool.query(query, values);
    const turmaAtualizada = result.rows[0];
    
    if (turmaAtualizada) {
      res.json(turmaAtualizada);
    } else {
      res.status(404).json({ message: 'Turma não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar uma turma
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM turmas WHERE id = $1 RETURNING *;', [req.params.id]);
    
    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Turma deletada' });
    } else {
      res.status(404).json({ message: 'Turma não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar turma:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// curl -X POST http://localhost:5000/turmas \
// -H 'Content-Type: application/json' \
// -d '{
//   "nome": "Turma de Ballet Avançado",
//   "modalidade": "Presencial",
//   "nivel": "Avançado",
//   "professor_id": 1,
//   "dias_da_semana": "Segunda, Quarta, Sexta",
//   "horario": "18:00:00",
//   "max_alunos": 20
// }'

