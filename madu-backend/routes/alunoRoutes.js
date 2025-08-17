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
    const { codigo, nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, responsavel_nome, responsavel_cpf, responsavel_telefone, responsavel_email, responsavel_parentesco } = req.body;
    
    const foto = req.files['foto'] ? `uploads/${req.files['foto'][0].filename}` : null;
    const contrato = req.files['contrato'] ? `uploads/${req.files['contrato'][0].filename}` : null;
    
    const query = `
      INSERT INTO alunos (codigo, nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato, responsavel_nome, responsavel_cpf, responsavel_telefone, responsavel_email, responsavel_parentesco)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *;
    `;
    
    const values = [codigo || null, nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato, responsavel_nome, responsavel_cpf, responsavel_telefone, responsavel_email, responsavel_parentesco];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alunos ORDER BY nome ASC;');
    res.json(result.rows);
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
    const { codigo, nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, fotoRemovida, contratoRemovido, responsavel_nome, responsavel_cpf, responsavel_telefone, responsavel_email, responsavel_parentesco } = req.body;
    
    let foto = req.files['foto'] ? `uploads/${req.files['foto'][0].filename}` : null;
    let contrato = req.files['contrato'] ? `uploads/${req.files['contrato'][0].filename}` : null;
    
    const resultAtual = await pool.query('SELECT foto, contrato FROM alunos WHERE id = $1;', [req.params.id]);
    const alunoAtual = resultAtual.rows[0];
    
    if (fotoRemovida === 'true' && alunoAtual.foto) {
      deleteFile(alunoAtual.foto);
      foto = null;
    } else if (!foto) {
      foto = alunoAtual.foto;
    }

    if (contratoRemovido === 'true' && alunoAtual.contrato) {
      deleteFile(alunoAtual.contrato);
      contrato = null;
    } else if (!contrato) {
      contrato = alunoAtual.contrato;
    }
    
    const query = `
      UPDATE alunos
      SET codigo = $1, nome = $2, sexo = $3, data_nascimento = $4, telefone = $5, cpf = $6, email = $7, responsavel_financeiro = $8, bolsista = $9, endereco = $10, cidade = $11, estado = $12, foto = $13, contrato = $14, responsavel_nome = $15, responsavel_cpf = $16, responsavel_telefone = $17, responsavel_email = $18, responsavel_parentesco = $19, updated_at = NOW()
      WHERE id = $20
      RETURNING *;
    `;
    
    const values = [codigo || null, nome, sexo, data_nascimento, telefone, cpf, email, responsavel_financeiro, bolsista, endereco, cidade, estado, foto, contrato, responsavel_nome, responsavel_cpf, responsavel_telefone, responsavel_email, responsavel_parentesco, req.params.id];
    
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
