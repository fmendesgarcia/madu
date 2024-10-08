// src/pages/ProfessorForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

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

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5001/professores/${id}`)
        .then((response) => setForm(response.data))
        .catch((error) => console.error('Erro ao buscar professor:', error));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      axios.put(`http://localhost:5001/professores/${id}`, form)
        .then(() => navigate('/professores'))
        .catch((error) => console.error('Erro ao atualizar professor:', error));
    } else {
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

  const sexoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px', margin: '0 auto' }}>
      <h2>{id ? 'Editar Professor' : 'Adicionar Professor'}</h2>
      <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
      <FormInput label="Apelido" name="apelido" value={form.apelido} onChange={handleChange} required />
      <FormInput label="Email" name="email" value={form.email} onChange={handleChange} type="email" required />
      <FormSelect label="Sexo" name="sexo" value={form.sexo} onChange={handleChange} options={sexoOptions} required />
      <FormInput label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} required />
      <FormInput label="CPF" name="cpf" value={form.cpf} onChange={handleChange} required />
      <Button type="submit" variant="contained" color="primary">{id ? 'Atualizar' : 'Adicionar'}</Button>
    </Box>
  );
};

export default ProfessorForm;
