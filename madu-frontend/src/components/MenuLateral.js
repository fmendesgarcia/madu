import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, IconButton, Typography, Divider, Collapse } from '@mui/material';
import { Dashboard, School, Group, Class, Menu as MenuIcon, Assignment, AttachMoney, Event, BarChart, ExpandLess, ExpandMore, MonetizationOn, Receipt, Payments, MusicNote } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const MenuLateral = () => {
  const [open, setOpen] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [financeOpen, setFinanceOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, link: '/dashboard' },
    { text: 'Alunos', icon: <Group />, link: '/alunos' },
    { text: 'Professores', icon: <School />, link: '/professores' },
    { text: 'Turmas', icon: <Class />, link: '/turmas' },
    { text: 'Aulas', icon: <Assignment />, link: '/aulas' },
    { text: 'Matrículas', icon: <Assignment />, link: '/matriculas' },
    { text: 'Eventos', icon: <Event />, link: '/eventos' },
    { text: 'Relatórios', icon: <BarChart />, link: '/relatorios' },
  ];

  React.useEffect(() => {
    const currentItem = menuItems.findIndex(item => item.link === location.pathname);
    setSelectedIndex(currentItem);
  }, [location.pathname]);

  const handleFinanceClick = () => {
    setFinanceOpen(!financeOpen);
  };

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
          backgroundColor: '#2c3e50',
          color: '#ecf0f1',
          transition: 'width 0.3s',
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" padding={1}>
        <IconButton onClick={() => setOpen(!open)}>
          <MenuIcon style={{ color: '#ecf0f1' }} />
        </IconButton>
        {open && (
          <Typography variant="h6" style={{ color: '#ecf0f1' }}>
            <MusicNote /> {/* Ícone de música */}
            Dança Logo
          </Typography>
        )}
      </Box>
      <Divider style={{ backgroundColor: '#bdc3c7' }} />
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
              backgroundColor: index === selectedIndex ? '#34495e' : 'transparent',
              color: '#ecf0f1',
              "& .MuiListItemIcon-root": {
                color: '#ecf0f1', // Mantém o ícone branco
              },
              '&:hover': {
                backgroundColor: '#1abc9c',
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            {open && <ListItemText primary={item.text} />}
          </ListItem>
        ))}

        {/* Item Financeiro com submenu */}
        <ListItem button onClick={handleFinanceClick}>
          <ListItemIcon>
            <AttachMoney style={{ color: '#ecf0f1' }} /> {/* Mantém o ícone branco */}
          </ListItemIcon>
          {open && <ListItemText primary="Financeiro" />}
          {open && (financeOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>

        <Collapse in={financeOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              to="/financeiro/mensalidades"
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <MonetizationOn style={{ color: '#ecf0f1' }} /> {/* Mantém o ícone branco */}
              </ListItemIcon>
              <ListItemText primary="Mensalidades" sx={{ color: '#ecf0f1' }} /> {/* Mantém o texto claro */}
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/financeiro/pagamentos"
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <Payments style={{ color: '#ecf0f1' }} /> {/* Mantém o ícone branco */}
              </ListItemIcon>
              <ListItemText primary="Pagamentos" sx={{ color: '#ecf0f1' }} /> {/* Mantém o texto claro */}
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/financeiro/lancamentos"
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <Receipt style={{ color: '#ecf0f1' }} /> {/* Mantém o ícone branco */}
              </ListItemIcon>
              <ListItemText primary="Lançamentos" sx={{ color: '#ecf0f1' }} /> {/* Mantém o texto claro */}
            </ListItem>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
};

export default MenuLateral;
