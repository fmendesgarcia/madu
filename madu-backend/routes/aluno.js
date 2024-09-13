const express = require('express');
const router = express.Router();
const Aluno = require('../models/Aluno');

// Rota para criar um novo aluno
router.post('/', async (req, res) => {
  try {
    const aluno = await Aluno.create(req.body);
    res.status(201).json(aluno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const alunos = await Aluno.findAll();
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar um aluno por ID
router.get('/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (aluno) {
      res.json(aluno);
    } else {
      res.status(404).json({ message: 'Aluno não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar um aluno
router.put('/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (aluno) {
      await aluno.update(req.body);
      res.json(aluno);
    } else {
      res.status(404).json({ message: 'Aluno não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar um aluno
router.delete('/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (aluno) {
      await aluno.destroy();
      res.status(204).json({ message: 'Aluno deletado' });
    } else {
      res.status(404).json({ message: 'Aluno não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
