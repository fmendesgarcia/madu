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

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verifica se o token existe no localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  const location = useLocation(); // Hook para verificar a rota atual

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Exibe o Menu Lateral apenas para usuários autenticados e fora da página de login */}
      {isAuthenticated && location.pathname !== '/login' && (
        <MenuLateral onLogout={handleLogout} />
      )}

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, ml: { sm: isAuthenticated ? 1 : 0 } }}
      >
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Auth />} />

          {/* Rotas protegidas */}
          <Route
            path="/professores"
            element={<PrivateRoute element={<Professores />} />}
          />
          <Route
            path="/professores/novo"
            element={<PrivateRoute element={<ProfessorForm />} />}
          />
          <Route
            path="/professores/:id/editar"
            element={<PrivateRoute element={<ProfessorForm />} />}
          />

          <Route path="/alunos" element={<PrivateRoute element={<Alunos />} />} />
          <Route path="/alunos/novo" element={<PrivateRoute element={<AlunoForm />} />} />
          <Route path="/alunos/:id/editar" element={<PrivateRoute element={<AlunoForm />} />} />

          <Route path="/turmas" element={<PrivateRoute element={<Turmas />} />} />
          <Route path="/turmas/novo" element={<PrivateRoute element={<TurmaForm />} />} />
          <Route path="/turmas/:id/editar" element={<PrivateRoute element={<TurmaForm />} />} />

          <Route path="/aulas" element={<PrivateRoute element={<Aulas />} />} />
          <Route path="/aulas/nova" element={<PrivateRoute element={<AulaForm />} />} />
          <Route path="/aulas/:id/editar" element={<PrivateRoute element={<AulaForm />} />} />

          <Route
            path="/matriculas"
            element={<PrivateRoute element={<Matriculas />} />}
          />
          <Route
            path="/matriculas/novo"
            element={<PrivateRoute element={<MatriculaForm />} />}
          />
          <Route
            path="/matriculas/:id/editar"
            element={<PrivateRoute element={<MatriculaForm />} />}
          />

          <Route
            path="/financeiro/mensalidades"
            element={<PrivateRoute element={<Mensalidades />} />}
          />
          <Route
            path="/financeiro/pagamentos"
            element={<PrivateRoute element={<Pagamentos />} />}
          />
          <Route
            path="/financeiro/lancamentos"
            element={<PrivateRoute element={<GerenciarLancamentos />} />}
          />

          <Route
            path="/turmas/:turmaId/configurar-dias-horarios"
            element={<PrivateRoute element={<ConfigurarDiasHorarios />} />}
          />

          {/* Rota inicial */}
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
