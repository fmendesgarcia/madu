// Calendar.js
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react'; 
import dayGridPlugin from '@fullcalendar/daygrid'; 
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import axios from 'axios';

const Calendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Buscando as aulas do backend
    axios.get('/api/aulas') // Essa rota deve retornar as aulas do backend
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar aulas:', error);
      });
  }, []);

  const handleDateSelect = (selectInfo) => {
    const title = prompt('Digite o título da aula:');
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // Limpa a seleção visual

    if (title) {
      const newEvent = {
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      };
      
      // Envia o novo evento para o backend
      axios.post('/api/aulas', newEvent)
        .then((response) => {
          // Atualiza o calendário com o novo evento
          setEvents((prevEvents) => [...prevEvents, response.data]);
        })
        .catch((error) => {
          console.error('Erro ao criar aula:', error);
        });
    }
  };

  const handleEventClick = (clickInfo) => {
    if (window.confirm(`Você realmente deseja deletar a aula '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove(); // Remove visualmente do calendário
      
      // Remover o evento do backend
      axios.delete(`/api/aulas/${clickInfo.event.id}`)
        .catch((error) => console.error('Erro ao deletar aula:', error));
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      selectable={true}  // Permite selecionar datas
      selectMirror={true}
      dayMaxEvents={true}  // Limita o número de eventos por dia
      events={events}  // Passa os eventos do backend
      select={handleDateSelect}  // Handler para criar eventos
      eventClick={handleEventClick}  // Handler para clicar em um evento
    />
  );
};

export default Calendar;
