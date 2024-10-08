import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Toolbar, IconButton, Typography, Divider } from '@mui/material';
import { Dashboard, School, Group, Class, Menu as MenuIcon, Assignment, AttachMoney, Event, BarChart } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const MenuLateral = () => {
  const [open, setOpen] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const location = useLocation();

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

  // Atualiza o item selecionado com base no link atual
  React.useEffect(() => {
    const currentItem = menuItems.findIndex(item => item.link === location.pathname);
    setSelectedIndex(currentItem);
  }, [location.pathname]);

  return (
    <Drawer
      variant="permanent"
      open={open}
      onClose={() => setOpen(!open)}
      sx={{
        width: open ? 240 : 60,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? 240 : 60,
          boxSizing: 'border-box',
          transition: 'width 0.3s',
        },
      }}
    >
      <Toolbar>
        <IconButton onClick={() => setOpen(!open)}>
          <MenuIcon />
        </IconButton>
        {open && (
          <Box ml={5}>
            <Typography variant="h6">Minha Logo</Typography>
          </Box>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={index}
            component={Link}
            to={item.link}
            selected={index === selectedIndex}
            onClick={() => setSelectedIndex(index)}
            sx={{
              backgroundColor: index === selectedIndex ? '#dfe4ea' : 'transparent',
              color: index === selectedIndex ? '#000' : '#1e2222',
              "& .MuiListItemIcon-root": {
                color: index === selectedIndex ? '#2980b9' : '#95a5a6',
              },
              '&:hover': {
                backgroundColor: '#ecf0f1',
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            {open && <ListItemText primary={item.text} />}
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default MenuLateral;
