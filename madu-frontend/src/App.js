// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Professores from './pages/Professores';
import ProfessorForm from './pages/ProfessorForm';
import MenuLateral from './components/MenuLateral';

const drawerWidth = 1; // Defina a largura fixa do menu lateral

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <MenuLateral /> {/* O menu lateral fixo */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, marginLeft: `${drawerWidth}px` }} // Adiciona margem ao conteúdo principal
        >
          <Routes>
            <Route path="/professores" element={<Professores />} />
            <Route path="/professores/novo" element={<ProfessorForm />} />
            <Route path="/professores/:id/editar" element={<ProfessorForm />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
