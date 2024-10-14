// src/pages/TurmaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControlLabel, Checkbox } from '@mui/material';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

const diasDaSemanaOptions = [
    { label: 'Segunda', value: 'Segunda' },
    { label: 'Terça', value: 'Terça' },
    { label: 'Quarta', value: 'Quarta' },
    { label: 'Quinta', value: 'Quinta' },
    { label: 'Sexta', value: 'Sexta' },
    { label: 'Sábado', value: 'Sábado' },
    { label: 'Domingo', value: 'Domingo' },
];

const modalidadeOptions = [
    { value: 'Ballet', label: 'Ballet' },
    { value: 'Jazz', label: 'Jazz' },
    { value: 'Contemporâneo', label: 'Contemporâneo' },
    { value: 'Hip Hop', label: 'Hip Hop' },
];

const tipoOptions = [
    { value: 'Presencial', label: 'Presencial' },
    { value: 'Online', label: 'Online' },
];

const TurmaForm = () => {
  const [form, setForm] = useState({
    nome: '',
    modalidade: '',
    tipo: '',
    nivel: '',
    professor_id: '',
    dias_da_semana: [],
    horario: '',
    max_alunos: '',
  });

  const [professores, setProfessores] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  // Função para carregar dados ao editar
  useEffect(() => {
    axios.get('http://localhost:5001/professores')
      .then((response) => setProfessores(response.data))
      .catch((error) => console.error('Erro ao buscar professores:', error));

    if (id) {
      axios.get(`http://localhost:5001/turmas/${id}`)
        .then((response) => {
          const turma = response.data;
          if (turma.dias_da_semana && typeof turma.dias_da_semana === 'string') {
            turma.dias_da_semana = turma.dias_da_semana.split(',');
          }
          setForm(turma);
        })
        .catch((error) => console.error('Erro ao buscar turma:', error));
    }
  }, [id]);

  // Função para atualizar o estado ao marcar/desmarcar dias da semana
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setForm((prevState) => ({
      ...prevState,
      dias_da_semana: checked
        ? [...prevState.dias_da_semana, value]
        : prevState.dias_da_semana.filter((dia) => dia !== value),
    }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      axios.put(`http://localhost:5001/turmas/${id}`, form)
        .then(() => navigate('/turmas'))
        .catch((error) => console.error('Erro ao atualizar turma:', error));
    } else {
      axios.post('http://localhost:5001/turmas', form)
        .then(() => navigate('/turmas'))
        .catch((error) => console.error('Erro ao criar turma:', error));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px', margin: '0 auto' }}>
      <h2>{id ? 'Editar Turma' : 'Adicionar Turma'}</h2>
      <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
      
      {/* Campo para selecionar a Modalidade (tipo de dança) */}
      <FormSelect label="Modalidade" name="modalidade" value={form.modalidade} onChange={handleChange} options={modalidadeOptions} required />
      
      {/* Campo para selecionar o Tipo (Presencial ou Online) */}
      <FormSelect label="Tipo" name="tipo" value={form.tipo} onChange={handleChange} options={tipoOptions} required />
      
      <FormInput label="Nível" name="nivel" value={form.nivel} onChange={handleChange} />

      <FormSelect
        label="Professor"
        name="professor_id"
        value={form.professor_id}
        onChange={handleChange}
        options={professores.map((professor) => ({
          value: professor.id,
          label: professor.nome
        }))}
        required
      />

      {/* Checkboxes para Dias da Semana */}
      <Box>
        <label>Dias da Semana:</label>
        {diasDaSemanaOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                value={option.value}
                checked={form.dias_da_semana.includes(option.value)}
                onChange={handleCheckboxChange}
              />
            }
            label={option.label}
          />
        ))}
      </Box>

      <FormInput label="Horário" name="horario" value={form.horario} onChange={handleChange} type="time" required />
      <FormInput label="Máximo de Alunos" name="max_alunos" value={form.max_alunos} onChange={handleChange} type="number" required />
      
      <Button type="submit" variant="contained" color="primary">
        {id ? 'Atualizar' : 'Adicionar'}
      </Button>
    </Box>
  );
};

export default TurmaForm;
