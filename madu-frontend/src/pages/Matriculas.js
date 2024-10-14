import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomTable from '../components/CustomTable';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Matriculas = () => {
  const [matriculas, setMatriculas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5001/matriculas')
      .then((response) => {
        // Formata as datas de matrícula e vencimento antes de atualizar o estado
        const formattedData = response.data.map(matricula => ({
          ...matricula,
          data_matricula: matricula.data_matricula ? new Date(matricula.data_matricula).toLocaleDateString('pt-BR') : '',
          data_vencimento: matricula.data_vencimento ? new Date(matricula.data_vencimento).toLocaleDateString('pt-BR') : ''
        }));
        setMatriculas(formattedData);
      })
      .catch((error) => console.error('Erro ao buscar matrículas:', error));
  }, []);

  const columns = [
    { id: 'aluno_nome', label: 'Aluno' },
    { id: 'turma_nome', label: 'Turma' },
    { id: 'status', label: 'Status' },
    { id: 'mensalidade', label: 'Mensalidade' },
    { id: 'data_matricula', label: 'Data da Matrícula' },
    { id: 'data_vencimento', label: 'Data de Vencimento' },
  ];

  const handleEdit = (id) => {
    navigate(`/matriculas/${id}/editar`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta matrícula?')) {
      axios.delete(`http://localhost:5001/matriculas/${id}`)
        .then(() => setMatriculas(matriculas.filter((matricula) => matricula.id !== id)))
        .catch((error) => console.error('Erro ao excluir matrícula:', error));
    }
  };

  return (
    <div>
      <h2>Lista de Matrículas</h2>
      <CustomTable columns={columns} data={matriculas} handleEdit={handleEdit} handleDelete={handleDelete} />
      <Button variant="contained" color="primary" onClick={() => navigate('/matriculas/novo')} style={{ marginTop: '20px' }}>
        Adicionar Nova Matrícula
      </Button>
    </div>
  );
};

export default Matriculas;
