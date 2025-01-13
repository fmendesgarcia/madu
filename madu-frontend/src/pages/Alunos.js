// src/pages/Alunos.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../components/CustomTable';
import { Button } from '@mui/material';

const Alunos = () => {
  const [alunos, setAlunos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('http://localhost:5001/alunos')
      .then((response) => {
        setAlunos(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar alunos:', error);
      });
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      api.delete(`http://localhost:5001/alunos/${id}`)
        .then(() => {
          setAlunos(alunos.filter((aluno) => aluno.id !== id));
        })
        .catch((error) => {
          console.error('Erro ao excluir aluno:', error);
        });
    }
  };

  const handleEdit = (id) => {
    navigate(`/alunos/${id}/editar`);
  };

  const columns = [
    { id: 'nome', label: 'Nome' },
    { id: 'cpf', label: 'CPF' },
    { id: 'email', label: 'Email' },
    { id: 'sexo', label: 'Sexo' },
  ];

  return (
    <div>
      <h2>Lista de Alunos</h2>
      <CustomTable columns={columns} data={alunos} handleEdit={handleEdit} handleDelete={handleDelete} />
      <Button variant="contained" color="primary" onClick={() => navigate('/alunos/novo')} style={{ marginTop: '20px' }}>
        Adicionar Novo Aluno
      </Button>
    </div>
  );
};

export default Alunos;
