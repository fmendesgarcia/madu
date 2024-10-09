const express = require('express');
const router = express.Router();
const pool = require('../config/config'); // Conexão com PostgreSQL

// Função para gerar mensalidades
const gerarMensalidades = async (matriculaId, mensalidade, dataVencimento, dataFinalContrato, desconto = 0, isBolsista = false) => {
  const mensalidades = [];
  let dataAtual = new Date(dataVencimento);

  // Gera mensalidades até a data final do contrato
  while (dataAtual <= new Date(dataFinalContrato)) {
    mensalidades.push({
      matricula_id: matriculaId,
      valor: isBolsista ? 0 : mensalidade - desconto, // Se for bolsista, o valor será zero
      data_vencimento: new Date(dataAtual),
      status: 'pendente',
    });

    // Incrementa a data para o próximo mês
    dataAtual.setMonth(dataAtual.getMonth() + 1);
  }

  // Insere as mensalidades no banco de dados
  const mensalidadeQuery = `
    INSERT INTO mensalidades (matricula_id, valor, data_vencimento, status)
    VALUES ($1, $2, $3, $4);
  `;

  for (const mensalidade of mensalidades) {
    await pool.query(mensalidadeQuery, [
      mensalidade.matricula_id,
      mensalidade.valor,
      mensalidade.data_vencimento,
      mensalidade.status,
    ]);
  }
};

// Rota para criar uma nova matrícula e gerar mensalidades
router.post('/', async (req, res) => {
  try {
    const { aluno_id, turma_id, data_matricula, status, mensalidade, data_vencimento, data_final_contrato, desconto, isencao_taxa, bolsista } = req.body;
    
    const matriculaQuery = `
      INSERT INTO matriculas (aluno_id, turma_id, data_matricula, status, mensalidade, data_vencimento, data_final_contrato, desconto, isencao_taxa, bolsista)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [aluno_id, turma_id, data_matricula || new Date(), status || 'ativa', mensalidade, data_vencimento, data_final_contrato, desconto || 0, isencao_taxa || false, bolsista || false];
    
    const result = await pool.query(matriculaQuery, values);
    const matriculaCriada = result.rows[0];

    // Gera mensalidades após a matrícula ser criada
    await gerarMensalidades(matriculaCriada.id, mensalidade, data_vencimento, data_final_contrato, desconto, bolsista);

    res.status(201).json(matriculaCriada); // Retorna a matrícula criada
  } catch (error) {
    console.error('Erro ao criar matrícula:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para atualizar uma matrícula e mensalidades
router.put('/:id', async (req, res) => {
  try {
    const { aluno_id, turma_id, data_matricula, status, mensalidade, data_vencimento, data_final_contrato, desconto, isencao_taxa, bolsista } = req.body;

    const matriculaQuery = `
      UPDATE matriculas
      SET aluno_id = $1, turma_id = $2, data_matricula = $3, status = $4, mensalidade = $5, data_vencimento = $6, data_final_contrato = $7, desconto = $8, isencao_taxa = $9, bolsista = $10, updated_at = NOW()
      WHERE id = $11
      RETURNING *;
    `;

    const values = [aluno_id, turma_id, data_matricula, status, mensalidade, data_vencimento, data_final_contrato, desconto || 0, isencao_taxa || false, bolsista || false, req.params.id];

    const result = await pool.query(matriculaQuery, values);
    const matriculaAtualizada = result.rows[0];

    if (matriculaAtualizada) {
      // Apagar mensalidades antigas associadas à matrícula
      await pool.query('DELETE FROM mensalidades WHERE matricula_id = $1;', [req.params.id]);

      // Gera novas mensalidades após a matrícula ser atualizada
      await gerarMensalidades(matriculaAtualizada.id, mensalidade, data_vencimento, data_final_contrato, desconto, bolsista);

      res.json(matriculaAtualizada);
    } else {
      res.status(404).json({ message: 'Matrícula não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar matrícula:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todas as matrículas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT matriculas.*, alunos.nome AS aluno_nome, turmas.nome AS turma_nome
      FROM matriculas
      LEFT JOIN alunos ON matriculas.aluno_id = alunos.id
      LEFT JOIN turmas ON matriculas.turma_id = turmas.id
      ORDER BY matriculas.data_matricula ASC;
    `);
    res.json(result.rows); // Retorna a lista de matrículas
  } catch (error) {
    console.error('Erro ao listar matrículas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar uma matrícula por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT matriculas.*, alunos.nome AS aluno_nome, turmas.nome AS turma_nome
      FROM matriculas
      LEFT JOIN alunos ON matriculas.aluno_id = alunos.id
      LEFT JOIN turmas ON matriculas.turma_id = turmas.id
      WHERE matriculas.id = $1;
    `, [req.params.id]);
    
    const matricula = result.rows[0];

    if (matricula) {
      res.json(matricula);
    } else {
      res.status(404).json({ message: 'Matrícula não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar matrícula por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para deletar uma matrícula
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM matriculas WHERE id = $1 RETURNING *;', [req.params.id]);

    if (result.rows.length > 0) {
      // Deleta mensalidades associadas à matrícula
      await pool.query('DELETE FROM mensalidades WHERE matricula_id = $1;', [req.params.id]);
      res.status(204).json({ message: 'Matrícula deletada' });
    } else {
      res.status(404).json({ message: 'Matrícula não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar matrícula:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
