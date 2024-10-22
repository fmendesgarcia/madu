import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../components/CustomTable';
import { Button } from '@mui/material';

const Professores = () => {
  const [professores, setProfessores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5001/professores')
      .then((response) => {
        setProfessores(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar professores:', error);
      });
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este professor?')) {
      axios.delete(`http://localhost:5001/professores/${id}`)
        .then(() => {
          setProfessores(professores.filter((professor) => professor.id !== id));
        })
        .catch((error) => {
          console.error('Erro ao excluir professor:', error);
        });
    }
  };

  const handleEdit = (id) => {
    navigate(`/professores/${id}/editar`);
  };

  // Atualizamos as colunas com os novos campos
  const columns = [
    { id: 'nome', label: 'Nome' },
    { id: 'apelido', label: 'Apelido' },
    { id: 'email', label: 'Email' },
    { id: 'sexo', label: 'Sexo' },
    { id: 'tipo_pagamento', label: 'Tipo de Pagamento' },
    { 
      id: 'dados_pagamento', 
      label: 'Dados de Pagamento', 
      render: (row) => row.tipo_pagamento === 'pix' 
        ? `Chave PIX: ${row.pix}` 
        : `Agência: ${row.agencia} / Conta: ${row.conta}` 
    },
    {
      id: 'foto',
      label: 'Foto',
      render: (row) => row.foto 
        ? <a href={`http://localhost:5001/${row.foto}`} target="_blank" rel="noopener noreferrer">Ver Foto</a> 
        : 'N/A'
    }
  ];

  return (
    <div>
      <h2>Lista de Professores</h2>
      <CustomTable 
        columns={columns} 
        data={professores} 
        handleEdit={handleEdit} 
        handleDelete={handleDelete} 
      />
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate('/professores/novo')} 
        style={{ marginTop: '20px' }}
      >
        Adicionar Novo Professor
      </Button>
    </div>
  );
};

export default Professores;
