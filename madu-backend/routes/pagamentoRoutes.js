const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar um novo pagamento e atualizar a mensalidade
// Rota para criar um novo pagamento e atualizar a mensalidade
router.post('/', async (req, res) => {
  const client = await pool.connect(); // Usar um cliente específico para a transação
  try {
    const { mensalidade_id, data_pagamento, valor_pago, forma_pagamento } = req.body;

    if (!mensalidade_id || !data_pagamento || !valor_pago || !forma_pagamento) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    await client.query('BEGIN'); // Iniciar transação

    // Obter aluno_id associado à mensalidade
    const mensalidadeQuery = `
      SELECT matriculas.aluno_id
      FROM mensalidades
      JOIN matriculas ON mensalidades.matricula_id = matriculas.id
      WHERE mensalidades.id = $1
      GROUP BY matriculas.aluno_id;
    `;
    const mensalidadeResult = await client.query(mensalidadeQuery, [mensalidade_id]);

    if (mensalidadeResult.rows.length === 0) {
      await client.query('ROLLBACK'); // Desfazer transação se a mensalidade não for encontrada
      return res.status(404).json({ message: 'Mensalidade não encontrada' });
    }

    const { aluno_id } = mensalidadeResult.rows[0];

    // Inserir o pagamento na tabela de pagamentos (uma vez, independentemente de quantas turmas associadas)
    const pagamentoQuery = `
      INSERT INTO pagamentos (aluno_id, mensalidade_id, data_pagamento, valor_pago, forma_pagamento)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const pagamentoValues = [aluno_id, mensalidade_id, data_pagamento, valor_pago, forma_pagamento];
    const pagamentoResult = await client.query(pagamentoQuery, pagamentoValues);

    // Atualizar o status da mensalidade para "pago" e definir a data de pagamento
    const atualizarMensalidadeQuery = `
      UPDATE mensalidades
      SET status = 'pago', data_pagamento = $1
      WHERE id = $2
      RETURNING *;
    `;
    const mensalidadeAtualizada = await client.query(atualizarMensalidadeQuery, [data_pagamento, mensalidade_id]);

    // **Aqui entra a atualização do lançamento**
    if (mensalidadeAtualizada.rows.length > 0) {
      const lancamentoQuery = `
        UPDATE lancamentos
        SET status = 'efetivada', updated_at = NOW()
        WHERE id = (
          SELECT lancamento_id FROM mensalidades WHERE id = $1
        );
      `;
      await client.query(lancamentoQuery, [mensalidade_id]);

      await client.query('COMMIT'); // Confirmar transação se tudo deu certo
      res.status(201).json({
        message: 'Pagamento registrado e mensalidade atualizada com sucesso.',
        pagamento: pagamentoResult.rows[0],
        mensalidadeAtualizada: mensalidadeAtualizada.rows[0],
      });
    } else {
      await client.query('ROLLBACK'); // Desfazer transação se a atualização da mensalidade falhar
      res.status(404).json({ message: 'Mensalidade não encontrada para ser atualizada' });
    }
  } catch (error) {
    await client.query('ROLLBACK'); // Desfazer transação em caso de erro
    console.error('Erro ao registrar pagamento:', error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release(); // Liberar o cliente
  }
});



// Rota para listar todos os pagamentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pagamentos.*, 
        alunos.nome AS aluno_nome, 
        STRING_AGG(turmas.nome, ', ') AS turmas_nomes
      FROM pagamentos
      LEFT JOIN alunos ON pagamentos.aluno_id = alunos.id
      LEFT JOIN mensalidades ON pagamentos.mensalidade_id = mensalidades.id
      LEFT JOIN matriculas_turmas ON mensalidades.matricula_id = matriculas_turmas.matricula_id
      LEFT JOIN turmas ON matriculas_turmas.turma_id = turmas.id
      GROUP BY pagamentos.id, alunos.nome
      ORDER BY pagamentos.mensalidade_id, pagamentos.created_at DESC;
    `);
    res.json(result.rows); // Retorna a lista de pagamentos
    
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: error.message });
  }
});


// Rota para buscar um pagamento por ID
// Rota para buscar um pagamento por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pagamentos.*, 
        alunos.nome AS aluno_nome, 
        STRING_AGG(turmas.nome, ', ') AS turmas_nomes
      FROM pagamentos
      LEFT JOIN alunos ON pagamentos.aluno_id = alunos.id
      LEFT JOIN mensalidades ON pagamentos.mensalidade_id = mensalidades.id
      LEFT JOIN matriculas_turmas ON mensalidades.matricula_id = matriculas_turmas.matricula_id
      LEFT JOIN turmas ON matriculas_turmas.turma_id = turmas.id
      WHERE pagamentos.id = $1
      GROUP BY pagamentos.id, alunos.nome;
    `, [req.params.id]);

    const pagamento = result.rows[0];

    if (pagamento) {
      res.json(pagamento);
    } else {
      res.status(404).json({ message: 'Pagamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar pagamento por ID:', error);
    res.status(500).json({ error: error.message });
  }
});



// Rota para atualizar um pagamento
router.put('/:id', async (req, res) => {
  try {
    const { aluno_id, data_pagamento, valor_pago, forma_pagamento } = req.body;

    const query = `
      UPDATE pagamentos
      SET aluno_id = $1, data_pagamento = $2, valor_pago = $3, forma_pagamento = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `;

    const values = [aluno_id, data_pagamento, valor_pago, forma_pagamento, req.params.id];

    const result = await pool.query(query, values);
    const pagamentoAtualizado = result.rows[0];

    if (pagamentoAtualizado) {
      res.json(pagamentoAtualizado);
    } else {
      res.status(404).json({ message: 'Pagamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(400).json({ error: error.message });
  }
});


// Rota para deletar um pagamento
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pagamentos WHERE id = $1 RETURNING *;', [req.params.id]);

    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Pagamento deletado' });
    } else {
      res.status(404).json({ message: 'Pagamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
