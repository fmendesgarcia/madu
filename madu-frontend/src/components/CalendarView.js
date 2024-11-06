import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import moment from 'moment-timezone';

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
          start: moment.tz(aula.start, 'America/Sao_Paulo').format(), // Converte para string ISO com fuso horário fixo
          end: moment.tz(aula.end_time, 'America/Sao_Paulo').format()
        }));
        setEvents(aulas);
      })
      .catch((error) => console.error('Erro ao carregar aulas:', error));
  }, []);
  

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setNewDate(moment.tz(clickInfo.event.start, 'America/Sao_Paulo').format('YYYY-MM-DD'));
    setNewTime(moment.tz(clickInfo.event.start, 'America/Sao_Paulo').format('HH:mm'));
    setShowModal(true);
  };
  

  const handleSaveChanges = () => {
    // Define horários no fuso correto e em formato de string
    const updatedStart = moment.tz(`${newDate}T${newTime}:00`, 'America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
    const updatedEnd = moment.tz(`${newDate}T${newTime}:00`, 'America/Sao_Paulo').add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
  
    axios.put(`http://localhost:5001/aulas/${selectedEvent.id}`, {
      start: updatedStart,
      end_time: updatedEnd
    })
    .then((response) => {
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, start: updatedStart, end: updatedEnd } // Atualiza como string no estado
          : event
      ));
      setShowModal(false);
      setSelectedEvent(null);
    })
    .catch((error) => console.error('Erro ao atualizar aula:', error));
  };
  
  
  
  const handleEventDrop = (info) => {
    const updatedEvent = {
      id: info.event.id,
      start: moment.tz(info.event.start, 'America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss'),
      end: moment.tz(new Date(info.event.start.getTime() + 60 * 60 * 1000), 'America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss')
    };
  
    axios.put(`http://localhost:5001/aulas/${updatedEvent.id}`, {
      start: updatedEvent.start,
      end_time: updatedEvent.end
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
      timeZone="local"
      displayEventTime={true} // Garante que o horário seja exibido
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
