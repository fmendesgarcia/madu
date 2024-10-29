import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5001/aulas')
      .then((response) => {
        const aulas = response.data.map(aula => ({
          id: aula.id,
          title: aula.title,
          start: new Date(aula.start),
          end: new Date(aula.end_time)
        }));
        setEvents(aulas);
      })
      .catch((error) => console.error('Erro ao carregar aulas:', error));
  }, []);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setNewDate(clickInfo.event.startStr.split('T')[0]);
    setNewTime(clickInfo.event.startStr.split('T')[1].slice(0, 5));
    setShowModal(true);
  };

  const handleSaveChanges = () => {
    const updatedStart = new Date(`${newDate}T${newTime}:00`);
    const updatedEnd = new Date(updatedStart.getTime() + 60 * 60 * 1000); // 1 hora depois

    axios.put(`http://localhost:5001/aulas/${selectedEvent.id}`, {
      start: updatedStart.toISOString(),
      end_time: updatedEnd.toISOString()
    })
    .then((response) => {
      setEvents(events.map(event => 
        event.id === selectedEvent.id ? { ...event, start: updatedStart, end: updatedEnd } : event
      ));
      setShowModal(false);
      setSelectedEvent(null);
    })
    .catch((error) => console.error('Erro ao atualizar aula:', error));
  };

  const handleEventDrop = (info) => {
    const updatedEvent = {
      id: info.event.id,
      start: info.event.start,
      end: new Date(info.event.start.getTime() + 60 * 60 * 1000)
    };

    axios.put(`http://localhost:5001/aulas/${updatedEvent.id}`, {
      start: updatedEvent.start.toISOString(),
      end_time: updatedEvent.end.toISOString()
    })
    .then((response) => {
      setEvents(events.map(event => 
        event.id === updatedEvent.id ? { ...event, start: updatedEvent.start, end: updatedEvent.end } : event
      ));
    })
    .catch((error) => console.error('Erro ao mover a aula:', error));
  };

  return (
    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        editable={true}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
      />

      {/* Modal de Edição usando Material-UI */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
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
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveChanges} color="primary" variant="contained">
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CalendarView;
