// src/pages/AlunoForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

const AlunoForm = () => {
  const [form, setForm] = useState({
    nome: '',
    sexo: '',
    data_nascimento: '',
    telefone: '',
    cpf: '',
    email: '',
    responsavel_financeiro: false,
    bolsista: false,
    endereco: '',
    cidade: '',
    estado: '',
    foto: '',
    contrato: '',
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5001/alunos/${id}`)
        .then((response) => setForm(response.data))
        .catch((error) => console.error('Erro ao buscar aluno:', error));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      axios.put(`http://localhost:5001/alunos/${id}`, form)
        .then(() => navigate('/alunos'))
        .catch((error) => console.error('Erro ao atualizar aluno:', error));
    } else {
      axios.post('http://localhost:5001/alunos', form)
        .then(() => navigate('/alunos'))
        .catch((error) => console.error('Erro ao adicionar aluno:', error));
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
      <h2>{id ? 'Editar Aluno' : 'Adicionar Aluno'}</h2>
      <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
      <FormSelect label="Sexo" name="sexo" value={form.sexo} onChange={handleChange} options={sexoOptions} required />
      <FormInput label="Data de Nascimento" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} type="date" required />
      <FormInput label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} required />
      <FormInput label="CPF" name="cpf" value={form.cpf} onChange={handleChange} required />
      <FormInput label="Email" name="email" value={form.email} onChange={handleChange} type="email" required />
      <FormInput label="Endereço" name="endereco" value={form.endereco} onChange={handleChange} />
      <FormInput label="Cidade" name="cidade" value={form.cidade} onChange={handleChange} />
      <FormInput label="Estado" name="estado" value={form.estado} onChange={handleChange} />
      <Button type="submit" variant="contained" color="primary">{id ? 'Atualizar' : 'Adicionar'}</Button>
    </Box>
  );
};

export default AlunoForm;
