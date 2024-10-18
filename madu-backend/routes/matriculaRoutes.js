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

// Função para gerar mensalidades
// Função para gerar mensalidades e criar lançamentos de receitas futuras
const gerarMensalidades = async (matriculaId, mensalidade, dataVencimento, dataFinalContrato, desconto = 0, isBolsista = false) => {
  const mensalidades = [];
  let dataAtual = new Date(dataVencimento);

  // Gera mensalidades até a data final do contrato
  while (dataAtual <= new Date(dataFinalContrato)) {
    mensalidades.push({
      matricula_id: matriculaId,
      valor: isBolsista ? 0 : mensalidade - desconto,
      data_vencimento: new Date(dataAtual),
      status: 'pendente',
    });

    dataAtual.setMonth(dataAtual.getMonth() + 1);
  }

  const mensalidadeQuery = `
    INSERT INTO mensalidades (matricula_id, valor, data_vencimento, status, lancamento_id)
    VALUES ($1, $2, $3, $4, $5);
  `;

  for (const mensalidade of mensalidades) {
    // Criação de lançamento de receita futura
    const lancamentoQuery = `
      INSERT INTO lancamentos (descricao, tipo, valor, data_lancamento, status)
      VALUES ('Receita futura mensalidade', 'receita', $1, $2, 'futura')
      RETURNING id;
    `;
    const lancamentoResult = await pool.query(lancamentoQuery, [mensalidade.valor, mensalidade.data_vencimento]);
    const lancamentoId = lancamentoResult.rows[0].id;

    // Insere a mensalidade vinculada ao lançamento
    await pool.query(mensalidadeQuery, [
      matriculaId,
      mensalidade.valor,
      mensalidade.data_vencimento,
      mensalidade.status,
      lancamentoId
    ]);
  }
};


// Rota para criar uma nova matrícula e gerar mensalidades
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      aluno_id,
      turmas_ids, // Array de IDs das turmas
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

  // Recupera os valores das turmas selecionadas
  const turmasQuery = `
    SELECT valor_hora FROM turmas WHERE id = ANY($1::int[]);
  `;
  const turmasResult = await client.query(turmasQuery, [turmas_ids]);

  // Converta os valores de valor_hora para números corretamente e some-os
  const valoresTurmas = turmasResult.rows.map(turma => parseFloat(turma.valor_hora));
  const valorTotalMensalidade = valoresTurmas.reduce((acc, valor) => acc + valor, 0);

  // Aplique o desconto e verifique se o cálculo é válido
  const mensalidadeFinal = valorTotalMensalidade - (desconto || 0);
  if (isNaN(mensalidadeFinal)) {
    throw new Error('Erro ao calcular a mensalidade: valor resultante é NaN');
  }

  // Insira a matrícula no banco com o valor da mensalidade calculado corretamente
  const matriculaQuery = `
    INSERT INTO matriculas (aluno_id, data_matricula, status, mensalidade, valor_matricula, data_vencimento, data_final_contrato, desconto, isencao_taxa, bolsista)
    VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, mensalidade;
  `;
  const matriculaValues = [
    aluno_id,
    data_matricula, // A data_matricula será a atual se não for informada
    status || 'ativa',
    mensalidadeFinal, // Usamos o valor total das turmas menos o desconto como a mensalidade
    valor_matricula,
    data_vencimento,
    data_final_contrato,
    desconto || 0,
    isencao_taxa || false,
    bolsista || false,
  ];

  const matriculaResult = await client.query(matriculaQuery, matriculaValues);
  const matriculaCriada = matriculaResult.rows[0];

  console.log('Matrícula criada com sucesso:', matriculaCriada);

    // Associa a matrícula às turmas usando batch insert
    if (turmas_ids && turmas_ids.length > 0) {
      const matriculasTurmasQuery = `
        INSERT INTO matriculas_turmas (matricula_id, turma_id)
        VALUES ${turmas_ids.map((_, i) => `($1, $${i + 2})`).join(', ')};
      `;
      await client.query(matriculasTurmasQuery, [matriculaCriada.id, ...turmas_ids]);
    }

    await client.query('COMMIT'); // Finaliza a transação da criação da matrícula

    // Gera as mensalidades após a matrícula ter sido criada
    if (valorTotalMensalidade && data_vencimento && data_final_contrato) {
      await gerarMensalidades(
        matriculaCriada.id,
        valorTotalMensalidade,  // Passa o valor total das turmas como a mensalidade
        data_vencimento,
        data_final_contrato,
        desconto,
        bolsista
      );
    }

    res.status(201).json({
      message: 'Matrícula e mensalidades criadas com sucesso',
      matricula: matriculaCriada
    });

  } catch (error) {
    await client.query('ROLLBACK'); // Se algo falhar, desfaz a transação
    console.error('Erro ao criar matrícula:', error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release(); // Libera o cliente de conexão com o banco de dados
  }
});

// Rota para atualizar uma matrícula e mensalidades
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      aluno_id,
      turmas_ids,
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
      data_vencimento,
      data_final_contrato,
      desconto || 0,
      isencao_taxa || false,
      bolsista || false,
      req.params.id,
    ];
    const matriculaResult = await client.query(matriculaQuery, matriculaValues);
    const matriculaAtualizada = matriculaResult.rows[0];

    if (matriculaAtualizada) {
      // Apagar associações antigas com turmas
      await client.query('DELETE FROM matriculas_turmas WHERE matricula_id = $1;', [req.params.id]);

      // Inserir novas associações em matriculas_turmas apenas se as turmas forem atualizadas
      if (turmas_ids && turmas_ids.length > 0) {
        const placeholders = turmas_ids.map((_, index) => `($1, $${index + 2})`).join(', ');
        const matriculasTurmasQuery = `
          INSERT INTO matriculas_turmas (matricula_id, turma_id)
          VALUES ${placeholders};
        `;
        
        const values = [matriculaAtualizada.id, ...turmas_ids];
        await client.query(matriculasTurmasQuery, values);
      }

      // Cancelar as mensalidades se o status da matrícula for "inativa"
      if (status === 'inativa') {
        const cancelarMensalidadesQuery = `
          UPDATE mensalidades
          SET status = 'cancelada'
          WHERE matricula_id = $1 AND status != 'cancelada';
        `;
        await client.query(cancelarMensalidadesQuery, [req.params.id]);
      }

      // NÃO criar novas mensalidades em caso de atualizações de turma ou outros detalhes
      // Isso evita a criação desnecessária de mensalidades ao atualizar dados
      // Caso deseje adicionar novas mensalidades em outro contexto, deve-se criar uma lógica específica para isso.

      // Finaliza a transação corretamente
      await client.query('COMMIT');
      res.json(matriculaAtualizada);
    } else {
      // Desfaz a transação em caso de erro
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Matrícula não encontrada' });
    }
  } catch (error) {
    await client.query('ROLLBACK'); // Finaliza a transação em caso de erro
    console.error('Erro ao atualizar matrícula:', error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release(); // Libera o cliente de conexão
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
