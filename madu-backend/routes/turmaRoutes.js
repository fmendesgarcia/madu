const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

function diaPtBrParaJsIndex(dia) {
  const map = {
    'Domingo': 0,
    'Segunda': 1,
    'Terça': 2,
    'Terca': 2,
    'Quarta': 3,
    'Quinta': 4,
    'Sexta': 5,
    'Sábado': 6,
    'Sabado': 6,
  };
  return map[dia] ?? -1;
}

async function gerarAulasParaTurma(turmaId, horarios, diasAdiante = 90) {
  // Limpa aulas futuras planejadas para evitar duplicidade
  await pool.query(
    "DELETE FROM aulas WHERE turma_id = $1 AND start >= CURRENT_DATE AND COALESCE(status, 'planejada') = 'planejada'",
    [turmaId]
  );

  // Buscar nome da turma para preencher o title
  const turmaRes = await pool.query('SELECT nome FROM turmas WHERE id = $1', [turmaId]);
  const turmaNome = turmaRes.rows[0]?.nome || 'Aula';

  const hoje = new Date();
  const fim = new Date();
  fim.setDate(fim.getDate() + diasAdiante);

  // Pre-processa horários por índice de dia
  const horariosPorDia = new Map();
  for (const h of horarios) {
    const idx = diaPtBrParaJsIndex(h.dia_da_semana);
    if (idx < 0) continue;
    if (!horariosPorDia.has(idx)) horariosPorDia.set(idx, []);
    horariosPorDia.get(idx).push(h.horario);
  }

  const inserts = [];
  for (
    let d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    d <= fim;
    d.setDate(d.getDate() + 1)
  ) {
    const idx = d.getDay();
    const horariosDia = horariosPorDia.get(idx);
    if (!horariosDia || horariosDia.length === 0) continue;

    for (const hhmm of horariosDia) {
      const [hh, mm] = (hhmm || '').split(':').map((x) => parseInt(x, 10));
      if (isNaN(hh) || isNaN(mm)) continue;
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      inserts.push({ start, end });
    }
  }

  const query = `
    INSERT INTO aulas (turma_id, title, start, end_time, status)
    VALUES ($1, $2, $3, $4, 'planejada')
  `;
  for (const aula of inserts) {
    await pool.query(query, [turmaId, turmaNome, aula.start, aula.end]);
  }
}

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

    // Primeiro, remover as aulas associadas aos horários antigos (se existir coluna horario_id no seu schema)
    for (const horario of horariosExistentes.rows) {
      try {
        await pool.query('DELETE FROM aulas WHERE horario_id = $1;', [horario.id]);
      } catch (_) {
        // ignora se a coluna não existir no schema atual
      }
    }

    // Agora podemos remover os horários antigos
    await pool.query('DELETE FROM horarios_turma WHERE turma_id = $1;', [turmaId]);

    // Inserir os novos horários
    const queryHorarios = `
      INSERT INTO horarios_turma (turma_id, dia_da_semana, horario)
      VALUES ($1, $2, $3);
    `;

    for (const horario of horarios) {
      if (!horario.dia_da_semana || !horario.horario) {
        return res.status(400).json({ message: 'Todos os horários devem ter dia_da_semana e horário' });
      }
      await pool.query(queryHorarios, [turmaId, horario.dia_da_semana, horario.horario]);
    }

    // Gerar aulas futuras com base nos novos horários (90 dias)
    await gerarAulasParaTurma(turmaId, horarios, 90);

    res.status(200).json({ message: 'Horários e aulas futuras atualizados com sucesso' });
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
