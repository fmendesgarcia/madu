// src/pages/Alunos.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../components/CustomTable';
import { Button, TextField, Box, InputAdornment } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const Alunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/alunos')
      .then((response) => {
        setAlunos(response.data);
        setFilteredAlunos(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar alunos:', error);
      });
  }, []);

  // Função para filtrar alunos
  const filterAlunos = (term) => {
    if (!term.trim()) {
      setFilteredAlunos(alunos);
      return;
    }

    const filtered = alunos.filter((aluno) => {
      const searchLower = term.toLowerCase();
      return (
        aluno.nome?.toLowerCase().includes(searchLower) ||
        aluno.email?.toLowerCase().includes(searchLower) ||
        aluno.cpf?.includes(term) ||
        aluno.telefone?.includes(term)
      );
    });
    setFilteredAlunos(filtered);
  };

  // Handler para mudança no campo de pesquisa
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterAlunos(value);
    setPage(0); // Volta para a primeira página quando pesquisa
  };

  // Handler para limpar pesquisa
  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredAlunos(alunos);
    setPage(0);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      api.delete(`/alunos/${id}`)
        .then(() => {
          const updatedAlunos = alunos.filter((aluno) => aluno.id !== id);
          setAlunos(updatedAlunos);
          filterAlunos(searchTerm); // Reaplica o filtro
        })
        .catch((error) => {
          console.error('Erro ao excluir aluno:', error);
        });
    }
  };

  const handleEdit = (id) => {
    navigate(`/alunos/${id}/editar`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columns = [
    { id: 'nome', label: 'Nome' },
    { id: 'cpf', label: 'CPF' },
    { id: 'email', label: 'Email' },
    { id: 'sexo', label: 'Sexo' },
    { 
      id: 'responsavel_financeiro', 
      label: 'Responsável Financeiro',
      render: (value, row) => {
        if (value) {
          return row.responsavel_nome ? `${row.responsavel_nome} (${row.responsavel_parentesco})` : 'Sim';
        }
        return 'Não';
      }
    },
  ];

  return (
    <div>
      <h2>Lista de Alunos</h2>
      
      {/* Campo de pesquisa */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar por nome, email, CPF ou telefone..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <ClearIcon />
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 500 }}
        />
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/alunos/novo')}
        >
          Adicionar Novo Aluno
        </Button>
      </Box>

      <CustomTable 
        columns={columns} 
        data={filteredAlunos} 
        handleEdit={handleEdit} 
        handleDelete={handleDelete}
        pagination={true}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default Alunos;
