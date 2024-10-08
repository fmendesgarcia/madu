const express = require('express');
const router = express.Router();
const pool = require('../config/config');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configuração de armazenamento do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Pasta onde os arquivos serão armazenados
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nome do arquivo com timestamp
  }
});
const upload = multer({ storage: storage });

// Função auxiliar para excluir arquivos
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    console.log(`Tentando excluir arquivo: ${filePath}`);
    fs.unlinkSync(filePath); // Remove o arquivo do sistema
  }
};

// Rota para criar um novo aluno com upload de foto e contrato
router.post('/', upload.fields([{ name: 'foto', maxCount: 1 }, { name: 'contrato', maxCount: 1 }]), async (req, res) => {
  try {
    const { nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado } = req.body;
    
    // Captura o caminho correto para foto e contrato
    const foto = req.files['foto'] ? `uploads/${req.files['foto'][0].filename}` : null;
    const contrato = req.files['contrato'] ? `uploads/${req.files['contrato'][0].filename}` : null;
    
    const query = `
      INSERT INTO alunos (nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    
    const values = [nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna o aluno criado
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alunos ORDER BY nome ASC;');
    res.json(result.rows); // Retorna a lista de alunos
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar um aluno por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alunos WHERE id = $1;', [req.params.id]);
    const aluno = result.rows[0];
    
    if (aluno) {
      res.json(aluno);
    } else {
      res.status(404).json({ message: 'Aluno não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar aluno por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar um aluno com upload de foto e contrato
router.put('/:id', upload.fields([{ name: 'foto', maxCount: 1 }, { name: 'contrato', maxCount: 1 }]), async (req, res) => {
  try {
    const { nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, fotoRemovida, contratoRemovido } = req.body;
    
    let foto = req.files['foto'] ? `uploads/${req.files['foto'][0].filename}` : null;
    let contrato = req.files['contrato'] ? `uploads/${req.files['contrato'][0].filename}` : null;
    
    // Busca o aluno atual para saber se há foto ou contrato existentes
    const resultAtual = await pool.query('SELECT foto, contrato FROM alunos WHERE id = $1;', [req.params.id]);
    const alunoAtual = resultAtual.rows[0];
    
    // Se a foto foi removida, excluir a foto existente e definir como null
    if (fotoRemovida === 'true' && alunoAtual.foto) {
      deleteFile(alunoAtual.foto);
      foto = null;
    } else if (!foto) {
      // Se não foi enviado um novo arquivo de foto, manter o caminho da foto atual
      foto = alunoAtual.foto;
    }

    // Se o contrato foi removido, excluir o contrato existente e definir como null
    if (contratoRemovido === 'true' && alunoAtual.contrato) {
      deleteFile(alunoAtual.contrato);
      contrato = null;
    } else if (!contrato) {
      // Se não foi enviado um novo arquivo de contrato, manter o caminho do contrato atual
      contrato = alunoAtual.contrato;
    }
    
    const query = `
      UPDATE alunos
      SET nome = $1, sexo = $2, data_nascimento = $3, telefone = $4, cpf = $5, email = $6, responsavel_financeiro = $7, bolsista = $8, endereco = $9, cidade = $10, estado = $11, foto = $12, contrato = $13, updated_at = NOW()
      WHERE id = $14
      RETURNING *;
    `;
    
    const values = [nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato, req.params.id];
    
    const result = await pool.query(query, values);
    const alunoAtualizado = result.rows[0];
    
    if (alunoAtualizado) {
      res.json(alunoAtualizado);
    } else {
      res.status(404).json({ message: 'Aluno não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(400).json({ error: error.message });
  }
});



// Rota para deletar um aluno
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM alunos WHERE id = $1 RETURNING *;', [req.params.id]);
    
    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Aluno deletado' });
    } else {
      res.status(404).json({ message: 'Aluno não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
