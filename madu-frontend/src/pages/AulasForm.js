import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, TextField } from '@mui/material';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importa a localização para português

const AulaForm = () => {
  const [form, setForm] = useState({
    turma_id: '',
    data: '',
    horario: '',
    duracao: ''
  });

  const [turmas, setTurmas] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('http://localhost:5001/turmas')
      .then((response) => {
        setTurmas(response.data);
      })
      .catch((error) => console.error('Erro ao buscar turmas:', error));
  
    if (id) {
      api.get(`http://localhost:5001/aulas/${id}`)
        .then((response) => {
          const aula = response.data;
  
          if (aula.data) {
            aula.data = parseISO(aula.data);
          }
  
          setForm(aula);
        })
        .catch((error) => console.error('Erro ao buscar aula:', error));
    }
  }, [id]);

  const handleDateChange = (date) => {
    setForm({
      ...form,
      data: date
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { ...form };

    if (formData.data) {
      formData.data = format(formData.data, 'yyyy-MM-dd');
    }

    if (id) {
      api.put(`http://localhost:5001/aulas/${id}`, formData)
        .then(() => navigate('/aulas'))
        .catch((error) => console.error('Erro ao atualizar aula:', error));
    } else {
      api.post('http://localhost:5001/aulas', formData)
        .then(() => navigate('/aulas'))
        .catch((error) => console.error('Erro ao adicionar aula:', error));
    }
  };

  const turmaOptions = turmas.map(turma => ({ value: turma.id, label: turma.nome }));

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px', margin: '0 auto' }}>
      <h2>{id ? 'Editar Aula' : 'Adicionar Aula'}</h2>
      <FormSelect label="Turma" name="turma_id" value={form.turma_id} onChange={handleChange} options={turmaOptions} required />
      
      {/* Campo de data com react-datepicker estilizado */}
      <DatePicker
        selected={form.data}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
        locale={ptBR} // Localização em português
        customInput={<TextField label="Data" fullWidth required />} // Usa o TextField do MUI para consistência
      />

      <FormInput label="Horário" name="horario" value={form.horario} onChange={handleChange} type="time" required />
      <FormInput label="Duração (minutos)" name="duracao" value={form.duracao} onChange={handleChange} required />
      <Button type="submit" variant="contained" color="primary">{id ? 'Atualizar' : 'Adicionar'}</Button>
    </Box>
  );
};

export default AulaForm;
