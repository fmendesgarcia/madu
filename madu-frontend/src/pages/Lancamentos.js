import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Table, TableHead, TableBody, TableRow, TableCell, Button, Select, MenuItem, FormControl, InputLabel, Modal, TextField, IconButton } from '@mui/material';
import { AttachMoney, MoneyOff } from '@mui/icons-material';

const GerenciarLancamentos = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false); 
  const [tipo, setTipo] = useState('receita'); 
  const [descricao, setDescricao] = useState(''); 
  const [valor, setValor] = useState(''); 
  const [dataLancamento, setDataLancamento] = useState(''); 
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState(null); 
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');

  useEffect(() => {
    carregarLancamentos();
  }, [mes, ano]);

  const carregarLancamentos = () => {
    api.get('/lancamentos', {
      params: { mes, ano }
    })
    .then(response => setLancamentos(response.data))
    .catch(error => console.error('Erro ao buscar lançamentos:', error));
  };

  const abrirModal = (lancamento) => {
    setLancamentoSelecionado(lancamento || null);
    setDescricao(lancamento ? lancamento.descricao : '');
    setValor(lancamento ? lancamento.valor : '');
    setTipo(lancamento ? lancamento.tipo : 'receita');
    setDataLancamento(lancamento ? lancamento.data_lancamento : '');
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setDescricao('');
    setValor('');
    setTipo('receita');
    setDataLancamento('');
    setLancamentoSelecionado(null);
  };

  const salvarLancamento = () => {
    const data = { descricao, tipo, valor, data_lancamento: dataLancamento };

    if (lancamentoSelecionado) {
      api.put(`/lancamentos/${lancamentoSelecionado.id}`, data)
        .then(() => {
          carregarLancamentos();
          fecharModal();
        }).catch(error => console.error('Erro ao atualizar lançamento:', error));
    } else {
      api.post('/lancamentos', data)
        .then(() => {
          carregarLancamentos();
          fecharModal();
        }).catch(error => console.error('Erro ao criar lançamento:', error));
    }
  };

  const deletarLancamento = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      api.delete(`/lancamentos/${id}`)
        .then(() => carregarLancamentos())
        .catch(error => console.error('Erro ao excluir lançamento:', error));
    }
  };

  // Função para formatar a data no formato dd/mm/aaaa
  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div>
      <h2>Gerenciar Lançamentos</h2>

      {/* Filtros de Mês e Ano */}
      <div style={{ marginBottom: '20px' }}>
        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel>Mês</InputLabel>
          <Select value={mes} onChange={(e) => setMes(e.target.value)}>
            <MenuItem value=""><em>Todos</em></MenuItem>
            <MenuItem value="01">Janeiro</MenuItem>
            <MenuItem value="02">Fevereiro</MenuItem>
            <MenuItem value="03">Março</MenuItem>
            <MenuItem value="04">Abril</MenuItem>
            <MenuItem value="05">Maio</MenuItem>
            <MenuItem value="06">Junho</MenuItem>
            <MenuItem value="07">Julho</MenuItem>
            <MenuItem value="08">Agosto</MenuItem>
            <MenuItem value="09">Setembro</MenuItem>
            <MenuItem value="10">Outubro</MenuItem>
            <MenuItem value="11">Novembro</MenuItem>
            <MenuItem value="12">Dezembro</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Ano</InputLabel>
          <Select value={ano} onChange={(e) => setAno(e.target.value)}>
            <MenuItem value=""><em>Todos</em></MenuItem>
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2023">2023</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Tabela de lançamentos */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Descrição</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Valor</TableCell>
            <TableCell>Data do Lançamento</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lancamentos.map((lancamento) => (
            <TableRow key={lancamento.id}>
              <TableCell>{lancamento.descricao}</TableCell>
              <TableCell>
                {lancamento.tipo === 'receita' ? (
                  <IconButton><AttachMoney style={{ color: 'green' }} /></IconButton>
                ) : (
                  <IconButton><MoneyOff style={{ color: 'red' }} /></IconButton>
                )}
              </TableCell>
              <TableCell>{lancamento.valor}</TableCell>
              <TableCell>{formatarData(lancamento.data_lancamento)}</TableCell> {/* Formatação da data */}
              <TableCell>
                <Button variant="contained" color="primary" onClick={() => abrirModal(lancamento)}>
                  Editar
                </Button>
                <Button variant="contained" color="error" onClick={() => deletarLancamento(lancamento.id)} style={{ marginLeft: '10px' }}>
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button variant="contained" color="primary" onClick={() => abrirModal(null)} style={{ marginTop: '20px' }}>
        Adicionar Lançamento
      </Button>

      {/* Modal para adicionar/editar lançamento */}
      <Modal open={modalOpen} onClose={fecharModal}>
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          margin: 'auto',
          width: '300px',
          top: '50%',
          left: '50%',
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}>
          <h3>{lancamentoSelecionado ? 'Editar' : 'Adicionar'} Lançamento</h3>

          <TextField
            label="Descrição"
            fullWidth
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={{ marginBottom: '10px' }}
          />

          <TextField
            label="Valor"
            fullWidth
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            style={{ marginBottom: '10px' }}
          />

          <FormControl fullWidth style={{ marginBottom: '10px' }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <MenuItem value="receita">Receita</MenuItem>
              <MenuItem value="despesa">Despesa</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Data do Lançamento"
            type="date"
            fullWidth
            value={dataLancamento}
            onChange={(e) => setDataLancamento(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ marginBottom: '10px' }}
          />

          <Button variant="contained" color="primary" onClick={salvarLancamento}>
            {lancamentoSelecionado ? 'Salvar Alterações' : 'Adicionar Lançamento'}
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default GerenciarLancamentos;
