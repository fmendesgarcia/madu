// src/pages/ProfessorForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const ProfessorForm = () => {
  const [form, setForm] = useState({
    nome: '',
    apelido: '',
    email: '',
    sexo: '',
    telefone: '',
    cpf: ''
  });

  const { id } = useParams();
  const navigate = useNavigate();

  // Se houver um ID na URL, busque o professor para edição
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5001/professores/${id}`)
        .then((response) => setForm(response.data))
        .catch((error) => console.error('Erro ao buscar professor:', error));
    }
  }, [id]);

  // Função para enviar os dados do formulário (inclusão ou edição)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      // Atualizar professor existente
      axios.put(`http://localhost:5001/professores/${id}`, form)
        .then(() => navigate('/professores'))
        .catch((error) => console.error('Erro ao atualizar professor:', error));
    } else {
      // Adicionar novo professor
      axios.post('http://localhost:5001/professores', form)
        .then(() => navigate('/professores'))
        .catch((error) => console.error('Erro ao adicionar professor:', error));
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px', margin: '0 auto' }}>
      <h2>{id ? 'Editar Professor' : 'Adicionar Professor'}</h2>
      <TextField label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
      <TextField label="Apelido" name="apelido" value={form.apelido} onChange={handleChange} required />
      <TextField label="Email" name="email" value={form.email} onChange={handleChange} required />
      <FormControl>
        <InputLabel>Sexo</InputLabel>
        <Select name="sexo" value={form.sexo} onChange={handleChange} required>
          <MenuItem value="M">Masculino</MenuItem>
          <MenuItem value="F">Feminino</MenuItem>
        </Select>
      </FormControl>
      <TextField label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} required />
      <TextField label="CPF" name="cpf" value={form.cpf} onChange={handleChange} required />
      <Button type="submit" variant="contained" color="primary">{id ? 'Atualizar' : 'Adicionar'}</Button>
    </Box>
  );
};

export default ProfessorForm;
