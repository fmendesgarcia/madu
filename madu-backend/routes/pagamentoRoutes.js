const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Rota para criar um novo pagamento e atualizar a mensalidade
router.post('/', async (req, res) => {
  const client = await pool.connect(); // Usar um cliente específico para a transação
  try {
    const { mensalidade_id, data_pagamento, valor_pago, forma_pagamento } = req.body;

    if (!mensalidade_id || !data_pagamento || !valor_pago || !forma_pagamento) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    await client.query('BEGIN'); // Iniciar transação

    // Obter aluno_id e turma_id a partir da mensalidade
    const mensalidadeQuery = `
      SELECT matriculas.aluno_id, matriculas.turma_id 
      FROM mensalidades
      JOIN matriculas ON mensalidades.matricula_id = matriculas.id
      WHERE mensalidades.id = $1;
    `;
    const mensalidadeResult = await client.query(mensalidadeQuery, [mensalidade_id]);

    if (mensalidadeResult.rows.length === 0) {
      await client.query('ROLLBACK'); // Desfazer transação se a mensalidade não for encontrada
      return res.status(404).json({ message: 'Mensalidade não encontrada' });
    }

    const { aluno_id, turma_id } = mensalidadeResult.rows[0];

    // Inserir o pagamento na tabela de pagamentos
    const pagamentoQuery = `
      INSERT INTO pagamentos (aluno_id, turma_id, mensalidade_id, data_pagamento, valor_pago, forma_pagamento)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const pagamentoValues = [aluno_id, turma_id, mensalidade_id, data_pagamento, valor_pago, forma_pagamento];
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
      await pool.query(lancamentoQuery, [mensalidade_id]);

      await client.query('COMMIT'); // Confirmar transação se tudo deu certo
      res.status(201).json({
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
      SELECT pagamentos.*, alunos.nome AS aluno_nome, turmas.nome AS turma_nome
      FROM pagamentos
      LEFT JOIN alunos ON pagamentos.aluno_id = alunos.id
      LEFT JOIN turmas ON pagamentos.turma_id = turmas.id
      ORDER BY data_pagamento DESC;
    `);
    res.json(result.rows); // Retorna a lista de pagamentos
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar um pagamento por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pagamentos.*, alunos.nome AS aluno_nome, turmas.nome AS turma_nome
      FROM pagamentos
      LEFT JOIN alunos ON pagamentos.aluno_id = alunos.id
      LEFT JOIN turmas ON pagamentos.turma_id = turmas.id
      WHERE pagamentos.id = $1;
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
    const { aluno_id, turma_id, data_pagamento, valor_pago, forma_pagamento } = req.body;

    const query = `
      UPDATE pagamentos
      SET aluno_id = $1, turma_id = $2, data_pagamento = $3, valor_pago = $4, forma_pagamento = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *;
    `;

    const values = [aluno_id, turma_id, data_pagamento, valor_pago, forma_pagamento, req.params.id];

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
