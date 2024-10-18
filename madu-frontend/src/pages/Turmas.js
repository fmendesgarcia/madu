import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../components/CustomTable';
import { Button } from '@mui/material';

const Turmas = () => {
  const [turmas, setTurmas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5001/turmas')
      .then((response) => setTurmas(response.data))
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

  const columns = [
    { id: 'nome', label: 'Nome' },
    { id: 'modalidade', label: 'Modalidade' },  // Modalidade (tipo de dança)
    { id: 'tipo', label: 'Tipo' },  // Novo campo "tipo" (presencial ou online)
    { id: 'nivel', label: 'Nível' },
    { id: 'professor_nome', label: 'Professor' },
    { id: 'dias_da_semana', label: 'Dias da Semana' },
    { id: 'horario', label: 'Horário' },
    { id: 'max_alunos', label: 'Máximo de Alunos' },
    { id: 'valor_hora', label: 'Valor hora aula' },

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
