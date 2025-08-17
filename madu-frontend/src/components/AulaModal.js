import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Checkbox, List, ListItem, ListItemText, ListItemSecondaryAction, TextField, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

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
    aulaId, // ID da aula para carregar presença
    status, setStatus,
    substitutoId, setSubstitutoId,
    observacoes, setObservacoes,
    professores,
    professorNome
}) => {
  const [presenceList, setPresenceList] = useState([]);

  useEffect(() => {
    if (showPresenceModal && aulaId) {
      api.get(`/presencas/aulas/${aulaId}/presencas`)
        .then(response => {
          setPresenceList(response.data);
        })
        .catch(error => {
          console.error('Erro ao buscar lista de presença:', error);
        });
    }
  }, [showPresenceModal, aulaId]);

  const handlePresenceChange = (index) => {
    setPresenceList(prevList => 
      prevList.map((item, i) => 
        i === index ? { ...item, presente: !item.presente } : item
      )
    );
  };

  const savePresenceList = () => {
    const promises = presenceList.map(item => 
      api.post('/presencas', {
        aluno_id: item.aluno_id,
        aula_id: aulaId,
        presente: item.presente
      })
    );

    Promise.all(promises)
      .then(() => {
        onClosePresenceList();
      })
      .catch(error => console.error('Erro ao salvar presença:', error));
  };

  return (
    <>
      <Dialog open={showEditModal} onClose={onClose} fullWidth>
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

          <Typography variant="body2" sx={{ mb: 1 }}>
            Professor titular: <strong>{professorNome || '—'}</strong>
          </Typography>

          <FormControl fullWidth style={{ marginBottom: '10px' }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="planejada">Planejada</MenuItem>
              <MenuItem value="realizada">Realizada</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
              <MenuItem value="reposicao">Reposição</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth style={{ marginBottom: '10px' }}>
            <InputLabel>Substituto (opcional)</InputLabel>
            <Select value={substitutoId || ''} label="Substituto (opcional)" onChange={(e) => setSubstitutoId(e.target.value)}>
              <MenuItem value=""><em>Nenhum</em></MenuItem>
              {professores.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Observações"
            fullWidth
            multiline
            minRows={2}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
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

      <Dialog open={showPresenceModal} onClose={onClosePresenceList} fullWidth>
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
