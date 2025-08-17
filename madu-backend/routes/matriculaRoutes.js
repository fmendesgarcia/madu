const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL



// Função para cancelar mensalidades futuras ao inativar matrícula
const cancelarMensalidadesFuturas = async (matriculaId) => {
  try {
    // Atualiza mensalidades pendentes para canceladas
    const cancelarQuery = `
      UPDATE mensalidades
      SET status = 'cancelada'
      WHERE matricula_id = $1 AND status = 'pendente'
      RETURNING lancamento_id;
    `;
    const result = await pool.query(cancelarQuery, [matriculaId]);
    
    // Atualiza os lançamentos associados às mensalidades canceladas
    const lancamentoIds = result.rows.map(row => row.lancamento_id);
    
    if (lancamentoIds.length > 0) {
      const cancelarLancamentosQuery = `
        UPDATE lancamentos
        SET status = 'cancelada'
        WHERE id = ANY($1::int[]);
      `;
      await pool.query(cancelarLancamentosQuery, [lancamentoIds]);
    }

    console.log('Mensalidades e lançamentos cancelados com sucesso.');
  } catch (error) {
    console.error('Erro ao cancelar mensalidades futuras:', error);
  }
};

// Função para gerar mensalidades e criar lançamentos de receitas futuras
const gerarMensalidades = async (matriculaId, mensalidade, dataVencimento, dataFinalContrato, desconto = 0, isBolsista = false) => {
  const mensalidades = [];

  // Define dia alvo do vencimento (apenas o dia)
  const dataBase = new Date(dataVencimento);
  const diaVencimento = dataBase.getDate();

  // Normaliza a data para o mês/ano base, garantindo dia válido no mês
  let dataAtual = new Date(dataBase.getFullYear(), dataBase.getMonth(), 1);
  const lastDayMesBase = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).getDate();
  dataAtual.setDate(Math.min(diaVencimento, lastDayMesBase));

  // Gera mensalidades até a data final do contrato
  while (dataAtual <= new Date(dataFinalContrato)) {
    const valorFinal = isBolsista ? 0 : Number(mensalidade);

    mensalidades.push({
      matricula_id: matriculaId,
      valor: valorFinal,
      data_vencimento: new Date(dataAtual),
      status: 'pendente',
    });

    // Avança para o próximo mês, clampando o dia ao máximo do mês
    dataAtual.setMonth(dataAtual.getMonth() + 1, 1); // vai para dia 1 do próximo mês
    const lastDay = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).getDate();
    dataAtual.setDate(Math.min(diaVencimento, lastDay));
  }

  const mensalidadeQuery = `
    INSERT INTO mensalidades (matricula_id, valor, data_vencimento, status, lancamento_id)
    VALUES ($1, $2, $3, $4, $5);
  `;

  for (const mensalidade of mensalidades) {
    const lancamentoQuery = `
      INSERT INTO lancamentos (descricao, tipo, valor, data_lancamento, status)
      VALUES ('Receita futura mensalidade', 'receita', $1, $2, 'futura')
      RETURNING id;
    `;
    const lancamentoResult = await pool.query(lancamentoQuery, [mensalidade.valor, mensalidade.data_vencimento]);
    const lancamentoId = lancamentoResult.rows[0].id;

    await pool.query(mensalidadeQuery, [
      matriculaId,
      mensalidade.valor,
      mensalidade.data_vencimento,
      mensalidade.status,
      lancamentoId
    ]);
  }
};

const buildVencimentoDateFromDay = (dia, dataMatricula) => {
  const base = dataMatricula ? new Date(dataMatricula) : new Date();
  const ano = base.getFullYear();
  const mes = base.getMonth();
  const lastDay = new Date(ano, mes + 1, 0).getDate();
  const diaClamped = Math.max(1, Math.min(parseInt(dia, 10), lastDay));
  return new Date(ano, mes, diaClamped);
};

