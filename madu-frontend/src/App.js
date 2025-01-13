// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Auth from './pages/Auth';
import Professores from './pages/Professores';
import ProfessorForm from './pages/ProfessorForm';
import Alunos from './pages/Alunos';
import AlunoForm from './pages/AlunosForm';
import Turmas from './pages/Turmas';
import TurmaForm from './pages/TurmasForm';
import Aulas from './pages/Aulas';
import AulaForm from './pages/AulasForm';
import Matriculas from './pages/Matriculas';
import MatriculaForm from './pages/MatriculasForm';
import Mensalidades from './pages/Mensalidades';
import Pagamentos from './pages/Pagamentos';
import Dashboard from './pages/Dashboard';
import GerenciarLancamentos from './pages/Lancamentos';
import ConfigurarDiasHorarios from './pages/ConfigurarDiasHorarios';
import MenuLateral from './components/MenuLateral';
import { Box, CssBaseline } from '@mui/material';
import api from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Inicial como null


  const location = useLocation(); // Hook para verificar a rota atual

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/validate-token', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsAuthenticated(response.data.valid);
        } catch (error) {
          console.error('Erro ao validar o token:', error);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      } else {
        setIsAuthenticated(false);
      }
    };
  
    checkAuth();
  }, []);
  
  useEffect(() => {
    console.log('Estado de isAuthenticated:', isAuthenticated);
  }, [isAuthenticated]);
  
  
  

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove o token
    localStorage.removeItem('user');  // Remove os dados do usuário
    setIsAuthenticated(false);        // Atualiza o estado de autenticação
  };

  const PrivateRoute = ({ element }) => {
    if (isAuthenticated === null) {
      return <div>Carregando...</div>; // Mostra um estado de carregamento
    }
    return isAuthenticated ? element : <Navigate to="/login" />;
  };
  

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Exibe o Menu Lateral apenas se o usuário estiver autenticado */}
      {isAuthenticated && location.pathname !== '/login' && (
        <MenuLateral onLogout={handleLogout} />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { sm: isAuthenticated ? 1 : 0 },
        }}
      >
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" />} />

          {/* Rotas protegidas */}
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/professores" element={<PrivateRoute element={<Professores />} />} />
          <Route path="/professores/novo" element={<PrivateRoute element={<ProfessorForm />} />} />
          <Route path="/professores/:id/editar" element={<PrivateRoute element={<ProfessorForm />} />} />
          <Route path="/alunos" element={<PrivateRoute element={<Alunos />} />} />
          <Route path="/alunos/novo" element={<PrivateRoute element={<AlunoForm />} />} />
          <Route path="/alunos/:id/editar" element={<PrivateRoute element={<AlunoForm />} />} />
          <Route path="/turmas" element={<PrivateRoute element={<Turmas />} />} />
          <Route path="/turmas/novo" element={<PrivateRoute element={<TurmaForm />} />} />
          <Route path="/turmas/:id/editar" element={<PrivateRoute element={<TurmaForm />} />} />
          <Route path="/aulas" element={<PrivateRoute element={<Aulas />} />} />
          <Route path="/aulas/nova" element={<PrivateRoute element={<AulaForm />} />} />
          <Route path="/aulas/:id/editar" element={<PrivateRoute element={<AulaForm />} />} />
          <Route path="/matriculas" element={<PrivateRoute element={<Matriculas />} />} />
          <Route path="/matriculas/novo" element={<PrivateRoute element={<MatriculaForm />} />} />
          <Route path="/matriculas/:id/editar" element={<PrivateRoute element={<MatriculaForm />} />} />
          <Route path="/financeiro/mensalidades" element={<PrivateRoute element={<Mensalidades />} />} />
          <Route path="/financeiro/pagamentos" element={<PrivateRoute element={<Pagamentos />} />} />
          <Route path="/financeiro/lancamentos" element={<PrivateRoute element={<GerenciarLancamentos />} />} />
          <Route
            path="/turmas/:turmaId/configurar-dias-horarios"
            element={<PrivateRoute element={<ConfigurarDiasHorarios />} />}
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
