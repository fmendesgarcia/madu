const express = require('express');
const router = express.Router();
const pool = require('../config/config');

// Utilitário para montar filtro por mês/ano
function buildMonthYearFilter(column, mes, ano, params) {
  let clause = '';
  if (mes) {
    clause += (clause ? ' AND ' : ' WHERE ') + `TO_CHAR(${column}, 'MM') = $${params.length + 1}`;
    params.push(mes.toString().padStart(2, '0'));
  }
  if (ano) {
    clause += (clause ? ' AND ' : ' WHERE ') + `TO_CHAR(${column}, 'YYYY') = $${params.length + 1}`;
    params.push(ano.toString());
  }
  return clause;
}

// A receber por aluno (mensalidades)
router.get('/receber-alunos', async (req, res) => {
  const { mes, ano } = req.query;
  try {
    const params = [];
    let where = buildMonthYearFilter('m.data_vencimento', mes, ano, params);

    const query = `
      SELECT 
        a.id AS aluno_id,
        a.nome AS aluno_nome,
        SUM(CASE WHEN m.status = 'pendente' AND m.data_vencimento >= CURRENT_DATE THEN m.valor ELSE 0 END) AS total_pendente,
        SUM(CASE WHEN m.status = 'pendente' AND m.data_vencimento < CURRENT_DATE THEN m.valor ELSE 0 END) AS total_vencido,
        SUM(CASE WHEN m.status = 'pago' THEN m.valor ELSE 0 END) AS total_pago
      FROM mensalidades m
      JOIN matriculas mat ON m.matricula_id = mat.id
      JOIN alunos a ON mat.aluno_id = a.id
      ${where}
      GROUP BY a.id, a.nome
      ORDER BY a.nome;
    `;

    const result = await pool.query(query, params);
    const rows = result.rows.map(r => ({
      ...r,
      total_pendente: Number(r.total_pendente || 0),
      total_vencido: Number(r.total_vencido || 0),
      total_pago: Number(r.total_pago || 0),
      total_receber: Number(r.total_pendente || 0) + Number(r.total_vencido || 0),
    }));

    res.json(rows);
  } catch (error) {
    console.error('Erro ao calcular a receber por aluno:', error);
    res.status(500).json({ error: error.message });
  }
});

// A receber por turma (mensalidades)
router.get('/receber-turmas', async (req, res) => {
  const { mes, ano } = req.query;
  try {
    const params = [];
    let where = buildMonthYearFilter('m.data_vencimento', mes, ano, params);

    const query = `
      SELECT 
        t.id AS turma_id,
        t.nome AS turma_nome,
        SUM(CASE WHEN m.status = 'pendente' AND m.data_vencimento >= CURRENT_DATE THEN m.valor ELSE 0 END) AS total_pendente,
        SUM(CASE WHEN m.status = 'pendente' AND m.data_vencimento < CURRENT_DATE THEN m.valor ELSE 0 END) AS total_vencido,
        SUM(CASE WHEN m.status = 'pago' THEN m.valor ELSE 0 END) AS total_pago
      FROM mensalidades m
      JOIN matriculas mat ON m.matricula_id = mat.id
      JOIN matriculas_turmas mt ON mt.matricula_id = mat.id
      JOIN turmas t ON t.id = mt.turma_id
      ${where}
      GROUP BY t.id, t.nome
      ORDER BY t.nome;
    `;

    const result = await pool.query(query, params);
    const rows = result.rows.map(r => ({
      ...r,
      total_pendente: Number(r.total_pendente || 0),
      total_vencido: Number(r.total_vencido || 0),
      total_pago: Number(r.total_pago || 0),
      total_receber: Number(r.total_pendente || 0) + Number(r.total_vencido || 0),
    }));

    res.json(rows);
  } catch (error) {
    console.error('Erro ao calcular a receber por turma:', error);
    res.status(500).json({ error: error.message });
  }
});

