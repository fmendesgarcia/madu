import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableHead, TableBody, TableRow, TableCell, Button } from '@mui/material';

const Pagamentos = () => {
  const [pagamentos, setPagamentos] = useState([]);

  // Função para carregar os pagamentos
  useEffect(() => {
    axios.get('http://localhost:5001/pagamentos')
      .then(response => {
        setPagamentos(response.data); // Atualiza o estado com os dados dos pagamentos
      })
      .catch(error => {
        console.error('Erro ao buscar pagamentos:', error);
      });
  }, []);

  return (
    <div>
      <h2>Gerenciar Pagamentos</h2>
      
      {/* Tabela de Pagamentos */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Aluno</TableCell>
            <TableCell>Turma</TableCell>
            <TableCell>Data de Pagamento</TableCell>
            <TableCell>Valor Pago</TableCell>
            <TableCell>Forma de Pagamento</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pagamentos.map((pagamento) => (
            <TableRow key={pagamento.id}>
              <TableCell>{pagamento.aluno_nome}</TableCell>
              <TableCell>{pagamento.turma_nome}</TableCell>
              <TableCell>{new Date(pagamento.data_pagamento).toLocaleDateString()}</TableCell> {/* Formatar a data */}
              <TableCell>{pagamento.valor_pago}</TableCell>
              <TableCell>{pagamento.forma_pagamento}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => alert(`Excluir pagamento: ${pagamento.id}`)}
                >
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Pagamentos;