// Rota para criar uma nova matrícula e gerar mensalidades
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      aluno_id,
      turma_id, // única turma
      data_matricula,
      status,
      valor_matricula, // Novo campo
      data_vencimento,
      data_final_contrato,
      desconto,
      isencao_taxa,
      bolsista
    } = req.body;

    await client.query('BEGIN'); // Inicia a transação

  // Normaliza data de vencimento caso venha apenas como dia (1-31)
  const dataVencimentoNormalizada = (typeof data_vencimento === 'number' || /^(\d{1,2})$/.test(String(data_vencimento)))
    ? buildVencimentoDateFromDay(data_vencimento, data_matricula)
    : data_vencimento;

  // Recupera o valor da turma selecionada
  const turmaQuery = `
    SELECT valor_hora FROM turmas WHERE id = $1;
  `;
  const turmaResult = await client.query(turmaQuery, [turma_id]);

  if (turmaResult.rows.length === 0) {
    throw new Error('Turma não encontrada');
  }

  const valorTurma = parseFloat(turmaResult.rows[0].valor_hora) || 0;

  // Aplique o desconto como valor fixo (se informado)
  const descontoNumero = parseFloat(desconto) || 0;
  const mensalidadeFinal = valorTurma - descontoNumero;
  if (isNaN(mensalidadeFinal)) {
    throw new Error('Erro ao calcular a mensalidade: valor resultante é NaN');
  }

  // Insira a matrícula
  const matriculaQuery = `
    INSERT INTO matriculas (aluno_id, data_matricula, status, mensalidade, valor_matricula, data_vencimento, data_final_contrato, desconto, isencao_taxa, bolsista)
    VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, mensalidade;
  `;
  const matriculaValues = [
    aluno_id,
    data_matricula,
    status || 'ativa',
    mensalidadeFinal,
    valor_matricula,
    dataVencimentoNormalizada,
    data_final_contrato,
    descontoNumero,
    isencao_taxa || false,
    bolsista || false,
  ];

  const matriculaResult = await client.query(matriculaQuery, matriculaValues);
  const matriculaCriada = matriculaResult.rows[0];

  console.log('Matrícula criada com sucesso:', matriculaCriada);

  // Associa a matrícula à turma (única)
  const matriculasTurmasQuery = `
    INSERT INTO matriculas_turmas (matricula_id, turma_id)
    VALUES ($1, $2);
  `;
  await client.query(matriculasTurmasQuery, [matriculaCriada.id, turma_id]);

  await client.query('COMMIT');

  // Gera as mensalidades após a matrícula ter sido criada
  if (mensalidadeFinal && dataVencimentoNormalizada && data_final_contrato) {
    await gerarMensalidades(
      matriculaCriada.id,
      mensalidadeFinal,
      dataVencimentoNormalizada,
      data_final_contrato,
      0,
      bolsista
    );
  }

  res.status(201).json({
    message: 'Matrícula e mensalidades criadas com sucesso',
    matricula: matriculaCriada
  });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar matrícula:', error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Rota para atualizar uma matrícula e mensalidades
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      aluno_id,
      turma_id,
      data_matricula,
      status,
      mensalidade,
      valor_matricula,
      data_vencimento,
      data_final_contrato,
      desconto,
      isencao_taxa,
      bolsista
    } = req.body;

    await client.query('BEGIN');

    // Normaliza data de vencimento no PUT também
    const dataVencimentoPUT = (typeof data_vencimento === 'number' || /^(\d{1,2})$/.test(String(data_vencimento)))
      ? buildVencimentoDateFromDay(data_vencimento, data_matricula)
      : data_vencimento;

    // Atualiza a matrícula
    const matriculaQuery = `
      UPDATE matriculas
      SET aluno_id = $1, data_matricula = $2, status = $3, mensalidade = $4, valor_matricula = $5, data_vencimento = $6, data_final_contrato = $7, desconto = $8, isencao_taxa = $9, bolsista = $10, updated_at = NOW()
      WHERE id = $11
      RETURNING *;
    `;
    const matriculaValues = [
      aluno_id,
      data_matricula,
      status,
      mensalidade !== '' ? mensalidade : null,
      valor_matricula !== '' ? valor_matricula : null,
      dataVencimentoPUT,
      data_final_contrato,
      parseFloat(desconto) || 0,
      isencao_taxa || false,
      bolsista || false,
      req.params.id,
    ];
    const matriculaResult = await client.query(matriculaQuery, matriculaValues);
    const matriculaAtualizada = matriculaResult.rows[0];

    if (matriculaAtualizada) {
      // Garantir associação única na tabela de junção
      await client.query('DELETE FROM matriculas_turmas WHERE matricula_id = $1;', [req.params.id]);

      if (turma_id) {
        await client.query('INSERT INTO matriculas_turmas (matricula_id, turma_id) VALUES ($1, $2);', [matriculaAtualizada.id, turma_id]);
      }

      if (status === 'inativa') {
        const cancelarMensalidadesQuery = `
          UPDATE mensalidades
          SET status = 'cancelada'
          WHERE matricula_id = $1 AND (status != 'cancelada' and status != 'pago');
        `;
        await client.query(cancelarMensalidadesQuery, [req.params.id]);
      }

      await client.query('COMMIT');
      res.json(matriculaAtualizada);
    } else {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Matrícula não encontrada' });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar matrícula:', error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});





