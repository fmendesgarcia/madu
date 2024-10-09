import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControlLabel, Checkbox } from '@mui/material';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';
import { TextField } from '@mui/material';

const MatriculaForm = () => {
  const [form, setForm] = useState({
    aluno_id: '',
    turma_id: '',
    data_matricula: new Date(),
    status: 'ativa',
    mensalidade: '',
    data_vencimento: '',
    data_final_contrato: '',
    desconto: '',
    isencao_taxa: false,
    bolsista: false
  });

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  // Carregar alunos e turmas ao montar o componente
  useEffect(() => {
    axios.get('http://localhost:5001/alunos')
      .then((response) => setAlunos(response.data))
      .catch((error) => console.error('Erro ao buscar alunos:', error));

    axios.get('http://localhost:5001/turmas')
      .then((response) => setTurmas(response.data))
      .catch((error) => console.error('Erro ao buscar turmas:', error));

    // Se estivermos editando uma matrícula, carregar os dados
    if (id) {
      axios.get(`http://localhost:5001/matriculas/${id}`)
        .then((response) => {
          const matricula = response.data;

          // Converter datas para o formato correto
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
        .catch((error) => console.error('Erro ao buscar matrícula:', error));
    }
  }, [id]);

  // Lida com mudanças nos campos de entrada
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Lida com a mudança nos campos de data
  const handleDateChange = (name, date) => {
    setForm({
      ...form,
      [name]: date
    });
  };

  // Enviar formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { ...form };

    // Converter datas para o formato correto antes de enviar
    if (formData.data_matricula) formData.data_matricula = formData.data_matricula.toISOString().split('T')[0];
    if (formData.data_vencimento) formData.data_vencimento = formData.data_vencimento.toISOString().split('T')[0];
    if (formData.data_final_contrato) formData.data_final_contrato = formData.data_final_contrato.toISOString().split('T')[0];

    if (id) {
      axios.put(`http://localhost:5001/matriculas/${id}`, formData)
        .then(() => navigate('/matriculas'))
        .catch((error) => console.error('Erro ao atualizar matrícula:', error));
    } else {
      axios.post('http://localhost:5001/matriculas', formData)
        .then(() => navigate('/matriculas'))
        .catch((error) => console.error('Erro ao adicionar matrícula:', error));
    }
  };

  const alunoOptions = alunos.map(aluno => ({ value: aluno.id, label: aluno.nome }));
  const turmaOptions = turmas.map(turma => ({ value: turma.id, label: turma.nome }));

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '500px', margin: '0 auto' }}>
      <h2>{id ? 'Editar Matrícula' : 'Adicionar Matrícula'}</h2>

      <FormSelect label="Aluno" name="aluno_id" value={form.aluno_id} onChange={handleChange} options={alunoOptions} required />
      <FormSelect label="Turma" name="turma_id" value={form.turma_id} onChange={handleChange} options={turmaOptions} required />
      
      {/* Data de Matrícula */}
      <DatePicker
        selected={form.data_matricula}
        onChange={(date) => handleDateChange('data_matricula', date)}
        dateFormat="dd/MM/yyyy"
        locale={ptBR}
        customInput={<TextField label="Data de Matrícula" fullWidth required />}
      />

      <FormInput label="Mensalidade" name="mensalidade" value={form.mensalidade} onChange={handleChange} type="number" required />

      {/* Data de Vencimento */}
      <DatePicker
        selected={form.data_vencimento}
        onChange={(date) => handleDateChange('data_vencimento', date)}
        dateFormat="dd/MM/yyyy"
        locale={ptBR}
        customInput={<TextField label="Data de Vencimento" fullWidth />}
      />

      {/* Data Final do Contrato */}
      <DatePicker
        selected={form.data_final_contrato}
        onChange={(date) => handleDateChange('data_final_contrato', date)}
        dateFormat="dd/MM/yyyy"
        locale={ptBR}
        customInput={<TextField label="Data Final do Contrato" fullWidth />}
      />

      <FormInput label="Desconto (%)" name="desconto" value={form.desconto} onChange={handleChange} type="number" />
      
      <FormControlLabel
        control={<Checkbox name="isencao_taxa" checked={form.isencao_taxa} onChange={handleChange} />}
        label="Isenção de Taxa"
      />

      <FormControlLabel
        control={<Checkbox name="bolsista" checked={form.bolsista} onChange={handleChange} />}
        label="Bolsista"
      />

      <Button type="submit" variant="contained" color="primary">{id ? 'Atualizar' : 'Adicionar'}</Button>
    </Box>
  );
};

export default MatriculaForm;
