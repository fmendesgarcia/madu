import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa o hook para redirecionar
import api from '../services/api';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from '@mui/material';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook para redirecionamento

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      // Salva o token no localStorage
      localStorage.setItem('token', response.data.token);

      // Redireciona para a página inicial após o login
      navigate('/dashboard'); // Substitua "/dashboard" pela rota desejada
    } catch (err) {
      setError('E-mail ou senha inválidos!');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          Login
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="E-mail"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Entrar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Auth;
