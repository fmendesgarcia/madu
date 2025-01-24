import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

const modalidadeOptions = [
  { value: 'Ballet', label: 'Ballet' },
  { value: 'Ballet - baby', label: 'Ballet - Baby' },
  { value: 'Ballet - infantil', label: 'Ballet - Infantil' },
  { value: 'Ballet - juvenil', label: 'Ballet - Juvenil' },
  { value: 'Ballet - adulto', label: 'Ballet - Adulto' },
  { value: 'Jazz', label: 'Jazz' },
  { value: 'Jazz - infantil', label: 'Jazz - Infantil' },
  { value: 'Jazz - grupinho', label: 'Jazz - Grupinho' },
  { value: 'Jazz - adulto', label: 'Jazz - Adulto' },
  { value: 'Boom dance', label: 'Boom Dance' },
  { value: 'Movimento', label: 'Movimento' },
  { value: 'Jazz Funk', label: 'Jazz Funk' },
  { value: 'Yoga', label: 'Yoga' },
  { value: 'Hip Hop', label: 'Hip Hop' },
  { value: 'Heels', label: 'Heels' },
  { value: 'Pilates', label: 'Pilates' },
  { value: 'Teatro infantil', label: 'Teatro Infantil' },
  { value: 'Teatro juvenil', label: 'Teatro Juvenil' },
  { value: 'Kpop infantil', label: 'Kpop Infantil' },
  { value: 'Kpop adulto', label: 'Kpop Adulto' },
  { value: 'Contemporâneo', label: 'Contemporâneo' },
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
    max_alunos: '',
    valor_hora: '',
  });

  const [professores, setProfessores] = useState([]);
  const { id: turmaId } = useParams();  // Aqui pegamos o turmaId corretamente da URL
  const navigate = useNavigate();

  // Função para carregar dados ao editar
  useEffect(() => {
    api.get('/professores')
      .then((response) => setProfessores(response.data))
      .catch((error) => console.error('Erro ao buscar professores:', error));

    if (turmaId) {
      api.get(`/turmas/${turmaId}`)
        .then((response) => {
          const turma = response.data;

          // Verificar se os dias_da_semana vêm como string e converter para array
          if (turma.dias_da_semana && typeof turma.dias_da_semana === 'string') {
            turma.dias_da_semana = turma.dias_da_semana.split(',');
          }
          setForm(turma);
        })
        .catch((error) => console.error('Erro ao buscar turma:', error));
    }
  }, [turmaId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Função para salvar a turma e redirecionar para configurar dias e horários
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let newTurmaId = turmaId;

      if (turmaId) {
        await api.put(`/turmas/${turmaId}`, form);
      } else {
        const response = await api.post('/turmas', form);
        newTurmaId = response.data.id; // Obtemos o ID da turma recém-criada
      }

      if (newTurmaId) {
        navigate(`/turmas/${newTurmaId}/configurar-dias-horarios`);
      }
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
    }

    console.log("ID da turma: " + turmaId);
  };

  // Função para redirecionar para a tela de incluir aulas e horários
  const handleIncluirAulas = () => {
    if (turmaId) {
      navigate(`/turmas/${turmaId}/configurar-dias-horarios`);
    } else {
      alert('Você precisa salvar a turma antes de incluir aulas.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px', margin: '0 auto' }}>
      <h2>{turmaId ? 'Editar Turma' : 'Adicionar Turma'}</h2>
      <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
      
      {/* Campo para selecionar a Modalidade */}
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

      <FormInput label="Máximo de Alunos" name="max_alunos" value={form.max_alunos} onChange={handleChange} type="number" required />
      <FormInput 
        label="Valor hora aula" 
        name="valor_hora" 
        value={form.valor_hora} 
        onChange={handleChange} 
        type="number" 
        step="0.01"  // Permite até duas casas decimais
        min="0"  // Impede valores negativos
        required 
      />

      {/* Botão para incluir aulas e horários */}
      {turmaId && (
        <Button onClick={handleIncluirAulas} variant="outlined" color="secondary">
          Incluir Aulas e Horários
        </Button>
      )}

      <Button type="submit" variant="contained" color="primary">
        {turmaId ? 'Atualizar' : 'Adicionar'}
      </Button>
    </Box>
  );
};

export default TurmaForm;
