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

// Rota para criar um novo professor com upload de foto e contrato
router.post('/', upload.fields([{ name: 'foto', maxCount: 1 }, { name: 'contrato', maxCount: 1 }]), async (req, res) => {
  try {
    const { nome, apelido, sexo, data_nascimento, cpf, cnpj, email, telefone, endereco, cidade, estado, valor_hora, dia_pagamento, tipo_pagamento, pix, agencia, conta } = req.body;
    
    // Captura o caminho correto para foto e contrato
    const foto = req.files['foto'] ? `uploads/${req.files['foto'][0].filename}` : null;
    const contrato = req.files['contrato'] ? `uploads/${req.files['contrato'][0].filename}` : null;
    
    const query = `
      INSERT INTO professores (nome, apelido, sexo, data_nascimento, cpf, cnpj, email, telefone, endereco, cidade, estado, valor_hora, dia_pagamento, tipo_pagamento, pix, agencia, conta, foto, contrato)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;
    `;
    
    const values = [nome, apelido, sexo, data_nascimento, cpf, cnpj, email, telefone, endereco, cidade, estado, valor_hora, dia_pagamento, tipo_pagamento, pix, agencia, conta, foto, contrato];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Retorna o professor criado
  } catch (error) {
    console.error('Erro ao criar professor:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todos os professores
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM professores ORDER BY nome ASC;');
    res.json(result.rows); // Retorna a lista de professores
  } catch (error) {
    console.error('Erro ao listar professores:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar um professor por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM professores WHERE id = $1;', [req.params.id]);
    const professor = result.rows[0];
    
    if (professor) {
      res.json(professor);
    } else {
      res.status(404).json({ message: 'Professor não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar professor por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar um professor com upload de foto e contrato
router.put('/:id', upload.fields([{ name: 'foto', maxCount: 1 }, { name: 'contrato', maxCount: 1 }]), async (req, res) => {
  try {
    const { nome, apelido, sexo, data_nascimento, cpf, cnpj, email, telefone, endereco, cidade, estado, valor_hora, dia_pagamento, tipo_pagamento, pix, agencia, conta, fotoRemovida, contratoRemovido } = req.body;
    
    let foto = req.files['foto'] ? `uploads/${req.files['foto'][0].filename}` : null;
    let contrato = req.files['contrato'] ? `uploads/${req.files['contrato'][0].filename}` : null;
    
    // Busca o professor atual para saber se há foto ou contrato existentes
    const resultAtual = await pool.query('SELECT foto, contrato FROM professores WHERE id = $1;', [req.params.id]);
    const professorAtual = resultAtual.rows[0];
    
    // Se a foto foi removida, excluir a foto existente e definir como null
    if (fotoRemovida === 'true' && professorAtual.foto) {
      deleteFile(professorAtual.foto);
      foto = null;
    } else if (!foto) {
      // Se não foi enviado um novo arquivo de foto, manter o caminho da foto atual
      foto = professorAtual.foto;
    }

    // Se o contrato foi removido, excluir o contrato existente e definir como null
    if (contratoRemovido === 'true' && professorAtual.contrato) {
      deleteFile(professorAtual.contrato);
      contrato = null;
    } else if (!contrato) {
      // Se não foi enviado um novo arquivo de contrato, manter o caminho do contrato atual
      contrato = professorAtual.contrato;
    }
    
    const query = `
      UPDATE professores
      SET nome = $1, apelido = $2, sexo = $3, data_nascimento = $4, cpf = $5, cnpj = $6, email = $7, telefone = $8, endereco = $9, cidade = $10, estado = $11, valor_hora = $12, dia_pagamento = $13, tipo_pagamento = $14, pix = $15, agencia = $16, conta = $17, foto = $18, contrato = $19, updated_at = NOW()
      WHERE id = $20
      RETURNING *;
    `;
    
    const values = [nome, apelido, sexo, data_nascimento, cpf, cnpj, email, telefone, endereco, cidade, estado, valor_hora, dia_pagamento, tipo_pagamento, pix, agencia, conta, foto, contrato, req.params.id];
    
    const result = await pool.query(query, values);
    const professorAtualizado = result.rows[0];
    
    if (professorAtualizado) {
      res.json(professorAtualizado);
    } else {
      res.status(404).json({ message: 'Professor não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar um professor
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM professores WHERE id = $1 RETURNING *;', [req.params.id]);
    
    if (result.rows.length > 0) {
      res.status(204).json({ message: 'Professor deletado' });
    } else {
      res.status(404).json({ message: 'Professor não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar professor:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
