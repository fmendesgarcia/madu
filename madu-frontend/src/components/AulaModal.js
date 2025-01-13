import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Checkbox, List, ListItem, ListItemText, ListItemSecondaryAction, TextField } from '@mui/material';

const AulaModal = ({ 
    showEditModal, 
    showPresenceModal, 
    onClose, 
    onSaveChanges, 
    onOpenPresenceList, 
    onClosePresenceList, 
    newDate, 
    newTime, 
    setNewDate, 
    setNewTime, 
    aulaId // ID da aula para carregar presença
}) => {
  const [presenceList, setPresenceList] = useState([]);

  // Função para buscar a lista de presença da aula
  useEffect(() => {
    if (showPresenceModal && aulaId) {
      api.get(`http://localhost:5001/presencas/aulas/${aulaId}/presencas`)
        .then(response => {
          setPresenceList(response.data);
        })
        .catch(error => {
          console.error('Erro ao buscar lista de presença:', error);
        });
    }
  }, [showPresenceModal, aulaId]);

  // Função para lidar com a mudança de presença
  const handlePresenceChange = (index) => {
    setPresenceList(prevList => 
      prevList.map((item, i) => 
        i === index ? { ...item, presente: !item.presente } : item
      )
    );
  };

  // Função para salvar a lista de presença
  const savePresenceList = () => {
    const promises = presenceList.map(item => 
      api.post('http://localhost:5001/presencas', {
        aluno_id: item.aluno_id,
        aula_id: aulaId,
        presente: item.presente
      })
    );

    Promise.all(promises)
      .then(() => {
        console.log('Lista de presença salva com sucesso!');
        onClosePresenceList();
      })
      .catch(error => console.error('Erro ao salvar presença:', error));
  };

  return (
    <>
      {/* Modal de Edição */}
      <Dialog open={showEditModal} onClose={onClose}>
        <DialogTitle>Editar Aula</DialogTitle>
        <DialogContent>
          <TextField
            label="Data"
            type="date"
            fullWidth
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Horário"
            type="time"
            fullWidth
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: '10px' }}
          />
        </DialogContent>
        <DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose} color="secondary">
            Cancelar
          </Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={onOpenPresenceList} color="primary" variant="outlined">
              Lista de Presença
            </Button>
            <Button onClick={onSaveChanges} color="primary" variant="contained">
              Salvar Alterações
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      {/* Modal de Lista de Presença */}
      <Dialog open={showPresenceModal} onClose={onClosePresenceList}>
        <DialogTitle>Lista de Presença</DialogTitle>
        <DialogContent>
          <List>
            {presenceList.map((item, index) => (
              <ListItem key={item.aluno_id}>
                <ListItemText primary={item.aluno_nome} secondary={`CPF: ${item.aluno_cpf}`} />
                <ListItemSecondaryAction>
                  <Checkbox
                    checked={item.presente}
                    onChange={() => handlePresenceChange(index)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClosePresenceList} color="primary">
            Voltar
          </Button>
          <Button onClick={savePresenceList} color="primary" variant="contained">
            Salvar Presença
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AulaModal;