// A pagar por professor (horas de aulas x valor_hora do professor)
router.get('/pagar-professores', async (req, res) => {
  const { mes, ano } = req.query;
  try {
    const params = [];
    let where = buildMonthYearFilter('a.start', mes, ano, params);
    // considerar apenas realizadas
    where += (where ? ' AND ' : ' WHERE ') + "COALESCE(a.status, 'planejada') = 'realizada'";

    const query = `
      WITH aulas_base AS (
        SELECT 
          a.id,
          a.start,
          a.end_time,
          a.substituto_professor_id,
          t.professor_id AS titular_professor_id,
          COALESCE(a.substituto_professor_id, t.professor_id) AS professor_id_utilizado
        FROM aulas a
        JOIN turmas t ON a.turma_id = t.id
        ${where}
      )
      SELECT 
        p.id AS professor_id,
        p.nome AS professor_nome,
        COALESCE(p.valor_hora, 0) AS valor_hora,
        SUM(GREATEST(EXTRACT(EPOCH FROM ((ab.end_time)::timestamp - (ab.start)::timestamp)) / 3600, 0)) AS total_horas
      FROM aulas_base ab
      JOIN professores p ON p.id = ab.professor_id_utilizado
      GROUP BY p.id, p.nome, p.valor_hora
      ORDER BY p.nome;
    `;

    const result = await pool.query(query, params);
    const rows = result.rows.map(r => ({
      professor_id: r.professor_id,
      professor_nome: r.professor_nome,
      valor_hora: Number(r.valor_hora || 0),
      total_horas: Number(r.total_horas || 0),
      total_pagar: Number(r.valor_hora || 0) * Number(r.total_horas || 0),
    }));

    res.json(rows);
  } catch (error) {
    console.error('Erro ao calcular a pagar por professor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar aulas realizadas (não pagas) por professor e período
router.get('/professores/:id/aulas-nao-pagas', async (req, res) => {
  const { id } = req.params;
  const { mes, ano } = req.query;
  try {
    const params = [id];
    let where = buildMonthYearFilter('a.start', mes, ano, params);
    where += (where ? ' AND ' : ' WHERE ') + "COALESCE(a.status, 'planejada') = 'realizada'";

    const query = `
      SELECT a.id, a.start, a.end_time, t.nome AS turma_nome
      FROM aulas a
      JOIN turmas t ON a.turma_id = t.id
      LEFT JOIN pagamentos_professores_aulas ppa ON ppa.aula_id = a.id
      WHERE (${id} = COALESCE(a.substituto_professor_id, t.professor_id))
        AND ppa.aula_id IS NULL
        ${where.replace('WHERE', 'AND')}
      ORDER BY a.start;
    `;

    // where começa com WHERE, mas já temos condições antes, então ajustamos com replace acima
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar aulas não pagas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Criar pagamento para professor, vinculando aulas
router.post('/professores/:id/pagamentos', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // professor_id
    const { mes, ano, aula_ids, data_pagamento, forma_pagamento, observacoes } = req.body;

    if (!mes || !ano || !Array.isArray(aula_ids) || aula_ids.length === 0) {
      return res.status(400).json({ message: 'Informe mes, ano e aula_ids.' });
    }

    await client.query('BEGIN');

    // Carregar valor_hora do professor
    const prof = await client.query('SELECT valor_hora FROM professores WHERE id = $1', [id]);
    if (prof.rows.length === 0) throw new Error('Professor não encontrado');
    const valorHora = parseFloat(prof.rows[0].valor_hora) || 0;

    // Carregar aulas e calcular horas
    const aulasRes = await client.query(
      `SELECT id, start, end_time FROM aulas WHERE id = ANY($1::int[])`,
      [aula_ids]
    );
    let totalHoras = 0;
    for (const a of aulasRes.rows) {
      const horas = Math.max(0, (new Date(a.end_time) - new Date(a.start)) / 3600000);
      totalHoras += horas;
    }
    const valorTotal = totalHoras * valorHora;

    const pagRes = await client.query(
      `INSERT INTO pagamentos_professores (professor_id, mes, ano, total_horas, valor_total, data_pagamento, forma_pagamento, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
      [id, mes.toString().padStart(2, '0'), parseInt(ano, 10), totalHoras, valorTotal, data_pagamento || null, forma_pagamento || null, observacoes || null]
    );
    const pagamento = pagRes.rows[0];

    for (const aulaId of aula_ids) {
      await client.query(
        `INSERT INTO pagamentos_professores_aulas (pagamento_professor_id, aula_id) VALUES ($1, $2)`,
        [pagamento.id, aulaId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ pagamento });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar pagamento de professor:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
