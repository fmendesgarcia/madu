// src/components/MenuLateral.js
import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Toolbar, Typography } from '@mui/material';
import { Dashboard, School, Group, Class, Assignment, Event, AttachMoney, BarChart } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const MenuLateral = () => {
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, link: '/' },
    { text: 'Alunos', icon: <Group />, link: '/alunos' },
    { text: 'Professores', icon: <School />, link: '/professores' },
    { text: 'Turmas', icon: <Class />, link: '/turmas' },
    { text: 'Aulas', icon: <Assignment />, link: '/aulas' },
    { text: 'Matrículas', icon: <Assignment />, link: '/matriculas' },
    { text: 'Financeiro', icon: <AttachMoney />, link: '/financeiro' },
    { text: 'Eventos', icon: <Event />, link: '/eventos' },
    { text: 'Relatórios', icon: <BarChart />, link: '/relatorios' },
  ];

  return (
    <Drawer variant="permanent" anchor="left">
      <Box sx={{ width: 240 }}>
        {/* Espaço para a logo */}
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Minha Logo
          </Typography>
        </Toolbar>
        <List>
          {menuItems.map((item, index) => (
            <ListItem button key={index} component={Link} to={item.link}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default MenuLateral;
