// src/pages/Professores.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

const Professores = () => {
  const [professores, setProfessores] = useState([]);

  // Função para buscar a lista de professores
  useEffect(() => {
    axios.get('http://localhost:5001/professores')
      .then((response) => {
        setProfessores(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar professores:', error);
      });
  }, []);

  // Função para excluir um professor
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

  return (
    <div>
      <h2>Lista de Professores</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Apelido</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Sexo</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {professores.map((professor) => (
              <TableRow key={professor.id}>
                <TableCell>{professor.nome}</TableCell>
                <TableCell>{professor.apelido}</TableCell>
                <TableCell>{professor.email}</TableCell>
                <TableCell>{professor.sexo}</TableCell>
                <TableCell>
                  <Button variant="contained" component={Link} to={`/professores/${professor.id}/editar`} style={{ marginRight: '10px' }}>
                    Editar
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(professor.id)}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" color="primary" component={Link} to="/professores/novo" style={{ marginTop: '20px' }}>
        Adicionar Novo Professor
      </Button>
    </div>
  );
};

export default Professores;
