import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControlLabel, Checkbox, TextField } from '@mui/material';
import FormSelect from '../components/FormSelect';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';

const MatriculaForm = () => {
  const [form, setForm] = useState({
    aluno_id: '',
    turma_id: '',
    data_matricula: '',
    status: 'ativa',
    mensalidade: '',
    data_vencimento: '',
    data_final_contrato: '',
    desconto: '',
    isencao_taxa: false,
    bolsista: false,
  });

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5001/alunos')
      .then(response => setAlunos(response.data))
      .catch(error => console.error('Erro ao buscar alunos:', error));

    axios.get('http://localhost:5001/turmas')
      .then(response => setTurmas(response.data))
      .catch(error => console.error('Erro ao buscar turmas:', error));

    if (id) {
      axios.get(`http://localhost:5001/matriculas/${id}`)
        .then(response => {
          const matricula = response.data;

          // Formatar as datas para exibição correta
          if (matricula.data_matricula) {
            matricula.data_matricula = new Date(matricula.data_matricula);
          }
          if (matricula.data_vencimento) {
            matricula.data_vencimento = new Date(matricula.data_vencimento);
          }
          if (matricula.data_final_contrato) {
            matricula.data_final_contrato = new Date(matricula.data_final_contrato);
          }

          setForm(matricula);
        })
        .catch(error => console.error('Erro ao buscar matrícula:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleDateChange = (name, date) => {
    setForm({
      ...form,
      [name]: date,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      ...form,
      data_matricula: form.data_matricula ? form.data_matricula.toISOString().split('T')[0] : '',
      data_vencimento: form.data_vencimento ? form.data_vencimento.toISOString().split('T')[0] : '',
      data_final_contrato: form.data_final_contrato ? form.data_final_contrato.toISOString().split('T')[0] : '',
    };

    if (id) {
      axios.put(`http://localhost:5001/matriculas/${id}`, formData)
        .then(() => navigate('/matriculas'))
        .catch(error => console.error('Erro ao atualizar matrícula:', error));
    } else {
      axios.post('http://localhost:5001/matriculas', formData)
        .then(() => navigate('/matriculas'))
        .catch(error => console.error('Erro ao adicionar matrícula:', error));
    }
  };

  const alunoOptions = alunos.map(aluno => ({ value: aluno.id, label: aluno.nome }));
  const turmaOptions = turmas.map(turma => ({ value: turma.id, label: turma.nome }));

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px', margin: '0 auto' }}>
      <h2>{id ? 'Editar Matrícula' : 'Adicionar Matrícula'}</h2>
      <FormSelect label="Aluno" name="aluno_id" value={form.aluno_id} onChange={handleChange} options={alunoOptions} required />
      <FormSelect label="Turma" name="turma_id" value={form.turma_id} onChange={handleChange} options={turmaOptions} required />
      
      {/* Data de Matrícula */}
      <DatePicker
        selected={form.data_matricula}
        onChange={date => handleDateChange('data_matricula', date)}
        dateFormat="dd/MM/yyyy"
        locale={ptBR}
        customInput={<TextField label="Data da Matrícula" fullWidth required />}
      />
      
      {/* Status */}
      <TextField label="Status" name="status" value={form.status} onChange={handleChange} required />
      
      {/* Mensalidade */}
      <TextField label="Mensalidade" name="mensalidade" value={form.mensalidade} onChange={handleChange} required />
      
      {/* Data de Vencimento */}
      <DatePicker
        selected={form.data_vencimento}
        onChange={date => handleDateChange('data_vencimento', date)}
        dateFormat="dd/MM/yyyy"
        locale={ptBR}
        customInput={<TextField label="Data de Vencimento" fullWidth required />}
      />
      
      {/* Data Final do Contrato */}
      <DatePicker
        selected={form.data_final_contrato}
        onChange={date => handleDateChange('data_final_contrato', date)}
        dateFormat="dd/MM/yyyy"
        locale={ptBR}
        customInput={<TextField label="Data Final do Contrato" fullWidth required />}
      />
      
      {/* Desconto */}
      <TextField label="Desconto" name="desconto" value={form.desconto} onChange={handleChange} />

      {/* Checkboxes */}
      <FormControlLabel
        control={
          <Checkbox
            name="isencao_taxa"
            checked={form.isencao_taxa}
            onChange={handleChange}
          />
        }
        label="Isenção de Taxa"
      />

      <FormControlLabel
        control={
          <Checkbox
            name="bolsista"
            checked={form.bolsista}
            onChange={handleChange}
          />
        }
        label="Bolsista"
      />

      <Button type="submit" variant="contained" color="primary">{id ? 'Atualizar' : 'Adicionar'}</Button>
    </Box>
  );
};

export default MatriculaForm;
