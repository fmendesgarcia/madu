import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Table, TableHead, TableBody, TableRow, TableCell, Button, Select, MenuItem, FormControl, InputLabel, Modal, TextField, Box, InputAdornment, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Para navegação
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const GerenciarMensalidades = () => {
  const now = new Date();
  const defaultMes = String(now.getMonth() + 1); // 1..12
  const defaultAno = String(now.getFullYear());

  const [mensalidades, setMensalidades] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [mesFilter, setMesFilter] = useState(defaultMes);
  const [anoFilter, setAnoFilter] = useState(defaultAno);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('nenhum'); // 'nenhum' | 'turma'
  const [modalOpen, setModalOpen] = useState(false);
  const [mensalidadeSelecionada, setMensalidadeSelecionada] = useState(null);
  const [dataPagamento, setDataPagamento] = useState('');
  const [valorPago, setValorPago] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/mensalidades')
      .then(response => {
        setMensalidades(response.data);
      })
      .catch(error => console.error('Erro ao buscar mensalidades:', error));
  }, []);

  const handleStatusFilterChange = (event) => setStatusFilter(event.target.value);
  const handleMesFilterChange = (event) => setMesFilter(event.target.value);
  const handleAnoFilterChange = (event) => setAnoFilter(event.target.value);

  const registrarPagamento = () => {
    if (!dataPagamento || !valorPago || !formaPagamento) {
      alert('Preencha todos os campos antes de registrar o pagamento');
      return;
    }
  
    api.post('/pagamentos', {
      mensalidade_id: mensalidadeSelecionada,
      data_pagamento: dataPagamento,
      valor_pago: valorPago,
      forma_pagamento: formaPagamento
    })
    .then(() => {
      carregarMensalidades();
      fecharModal();
    })
    .catch(error => {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento: ' + error.message);
    });
  };

  const abrirModalPagamento = (mensalidade) => {
    const hoje = new Date().toISOString().split('T')[0];
    setMensalidadeSelecionada(mensalidade.id);
    setModalOpen(true);
    setDataPagamento(hoje);
    setValorPago(mensalidade.valor);
    setFormaPagamento('');
  };

  const fecharModal = () => {
    setModalOpen(false);
    setMensalidadeSelecionada(null);
    setDataPagamento('');
    setValorPago('');
    setFormaPagamento('');
  };

  const carregarMensalidades = () => {
    api.get('/mensalidades')
      .then(response => setMensalidades(response.data))
      .catch(error => console.error('Erro ao buscar mensalidades:', error));
  };

  const renderStatus = (status) => {
    if (status === 'pago') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', backgroundColor: 'lightgreen', padding: '5px', borderRadius: '5px' }}>
          <CheckCircleIcon style={{ color: 'green', marginRight: '5px' }} /> Pago
        </span>
      );
    } else if (status === 'pendente') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', backgroundColor: 'lightcoral', padding: '5px', borderRadius: '5px' }}>
          <ErrorIcon style={{ color: 'red', marginRight: '5px' }} /> Pendente
        </span>
      );
    } else if (status === 'cancelada') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', backgroundColor: 'lightgray', padding: '5px', borderRadius: '5px' }}>
          <ErrorIcon style={{ color: 'gray', marginRight: '5px' }} /> Cancelada
        </span>
      );
    }
    return (
      <span style={{ display: 'flex', alignItems: 'center', backgroundColor: 'lightyellow', padding: '5px', borderRadius: '5px' }}>
        <AccessTimeIcon style={{ color: 'orange', marginRight: '5px' }} /> Em andamento
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredMensalidades = useMemo(() => {
    return mensalidades
      .filter(m => (statusFilter === 'Todos' || m.status === statusFilter))
      .filter(m => (mesFilter === 'Todos' || new Date(m.data_vencimento).getMonth() + 1 === parseInt(mesFilter)))
      .filter(m => (anoFilter === 'Todos' || new Date(m.data_vencimento).getFullYear() === parseInt(anoFilter)))
      .filter(m => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          (m.aluno_nome || '').toLowerCase().includes(q) ||
          (m.turmas_nomes || '').toLowerCase().includes(q)
        );
      });
  }, [mensalidades, statusFilter, mesFilter, anoFilter, searchTerm]);

  const groupedByTurma = useMemo(() => {
    if (groupBy !== 'turma') return null;
    const map = new Map();
    for (const m of filteredMensalidades) {
      const turmaKey = m.turmas_nomes || 'Sem turma';
      if (!map.has(turmaKey)) map.set(turmaKey, []);
      map.get(turmaKey).push(m);
    }
    return map;
  }, [filteredMensalidades, groupBy]);

  return (
    <div>
      <h2>Gerenciar Mensalidades</h2>

      {/* Filtros e busca */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={handleStatusFilterChange}>
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="pago">Pago</MenuItem>
            <MenuItem value="pendente">Pendente</MenuItem>
            <MenuItem value="cancelada">Cancelada</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Mês</InputLabel>
          <Select value={mesFilter} label="Mês" onChange={handleMesFilterChange}>
            <MenuItem value="Todos">Todos</MenuItem>
            {monthNames.map((label, idx) => (
              <MenuItem key={idx + 1} value={String(idx + 1)}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Ano</InputLabel>
          <Select value={anoFilter} label="Ano" onChange={handleAnoFilterChange}>
            <MenuItem value="Todos">Todos</MenuItem>
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <MenuItem key={y} value={String(y)}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          placeholder="Pesquisar por aluno ou turma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ minWidth: 280 }}
        />

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Agrupar por</InputLabel>
          <Select value={groupBy} label="Agrupar por" onChange={(e) => setGroupBy(e.target.value)}>
            <MenuItem value="nenhum">Nenhum</MenuItem>
            <MenuItem value="turma">Turma</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabela de mensalidades */}
      {groupBy === 'nenhum' && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Aluno</TableCell>
              <TableCell>Turmas</TableCell>
              <TableCell>Data de Vencimento</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMensalidades.map((mensalidade) => (
              <TableRow key={mensalidade.id}>
                <TableCell>{mensalidade.aluno_nome}</TableCell>
                <TableCell>{mensalidade.turmas_nomes}</TableCell>
                <TableCell>{formatDate(mensalidade.data_vencimento)}</TableCell>
                <TableCell>{mensalidade.valor}</TableCell>
                <TableCell>{renderStatus(mensalidade.status)}</TableCell>
                <TableCell>
                  {mensalidade.status !== 'pago' && (
                    <Button variant="contained" color="primary" onClick={() => abrirModalPagamento(mensalidade)}>
                      Registrar Pagamento
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {groupBy === 'turma' && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Turma</TableCell>
              <TableCell>Aluno</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...groupedByTurma.keys()].map((turma) => (
              <React.Fragment key={turma}>
                <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell colSpan={6} style={{ fontWeight: 'bold' }}>{turma}</TableCell>
                </TableRow>
                {groupedByTurma.get(turma).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{/* vazio, turma já está no cabeçalho do grupo */}</TableCell>
                    <TableCell>{m.aluno_nome}</TableCell>
                    <TableCell>{formatDate(m.data_vencimento)}</TableCell>
                    <TableCell>{m.valor}</TableCell>
                    <TableCell>{renderStatus(m.status)}</TableCell>
                    <TableCell>
                      {m.status !== 'pago' && (
                        <Button variant="contained" color="primary" onClick={() => abrirModalPagamento(m)}>
                          Registrar Pagamento
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal para registrar pagamento */}
      <Modal open={modalOpen} onClose={fecharModal}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          width: '300px', 
          margin: 'auto', 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', 
          borderRadius: '8px' 
        }}>
          <h3>Registrar Pagamento</h3>

          <TextField
            label="Data de Pagamento"
            type="date"
            fullWidth
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: '10px' }}
          />

          <TextField
            label="Valor Pago"
            fullWidth
            value={valorPago}
            onChange={(e) => setValorPago(e.target.value)}
            style={{ marginBottom: '10px' }}
          />

          <FormControl fullWidth style={{ marginBottom: '10px' }}>
            <InputLabel>Forma de Pagamento</InputLabel>
            <Select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
            >
              <MenuItem value="cartao">Cartão</MenuItem>
              <MenuItem value="boleto">Boleto</MenuItem>
              <MenuItem value="pix">Pix</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={registrarPagamento}>
            Confirmar Pagamento
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default GerenciarMensalidades;
