import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../components/CustomTable';
import { Button, IconButton } from '@mui/material';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';  // Ícone para o botão de editar agenda

const Turmas = () => {
  const [turmas, setTurmas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5001/turmas')
      .then((response) => {
        // Formatamos os dias da semana e horários antes de atualizar o estado
        const turmasFormatadas = response.data.map(turma => ({
          ...turma,
          dias_da_semana: Array.isArray(turma.dias_da_semana) ? turma.dias_da_semana.join(', ') : turma.dias_da_semana,
          horarios: turma.horarios ? turma.horarios.map(h => `${h.dia_da_semana}: ${h.horario}`).join(', ') : ''
        }));
        setTurmas(turmasFormatadas);
      })
      .catch((error) => console.error('Erro ao buscar turmas:', error));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      axios.delete(`http://localhost:5001/turmas/${id}`)
        .then(() => setTurmas(turmas.filter((turma) => turma.id !== id)))
        .catch((error) => console.error('Erro ao excluir turma:', error));
    }
  };

  const handleEdit = (id) => {
    navigate(`/turmas/${id}/editar`);
  };

  const handleEditAgenda = (id) => {
    navigate(`/turmas/${id}/configurar-dias-horarios`);
  };

  const columns = [
    { id: 'nome', label: 'Nome' },
    { id: 'modalidade', label: 'Modalidade' },  // Modalidade (tipo de dança)
    { id: 'tipo', label: 'Tipo' },  // Novo campo "tipo" (presencial ou online)
    { id: 'nivel', label: 'Nível' },
    { id: 'professor_nome', label: 'Professor' },
    { id: 'max_alunos', label: 'Máximo de Alunos' },
    { id: 'valor_hora', label: 'Valor hora aula' },
    {
      id: 'acoes',
      label: 'Ações',
      renderCell: (turma) => (
        <>
          <Button onClick={() => handleEdit(turma.id)} variant="outlined" color="primary">
            Editar Turma
          </Button>
          <IconButton onClick={() => handleEditAgenda(turma.id)} color="secondary" aria-label="Editar Agenda">
            <EditCalendarIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Lista de Turmas</h2>
      <CustomTable columns={columns} data={turmas} handleEdit={handleEdit} handleDelete={handleDelete} />
      <Button variant="contained" color="primary" onClick={() => navigate('/turmas/novo')} style={{ marginTop: '20px' }}>
        Adicionar Nova Turma
      </Button>
    </div>
  );
};

export default Turmas;
