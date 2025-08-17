import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../components/CustomTable';
import { Button, TextField, Box, InputAdornment } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const Professores = () => {
  const [professores, setProfessores] = useState([]);
  const [filteredProfessores, setFilteredProfessores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/professores')
      .then((response) => {
        setProfessores(response.data);
        setFilteredProfessores(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar professores:', error);
      });
  }, []);

  // Função para filtrar professores
  const filterProfessores = (term) => {
    if (!term.trim()) {
      setFilteredProfessores(professores);
      return;
    }

    const filtered = professores.filter((professor) => {
      const searchLower = term.toLowerCase();
      return (
        professor.nome?.toLowerCase().includes(searchLower) ||
        professor.apelido?.toLowerCase().includes(searchLower) ||
        professor.email?.toLowerCase().includes(searchLower) ||
        professor.sexo?.toLowerCase().includes(searchLower) ||
        professor.tipo_pagamento?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredProfessores(filtered);
  };

  // Handler para mudança no campo de pesquisa
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterProfessores(value);
    setPage(0); // Volta para a primeira página quando pesquisa
  };

  // Handler para limpar pesquisa
  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredProfessores(professores);
    setPage(0);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este professor?')) {
      api.delete(`/professores/${id}`)
        .then(() => {
          const updatedProfessores = professores.filter((professor) => professor.id !== id);
          setProfessores(updatedProfessores);
          filterProfessores(searchTerm); // Reaplica o filtro
        })
        .catch((error) => {
          console.error('Erro ao excluir professor:', error);
        });
    }
  };

  const handleEdit = (id) => {
    navigate(`/professores/${id}/editar`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      render: (value, row) => {
        if (!row.tipo_pagamento) return 'N/A';
        return row.tipo_pagamento === 'pix' 
          ? `Chave PIX: ${row.pix || 'N/A'}` 
          : `Agência: ${row.agencia || 'N/A'} / Conta: ${row.conta || 'N/A'}`;
      }
    },
    {
      id: 'foto',
      label: 'Foto',
      render: (value, row) => row.foto 
        ? <a href={`${api.defaults.baseURL}/${row.foto}`} target="_blank" rel="noopener noreferrer">Ver Foto</a> 
        : 'N/A'
    }
  ];

  return (
    <div>
      <h2>Lista de Professores</h2>
      
      {/* Campo de pesquisa */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar por nome, apelido, email, sexo ou tipo de pagamento..."
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
          onClick={() => navigate('/professores/novo')}
        >
          Adicionar Novo Professor
        </Button>
      </Box>

      <CustomTable 
        columns={columns} 
        data={filteredProfessores} 
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

export default Professores;
