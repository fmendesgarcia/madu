// CalendarView.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../services/api';
import moment from 'moment-timezone';
import AulaModal from './AulaModal';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPresenceModal, setShowPresenceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const fetchEvents = () => {
    api.get('http://localhost:5001/aulas')
      .then((response) => {
        const aulas = response.data.map(aula => ({
          id: aula.id,
          title: aula.title,
          start: moment.tz(aula.start, 'America/Sao_Paulo').format(),
          end: moment.tz(aula.end_time, 'America/Sao_Paulo').format()
        }));
        setEvents(aulas);
      })
      .catch((error) => console.error('Erro ao carregar aulas:', error));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setNewDate(moment.tz(clickInfo.event.start, 'America/Sao_Paulo').format('YYYY-MM-DD'));
    setNewTime(moment.tz(clickInfo.event.start, 'America/Sao_Paulo').format('HH:mm'));
    setShowEditModal(true);
  };

  const handleOpenPresenceList = () => {
    setShowEditModal(false);
    setShowPresenceModal(true);
  };

  const handleClosePresenceModal = () => {
    setShowPresenceModal(false);
    setShowEditModal(true);
  };

  const handleSaveChanges = () => {
    const updatedStart = moment.tz(`${newDate}T${newTime}:00`, 'America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
    const updatedEnd = moment.tz(`${newDate}T${newTime}:00`, 'America/Sao_Paulo').add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

    api.put(`http://localhost:5001/aulas/${selectedEvent.id}`, {
      start: updatedStart,
      end_time: updatedEnd
    })
    .then(() => {
      setShowEditModal(false);
      setSelectedEvent(null);
      fetchEvents();
    })
    .catch((error) => console.error('Erro ao atualizar aula:', error));
  };

  return (
    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        editable={true}
        eventClick={handleEventClick}
        eventDrop={(info) => {
          const updatedEvent = {
            id: info.event.id,
            start: moment.tz(info.event.start, 'America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss'),
            end: moment.tz(new Date(info.event.start.getTime() + 60 * 60 * 1000), 'America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss')
          };
          api.put(`http://localhost:5001/aulas/${updatedEvent.id}`, {
            start: updatedEvent.start,
            end_time: updatedEvent.end
          })
          .then(() => fetchEvents())
          .catch((error) => console.error('Erro ao mover a aula:', error));
        }}
      />

      {/* Chama o componente AulaModal e passa as props */}
      <AulaModal
        showEditModal={showEditModal}
        showPresenceModal={showPresenceModal}
        onClose={() => setShowEditModal(false)}
        onSaveChanges={handleSaveChanges}
        onOpenPresenceList={handleOpenPresenceList}
        onClosePresenceList={handleClosePresenceModal}
        newDate={newDate}
        newTime={newTime}
        setNewDate={setNewDate}
        setNewTime={setNewTime}
      />
    </div>
  );
};

export default CalendarView;
