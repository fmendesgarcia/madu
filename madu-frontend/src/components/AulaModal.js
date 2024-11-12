// AulaModal.jsx
import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';

const AulaModal = ({ showEditModal, showPresenceModal, onClose, onSaveChanges, onOpenPresenceList, onClosePresenceList, newDate, newTime, setNewDate, setNewTime }) => {
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
          <ul>
            <li><input type="checkbox" /> Aluno 1</li>
            <li><input type="checkbox" /> Aluno 2</li>
            <li><input type="checkbox" /> Aluno 3</li>
            {/* Adicione mais alunos conforme necessário */}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClosePresenceList} color="primary">
            Voltar
          </Button>
          <Button onClick={() => console.log('Salvar Presença')} color="primary" variant="contained">
            Salvar Presença
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AulaModal;