// Rota para deletar uma matrícula e suas associações
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Primeiro, cancelar ou deletar as mensalidades associadas à matrícula
    const cancelarMensalidadesQuery = `
      UPDATE mensalidades
      SET status = 'cancelada'
      WHERE matricula_id = $1 AND status != 'cancelada';
    `;
    await client.query(cancelarMensalidadesQuery, [req.params.id]);

    // Atualiza os lançamentos associados às mensalidades canceladas (opcional)
    const cancelarLancamentosQuery = `
      UPDATE lancamentos
      SET status = 'cancelado'
      WHERE id IN (SELECT lancamento_id FROM mensalidades WHERE matricula_id = $1);
    `;
    await client.query(cancelarLancamentosQuery, [req.params.id]);

    // Depois, deletar as associações de turmas com a matrícula
    const deleteTurmasQuery = 'DELETE FROM matriculas_turmas WHERE matricula_id = $1;';
    await client.query(deleteTurmasQuery, [req.params.id]);

    // Finalmente, deletar a matrícula
    const result = await client.query('DELETE FROM matriculas WHERE id = $1 RETURNING *;', [req.params.id]);

    if (result.rows.length > 0) {
      await client.query('COMMIT');
      res.status(204).json({ message: 'Matrícula deletada com sucesso.' });
    } else {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Matrícula não encontrada.' });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar matrícula:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});


// Rota para listar todas as matrículas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        matriculas.*, 
        alunos.nome AS aluno_nome,
        STRING_AGG(turmas.nome, ', ') AS turmas_nomes -- Concatena os nomes das turmas associadas
      FROM matriculas
      LEFT JOIN alunos ON matriculas.aluno_id = alunos.id
      LEFT JOIN matriculas_turmas ON matriculas.id = matriculas_turmas.matricula_id
      LEFT JOIN turmas ON matriculas_turmas.turma_id = turmas.id
      GROUP BY matriculas.id, alunos.nome
      ORDER BY matriculas.data_matricula ASC;
    `);

    res.json(result.rows); // Retorna a lista de matrículas
    console.log(result.rows);
  } catch (error) {
    console.error('Erro ao listar matrículas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar uma matrícula por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
SELECT matriculas.*, alunos.nome AS aluno_nome, array_agg(turmas.nome) AS turmas_nomes
FROM matriculas
LEFT JOIN alunos ON matriculas.aluno_id = alunos.id
LEFT JOIN matriculas_turmas ON matriculas.id = matriculas_turmas.matricula_id
LEFT JOIN turmas ON matriculas_turmas.turma_id = turmas.id
WHERE matriculas.id = $1
GROUP BY matriculas.id, alunos.nome;
    `, [req.params.id]);

    const matricula = result.rows[0];

    if (matricula) {
      // Verificar se existem parcelas geradas
      const parcelasResult = await pool.query('SELECT COUNT(*) FROM mensalidades WHERE matricula_id = $1;', [req.params.id]);
      const parcelasGeradas = parseInt(parcelasResult.rows[0].count) > 0;

      matricula.parcelasGeradas = parcelasGeradas; // Adiciona o campo parcelasGeradas à resposta
      res.json(matricula);
      console.log(matricula);
    } else {
      res.status(404).json({ message: 'Matrícula não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar matrícula por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
