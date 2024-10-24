// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        {/* Incluímos o CSSBaseline para uma base visual e resetar estilos */}
        <CssBaseline />

        {/* Menu lateral */}
        <MenuLateral isDrawerOpen={isDrawerOpen} handleDrawerToggle={handleDrawerToggle} />

        {/* Conteúdo principal com margem para evitar sobreposição */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, ml: { sm: 1 } }} // ml (margin-left) desloca o conteúdo
        >
          <Routes>
            <Route path="/professores" element={<Professores />} />
            <Route path="/professores/novo" element={<ProfessorForm />} />
            <Route path="/professores/:id/editar" element={<ProfessorForm />} />


            {/* Rotas para Alunos */}
            <Route path="/alunos" element={<Alunos />} />
            <Route path="/alunos/novo" element={<AlunoForm />} />
            <Route path="/alunos/:id/editar" element={<AlunoForm />} />


            <Route path="/turmas" element={<Turmas />} />
            <Route path="/turmas/novo" element={<TurmaForm />} />
            <Route path="/turmas/:id/editar" element={<TurmaForm />} />

            {/* Outras rotas */}
            <Route path="/aulas" element={<Aulas />} />
            <Route path="/aulas/nova" element={<AulaForm />} />
            <Route path="/aulas/:id/editar" element={<AulaForm />} />

            
            <Route path="/matriculas" element={<Matriculas />} />
            <Route path="/matriculas/novo" element={<MatriculaForm />} />
            <Route path="/matriculas/:id/editar" element={<MatriculaForm />} />


            <Route path="/financeiro/mensalidades" element={<Mensalidades />} />
            <Route path="/financeiro/pagamentos" element={<Pagamentos />} />

            <Route path="/financeiro/lancamentos" element={<GerenciarLancamentos />} />

            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Outras rotas */}

            <Route path="/turmas/:turmaId/configurar-dias-horarios" element={<ConfigurarDiasHorarios />} />

            




          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
