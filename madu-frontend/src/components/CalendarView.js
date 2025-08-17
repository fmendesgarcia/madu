// CalendarView.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../services/api';
import moment from 'moment-timezone';
import AulaModal from './AulaModal';
import { Box } from '@mui/material';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPresenceModal, setShowPresenceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [status, setStatus] = useState('planejada');
  const [substitutoId, setSubstitutoId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [professores, setProfessores] = useState([]);
  const [professorNome, setProfessorNome] = useState('');

  const getColorsByStatus = (st) => {
    const map = {
      realizada: { backgroundColor: '#C8E6C9', borderColor: '#2E7D32' }, // verde claro
      cancelada: { backgroundColor: '#FFCDD2', borderColor: '#C62828' }, // vermelho claro
      reposicao: { backgroundColor: '#FFE0B2', borderColor: '#EF6C00' }, // laranja claro
      planejada: { backgroundColor: '#BBDEFB', borderColor: '#1565C0' }, // azul claro
    };
    return map[st] || map.planejada;
  };

  const fetchEvents = () => {
    api.get('/aulas')
      .then((response) => {
        const aulas = response.data.map(aula => {
          const st = (aula.status || 'planejada');
          const { backgroundColor, borderColor } = getColorsByStatus(st);
          return {
            id: aula.id,
            title: aula.turma_nome || aula.title,
            start: moment.tz(aula.start, 'America/Sao_Paulo').format(),
            end: moment.tz(aula.end_time, 'America/Sao_Paulo').format(),
            backgroundColor,
            borderColor,
            extendedProps: {
              status: st,
              substituto_professor_id: aula.substituto_professor_id || '',
              observacoes: aula.observacoes || '',
              professor_nome: aula.professor_nome || ''
            }
          };
        });
        setEvents(aulas);
      })
      .catch((error) => console.error('Erro ao carregar aulas:', error));
  };

  useEffect(() => {
    fetchEvents();
    api.get('/professores').then(r => setProfessores(r.data || [])).catch(() => {});
  }, []);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setNewDate(moment.tz(clickInfo.event.start, 'America/Sao_Paulo').format('YYYY-MM-DD'));
    setNewTime(moment.tz(clickInfo.event.start, 'America/Sao_Paulo').format('HH:mm'));
    setStatus(clickInfo.event.extendedProps?.status || 'planejada');
    setSubstitutoId(clickInfo.event.extendedProps?.substituto_professor_id || '');
    setObservacoes(clickInfo.event.extendedProps?.observacoes || '');
    setProfessorNome(clickInfo.event.extendedProps?.professor_nome || '');
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

    api.put(`/aulas/${selectedEvent.id}`, {
      start: updatedStart,
      end_time: updatedEnd,
      status,
      substituto_professor_id: substitutoId || null,
      observacoes
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
      {/* Legenda */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
        {[{label:'Planejada', bg:'#BBDEFB', br:'#1565C0'}, {label:'Realizada', bg:'#C8E6C9', br:'#2E7D32'}, {label:'Cancelada', bg:'#FFCDD2', br:'#C62828'}, {label:'Reposição', bg:'#FFE0B2', br:'#EF6C00'}].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: item.bg, border: `2px solid ${item.br}`, borderRadius: 3 }} />
            <span style={{ fontSize: 12 }}>{item.label}</span>
          </Box>
        ))}
      </Box>

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
          api.put(`/aulas/${updatedEvent.id}`, {
            start: updatedEvent.start,
            end_time: updatedEvent.end
          })
          .then(() => fetchEvents())
          .catch((error) => console.error('Erro ao mover a aula:', error));
        }}
      />

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
        aulaId={selectedEvent?.id}
        status={status}
        setStatus={setStatus}
        substitutoId={substitutoId}
        setSubstitutoId={setSubstitutoId}
        observacoes={observacoes}
        setObservacoes={setObservacoes}
        professores={professores}
        professorNome={professorNome}
      />
    </div>
  );
};

export default CalendarView;
