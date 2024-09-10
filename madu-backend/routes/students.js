const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Listar todos os alunos
router.get('/', async (req, res) => {
  const students = await Student.findAll();
  res.json(students);
});

// Criar um novo aluno
router.post('/', async (req, res) => {
  const student = await Student.create(req.body);
  res.json(student);
});

module.exports = router;
