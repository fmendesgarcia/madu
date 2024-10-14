import React, { useState } from 'react';
import { Modal, Button, TextField, MenuItem, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';
import axios from 'axios';

const ModalRegistrarPagamento = ({ open, handleClose, mensalidadeId, recarregarMensalidades }) => {
  const [dataPagamento, setDataPagamento] = useState('');
  const [valorPago, setValorPago] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [erro, setErro] = useState('');

  const registrarPagamento = () => {
    // Verificação se todos os campos estão preenchidos
    if (!dataPagamento || !valorPago || !formaPagamento) {
      setErro('Preencha todos os campos antes de confirmar o pagamento.');
      return;
    }

    axios.post('http://localhost:5001/pagamentos', {
      mensalidade_id: mensalidadeId,
      data_pagamento: dataPagamento,
      valor_pago: valorPago,
      forma_pagamento: formaPagamento
    })
    .then(response => {
      console.log('Pagamento registrado:', response.data);
      setErro(''); // Limpar erros ao registrar pagamento com sucesso
      handleClose(); // Fechar modal após registrar pagamento
      recarregarMensalidades(); // Atualizar a lista de mensalidades após o pagamento
    })
    .catch(error => {
      console.error('Erro ao registrar pagamento:', error);
      setErro('Erro ao registrar pagamento. Tente novamente.');
    });
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
          type="number"
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

        {erro && (
          <FormHelperText error style={{ marginBottom: '10px' }}>
            {erro}
          </FormHelperText>
        )}

        <Button variant="contained" color="primary" onClick={registrarPagamento}>
          Confirmar Pagamento
        </Button>
      </div>
    </Modal>
  );
};

export default ModalRegistrarPagamento;
