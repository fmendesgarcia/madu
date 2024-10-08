// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Professores from './pages/Professores';
import ProfessorForm from './pages/ProfessorForm';
import Alunos from './pages/Alunos';
import AlunoForm from './pages/AlunosForm';
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


          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
