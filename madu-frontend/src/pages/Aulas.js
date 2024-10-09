// src/pages/Aulas.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomTable from '../components/CustomTable';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Aulas = () => {
  const [aulas, setAulas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5001/aulas')
      .then((response) => {
        const aulasFormatadas = response.data.map((aula) => {
          // Formatar a data no formato dd/mm/yyyy para cada aula
          if (aula.data) {
            const dataObj = new Date(aula.data);
            aula.data = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          }
          return aula;
        });
        setAulas(aulasFormatadas); // Atualiza o estado com as aulas formatadas
      })
      .catch((error) => {
        console.error('Erro ao buscar aulas:', error);
      });
  }, []);
  

  const handleEdit = (id) => {
    navigate(`/aulas/${id}/editar`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta aula?')) {
      axios.delete(`http://localhost:5001/aulas/${id}`)
        .then(() => {
          setAulas(aulas.filter((aula) => aula.id !== id));
        })
        .catch((error) => {
          console.error('Erro ao excluir aula:', error);
        });
    }
  };

  const columns = [
    { id: 'turma_id', label: 'Turma' },
    { id: 'data', label: 'Data' },
    { id: 'horario', label: 'Horário' },
    { id: 'duracao', label: 'Duração (min)' },
  ];

  return (
    <div>
      <h2>Lista de Aulas</h2>
      <CustomTable columns={columns} data={aulas} handleEdit={handleEdit} handleDelete={handleDelete} />
      <Button variant="contained" color="primary" onClick={() => navigate('/aulas/nova')}  style={{ marginTop: '20px' }}>
        Adicionar Nova Aula
      </Button>
    </div>
  );
};

export default Aulas;
