import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, IconButton, Typography, Divider, Collapse } from '@mui/material';
import { Dashboard, School, Group, Class, Menu as MenuIcon, Assignment, AttachMoney, Event, BarChart, ExpandLess, ExpandMore, MonetizationOn, Receipt, Payments, MusicNote } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const MenuLateral = ({ onLogout }) => {
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
            <MusicNote />
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
                color: '#ecf0f1',
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
            <AttachMoney style={{ color: '#ecf0f1' }} />
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
                <MonetizationOn style={{ color: '#ecf0f1' }} />
              </ListItemIcon>
              <ListItemText primary="Mensalidades" sx={{ color: '#ecf0f1' }} />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/financeiro/pagamentos"
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <Payments style={{ color: '#ecf0f1' }} />
              </ListItemIcon>
              <ListItemText primary="Pagamentos" sx={{ color: '#ecf0f1' }} />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/financeiro/lancamentos"
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <Receipt style={{ color: '#ecf0f1' }} />
              </ListItemIcon>
              <ListItemText primary="Lançamentos" sx={{ color: '#ecf0f1' }} />
            </ListItem>
          </List>
        </Collapse>

        {/* Botão de Logout */}
        <ListItem
          button
          onClick={onLogout} // Chama a função de logout passada pelo App.js
          sx={{
            color: '#ecf0f1',
            "& .MuiListItemIcon-root": { color: '#ecf0f1' },
            '&:hover': {
              backgroundColor: '#e74c3c',
              color: '#ffffff',
            },
          }}
        >
          <ListItemIcon>
            <MenuIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Sair" />}
        </ListItem>
      </List>
    </Drawer>
  );
};

export default MenuLateral;
