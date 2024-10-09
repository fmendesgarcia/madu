import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@mui/material';
import CustomTable from '../components/CustomTable';
import { useNavigate } from 'react-router-dom';

const MatriculaList = () => {
  const [matriculas, setMatriculas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5001/matriculas')
      .then((response) => setMatriculas(response.data))
      .catch((error) => console.error('Erro ao buscar matrículas:', error));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta matrícula?')) {
      axios.delete(`http://localhost:5001/matriculas/${id}`)
        .then(() => setMatriculas(matriculas.filter(matricula => matricula.id !== id)))
        .catch((error) => console.error('Erro ao excluir matrícula:', error));
    }
  };

  const handleEdit = (id) => {
    navigate(`/matriculas/${id}/editar`);
  };

  const columns = [
    { id: 'aluno_nome', label: 'Aluno' },
    { id: 'turma_nome', label: 'Turma' },
    { id: 'data_matricula', label: 'Data Matrícula', format: (value) => new Date(value).toLocaleDateString('pt-BR') },
    { id: 'mensalidade', label: 'Mensalidade' },
    { id: 'status', label: 'Status' }
  ];

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

export default MatriculaList;
