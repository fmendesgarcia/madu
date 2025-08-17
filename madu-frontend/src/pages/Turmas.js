import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../components/CustomTable';
import { Button, IconButton, TextField, Box, InputAdornment } from '@mui/material';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';  // Ícone para o botão de editar agenda
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const Turmas = () => {
  const [turmas, setTurmas] = useState([]);
  const [filteredTurmas, setFilteredTurmas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/turmas')
      .then((response) => {
        // Formatamos os dias da semana e horários antes de atualizar o estado
        const turmasFormatadas = response.data.map(turma => ({
          ...turma,
          dias_da_semana: Array.isArray(turma.dias_da_semana) ? turma.dias_da_semana.join(', ') : turma.dias_da_semana,
          horarios: turma.horarios ? turma.horarios.map(h => `${h.dia_da_semana}: ${h.horario}`).join(', ') : ''
        }));
        setTurmas(turmasFormatadas);
        setFilteredTurmas(turmasFormatadas);
      })
      .catch((error) => console.error('Erro ao buscar turmas:', error));
  }, []);

  // Função para filtrar turmas
  const filterTurmas = (term) => {
    if (!term.trim()) {
      setFilteredTurmas(turmas);
      return;
    }

    const filtered = turmas.filter((turma) => {
      const searchLower = term.toLowerCase();
      return (
        turma.nome?.toLowerCase().includes(searchLower) ||
        turma.modalidade?.toLowerCase().includes(searchLower) ||
        turma.tipo?.toLowerCase().includes(searchLower) ||
        turma.nivel?.toLowerCase().includes(searchLower) ||
        turma.professor_nome?.toLowerCase().includes(searchLower) ||
        turma.max_alunos?.toString().includes(term) ||
        turma.valor_hora?.toString().includes(term)
      );
    });
    setFilteredTurmas(filtered);
  };

  // Handler para mudança no campo de pesquisa
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterTurmas(value);
    setPage(0); // Volta para a primeira página quando pesquisa
  };

  // Handler para limpar pesquisa
  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredTurmas(turmas);
    setPage(0);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      api.delete(`/turmas/${id}`)
        .then(() => {
          const updatedTurmas = turmas.filter((turma) => turma.id !== id);
          setTurmas(updatedTurmas);
          filterTurmas(searchTerm); // Reaplica o filtro
        })
        .catch((error) => console.error('Erro ao excluir turma:', error));
    }
  };

  const handleEdit = (id) => {
    navigate(`/turmas/${id}/editar`);
  };

  const handleEditAgenda = (id) => {
    navigate(`/turmas/${id}/configurar-dias-horarios`);
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
    { id: 'modalidade', label: 'Modalidade' },  // Modalidade (tipo de dança)
    { id: 'tipo', label: 'Tipo' },  // Novo campo "tipo" (presencial ou online)
    { 
      id: 'nivel', 
      label: 'Nível',
      render: (value, row) => {
        if (!value) return 'N/A';
        const nivelMap = {
          'iniciante': 'Iniciante',
          'intermediario': 'Intermediário',
          'avancado': 'Avançado'
        };
        return nivelMap[value] || value;
      }
    },
    { id: 'professor_nome', label: 'Professor' },
    { id: 'max_alunos', label: 'Máximo de Alunos' },
    { id: 'valor_hora', label: 'Valor hora aula' },
    {
      id: 'acoes',
      label: 'Ações',
      render: (value, row) => (
        <>
          <Button onClick={() => handleEdit(row.id)} variant="outlined" color="primary" style={{ marginRight: '10px' }}>
            Editar Turma
          </Button>
          <IconButton onClick={() => handleEditAgenda(row.id)} color="secondary" aria-label="Editar Agenda">
            <EditCalendarIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Lista de Turmas</h2>
      
      {/* Campo de pesquisa */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar por nome, modalidade, tipo, nível, professor, máximo de alunos ou valor..."
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
          onClick={() => navigate('/turmas/novo')}
        >
          Adicionar Nova Turma
        </Button>
      </Box>

      <CustomTable 
        columns={columns} 
        data={filteredTurmas} 
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

export default Turmas;
