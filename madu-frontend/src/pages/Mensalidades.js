import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Table, TableHead, TableBody, TableRow, TableCell, Button, Select, MenuItem, FormControl, InputLabel, Modal, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Para navegação
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const GerenciarMensalidades = () => {
  const [mensalidades, setMensalidades] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Todos'); // Filtro de status com "Todos" como padrão
  const [mesFilter, setMesFilter] = useState('Todos'); // Filtro de mês com "Todos" como padrão
  const [anoFilter, setAnoFilter] = useState('Todos'); // Filtro de ano com "Todos" como padrão
  const [modalOpen, setModalOpen] = useState(false); // Estado para abrir/fechar o modal
  const [mensalidadeSelecionada, setMensalidadeSelecionada] = useState(null); // Armazena a mensalidade selecionada para o pagamento
  const [dataPagamento, setDataPagamento] = useState(''); // Data de pagamento no modal
  const [valorPago, setValorPago] = useState(''); // Valor pago no modal
  const [formaPagamento, setFormaPagamento] = useState(''); // Forma de pagamento no modal
  const navigate = useNavigate(); // Hook para navegação

  // Carrega as mensalidades da API
  useEffect(() => {
    api.get('/mensalidades')
      .then(response => {
        console.log('Dados recebidos do backend:', response); // Verifique os dados completos
        setMensalidades(response.data);
      })
      .catch(error => console.error('Erro ao buscar mensalidades:', error));
  }, []);

  // Função para filtrar pelo status, mês e ano
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleMesFilterChange = (event) => {
    setMesFilter(event.target.value);
  };

  const handleAnoFilterChange = (event) => {
    setAnoFilter(event.target.value);
  };

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
    .then(response => {
      console.log('Pagamento registrado:', response.data);
      carregarMensalidades();
      fecharModal();
    })
    .catch(error => {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento: ' + error.message);
    });
  };

  const abrirModalPagamento = (mensalidadeId) => {
    setMensalidadeSelecionada(mensalidadeId);
    setModalOpen(true);
    setDataPagamento('');
    setValorPago('');
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
      .then(response => {
        setMensalidades(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar mensalidades:', error);
      });
  };

  // Função para estilizar o status
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
    const day = String(date.getDate()).padStart(2, '0'); // Garante dois dígitos para o dia
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Garante dois dígitos para o mês
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Formato dd/mm/yyyy
  };

  return (
    <div>
      <h2>Gerenciar Mensalidades</h2>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <FormControl>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={handleStatusFilterChange}>
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="pago">Pago</MenuItem>
            <MenuItem value="pendente">Pendente</MenuItem>
            <MenuItem value="cancelada">Cancelada</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Mês</InputLabel>
          <Select value={mesFilter} onChange={handleMesFilterChange}>
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="1">Janeiro</MenuItem>
            <MenuItem value="2">Fevereiro</MenuItem>
            <MenuItem value="3">Março</MenuItem>
            <MenuItem value="4">Abril</MenuItem>
            <MenuItem value="5">Maio</MenuItem>
            <MenuItem value="6">Junho</MenuItem>
            <MenuItem value="7">Julho</MenuItem>
            <MenuItem value="8">Agosto</MenuItem>
            <MenuItem value="9">Setembro</MenuItem>
            <MenuItem value="10">Outubro</MenuItem>
            <MenuItem value="11">Novembro</MenuItem>
            <MenuItem value="12">Dezembro</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Ano</InputLabel>
          <Select value={anoFilter} onChange={handleAnoFilterChange}>
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="2022">2022</MenuItem>
            <MenuItem value="2023">2023</MenuItem>
            <MenuItem value="2024">2024</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Tabela de mensalidades */}
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
          {mensalidades
            .filter(mensalidade => 
              (statusFilter === 'Todos' || mensalidade.status === statusFilter) &&
              (mesFilter === 'Todos' || new Date(mensalidade.data_vencimento).getMonth() + 1 === parseInt(mesFilter)) &&
              (anoFilter === 'Todos' || new Date(mensalidade.data_vencimento).getFullYear() === parseInt(anoFilter))
            )
            .map((mensalidade) => (
              <TableRow key={mensalidade.id}>
                <TableCell>{mensalidade.aluno_nome}</TableCell>
                <TableCell>{mensalidade.turmas_nomes}</TableCell> {/* Exibe as turmas concatenadas */}
                <TableCell>{formatDate(mensalidade.data_vencimento)}</TableCell> {/* Formata a data corretamente */}
                <TableCell>{mensalidade.valor}</TableCell>
                <TableCell>{renderStatus(mensalidade.status)}</TableCell>
                <TableCell>
                  {mensalidade.status !== 'pago' && (
                    <Button variant="contained" color="primary" onClick={() => abrirModalPagamento(mensalidade.id)}>
                      Registrar Pagamento
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

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
          transform: 'translate(-50%, -50%)', // Centraliza o modal
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
