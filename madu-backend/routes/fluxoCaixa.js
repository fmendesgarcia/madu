const express = require('express');
const router = express.Router();
const FluxoCaixa = require('../models/fluxoCaixa');

// Rota para criar uma nova transação
router.post('/', async (req, res) => {
  try {
    const fluxoCaixa = await FluxoCaixa.create(req.body);
    res.status(201).json(fluxoCaixa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para listar todas as transações
router.get('/', async (req, res) => {
  try {
    const fluxos = await FluxoCaixa.findAll();
    res.json(fluxos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar uma transação por ID
router.get('/:id', async (req, res) => {
  try {
    const fluxoCaixa = await FluxoCaixa.findByPk(req.params.id);
    if (fluxoCaixa) {
      res.json(fluxoCaixa);
    } else {
      res.status(404).json({ message: 'Transação não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar uma transação
router.put('/:id', async (req, res) => {
  try {
    const fluxoCaixa = await FluxoCaixa.findByPk(req.params.id);
    if (fluxoCaixa) {
      await fluxoCaixa.update(req.body);
      res.json(fluxoCaixa);
    } else {
      res.status(404).json({ message: 'Transação não encontrada' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar uma transação
router.delete('/:id', async (req, res) => {
  try {
    const fluxoCaixa = await FluxoCaixa.findByPk(req.params.id);
    if (fluxoCaixa) {
      await fluxoCaixa.destroy();
      res.status(204).json({ message: 'Transação deletada' });
    } else {
      res.status(404).json({ message: 'Transação não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
