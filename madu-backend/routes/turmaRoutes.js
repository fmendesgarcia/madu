const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar uma nova turma
router.post('/', async (req, res) => {
  try {
    const { nome, modalidade, tipo, nivel, professor_id, max_alunos, valor_hora } = req.body;

    const queryTurma = `
      INSERT INTO turmas (nome, modalidade, tipo, nivel, professor_id, max_alunos, valor_hora)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const valuesTurma = [nome, modalidade, tipo, nivel, professor_id, max_alunos, valor_hora];
    const resultTurma = await pool.query(queryTurma, valuesTurma);
    const turmaCriada = resultTurma.rows[0];

    res.status(201).json(turmaCriada);
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/:turmaId/horarios', async (req, res) => {
  console.log("Entrou na rota de horários-----------------------");
  try {
    const { horarios } = req.body;
    const { turmaId } = req.params;

    console.log('Horários recebidos:', horarios);
    console.log('ID da turma recebida:', turmaId);

    if (!turmaId) {
      console.log('Erro: turmaId não foi passado.');
      return res.status(400).json({ message: 'turmaId é obrigatório' });
    }

    if (!Array.isArray(horarios) || horarios.length === 0) {
      console.log('Erro: Horários não foram enviados corretamente ou estão vazios.');
      return res.status(400).json({ message: 'Horários são obrigatórios e devem ser um array' });
    }

    // Obter os horários antigos da turma
    const horariosExistentes = await pool.query('SELECT * FROM horarios_turma WHERE turma_id = $1;', [turmaId]);

    // Primeiro, remover as aulas associadas aos horários que serão deletados
    for (const horario of horariosExistentes.rows) {
      await pool.query('DELETE FROM aulas WHERE horario_id = $1;', [horario.id]);
      console.log(`Aulas associadas ao horário ${horario.id} foram removidas.`);
    }

    // Agora podemos remover os horários antigos
    await pool.query('DELETE FROM horarios_turma WHERE turma_id = $1;', [turmaId]);

    // Inserir os novos horários
    const queryHorarios = `
      INSERT INTO horarios_turma (turma_id, dia_da_semana, horario)
      VALUES ($1, $2, $3);
    `;

    for (const horario of horarios) {
      console.log('Processando horário:', horario);

      if (!horario.dia_da_semana || !horario.horario) {
        console.log('Erro: Faltando dados para o horário:', horario);
        return res.status(400).json({ message: 'Todos os horários devem ter dia_da_semana e horário' });
      }

      await pool.query(queryHorarios, [turmaId, horario.dia_da_semana, horario.horario]);

      console.log(`Query executada com sucesso para turmaId ${turmaId} e horário: ${horario.dia_da_semana} - ${horario.horario}`);
    }

    res.status(200).json({ message: 'Horários atualizados com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar horários da turma:', error);
    res.status(500).json({ error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { nome, modalidade, tipo, nivel, professor_id, horarios, max_alunos, valor_hora } = req.body;

    // Atualizar a tabela turmas
    const queryTurma = `
      UPDATE turmas
      SET nome = $1, modalidade = $2, tipo = $3, nivel = $4, professor_id = $5, max_alunos = $6, valor_hora = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING *;
    `;
    
    const valuesTurma = [nome, modalidade, tipo, nivel, professor_id, max_alunos, parseFloat(valor_hora), req.params.id];
    const resultTurma = await pool.query(queryTurma, valuesTurma);
    const turmaAtualizada = resultTurma.rows[0];

    if (Array.isArray(horarios) && horarios.length > 0) {
      // Obter os horários antigos da turma
      const horariosExistentes = await pool.query('SELECT * FROM horarios_turma WHERE turma_id = $1;', [req.params.id]);

      // Primeiro, remover as aulas associadas aos horários antigos
      for (const horario of horariosExistentes.rows) {
        await pool.query('DELETE FROM aulas WHERE horario_id = $1;', [horario.id]);
        console.log(`Aulas associadas ao horário ${horario.id} foram removidas.`);
      }

      // Agora podemos remover os horários antigos
      await pool.query('DELETE FROM horarios_turma WHERE turma_id = $1;', [req.params.id]);

      // Inserir os novos horários
      const queryHorarios = `
        INSERT INTO horarios_turma (turma_id, dia_da_semana, horario)
        VALUES ($1, $2, $3);
      `;
      for (const horario of horarios) {
        await pool.query(queryHorarios, [req.params.id, horario.dia_da_semana, horario.horario]);
      }
    }

    res.json({ message: 'Turma e horários atualizados com sucesso', turma: turmaAtualizada });
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    res.status(400).json({ error: error.message });
  }
});


// Rota para buscar todas as turmas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM turmas');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar os horários de uma turma específica
router.get('/:turmaId/horarios', async (req, res) => {
  const { turmaId } = req.params;
  try {
    const queryHorarios = `
      SELECT dia_da_semana, horario
      FROM horarios_turma
      WHERE turma_id = $1;
    `;
    const resultHorarios = await pool.query(queryHorarios, [turmaId]);

    if (resultHorarios.rows.length > 0) {
      console.log('Horários carregados:', resultHorarios.rows);
      res.json(resultHorarios.rows);
    } else {
      res.status(404).json({ message: 'Nenhum horário encontrado para essa turma' });
    }
  } catch (error) {
    console.error('Erro ao buscar horários da turma:', error);
    res.status(500).json({ error: 'Erro ao buscar horários da turma' });
  }
});


// Rota para buscar uma turma por ID (incluindo horários)
router.get('/:id', async (req, res) => {
  console.log("entrou na buceta");
  try {
    const queryTurma = `
      SELECT turmas.*, professores.nome AS professor_nome
      FROM turmas
      LEFT JOIN professores ON turmas.professor_id = professores.id
      WHERE turmas.id = $1;
    `;
    const resultTurma = await pool.query(queryTurma, [req.params.id]);
    const turma = resultTurma.rows[0];

    if (turma) {
      // Carregar os horários dessa turma
      const queryHorarios = `
        SELECT dia_da_semana, horario
        FROM horarios_turma
        WHERE turma_id = $1;
      `;
      const resultHorarios = await pool.query(queryHorarios, [req.params.id]);
      turma.horarios = resultHorarios.rows;

      console.log('Horários carregados para a turma:', turma.horarios);
      res.json(turma);
    } else {
      res.status(404).json({ message: 'Turma não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar turma por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para deletar uma turma (opcionalmente lidando com as aulas associadas)
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
// Rota para buscar os valores das turmas com base nos IDs
router.post('/valores', async (req, res) => {
  try {
    const { turma_ids } = req.body;

    if (!turma_ids || turma_ids.length === 0) {
      return res.status(400).json({ message: 'Nenhuma turma selecionada' });
    }

    const query = `
      SELECT valor_hora
      FROM turmas
      WHERE id = ANY($1::int[]);
    `;

    const result = await pool.query(query, [turma_ids]);

    const valores = result.rows.map(row => parseFloat(row.valor_hora));
    
    res.json({ valores });
  } catch (error) {
    console.error('Erro ao buscar valores das turmas:', error);
    res.status(500).json({ error: 'Erro ao buscar valores das turmas' });
  }
});

module.exports = router;
